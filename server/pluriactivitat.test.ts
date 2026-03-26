import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock del mòdul de base de dades
vi.mock("./db", () => ({
  getAllDocuments: vi.fn().mockResolvedValue([]),
  searchDocuments: vi.fn().mockResolvedValue([]),
  getDocumentById: vi.fn().mockResolvedValue(null),
  getAllSpecialCases: vi.fn().mockResolvedValue([
    {
      id: 1,
      title: "Menstruació incapacitant",
      category: "menstruacion",
      description: "Descripció",
      legalBasis: "Art. 169 LGSS",
      procedure: "Procediment",
      examples: "Exemple",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 6,
      title: "Pluriempleo",
      category: "pluriempleo",
      description: "El trabajador pluriempleado en IT debe causar baja en todos sus empleos.",
      legalBasis: "Art. 175 LGSS",
      procedure: "Procediment pluriempleo",
      examples: "Exemple pluriempleo",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 70001,
      title: "Pluriactivitat: treballador simultàniament autònom (RETA) i assalariat (Règim General)",
      category: "pluriempleo",
      description: "La pluriactivitat és la situació en la qual un treballador exerceix simultàniament activitats que donen lloc a la seva alta obligatòria en dos o més règims distintos del sistema de la Seguretat Social.",
      legalBasis: "Art. 7.4 RD 84/1996; Art. 313 LGSS; STS 19/02/2002 (RCUD 2127/2001)",
      procedure: "PRINCIPI FONAMENTAL: El metge de família ha d'emetre PARTS DE BAIXA SEPARATS per a cada règim en el qual el treballador estigui d'alta.",
      examples: "EXEMPLE 1: Metge de família que combina la sanitat pública (assalariat) i la clínica privada (autònom)",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getSpecialCasesByCategory: vi.fn().mockImplementation(async (category: string) => {
    if (category === "pluriempleo") {
      return [
        {
          id: 6,
          title: "Pluriempleo",
          category: "pluriempleo",
          description: "El trabajador pluriempleado en IT debe causar baja en todos sus empleos.",
          legalBasis: "Art. 175 LGSS",
          procedure: "Procediment pluriempleo",
          examples: "Exemple pluriempleo",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 70001,
          title: "Pluriactivitat: treballador simultàniament autònom (RETA) i assalariat (Règim General)",
          category: "pluriempleo",
          description: "La pluriactivitat és la situació en la qual un treballador exerceix simultàniament activitats que donen lloc a la seva alta obligatòria en dos o més règims distintos del sistema de la Seguretat Social.",
          legalBasis: "Art. 7.4 RD 84/1996; Art. 313 LGSS; STS 19/02/2002 (RCUD 2127/2001)",
          procedure: "PRINCIPI FONAMENTAL: El metge de família ha d'emetre PARTS DE BAIXA SEPARATS per a cada règim en el qual el treballador estigui d'alta.",
          examples: "EXEMPLE 1: Metge de família que combina la sanitat pública (assalariat) i la clínica privada (autònom)",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }
    return [];
  }),
  getSpecialCaseById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 70001) {
      return {
        id: 70001,
        title: "Pluriactivitat: treballador simultàniament autònom (RETA) i assalariat (Règim General)",
        category: "pluriempleo",
        description: "La pluriactivitat és la situació en la qual un treballador exerceix simultàniament activitats que donen lloc a la seva alta obligatòria en dos o més règims distintos del sistema de la Seguretat Social.",
        legalBasis: "Art. 7.4 RD 84/1996; Art. 313 LGSS; STS 19/02/2002 (RCUD 2127/2001)",
        procedure: "PRINCIPI FONAMENTAL: El metge de família ha d'emetre PARTS DE BAIXA SEPARATS per a cada règim en el qual el treballador estigui d'alta.",
        examples: "EXEMPLE 1: Metge de família que combina la sanitat pública (assalariat) i la clínica privada (autònom)",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return null;
  }),
  searchSpecialCases: vi.fn().mockImplementation(async (query: string) => {
    if (query.toLowerCase().includes("pluriactivitat") || query.toLowerCase().includes("reta") || query.toLowerCase().includes("autònom")) {
      return [
        {
          id: 70001,
          title: "Pluriactivitat: treballador simultàniament autònom (RETA) i assalariat (Règim General)",
          category: "pluriempleo",
          description: "La pluriactivitat és la situació en la qual un treballador exerceix simultàniament activitats que donen lloc a la seva alta obligatòria en dos o més règims distintos del sistema de la Seguretat Social.",
          legalBasis: "Art. 7.4 RD 84/1996; Art. 313 LGSS; STS 19/02/2002 (RCUD 2127/2001)",
          procedure: "PRINCIPI FONAMENTAL: El metge de família ha d'emetre PARTS DE BAIXA SEPARATS per a cada règim en el qual el treballador estigui d'alta.",
          examples: "EXEMPLE 1: Metge de família que combina la sanitat pública (assalariat) i la clínica privada (autònom)",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }
    return [];
  }),
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
  getUserFavoriteIds: vi.fn().mockResolvedValue([]),
  advancedSearchDocuments: vi.fn().mockResolvedValue([]),
  advancedSearchSpecialCases: vi.fn().mockImplementation(async (params: { query?: string; category?: string }) => {
    if (params.category === "pluriempleo" || params.query?.toLowerCase().includes("pluriactivitat")) {
      return [
        {
          id: 70001,
          title: "Pluriactivitat: treballador simultàniament autònom (RETA) i assalariat (Règim General)",
          category: "pluriempleo",
          description: "La pluriactivitat és la situació en la qual un treballador exerceix simultàniament activitats que donen lloc a la seva alta obligatòria en dos o més règims distintos del sistema de la Seguretat Social.",
          legalBasis: "Art. 7.4 RD 84/1996; Art. 313 LGSS; STS 19/02/2002 (RCUD 2127/2001)",
          procedure: "PRINCIPI FONAMENTAL: El metge de família ha d'emetre PARTS DE BAIXA SEPARATS per a cada règim en el qual el treballador estigui d'alta.",
          examples: "EXEMPLE 1: Metge de família que combina la sanitat pública (assalariat) i la clínica privada (autònom)",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }
    return [];
  }),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

// Mock del generador de PDFs
vi.mock("./pdfGenerator", () => ({
  generateConversationPDF: vi.fn().mockResolvedValue(Buffer.from("PDF")),
  generateSpecialCasePDF: vi.fn().mockResolvedValue(Buffer.from("PDF")),
  generateDocumentPDF: vi.fn().mockResolvedValue(Buffer.from("PDF")),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("Cas especial de Pluriactivitat (RETA + Règim General)", () => {
  it("getAllSpecialCases inclou el cas de pluriactivitat", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.specialCases.list({ language: "ca" });
    const pluriactivitatCase = result.find(c => c.id === 70001);
    expect(pluriactivitatCase).toBeDefined();
    expect(pluriactivitatCase?.category).toBe("pluriempleo");
    expect(pluriactivitatCase?.title).toContain("Pluriactivitat");
  });

  it("getSpecialCasesByCategory retorna el cas de pluriactivitat per la categoria pluriempleo", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.specialCases.getByCategory({ category: "pluriempleo" });
    expect(Array.isArray(result)).toBe(true);
    const pluriactivitatCase = result.find(c => c.id === 70001);
    expect(pluriactivitatCase).toBeDefined();
    expect(pluriactivitatCase?.title).toContain("Pluriactivitat");
  });

  it("getSpecialCaseById retorna el cas de pluriactivitat per ID 70001", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.specialCases.getById({ language: "ca", id: 70001 });
    expect(result).toBeDefined();
    expect(result?.id).toBe(70001);
    expect(result?.title).toContain("Pluriactivitat");
    expect(result?.category).toBe("pluriempleo");
  });

  it("el cas de pluriactivitat té base legal amb normativa LGSS i jurisprudència TS", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.specialCases.getById({ language: "ca", id: 70001 });
    expect(result?.legalBasis).toBeDefined();
    expect(result?.legalBasis).toContain("LGSS");
    expect(result?.legalBasis).toContain("STS");
  });

  it("el cas de pluriactivitat té procediment amb instruccions per a l'eCap", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.specialCases.getById({ language: "ca", id: 70001 });
    expect(result?.procedure).toBeDefined();
    expect(result?.procedure).toContain("PARTS DE BAIXA SEPARATS");
  });

  it("el cas de pluriactivitat té exemples pràctics", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.specialCases.getById({ language: "ca", id: 70001 });
    expect(result?.examples).toBeDefined();
    expect(result?.examples).toContain("EXEMPLE");
  });

  it("searchSpecialCases troba el cas de pluriactivitat per la paraula clau 'pluriactivitat'", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.specialCases.search({ language: "ca", query: "pluriactivitat" });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    const found = result.find(c => c.id === 70001);
    expect(found).toBeDefined();
  });

  it("searchSpecialCases troba el cas de pluriactivitat per la paraula clau 'RETA'", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.specialCases.search({ language: "ca", query: "RETA" });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("search.specialCases filtra per categoria pluriempleo i inclou el cas de pluriactivitat", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.search.specialCases({ category: "pluriempleo" });
    expect(Array.isArray(result)).toBe(true);
    const pluriactivitatCase = result.find(c => c.id === 70001);
    expect(pluriactivitatCase).toBeDefined();
  });

  it("exportPDF genera un PDF per al cas de pluriactivitat", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.specialCases.exportPDF({ id: 70001 });
    expect(result).toHaveProperty("pdf");
    expect(result).toHaveProperty("filename");
    expect(result.pdf).toBeTruthy();
    expect(result.filename).toContain(".pdf");
  });
});
