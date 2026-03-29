import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { feedbackRouter } from "./routers/feedback";
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
  updateSpecialCase,
  searchItDurations,
  getItDurationById,
  createConversation,
  getUserConversations,
  getConversationMessages,
  addMessage,
  updateConversationTitle,
  deleteConversation,
  getRelevantContext,
  addFavorite,
  removeFavorite,
  getUserFavorites,
  getUserFavoriteIds,
  advancedSearchDocuments,
  advancedSearchSpecialCases,
  getRecentItems,
  updateUserLanguage,
  updateUserTheme,
  saveSpecialCaseTranslation,
  saveDocumentTranslation,
} from "./db";
import { translateFieldsToEs, translateCaToEs } from "./translation";
import { invokeLLM } from "./_core/llm";

// ===== TRANSLATION HELPERS =====

/**
 * Apply Spanish translation to a special case, using cached values if available.
 * If no cache exists, translate on-the-fly and save to DB.
 */
async function applySpecialCaseTranslation(c: any) {
  // Check if all required fields are already cached
  const hasTitleCache = !!c.titleEs;
  const hasDescCache = !!c.descriptionEs;

  if (hasTitleCache && hasDescCache) {
    // Return with cached translations
    return {
      ...c,
      title: c.titleEs || c.title,
      description: c.descriptionEs || c.description,
      legalBasis: c.legalBasisEs || c.legalBasis,
      procedure: c.procedureEs || c.procedure,
      examples: c.examplesEs || c.examples,
    };
  }

  // Translate and cache
  const fieldsToTranslate: Record<string, string> = {
    title: c.title || "",
    description: c.description || "",
  };
  if (c.legalBasis) fieldsToTranslate.legalBasis = c.legalBasis;
  if (c.procedure) fieldsToTranslate.procedure = c.procedure;
  if (c.examples) fieldsToTranslate.examples = c.examples;

  const translated = await translateFieldsToEs(fieldsToTranslate);

  // Only save to cache if the translation is actually different from the original
  // (i.e., the LLM actually translated it, not just returned the fallback)
  const translationSucceeded = translated.title && translated.title !== c.title;
  if (translationSucceeded) {
    saveSpecialCaseTranslation(c.id, {
      titleEs: translated.title,
      descriptionEs: translated.description,
      legalBasisEs: translated.legalBasis,
      procedureEs: translated.procedure,
      examplesEs: translated.examples,
    }).catch(err => console.error("[translation] Failed to save cache:", err));
  }

  return {
    ...c,
    title: translated.title || c.title,
    description: translated.description || c.description,
    legalBasis: translated.legalBasis || c.legalBasis,
    procedure: translated.procedure || c.procedure,
    examples: translated.examples || c.examples,
  };
}

/**
 * Apply Spanish translation to a document, using cached values if available.
 */
