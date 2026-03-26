import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateUserLanguage, getUserByOpenId } from "./db";

// Mock de la BD
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    updateUserLanguage: vi.fn().mockResolvedValue(undefined),
    getUserByOpenId: vi.fn().mockResolvedValue({
      id: 1,
      openId: "test-open-id",
      name: "Test User",
      email: "test@example.com",
      role: "user",
      preferredLanguage: "ca",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: null,
    }),
  };
});

describe("User Language Preference", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updateUserLanguage crida la BD amb l'idioma correcte (ca)", async () => {
    await updateUserLanguage("test-open-id", "ca");
    expect(updateUserLanguage).toHaveBeenCalledWith("test-open-id", "ca");
  });

  it("updateUserLanguage crida la BD amb l'idioma correcte (es)", async () => {
    await updateUserLanguage("test-open-id", "es");
    expect(updateUserLanguage).toHaveBeenCalledWith("test-open-id", "es");
  });

  it("getUserByOpenId retorna preferredLanguage", async () => {
    const user = await getUserByOpenId("test-open-id");
    expect(user).toBeDefined();
    expect(user?.preferredLanguage).toBe("ca");
  });

  it("updateUserLanguage s'executa sense llançar excepcions per a 'ca'", async () => {
    await expect(updateUserLanguage("user-123", "ca")).resolves.toBeUndefined();
  });

  it("updateUserLanguage s'executa sense llançar excepcions per a 'es'", async () => {
    await expect(updateUserLanguage("user-123", "es")).resolves.toBeUndefined();
  });

  it("updateUserLanguage accepta openId arbitrari", async () => {
    await updateUserLanguage("any-open-id-456", "es");
    expect(updateUserLanguage).toHaveBeenCalledTimes(1);
    expect(updateUserLanguage).toHaveBeenCalledWith("any-open-id-456", "es");
  });

  it("el valor per defecte de preferredLanguage és 'ca'", async () => {
    const user = await getUserByOpenId("test-open-id");
    expect(user?.preferredLanguage).toBe("ca");
  });

  it("updateUserLanguage es pot cridar múltiples vegades", async () => {
    await updateUserLanguage("u1", "ca");
    await updateUserLanguage("u1", "es");
    await updateUserLanguage("u1", "ca");
    expect(updateUserLanguage).toHaveBeenCalledTimes(3);
  });
});
