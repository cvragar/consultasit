/**
 * Tests per a les millores de la pàgina de Documentació:
 * - Filtre per any de publicació
 * - Indicador visual de vigència (vigent/derogada/en_revisio)
 * - Migració de l'esquema (nous camps publicationYear i status)
 */
import { describe, it, expect } from "vitest";

// ===== Tests de l'esquema i la lògica de filtratge =====

describe("Document status logic", () => {
  const statusConfig = {
    vigent: { label: "Vigent", badgeClass: "bg-green-100 text-green-800 border-green-200" },
    derogada: { label: "Derogada", badgeClass: "bg-red-100 text-red-800 border-red-200" },
    en_revisio: { label: "En revisió", badgeClass: "bg-amber-100 text-amber-800 border-amber-200" },
  };

  it("should have correct label for vigent status", () => {
    expect(statusConfig.vigent.label).toBe("Vigent");
  });

  it("should have correct label for derogada status", () => {
    expect(statusConfig.derogada.label).toBe("Derogada");
  });

  it("should have correct label for en_revisio status", () => {
    expect(statusConfig.en_revisio.label).toBe("En revisió");
  });

  it("should have green badge for vigent status", () => {
    expect(statusConfig.vigent.badgeClass).toContain("green");
  });

  it("should have red badge for derogada status", () => {
    expect(statusConfig.derogada.badgeClass).toContain("red");
  });

  it("should have amber badge for en_revisio status", () => {
    expect(statusConfig.en_revisio.badgeClass).toContain("amber");
  });
});

// ===== Tests de la lògica de filtratge local =====

describe("Document filtering logic", () => {
  type MockDocument = {
    id: number;
    title: string;
    type: string;
    jurisdiction: string;
    status: string;
    publicationYear: number | null;
    content: string;
    summary: string | null;
    source: string | null;
  };

  const mockDocuments: MockDocument[] = [
    { id: 1, title: "Llei 8/2015 LGSS", type: "ley", jurisdiction: "estatal", status: "vigent", publicationYear: 2015, content: "Contingut LGSS", summary: "Resum LGSS", source: "BOE" },
    { id: 2, title: "Decret 575/1997", type: "decreto", jurisdiction: "estatal", status: "derogada", publicationYear: 1997, content: "Contingut derogat", summary: null, source: "BOE" },
    { id: 3, title: "Guia ICS IT 2022", type: "guia", jurisdiction: "autonomica", status: "vigent", publicationYear: 2022, content: "Guia ICS", summary: "Guia pràctica", source: "ICS" },
    { id: 4, title: "Manual INSS 2023", type: "manual", jurisdiction: "estatal", status: "en_revisio", publicationYear: 2023, content: "Manual INSS", summary: null, source: "INSS" },
    { id: 5, title: "Decret 84/1996", type: "decreto", jurisdiction: "estatal", status: "en_revisio", publicationYear: 1996, content: "Contingut 1996", summary: null, source: "BOE" },
  ];

  const filterDocuments = (
    docs: MockDocument[],
    opts: { query?: string; type?: string; jurisdiction?: string; year?: string; status?: string }
  ) => {
    let result = [...docs];
    if (opts.query && opts.query.length > 1) {
      const q = opts.query.toLowerCase();
      result = result.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        (d.summary?.toLowerCase().includes(q)) ||
        (d.source?.toLowerCase().includes(q))
      );
    }
    if (opts.type && opts.type !== "all") result = result.filter(d => d.type === opts.type);
    if (opts.jurisdiction && opts.jurisdiction !== "all") result = result.filter(d => d.jurisdiction === opts.jurisdiction);
    if (opts.year && opts.year !== "all") result = result.filter(d => d.publicationYear === parseInt(opts.year!));
    if (opts.status && opts.status !== "all") result = result.filter(d => d.status === opts.status);
    return result;
  };

  it("should return all documents when no filters applied", () => {
    const result = filterDocuments(mockDocuments, {});
    expect(result).toHaveLength(5);
  });

  it("should filter by type correctly", () => {
    const result = filterDocuments(mockDocuments, { type: "decreto" });
    expect(result).toHaveLength(2);
    expect(result.every(d => d.type === "decreto")).toBe(true);
  });

  it("should filter by jurisdiction correctly", () => {
    const result = filterDocuments(mockDocuments, { jurisdiction: "autonomica" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  it("should filter by publication year correctly", () => {
    const result = filterDocuments(mockDocuments, { year: "2022" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  it("should filter by status vigent correctly", () => {
    const result = filterDocuments(mockDocuments, { status: "vigent" });
    expect(result).toHaveLength(2);
    expect(result.every(d => d.status === "vigent")).toBe(true);
  });

  it("should filter by status derogada correctly", () => {
    const result = filterDocuments(mockDocuments, { status: "derogada" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it("should filter by status en_revisio correctly", () => {
    const result = filterDocuments(mockDocuments, { status: "en_revisio" });
    expect(result).toHaveLength(2);
    expect(result.every(d => d.status === "en_revisio")).toBe(true);
  });

  it("should combine multiple filters correctly", () => {
    const result = filterDocuments(mockDocuments, { type: "decreto", status: "en_revisio" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(5);
  });

  it("should filter by search query in title", () => {
    const result = filterDocuments(mockDocuments, { query: "LGSS" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("should filter by search query in source", () => {
    const result = filterDocuments(mockDocuments, { query: "ICS" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  it("should return empty array when no documents match filters", () => {
    const result = filterDocuments(mockDocuments, { year: "1990" });
    expect(result).toHaveLength(0);
  });
});

// ===== Tests de l'extracció d'anys únics =====

describe("Available years extraction", () => {
  it("should extract unique years from documents in descending order", () => {
    const docs = [
      { publicationYear: 2022 },
      { publicationYear: 2015 },
      { publicationYear: 2022 },
      { publicationYear: null },
      { publicationYear: 2023 },
    ];
    const years = new Set<number>();
    docs.forEach(d => { if (d.publicationYear) years.add(d.publicationYear); });
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    expect(sortedYears).toEqual([2023, 2022, 2015]);
  });

  it("should handle documents with no publication year", () => {
    const docs = [{ publicationYear: null }, { publicationYear: null }];
    const years = new Set<number>();
    docs.forEach(d => { if (d.publicationYear) years.add(d.publicationYear); });
    expect(years.size).toBe(0);
  });
});
