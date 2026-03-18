import { describe, it, expect } from "vitest";
import { searchItDurations, getItDurationById } from "./db";

describe("Calculadora IT - searchItDurations", () => {
  it("retorna resultats per a 'lumbalgia'", async () => {
    const results = await searchItDurations("lumbalgia");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].diagnosis.toLowerCase()).toContain("lumbalgia");
  });

  it("retorna resultats per a 'hèrnia'", async () => {
    const results = await searchItDurations("hèrnia");
    expect(results.length).toBeGreaterThan(0);
  });

  it("retorna resultats per a 'hernia' (sense accent)", async () => {
    const results = await searchItDurations("hernia");
    expect(results.length).toBeGreaterThan(0);
  });

  it("retorna resultats per a codi CIE-10 'M54'", async () => {
    const results = await searchItDurations("M54");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.cie10Code?.startsWith("M54"))).toBe(true);
  });

  it("retorna resultats per a 'fractura'", async () => {
    const results = await searchItDurations("fractura");
    expect(results.length).toBeGreaterThan(0);
  });

  it("retorna resultats per a 'depressió' o 'depress'", async () => {
    // La BD pot no suportar caràcters accentuats en LIKE, usem terme sense accent
    const results = await searchItDurations("depress");
    expect(results.length).toBeGreaterThan(0);
  });

  it("retorna resultats per a 'ansietat'", async () => {
    const results = await searchItDurations("ansietat");
    expect(results.length).toBeGreaterThan(0);
  });

  it("retorna resultats per a 'pneumònia'", async () => {
    const results = await searchItDurations("pneumònia");
    expect(results.length).toBeGreaterThan(0);
  });

  it("retorna resultats per a 'infart'", async () => {
    const results = await searchItDurations("infart");
    expect(results.length).toBeGreaterThan(0);
  });

  it("retorna resultats per a categoria 'Salut mental'", async () => {
    const results = await searchItDurations("Salut mental");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(r => r.category === "Salut mental")).toBe(true);
  });

  it("retorna array buit per a una cerca sense resultats", async () => {
    const results = await searchItDurations("xyzabcnonexistent999");
    expect(results).toEqual([]);
  });

  it("cada resultat té els camps obligatoris", async () => {
    const results = await searchItDurations("lumbalgia");
    for (const r of results) {
      expect(r.id).toBeDefined();
      expect(r.diagnosis).toBeTruthy();
      expect(typeof r.minDays).toBe("number");
      expect(typeof r.maxDays).toBe("number");
      expect(typeof r.averageDays).toBe("number");
      expect(r.minDays).toBeLessThanOrEqual(r.averageDays);
      expect(r.averageDays).toBeLessThanOrEqual(r.maxDays);
    }
  });

  it("retorna màxim 20 resultats", async () => {
    const results = await searchItDurations("a");
    expect(results.length).toBeLessThanOrEqual(20);
  });
});

describe("Calculadora IT - getItDurationById", () => {
  it("retorna un diagnòstic per ID vàlid", async () => {
    const results = await searchItDurations("lumbalgia");
    expect(results.length).toBeGreaterThan(0);
    const id = results[0].id;
    const item = await getItDurationById(id);
    expect(item).toBeDefined();
    expect(item?.id).toBe(id);
  });

  it("retorna null o undefined per a un ID inexistent", async () => {
    const item = await getItDurationById(999999);
    // Drizzle retorna undefined o null per a registres no trobats
    expect(item == null).toBe(true);
  });
});

describe("Calculadora IT - Validació de dades", () => {
  it("tots els diagnòstics inserits tenen dies mínims > 0", async () => {
    const results = await searchItDurations("a");
    for (const r of results) {
      expect(r.minDays).toBeGreaterThan(0);
    }
  });

  it("tots els diagnòstics inserits tenen dies màxims >= dies mínims", async () => {
    const results = await searchItDurations("a");
    for (const r of results) {
      expect(r.maxDays).toBeGreaterThanOrEqual(r.minDays);
    }
  });

  it("tots els diagnòstics inserits tenen dies mitjans entre mínim i màxim", async () => {
    const results = await searchItDurations("a");
    for (const r of results) {
      expect(r.averageDays).toBeGreaterThanOrEqual(r.minDays);
      expect(r.averageDays).toBeLessThanOrEqual(r.maxDays);
    }
  });
});
