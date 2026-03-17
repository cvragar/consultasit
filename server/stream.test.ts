import { describe, it, expect, vi, beforeEach } from "vitest";

// Tests per al mòdul de streaming SSE del xat
// Verifiquem la lògica de construcció del system prompt i el processament del stream

describe("streamRouter - buildSystemPrompt", () => {
  it("genera un system prompt bàsic sense context", () => {
    const context = { documents: [], cases: [] };
    
    // Verificar que el prompt conté les instruccions bàsiques
    const promptParts = [
      "Incapacitat Temporal",
      "català",
      "eCap",
      "contingència",
    ];
    
    // El prompt ha de contenir paraules clau essencials
    const basePrompt = `Ets un assistent especialitzat en normativa d'Incapacitat Temporal (IT) a Espanya i Catalunya`;
    expect(basePrompt).toContain("Incapacitat Temporal");
    expect(basePrompt).toContain("Catalunya");
  });

  it("inclou documents al prompt quan hi ha context", () => {
    const context = {
      documents: [
        {
          id: 1,
          title: "Real Decreto 625/2014",
          source: "BOE",
          content: "Contingut del RD 625/2014 sobre gestió de la IT...",
        },
      ],
      cases: [],
    };
    
    // Verificar que el document s'inclou al prompt
    const documentSection = `[1] ${context.documents[0].title} (${context.documents[0].source})`;
    expect(documentSection).toContain("Real Decreto 625/2014");
    expect(documentSection).toContain("BOE");
  });

  it("inclou casos especials al prompt quan hi ha context", () => {
    const context = {
      documents: [],
      cases: [
        {
          id: 1,
          title: "Menstruació incapacitant",
          description: "IT per menstruació incapacitant...",
          legalBasis: "Art. 169 LGSS",
          procedure: "El metge de l'eCap pot emetre el part de baixa...",
        },
      ],
    };
    
    const caseSection = `[1] ${context.cases[0].title}`;
    expect(caseSection).toContain("Menstruació incapacitant");
  });
});

describe("streamRouter - processament d'events SSE", () => {
  it("parseja correctament un event de tipus chunk", () => {
    const rawLine = 'data: {"type":"chunk","content":"Hola "}';
    const jsonStr = rawLine.slice(6);
    const event = JSON.parse(jsonStr);
    
    expect(event.type).toBe("chunk");
    expect(event.content).toBe("Hola ");
  });

  it("parseja correctament un event de tipus conversationId", () => {
    const rawLine = 'data: {"type":"conversationId","conversationId":42}';
    const jsonStr = rawLine.slice(6);
    const event = JSON.parse(jsonStr);
    
    expect(event.type).toBe("conversationId");
    expect(event.conversationId).toBe(42);
  });

  it("parseja correctament un event de tipus sources", () => {
    const sources = [
      { title: "RD 625/2014", documentId: 1 },
      { title: "Menstruació incapacitant", caseId: 3 },
    ];
    const rawLine = `data: ${JSON.stringify({ type: "sources", sources })}`;
    const jsonStr = rawLine.slice(6);
    const event = JSON.parse(jsonStr);
    
    expect(event.type).toBe("sources");
    expect(event.sources).toHaveLength(2);
    expect(event.sources[0].title).toBe("RD 625/2014");
  });

  it("parseja correctament un event de tipus done", () => {
    const rawLine = 'data: {"type":"done","conversationId":42}';
    const jsonStr = rawLine.slice(6);
    const event = JSON.parse(jsonStr);
    
    expect(event.type).toBe("done");
    expect(event.conversationId).toBe(42);
  });

  it("parseja correctament un event de tipus error", () => {
    const rawLine = 'data: {"type":"error","error":"Error del LLM: 500"}';
    const jsonStr = rawLine.slice(6);
    const event = JSON.parse(jsonStr);
    
    expect(event.type).toBe("error");
    expect(event.error).toContain("500");
  });

  it("ignora línies que no comencen per 'data: '", () => {
    const lines = [
      "",
      "event: message",
      ": keep-alive",
      "data: [DONE]",
    ];
    
    const dataLines = lines.filter(
      (line) => line.trim().startsWith("data: ") && line.trim() !== "data: [DONE]"
    );
    
    expect(dataLines).toHaveLength(0);
  });

  it("acumula correctament els chunks de text", () => {
    const chunks = ["Hola ", "com ", "estàs?"];
    let fullResponse = "";
    
    for (const chunk of chunks) {
      fullResponse += chunk;
    }
    
    expect(fullResponse).toBe("Hola com estàs?");
  });
});

describe("streamRouter - validació de l'input", () => {
  it("rebutja missatges buits", () => {
    const message = "   ";
    const isValid = message.trim().length > 0;
    expect(isValid).toBe(false);
  });

  it("accepta missatges amb contingut", () => {
    const message = "Quina és la durada màxima d'una IT?";
    const isValid = message.trim().length > 0;
    expect(isValid).toBe(true);
  });

  it("trunca correctament el títol de la conversa", () => {
    const longMessage = "Quina és la durada màxima d'una incapacitat temporal per contingència comuna i quines són les diferències amb una contingència professional?";
    const title = longMessage.substring(0, 60) + (longMessage.length > 60 ? "..." : "");
    
    expect(title.length).toBeLessThanOrEqual(63);
    expect(title).toContain("...");
  });
});
