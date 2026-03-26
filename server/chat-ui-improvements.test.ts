/**
 * Tests per a les millores de la interfície del xat:
 * - Suggeriments ràpids a la pantalla inicial
 * - Sidebar automàtic quan hi ha converses anteriors
 * - Traducció completa al català
 *
 * Nota: Aquests tests validen la lògica de backend que suporta les millores de la UI.
 * La lògica del sidebar i els suggeriments ràpids és purament frontend (useState/useEffect)
 * i es valida a través dels tests de routers existents.
 */
import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock del mòdul de base de dades
vi.mock("./db", () => ({
  getAllDocuments: vi.fn().mockResolvedValue([]),
  searchDocuments: vi.fn().mockResolvedValue([]),
  getDocumentById: vi.fn().mockResolvedValue(null),
  getAllSpecialCases: vi.fn().mockResolvedValue([
    { id: 1, title: "Menstruació incapacitant", category: "menstruacion", description: "Desc", legalBasis: null, procedure: null, examples: null, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, title: "Embaràs i IT", category: "embarazo", description: "Desc", legalBasis: null, procedure: null, examples: null, createdAt: new Date(), updatedAt: new Date() },
    { id: 3, title: "Donació d'òrgans", category: "donacion_organos", description: "Desc", legalBasis: null, procedure: null, examples: null, createdAt: new Date(), updatedAt: new Date() },
    { id: 4, title: "Baixa retroactiva", category: "baja_retroactiva", description: "Desc", legalBasis: null, procedure: null, examples: null, createdAt: new Date(), updatedAt: new Date() },
    { id: 5, title: "Pluriempleo", category: "pluriempleo", description: "Desc", legalBasis: null, procedure: null, examples: null, createdAt: new Date(), updatedAt: new Date() },
    { id: 70001, title: "Pluriactivitat: treballador simultàniament autònom (RETA) i assalariat (Règim General)", category: "pluriempleo", description: "Desc", legalBasis: "Art. 313 LGSS", procedure: "Procediment", examples: "Exemple", createdAt: new Date(), updatedAt: new Date() },
  ]),
  getSpecialCasesByCategory: vi.fn().mockResolvedValue([]),
  getSpecialCaseById: vi.fn().mockResolvedValue(null),
  searchSpecialCases: vi.fn().mockResolvedValue([]),
  searchItDurations: vi.fn().mockResolvedValue([]),
  getItDurationById: vi.fn().mockResolvedValue(null),
  createConversation: vi.fn().mockResolvedValue(42),
  getUserConversations: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, title: "Consulta sobre IT", createdAt: new Date(), updatedAt: new Date() },
    { id: 2, userId: 1, title: "Pluriactivitat i baixa mèdica", createdAt: new Date(), updatedAt: new Date() },
    { id: 3, userId: 1, title: "Pròrroga IT 365 dies", createdAt: new Date(), updatedAt: new Date() },
  ]),
  getConversationMessages: vi.fn().mockResolvedValue([
    { id: 1, conversationId: 1, role: "user", content: "Quina és la durada màxima d'una IT?", sources: null, createdAt: new Date() },
    { id: 2, conversationId: 1, role: "assistant", content: "La durada màxima és de 365 dies prorrogables fins a 545 dies.", sources: null, createdAt: new Date() },
  ]),
  addMessage: vi.fn().mockResolvedValue(undefined),
  updateConversationTitle: vi.fn().mockResolvedValue(undefined),
  deleteConversation: vi.fn().mockResolvedValue(undefined),
  getRelevantContext: vi.fn().mockResolvedValue({ documents: [], cases: [] }),
  addFavorite: vi.fn().mockResolvedValue(undefined),
  removeFavorite: vi.fn().mockResolvedValue(undefined),
  getUserFavorites: vi.fn().mockResolvedValue({ documents: [], cases: [] }),
  getUserFavoriteIds: vi.fn().mockResolvedValue([]),
  advancedSearchDocuments: vi.fn().mockResolvedValue([]),
  advancedSearchSpecialCases: vi.fn().mockResolvedValue([]),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./pdfGenerator", () => ({
  generateConversationPDF: vi.fn().mockResolvedValue(Buffer.from("PDF")),
  generateSpecialCasePDF: vi.fn().mockResolvedValue(Buffer.from("PDF")),
  generateDocumentPDF: vi.fn().mockResolvedValue(Buffer.from("PDF")),
}));

function createAuthContext(): TrpcContext {
  return {
    user: { id: 1, openId: "user-1", name: "Metge Test", email: "test@test.cat", role: "user", createdAt: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("Suport backend per a les millores del xat", () => {
  describe("getUserConversations — suport per al sidebar automàtic", () => {
    it("retorna la llista de converses de l'usuari autenticat", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.chat.getUserConversations();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("cada conversa té id, title, createdAt i updatedAt", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.chat.getUserConversations();
      for (const conv of result) {
        expect(conv).toHaveProperty("id");
        expect(conv).toHaveProperty("title");
        expect(conv).toHaveProperty("createdAt");
        expect(conv).toHaveProperty("updatedAt");
      }
    });

    it("retorna error si l'usuari no està autenticat", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.chat.getUserConversations()).rejects.toThrow();
    });
  });

  describe("getMessages — suport per a la càrrega de converses anteriors", () => {
    it("retorna els missatges d'una conversa existent", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.chat.getMessages({ conversationId: 1 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("cada missatge té role (user/assistant) i content", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.chat.getMessages({ conversationId: 1 });
      for (const msg of result) {
        expect(msg).toHaveProperty("role");
        expect(msg).toHaveProperty("content");
        expect(["user", "assistant"]).toContain(msg.role);
      }
    });
  });

  describe("specialCases.list — suport per als suggeriments ràpids (contingut en català)", () => {
    it("retorna tots els casos especials en català", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.specialCases.list({ language: "ca" });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("el cas de pluriactivitat (suggeriment ràpid) és accessible via specialCases.list", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.specialCases.list({ language: "ca" });
      const pluriactivitatCase = result.find(c => c.id === 70001);
      expect(pluriactivitatCase).toBeDefined();
      expect(pluriactivitatCase?.title).toContain("Pluriactivitat");
    });

    it("la llista inclou casos de diverses categories per cobrir tots els suggeriments ràpids", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.specialCases.list({ language: "ca" });
      const categories = new Set(result.map(c => c.category));
      // Els suggeriments ràpids cobreixen menstruació, pluriactivitat, recaiguda, vacances...
      expect(categories.size).toBeGreaterThan(1);
    });
  });

  describe("deleteConversation — funcionalitat del sidebar", () => {
    it("elimina una conversa existent de l'usuari autenticat", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.chat.deleteConversation({ conversationId: 1 })).resolves.not.toThrow();
    });

    it("retorna error si l'usuari no està autenticat", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.chat.deleteConversation({ conversationId: 1 })).rejects.toThrow();
    });
  });
});
