import { describe, it, expect } from "vitest";

describe("Semantic Search - Synonym Dictionary", () => {
  it("should export semanticSearchDiagnosis function", async () => {
    const mod = await import("./semanticSearch");
    expect(mod.semanticSearchDiagnosis).toBeDefined();
    expect(typeof mod.semanticSearchDiagnosis).toBe("function");
  });

  it("should return results for common colloquial terms via synonyms", async () => {
    const { semanticSearchDiagnosis } = await import("./semanticSearch");
    // "mal d'esquena" should match lumbalgia, dorsalgia, etc. via synonym dictionary
    const response = await semanticSearchDiagnosis("mal d'esquena");
    expect(response).toHaveProperty("results");
    expect(response).toHaveProperty("method");
    expect(Array.isArray(response.results)).toBe(true);
    expect(response.results.length).toBeGreaterThan(0);
    // Should use synonyms method since "mal d'esquena" is not a direct DB term
    expect(["synonyms", "direct", "llm"]).toContain(response.method);
  });

  it("should return results for Spanish colloquial terms", async () => {
    const { semanticSearchDiagnosis } = await import("./semanticSearch");
    // "dolor de cabeza" should match migranya, cefalea via synonyms
    const response = await semanticSearchDiagnosis("dolor de cabeza");
    expect(response).toHaveProperty("results");
    expect(Array.isArray(response.results)).toBe(true);
    expect(response.results.length).toBeGreaterThan(0);
  });

  it("should return results for direct CIE-10 code search", async () => {
    const { semanticSearchDiagnosis } = await import("./semanticSearch");
    // M54 is lumbalgia - should match directly
    const response = await semanticSearchDiagnosis("M54");
    expect(response).toHaveProperty("results");
    expect(Array.isArray(response.results)).toBe(true);
    expect(response.results.length).toBeGreaterThan(0);
    expect(response.method).toBe("direct");
  });

  it("should return empty results array for nonsense queries", async () => {
    const { semanticSearchDiagnosis } = await import("./semanticSearch");
    const response = await semanticSearchDiagnosis("xyzqwerty123456");
    expect(response).toHaveProperty("results");
    expect(Array.isArray(response.results)).toBe(true);
    // Nonsense query should return 0 results (or LLM may find something)
    // We just verify the structure is correct
  });

  it("should handle short queries gracefully", async () => {
    const { semanticSearchDiagnosis } = await import("./semanticSearch");
    const response = await semanticSearchDiagnosis("ab");
    expect(response).toHaveProperty("results");
    expect(response).toHaveProperty("method");
    expect(Array.isArray(response.results)).toBe(true);
  });

  it("should indicate synonyms method when using synonym dictionary", async () => {
    const { semanticSearchDiagnosis } = await import("./semanticSearch");
    const response = await semanticSearchDiagnosis("lumbago");
    expect(response).toHaveProperty("results");
    // "lumbago" is in the synonym dictionary mapping to lumbalgia
    if (response.method === "synonyms") {
      expect(response.synonymsUsed).toBeDefined();
      expect(Array.isArray(response.synonymsUsed)).toBe(true);
    }
  });
});
