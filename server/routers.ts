import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllDocuments,
  searchDocuments,
  getDocumentById,
  getAllSpecialCases,
  getSpecialCasesByCategory,
  getSpecialCaseById,
  searchSpecialCases,
  searchItDurations,
  getItDurationById,
  createConversation,
  getUserConversations,
  getConversationMessages,
  addMessage,
  updateConversationTitle,
  deleteConversation,
  getRelevantContext,
} from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ===== DOCUMENTS =====
  documents: router({
    list: publicProcedure.query(async () => {
      return await getAllDocuments();
    }),
    search: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await searchDocuments(input.query, input.limit);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getDocumentById(input.id);
      }),
  }),

  // ===== SPECIAL CASES =====
  specialCases: router({
    list: publicProcedure.query(async () => {
      return await getAllSpecialCases();
    }),
    getByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return await getSpecialCasesByCategory(input.category);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getSpecialCaseById(input.id);
      }),
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await searchSpecialCases(input.query);
      }),
  }),

  // ===== IT DURATIONS =====
  itDurations: router({
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await searchItDurations(input.query);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getItDurationById(input.id);
      }),
  }),

  // ===== CHAT =====
  chat: router({
    // Crear nueva conversación
    createConversation: protectedProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const conversationId = await createConversation(ctx.user.id, input.title);
        return { conversationId };
      }),

    // Obtener conversaciones del usuario
    getUserConversations: protectedProcedure.query(async ({ ctx }) => {
      return await getUserConversations(ctx.user.id);
    }),

    // Obtener mensajes de una conversación
    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await getConversationMessages(input.conversationId);
      }),

    // Enviar mensaje y obtener respuesta de IA
    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          message: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { conversationId, message } = input;

        // Guardar mensaje del usuario
        await addMessage(conversationId, "user", message);

        // Obtener contexto relevante de la base de datos
        const context = await getRelevantContext(message);

        // Construir prompt del sistema con contexto
        let systemPrompt = `Eres un asistente especializado en normativa de Incapacidad Temporal (IT) en España y Catalunya.

Tu objetivo es responder preguntas de profesionales sanitarios y administrativos sobre:
- Normativa estatal y autonómica de IT
- Casos especiales y situaciones extremas
- Procedimientos administrativos
- Duración de IT y prórrogas
- Gestión de bajas médicas

IMPORTANTE:
- Responde SIEMPRE en catalán, ya que es el idioma preferido del usuario
- Sé preciso y cita la normativa aplicable
- Si no tienes información suficiente, indícalo claramente
- Proporciona ejemplos prácticos cuando sea relevante

`;

        // Añadir contexto de documentos
        if (context.documents.length > 0) {
          systemPrompt += "\n\nDOCUMENTOS RELEVANTES:\n";
          context.documents.forEach((doc, idx) => {
            systemPrompt += `\n[${idx + 1}] ${doc.title} (${doc.source})\n`;
            systemPrompt += `${doc.content.substring(0, 1500)}...\n`;
          });
        }

        // Añadir contexto de casos especiales
        if (context.cases.length > 0) {
          systemPrompt += "\n\nCASOS ESPECIALES RELEVANTES:\n";
          context.cases.forEach((caso, idx) => {
            systemPrompt += `\n[${idx + 1}] ${caso.title}\n`;
            systemPrompt += `Descripción: ${caso.description}\n`;
            if (caso.legalBasis) systemPrompt += `Base legal: ${caso.legalBasis}\n`;
            if (caso.procedure) systemPrompt += `Procedimiento: ${caso.procedure}\n`;
          });
        }

        // Obtener historial de mensajes previos
        const previousMessages = await getConversationMessages(conversationId);
        const chatHistory = previousMessages.slice(-6).map((msg) => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        }));

        // Llamar a la IA
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...chatHistory,
            { role: "user", content: message },
          ],
        });

        const assistantMessage = (typeof response.choices[0]?.message?.content === 'string' 
          ? response.choices[0]?.message?.content 
          : "No se pudo generar una respuesta.");

        // Preparar fuentes citadas
        const sources = [
          ...context.documents.map((doc) => ({
            documentId: doc.id,
            title: doc.title,
          })),
          ...context.cases.map((caso) => ({
            caseId: caso.id,
            title: caso.title,
          })),
        ];

        // Guardar respuesta del asistente
        await addMessage(conversationId, "assistant", assistantMessage, sources);

        return {
          message: assistantMessage,
          sources,
        };
      }),

    // Actualizar título de conversación
    updateTitle: protectedProcedure
      .input(z.object({ conversationId: z.number(), title: z.string() }))
      .mutation(async ({ input }) => {
        await updateConversationTitle(input.conversationId, input.title);
        return { success: true };
      }),

    // Eliminar conversación
    deleteConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteConversation(input.conversationId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
