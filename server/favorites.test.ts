import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  getAllDocuments: vi.fn().mockResolvedValue([
    { id: 1, title: "RD 625/2014", type: "decreto", jurisdiction: "estatal", source: "BOE", content: "Contingut...", summary: "Resum", tags: ["IT"], url: null, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, title: "Guia IT Catalunya", type: "guia", jurisdiction: "autonomica", source: "ICS", content: "Contingut guia...", summary: "Resum guia", tags: ["IT", "Catalunya"], url: null, createdAt: new Date(), updatedAt: new Date() },
  ]),
  searchDocuments: vi.fn().mockResolvedValue([
    { id: 1, title: "RD 625/2014", type: "decreto", jurisdiction: "estatal", source: "BOE", content: "Contingut...", summary: "Resum", tags: ["IT"], url: null, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getDocumentById: vi.fn().mockResolvedValue({
    id: 1, title: "RD 625/2014", type: "decreto", jurisdiction: "estatal", source: "BOE", content: "Contingut...", summary: "Resum", tags: ["IT"], url: null, createdAt: new Date(), updatedAt: new Date()
  }),
  getAllSpecialCases: vi.fn().mockResolvedValue([
    { id: 1, title: "Menstruació incapacitant", category: "menstruacion", description: "Descripció", legalBasis: "Art. 169 LGSS", procedure: "Procediment", examples: "Exemple", createdAt: new Date(), updatedAt: new Date() },
  ]),
  getSpecialCasesByCategory: vi.fn().mockResolvedValue([]),
  getSpecialCaseById: vi.fn().mockResolvedValue({
    id: 1, title: "Menstruació incapacitant", category: "menstruacion", description: "Descripció", legalBasis: "Art. 169 LGSS", procedure: "Procediment", examples: "Exemple", createdAt: new Date(), updatedAt: new Date()
  }),
  searchSpecialCases: vi.fn().mockResolvedValue([]),
  searchItDurations: vi.fn().mockResolvedValue([]),
  getItDurationById: vi.fn().mockResolvedValue(null),
  createConversation: vi.fn().mockResolvedValue(1),
  getUserConversations: vi.fn().mockResolvedValue([]),
  getConversationMessages: vi.fn().mockResolvedValue([]),
  addMessage: vi.fn().mockResolvedValue(undefined),
  updateConversationTitle: vi.fn().mockResolvedValue(undefined),
  deleteConversation: vi.fn().mockResolvedValue(undefined),
  getRelevantContext: vi.fn().mockResolvedValue({ documents: [], cases: [] }),
  addFavorite: vi.fn().mockResolvedValue(undefined),
  removeFavorite: vi.fn().mockResolvedValue(undefined),
  getUserFavorites: vi.fn().mockResolvedValue({ documents: [], cases: [] }),
  getUserFavoriteIds: vi.fn().mockResolvedValue([
    { entityType: "document", entityId: 1 },
    { entityType: "special_case", entityId: 1 },
  ]),
  advancedSearchDocuments: vi.fn().mockResolvedValue([
    { id: 1, title: "RD 625/2014", type: "decreto", jurisdiction: "estatal", source: "BOE", content: "Contingut...", summary: "Resum", tags: ["IT"], url: null, createdAt: new Date(), updatedAt: new Date() },
  ]),
  advancedSearchSpecialCases: vi.fn().mockResolvedValue([
    { id: 1, title: "Menstruació incapacitant", category: "menstruacion", description: "Descripció", legalBasis: "Art. 169 LGSS", procedure: "Procediment", examples: "Exemple", createdAt: new Date(), updatedAt: new Date() },
  ]),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

// Mock pdfGenerator
vi.mock("./pdfGenerator", () => ({
  generateConversationPDF: vi.fn().mockResolvedValue(Buffer.from("PDF")),
  generateSpecialCasePDF: vi.fn().mockResolvedValue(Buffer.from("PDF")),
  generateDocumentPDF: vi.fn().mockResolvedValue(Buffer.from("PDF")),
}));

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "test-user-42",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("favorites router", () => {
  it("getIds retorna els IDs de favorits de l'usuari autenticat", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.favorites.getIds();
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ entityType: "document", entityId: 1 });
    expect(result[1]).toMatchObject({ entityType: "special_case", entityId: 1 });
  });

  it("getAll retorna tots els favorits de l'usuari", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.favorites.getAll();
    expect(result).toMatchObject({ documents: [], cases: [] });
  });

  it("add afegeix un document als favorits", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.favorites.add({ entityType: "document", entityId: 1 });
    expect(result).toEqual({ success: true });
  });

  it("add afegeix un cas especial als favorits", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.favorites.add({ entityType: "special_case", entityId: 1 });
    expect(result).toEqual({ success: true });
  });

  it("remove elimina un document dels favorits", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.favorites.remove({ entityType: "document", entityId: 1 });
    expect(result).toEqual({ success: true });
  });
});

describe("search router", () => {
  it("global retorna documents i casos especials", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.search.global({ query: "IT" });
    expect(result).toHaveProperty("documents");
    expect(result).toHaveProperty("cases");
    expect(result.documents.length).toBeGreaterThan(0);
    expect(result.cases.length).toBeGreaterThan(0);
  });

  it("documents cerca per query i retorna resultats", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.search.documents({ query: "RD 625" });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("documents filtra per tipus", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.search.documents({ type: "decreto" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("documents filtra per jurisdicció", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.search.documents({ jurisdiction: "estatal" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("specialCases cerca per query", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.search.specialCases({ query: "menstruació" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("specialCases filtra per categoria", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.search.specialCases({ category: "menstruacion" });
    expect(Array.isArray(result)).toBe(true);
  });
});
