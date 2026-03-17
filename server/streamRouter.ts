import { Router, Request, Response } from "express";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import {
  addMessage,
  createConversation,
  getConversationMessages,
  getRelevantContext,
} from "./db";

export const streamRouter = Router();

// Construir el system prompt amb context RAG
function buildSystemPrompt(
  context: Awaited<ReturnType<typeof getRelevantContext>>
): string {
  let systemPrompt = `Ets un assistent especialitzat en normativa d'Incapacitat Temporal (IT) a Espanya i Catalunya, dissenyat per a professionals sanitaris.

El teu objectiu és respondre preguntes sobre:
- Normativa estatal i autonòmica d'IT (RD 625/2014, RD 1060/2022, LGSS, LETA, Llei 10/2021)
- Casos especials i situacions extremes (menstruació incapacitant, gestació setmana 39, donants d'òrgans, TRADE, pluriocupació, teletreball, accidents in itinere)
- Procediments administratius des de l'eCap (sistema de gestió de bajas de Catalunya)
- Durada de la IT i pròrrogues (fins a 365, 545 i 730 dies)
- Gestió de baixes mèdiques per contingències comunes i professionals

INSTRUCCIONS CRÍTIQUES:
- Respon SEMPRE en català
- Sigues precís i cita la normativa aplicable (article, llei, decret)
- Si no tens informació suficient, indica-ho clarament i no alucinis
- Proporciona exemples pràctics quan sigui rellevant
- Recorda que els parts de baixa els emet el metge des de l'eCap (sistema català)
- Distingeix sempre entre contingència comuna (CC) i contingència professional (AT/EP)
- Per als accidents de treball (AT), recorda que la mútua és la responsable de la gestió, no l'INSS
`;

  if (context.documents.length > 0) {
    systemPrompt += "\n\n--- DOCUMENTS NORMATIUS RELLEVANTS ---\n";
    context.documents.forEach((doc, idx) => {
      systemPrompt += `\n[${idx + 1}] ${doc.title} (${doc.source})\n`;
      systemPrompt += `${doc.content.substring(0, 2000)}\n`;
    });
  }

  if (context.cases.length > 0) {
    systemPrompt += "\n\n--- CASOS ESPECIALS RELLEVANTS ---\n";
    context.cases.forEach((caso, idx) => {
      systemPrompt += `\n[${idx + 1}] ${caso.title}\n`;
      systemPrompt += `Descripció: ${caso.description}\n`;
      if (caso.legalBasis) systemPrompt += `Base legal: ${caso.legalBasis}\n`;
      if (caso.procedure) systemPrompt += `Procediment: ${caso.procedure.substring(0, 800)}\n`;
    });
  }

  return systemPrompt;
}

// POST /api/stream/chat
// Body: { conversationId?: number, message: string }
// Retorna: SSE stream amb chunks de text
streamRouter.post("/chat", async (req: Request, res: Response) => {
  try {
    // Autenticar l'usuari
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      res.status(401).json({ error: "No autenticat" });
      return;
    }

    const { message, conversationId: inputConversationId } = req.body as {
      message: string;
      conversationId?: number;
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({ error: "El missatge és obligatori" });
      return;
    }

    // Crear o usar la conversa existent
    let conversationId = inputConversationId;
    if (!conversationId) {
      const title = message.substring(0, 60) + (message.length > 60 ? "..." : "");
      conversationId = await createConversation(user.id, title);
    }

    // Guardar el missatge de l'usuari
    await addMessage(conversationId, "user", message.trim());

    // Obtenir context rellevant (RAG)
    const context = await getRelevantContext(message.trim());

    // Construir el system prompt
    const systemPrompt = buildSystemPrompt(context);

    // Obtenir historial de missatges previs (últims 6)
    const previousMessages = await getConversationMessages(conversationId);
    const chatHistory = previousMessages.slice(-6).map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));

    // Configurar SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    // Enviar l'ID de la conversa primer
    res.write(`data: ${JSON.stringify({ type: "conversationId", conversationId })}\n\n`);

    // Enviar les fonts citades
    const sources = [
      ...context.documents.map((doc) => ({ documentId: doc.id, title: doc.title })),
      ...context.cases.map((caso) => ({ caseId: caso.id, title: caso.title })),
    ];
    if (sources.length > 0) {
      res.write(`data: ${JSON.stringify({ type: "sources", sources })}\n\n`);
    }

    // Cridar l'API del LLM amb streaming
    const apiUrl = ENV.forgeApiUrl
      ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
      : "https://forge.manus.im/v1/chat/completions";

    const llmResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        stream: true,
        max_tokens: 8192,
        messages: [
          { role: "system", content: systemPrompt },
          ...chatHistory,
          { role: "user", content: message.trim() },
        ],
      }),
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();
      res.write(`data: ${JSON.stringify({ type: "error", error: `Error del LLM: ${llmResponse.status}` })}\n\n`);
      res.end();
      return;
    }

    // Processar el stream SSE del LLM i reenviar al client
    const reader = llmResponse.body?.getReader();
    if (!reader) {
      res.write(`data: ${JSON.stringify({ type: "error", error: "No s'ha pogut llegir el stream" })}\n\n`);
      res.end();
      return;
    }

    const decoder = new TextDecoder();
    let fullResponse = "";
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Guardar la línia incompleta

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          if (!trimmed.startsWith("data: ")) continue;

          const jsonStr = trimmed.slice(6);
          try {
            const chunk = JSON.parse(jsonStr);
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) {
              fullResponse += delta;
              res.write(`data: ${JSON.stringify({ type: "chunk", content: delta })}\n\n`);
            }
          } catch {
            // Ignorar línies que no siguin JSON vàlid
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Guardar la resposta completa a la BD
    if (fullResponse.trim()) {
      await addMessage(conversationId, "assistant", fullResponse.trim(), sources);
    }

    // Enviar senyal de finalització
    res.write(`data: ${JSON.stringify({ type: "done", conversationId })}\n\n`);
    res.end();

  } catch (error: any) {
    console.error("[StreamRouter] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Error intern del servidor" });
    } else {
      res.write(`data: ${JSON.stringify({ type: "error", error: error.message || "Error intern" })}\n\n`);
      res.end();
    }
  }
});
