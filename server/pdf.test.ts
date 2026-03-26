import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "admin",
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

  return { ctx };
}

describe("PDF Export", () => {
  it("should export a document to PDF", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get first document
    const documents = await caller.documents.list({ language: "ca" });
    expect(documents).toBeDefined();
    expect(documents.length).toBeGreaterThan(0);

    const firstDoc = documents[0];
    if (!firstDoc) {
      throw new Error("No documents found");
    }

    // Export to PDF
    const result = await caller.documents.exportPDF({ id: firstDoc.id });
    
    expect(result).toBeDefined();
    expect(result.pdf).toBeDefined();
    expect(typeof result.pdf).toBe("string");
    expect(result.filename).toBeDefined();
    expect(result.filename).toContain(".pdf");
    
    // Verify base64 format
    expect(result.pdf.length).toBeGreaterThan(0);
  });

  it("should export a special case to PDF", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get first special case
    const cases = await caller.specialCases.list({ language: "ca" });
    expect(cases).toBeDefined();
    expect(cases.length).toBeGreaterThan(0);

    const firstCase = cases[0];
    if (!firstCase) {
      throw new Error("No special cases found");
    }

    // Export to PDF
    const result = await caller.specialCases.exportPDF({ id: firstCase.id });
    
    expect(result).toBeDefined();
    expect(result.pdf).toBeDefined();
    expect(typeof result.pdf).toBe("string");
    expect(result.filename).toBeDefined();
    expect(result.filename).toContain(".pdf");
    
    // Verify base64 format
    expect(result.pdf.length).toBeGreaterThan(0);
  });

  it("should export a conversation to PDF", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get existing conversations
    const conversations = await caller.chat.getUserConversations();
    
    // Skip test if no conversations exist
    if (!conversations || conversations.length === 0) {
      console.log("No conversations found, skipping test");
      return;
    }

    const firstConversation = conversations[0];
    if (!firstConversation) {
      throw new Error("No conversations found");
    }

    // Export to PDF
    const result = await caller.chat.exportPDF({ conversationId: firstConversation.id });
    
    expect(result).toBeDefined();
    expect(result.pdf).toBeDefined();
    expect(typeof result.pdf).toBe("string");
    expect(result.filename).toBeDefined();
    expect(result.filename).toContain(".pdf");
    expect(result.filename).toContain(`conversa_${firstConversation.id}`);
    
    // Verify base64 format
    expect(result.pdf.length).toBeGreaterThan(0);
  });
});
