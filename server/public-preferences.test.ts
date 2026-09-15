import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("public preferences", () => {
  it("returns Catalan and light defaults for visitors without a session", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.user.getLanguage()).resolves.toEqual({ language: "ca" });
    await expect(caller.user.getTheme()).resolves.toEqual({ theme: "light" });
  });
});