async function applyDocumentTranslation(d: any) {
  const hasTitleCache = !!d.titleEs;
  const hasSummaryCache = !!d.summaryEs;

  if (hasTitleCache && hasSummaryCache) {
    return {
      ...d,
      title: d.titleEs || d.title,
      summary: d.summaryEs || d.summary,
      content: d.contentEs || d.content,
    };
  }

  // Translate and cache
  const fieldsToTranslate: Record<string, string> = {
    title: d.title || "",
  };
  if (d.summary) fieldsToTranslate.summary = d.summary;
  // Only translate content if it's not too long (>8000 chars split into summary only)
  if (d.content && d.content.length <= 8000) {
    fieldsToTranslate.content = d.content;
  }

  const translated = await translateFieldsToEs(fieldsToTranslate);

  // Only save to cache if the translation is actually different from the original
  const translationSucceeded = translated.title && translated.title !== d.title;
  if (translationSucceeded) {
    saveDocumentTranslation(d.id, {
      titleEs: translated.title,
      summaryEs: translated.summary,
      contentEs: translated.content,
    }).catch(err => console.error("[translation] Failed to save doc cache:", err));
  }

  return {
    ...d,
    title: translated.title || d.title,
    summary: translated.summary || d.summary,
    content: translated.content || d.content,
  };
}
import {
  generateConversationPDF,
  generateSpecialCasePDF,
  generateDocumentPDF,
} from "./pdfGenerator";

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

  // ===== USER PREFERENCES =====
  user: router({
    getLanguage: protectedProcedure.query(async ({ ctx }) => {
      return { language: ctx.user.preferredLanguage ?? "ca" };
    }),
    setLanguage: protectedProcedure
      .input(z.object({ language: z.enum(["ca", "es"]) }))
      .mutation(async ({ ctx, input }) => {
        await updateUserLanguage(ctx.user.openId, input.language);
        return { success: true };
      }),
    getTheme: protectedProcedure.query(async ({ ctx }) => {
      return { theme: (ctx.user as any).preferredTheme ?? "light" };
    }),
    setTheme: protectedProcedure
      .input(z.object({ theme: z.enum(["light", "dark"]) }))
      .mutation(async ({ ctx, input }) => {
        await updateUserTheme(ctx.user.openId, input.theme);
        return { success: true };
      }),
  }),

  // ===== DOCUMENTS =====
  documents: router({
    list: publicProcedure
      .input(z.object({ language: z.enum(["ca", "es"]).optional().default("ca") }))
      .query(async ({ input }) => {
        const docs = await getAllDocuments();
        if (input.language === "es") {
          return await Promise.all(docs.map(d => applyDocumentTranslation(d)));
        }
        return docs;
      }),
    search: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional(), language: z.enum(["ca", "es"]).optional().default("ca") }))
      .query(async ({ input }) => {
        const docs = await searchDocuments(input.query, input.limit);
        if (input.language === "es") {
          return await Promise.all(docs.map(d => applyDocumentTranslation(d)));
        }
        return docs;
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number(), language: z.enum(["ca", "es"]).optional().default("ca") }))
      .query(async ({ input }) => {
        const doc = await getDocumentById(input.id);
        if (!doc) return null;
        if (input.language === "es") {
          return await applyDocumentTranslation(doc);
        }
        return doc;
      }),
    exportPDF: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const document = await getDocumentById(input.id);
        if (!document) {
          throw new Error("Document not found");
        }
        const pdfBuffer = await generateDocumentPDF(document);
        const base64 = pdfBuffer.toString("base64");
        return { pdf: base64, filename: `${document.title.replace(/[^a-z0-9]/gi, "_")}.pdf` };
      }),
  }),

  // ===== SPECIAL CASES =====
  specialCases: router({
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        legalBasis: z.string().optional(),
        procedure: z.string().optional(),
        examples: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Accés restringit: cal ser administrador");
        }
        const { id, ...data } = input;
        // Invalidate ES cache when content is updated
        await updateSpecialCase(id, data);
        await saveSpecialCaseTranslation(id, {
          titleEs: undefined,
          descriptionEs: undefined,
          legalBasisEs: undefined,
          procedureEs: undefined,
          examplesEs: undefined,
        });
        const updated = await getSpecialCaseById(id);
        if (!updated) throw new Error("Cas especial no trobat");
        return updated;
      }),
    list: publicProcedure
      .input(z.object({ language: z.enum(["ca", "es"]).optional().default("ca") }))
      .query(async ({ input }) => {
        const cases = await getAllSpecialCases();
        if (input.language === "es") {
          return await Promise.all(cases.map(c => applySpecialCaseTranslation(c)));
        }
        return cases;
      }),
    getByCategory: publicProcedure
      .input(z.object({ category: z.string(), language: z.enum(["ca", "es"]).optional().default("ca") }))
      .query(async ({ input }) => {
        const cases = await getSpecialCasesByCategory(input.category);
        if (input.language === "es") {
          return await Promise.all(cases.map(c => applySpecialCaseTranslation(c)));
        }
        return cases;
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number(), language: z.enum(["ca", "es"]).optional().default("ca") }))
      .query(async ({ input }) => {
        const c = await getSpecialCaseById(input.id);
        if (!c) return null;
        if (input.language === "es") {
          return await applySpecialCaseTranslation(c);
        }
        return c;
      }),
    search: publicProcedure
      .input(z.object({ query: z.string(), language: z.enum(["ca", "es"]).optional().default("ca") }))
      .query(async ({ input }) => {
        const cases = await searchSpecialCases(input.query);
        if (input.language === "es") {
          return await Promise.all(cases.map(c => applySpecialCaseTranslation(c)));
        }
        return cases;
      }),
    exportPDF: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const specialCase = await getSpecialCaseById(input.id);
        if (!specialCase) {
          throw new Error("Special case not found");
        }
        const pdfBuffer = await generateSpecialCasePDF(specialCase);
        const base64 = pdfBuffer.toString("base64");
        return { pdf: base64, filename: `${specialCase.title.replace(/[^a-z0-9]/gi, "_")}.pdf` };
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

  // ===== FAVORITES =====
  favorites: router({
    // Obtenir tots els favorits de l'usuari
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return await getUserFavorites(ctx.user.id);
    }),

    // Obtenir IDs de favorits de l'usuari
    getIds: protectedProcedure.query(async ({ ctx }) => {
      const favs = await getUserFavoriteIds(ctx.user.id);
      return favs.map(f => ({ entityType: f.entityType, entityId: f.entityId }));
    }),

    // Afegir favorit
    add: protectedProcedure
      .input(z.object({
        entityType: z.enum(["document", "special_case"]),
        entityId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await addFavorite(ctx.user.id, input.entityType, input.entityId);
        return { success: true };
      }),

    // Eliminar favorit
    remove: protectedProcedure
      .input(z.object({
        entityType: z.enum(["document", "special_case"]),
        entityId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await removeFavorite(ctx.user.id, input.entityType, input.entityId);
        return { success: true };
      }),
  }),

  // ===== NOVETATS =====
  novetats: router({
    getRecent: publicProcedure
      .input(z.object({ days: z.number().optional() }))
      .query(async ({ input }) => {
        return await getRecentItems(input.days ?? 30);
      }),
  }),

  // ===== ADVANCED SEARCH =====
  search: router({
    documents: publicProcedure
      .input(z.object({
        query: z.string().optional(),
        type: z.string().optional(),
        jurisdiction: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        publicationYear: z.number().optional(),
        status: z.enum(["vigent", "derogada", "en_revisio"]).optional(),
        limit: z.number().optional(),
        language: z.enum(["ca", "es"]).optional().default("ca"),
      }))
      .query(async ({ input }) => {
        const { language, ...params } = input;
        const docs = await advancedSearchDocuments(params);
        if (language === "es") {
          return await Promise.all(docs.map(d => applyDocumentTranslation(d)));
        }
        return docs;
      }),

    specialCases: publicProcedure
      .input(z.object({
        query: z.string().optional(),
        category: z.string().optional(),
        limit: z.number().optional(),
        language: z.enum(["ca", "es"]).optional().default("ca"),
      }))
      .query(async ({ input }) => {
        const { language, ...params } = input;
        const cases = await advancedSearchSpecialCases(params);
        if (language === "es") {
          return await Promise.all(cases.map(c => applySpecialCaseTranslation(c)));
        }
        return cases;
      }),

    // Cerca global (documents + casos)
    global: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional(), language: z.enum(["ca", "es"]).optional().default("ca") }))
      .query(async ({ input }) => {
        const { language, query, limit } = input;
        const [docs, cases] = await Promise.all([
          advancedSearchDocuments({ query, limit: limit ?? 5 }),
          advancedSearchSpecialCases({ query, limit: limit ?? 5 }),
        ]);
        if (language === "es") {
          const [translatedDocs, translatedCases] = await Promise.all([
            Promise.all(docs.map(d => applyDocumentTranslation(d))),
            Promise.all(cases.map(c => applySpecialCaseTranslation(c))),
          ]);
          return { documents: translatedDocs, cases: translatedCases };
        }
        return { documents: docs, cases };
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
          language: z.enum(["ca", "es"]).optional().default("ca"),
        })
      )
      .mutation(async ({ input }) => {
        const { conversationId, message, language } = input;

        // Guardar mensaje del usuario
        await addMessage(conversationId, "user", message);

        // Obtener contexto relevante de la base de datos
        const context = await getRelevantContext(message);

        // Construir prompt del sistema con contexto
        const langInstruction = language === "es"
          ? "Responde SIEMPRE en castellano (español), ya que el usuario ha seleccionado el español como idioma preferido."
          : "Respon SEMPRE en català, ja que l'usuari ha seleccionat el català com a idioma preferit.";

        let systemPrompt = `Ets un assistent especialitzat en normativa d'Incapacitat Temporal (IT) a Espanya i Catalunya.

El teu objectiu és respondre preguntes de professionals sanitàries i administratius sobre:
- Normativa estatal i autonòmica d'IT
- Casos especials i situacions complexes
- Procediments administratius
- Durada d'IT i pròrrogues
- Gestió de baixes mèdiques

IMPORTANT:
- ${langInstruction}
- Sigues precís i cita la normativa aplicable (LGSS, RD 625/2014, etc.)
- Si no tens informació suficient, indica-ho clarament
- Proporciona exemples pràctics quan sigui rellevant

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

    // Exportar conversación a PDF
    exportPDF: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        const messages = await getConversationMessages(input.conversationId);
        const conversations = await getUserConversations(messages[0]?.conversationId || 0);
        const conversation = conversations.find(c => c.id === input.conversationId);
        const title = conversation?.title || "Conversa sense títol";
        
        const pdfBuffer = await generateConversationPDF(title, messages as any);
        const base64 = pdfBuffer.toString("base64");
        return { pdf: base64, filename: `conversa_${input.conversationId}.pdf` };
      }),
  }),

  // ===== ADMIN =====
  admin: router({
    /**
     * Pre-translate all special cases and documents to Spanish.
     * Admin only. Processes items without cached translations.
     */
    pretranslateAll: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Accés restringit: cal ser administrador");
      }

      const cases = await getAllSpecialCases();
      const docs = await getAllDocuments();

      // Translate cases without cache
      const casesToTranslate = cases.filter(c => !c.titleEs);
      const docsToTranslate = docs.filter(d => !d.titleEs);

      let casesDone = 0;
      let docsDone = 0;
      const errors: string[] = [];

       for (const c of casesToTranslate) {
        try {
          // Translate title first to verify the LLM is working
          const titleTranslated = await translateCaToEs(c.title);
          if (!titleTranslated || titleTranslated === c.title) {
            errors.push(`Case #${c.id}: translation returned same text, skipping`);
            continue;
          }
          const descTranslated = await translateCaToEs(c.description);
          const legalTranslated = c.legalBasis ? await translateCaToEs(c.legalBasis) : undefined;
          const procTranslated = c.procedure ? await translateCaToEs(c.procedure) : undefined;
          const exTranslated = c.examples ? await translateCaToEs(c.examples) : undefined;
          await saveSpecialCaseTranslation(c.id, {
            titleEs: titleTranslated,
            descriptionEs: descTranslated !== c.description ? descTranslated : undefined,
            legalBasisEs: legalTranslated !== c.legalBasis ? legalTranslated : undefined,
            procedureEs: procTranslated !== c.procedure ? procTranslated : undefined,
            examplesEs: exTranslated !== c.examples ? exTranslated : undefined,
          });
          casesDone++;
        } catch (err) {
          errors.push(`Case #${c.id}: ${(err as Error).message}`);
        }
      }
      for (const d of docsToTranslate) {
        try {
          const titleTranslated = await translateCaToEs(d.title);
          if (!titleTranslated || titleTranslated === d.title) {
            errors.push(`Doc #${d.id}: translation returned same text, skipping`);
            continue;
          }
          const summaryTranslated = d.summary ? await translateCaToEs(d.summary) : undefined;
          // Only translate content if not too long
          const contentTranslated = (d.content && d.content.length <= 6000)
            ? await translateCaToEs(d.content)
            : undefined;
          await saveDocumentTranslation(d.id, {
            titleEs: titleTranslated,
            summaryEs: summaryTranslated !== d.summary ? summaryTranslated : undefined,
            contentEs: contentTranslated !== d.content ? contentTranslated : undefined,
          });
          docsDone++;
        } catch (err) {
          errors.push(`Doc #${d.id}: ${(err as Error).message}`);
        }
      }

      return {
        casesDone,
        docsDone,
        casesSkipped: cases.length - casesToTranslate.length,
        docsSkipped: docs.length - docsToTranslate.length,
        errors,
      };
    }),
  }),
  feedback: feedbackRouter,
});

// ===== FEEDBACK =====

export type AppRouter = typeof appRouter;
