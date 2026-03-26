import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1, role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Documents Router", () => {
  it("should list all documents", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const documents = await caller.documents.list({ language: "ca" });

    expect(documents).toBeDefined();
    expect(Array.isArray(documents)).toBe(true);
    // Verificar que hay documentos cargados
    expect(documents.length).toBeGreaterThan(0);
  });

  it("should search documents by query", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.documents.search({ query: "Real Decreto" });

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });

  it("should get document by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Primero obtener un documento válido
    const documents = await caller.documents.list({ language: "ca" });
    if (documents.length > 0) {
      const doc = await caller.documents.getById({ language: "ca", id: documents[0]!.id });
      expect(doc).toBeDefined();
      expect(doc?.id).toBe(documents[0]!.id);
    }
  });
});

describe("Special Cases Router", () => {
  it("should list all special cases", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const cases = await caller.specialCases.list({ language: "ca" });

    expect(cases).toBeDefined();
    expect(Array.isArray(cases)).toBe(true);
    expect(cases.length).toBeGreaterThan(0);
  });

  it("should search special cases by query", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.specialCases.search({ language: "ca", query: "menstruación" });

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });

  it("should get special case by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const cases = await caller.specialCases.list({ language: "ca" });
    if (cases.length > 0) {
      const caso = await caller.specialCases.getById({ language: "ca", id: cases[0]!.id });
      expect(caso).toBeDefined();
      expect(caso?.id).toBe(cases[0]!.id);
    }
  });

  it("should filter cases by category", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const cases = await caller.specialCases.getByCategory({ category: "menstruacion" });

    expect(cases).toBeDefined();
    expect(Array.isArray(cases)).toBe(true);
    // Verificar que todos los casos tienen la categoría correcta
    cases.forEach((caso) => {
      expect(caso.category).toBe("menstruacion");
    });
  });
});

describe("Chat Router", () => {
  it("should create a new conversation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.createConversation({ title: "Test conversation" });

    expect(result).toBeDefined();
    expect(result.conversationId).toBeDefined();
    expect(typeof result.conversationId).toBe("number");
  });

  it("should get user conversations", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Crear una conversación primero
    await caller.chat.createConversation({ title: "Test" });

    const conversations = await caller.chat.getUserConversations();

    expect(conversations).toBeDefined();
    expect(Array.isArray(conversations)).toBe(true);
  });

  it("should send message and get AI response", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Crear conversación
    const { conversationId } = await caller.chat.createConversation({});

    // Enviar mensaje
    const response = await caller.chat.sendMessage({
      conversationId,
      message: "Quina és la durada màxima d'una IT?",
    });

    expect(response).toBeDefined();
    expect(response.message).toBeDefined();
    expect(typeof response.message).toBe("string");
    expect(response.message.length).toBeGreaterThan(0);
    expect(response.sources).toBeDefined();
    expect(Array.isArray(response.sources)).toBe(true);
  }, 30000); // Timeout de 30 segundos para la llamada a la IA

  it("should get messages from a conversation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Crear conversación y enviar mensaje
    const { conversationId } = await caller.chat.createConversation({});
    await caller.chat.sendMessage({
      conversationId,
      message: "Test message",
    });

    const messages = await caller.chat.getMessages({ conversationId });

    expect(messages).toBeDefined();
    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThanOrEqual(2); // Usuario + Asistente
  }, 30000);
});

describe("IT Durations Router", () => {
  it("should search IT durations by query", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.itDurations.search({ query: "fractura" });

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });
});

describe("Auth Router", () => {
  it("should return current user info", async () => {
    const ctx = createAuthContext(1, "admin");
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).toBeDefined();
    expect(user?.id).toBe(1);
    expect(user?.role).toBe("admin");
  });

  it("should logout successfully", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
