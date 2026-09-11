import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import type { Document, SpecialCase } from "../drizzle/schema";
import {
  CORPUS_EXPORT_VERSION,
  generateCombinedCorpus,
  generateDocumentsCorpus,
  generateSpecialCasesCorpus,
} from "./corpusExport";
import type { GeneratedCorpus } from "./corpusExport";

const generatedAt = new Date("2026-09-11T10:44:00.000Z");

const document = {
  id: 42,
  title: "Guia de prova",
  titleEs: "Guía de prueba",
  type: "guia",
  source: "ICS",
  jurisdiction: "autonomica",
  content: "## Contingut\n\nCriteri **important** amb un [enllaç](https://example.test).",
  contentEs: "## Contenido\n\nCriterio **importante** con un [enlace](https://example.test).",
  summary: "Resum de prova",
  summaryEs: "Resumen de prueba",
  url: "https://example.test/guia",
  tags: ["IT", "prova"],
  publicationYear: 2026,
  status: "vigent",
  createdAt: generatedAt,
  updatedAt: generatedAt,
  createdBy: 1,
} as Document;

const specialCase = {
  id: 99,
  title: "Cas de prova",
  titleEs: "Caso de prueba",
  category: "otro",
  description: "Descripció **catalana**.",
  descriptionEs: "Descripción **española**.",
  legalBasis: "Art. 1 LGSS",
  legalBasisEs: "Art. 1 LGSS",
  procedure: "Pas 1",
  procedureEs: "Paso 1",
  examples: "Exemple pràctic",
  examplesEs: "Ejemplo práctico",
  relatedDocumentIds: [],
  createdAt: generatedAt,
  updatedAt: generatedAt,
  createdBy: 1,
} as SpecialCase;

function fileContent(corpus: GeneratedCorpus, name: string) {
  const file = corpus.files.find(item => item.name === name);
  expect(file).toBeDefined();
  return file?.content ?? "";
}

describe("generador de corpus TXT per a Coloq.ia", () => {
  it("genera el corpus documental amb versió, data i ZIP vàlid", () => {
    const corpus = generateDocumentsCorpus([document], generatedAt);
    const index = fileContent(corpus, "00-INDEX.txt");
    const documentText = corpus.files.find(file => file.name.endsWith("guia-de-prova.txt"))?.content ?? "";
    const archiveFiles = unzipSync(corpus.archive);

    expect(corpus.kind).toBe("documents");
    expect(corpus.version).toBe(CORPUS_EXPORT_VERSION);
    expect(corpus.generatedAt).toBe("2026-09-11T10:44:00.000Z");
    expect(corpus.validation.valid).toBe(true);
    expect(index).toContain("Fecha de generación (UTC): 2026-09-11T10:44:00.000Z");
    expect(index).toContain(`Versión del corpus: ${CORPUS_EXPORT_VERSION}`);
    expect(documentText).toContain("enllaç (https://example.test)");
    expect(documentText).not.toMatch(/^#{1,6}\s/m);
    expect(documentText).not.toMatch(/\[[^\]]+\]\([^)]+\)/);
    expect(strFromU8(archiveFiles["documentacio_txt_coloqia/00-INDEX.txt"])).toContain(CORPUS_EXPORT_VERSION);
  });

  it("genera el corpus de casos amb índex versionat i text pla", () => {
    const corpus = generateSpecialCasesCorpus([specialCase], generatedAt);
    const index = fileContent(corpus, "00-INDEX.txt");
    const caseText = corpus.files.find(file => file.name.endsWith("cas-de-prova.txt"))?.content ?? "";
    const archiveFiles = unzipSync(corpus.archive);

    expect(corpus.kind).toBe("specialCases");
    expect(corpus.validation.valid).toBe(true);
    expect(index).toContain("Fecha de generación (UTC): 2026-09-11T10:44:00.000Z");
    expect(index).toContain(`Versión del corpus: ${CORPUS_EXPORT_VERSION}`);
    expect(caseText).toContain("CONTENIDO EN ESPAÑOL");
    expect(caseText).toContain("INSTRUCCIONES PARA EL ASISTENTE");
    expect(caseText).not.toMatch(/^#{1,6}\s/m);
    expect(strFromU8(archiveFiles["casos_especiales_txt_coloqia/00-INDEX.txt"])).toContain(CORPUS_EXPORT_VERSION);
  });

  it("uneix els dos corpus en un ZIP pla amb índex i manifest comuns", () => {
    const corpus = generateCombinedCorpus([document], [specialCase], generatedAt);
    const archiveFiles = unzipSync(corpus.archive);
    const generalIndex = strFromU8(archiveFiles["00-INDEX-CORPUS-COMPLET.txt"]);
    const manifest = JSON.parse(strFromU8(archiveFiles["manifest.json"])) as {
      files: Array<{ corpus: string; filename: string }>;
    };

    expect(corpus.kind).toBe("all");
    expect(corpus.filename).toBe("consultes-it-corpus-complet.zip");
    expect(corpus.validation.input_records).toBe(2);
    expect(corpus.validation.valid).toBe(true);
    expect(generalIndex).toContain("Total de fitxers de contingut: 2");
    expect(generalIndex).toContain("ESTRUCTURA PLANA PER A COLOQ.IA");
    expect(generalIndex).toContain("sense carpetes");
    expect(archiveFiles["DOC-042-guia-de-prova.txt"]).toBeDefined();
    expect(archiveFiles["CAS-099-cas-de-prova.txt"]).toBeDefined();
    expect(archiveFiles["00-INSTRUCCIONS-COLOQIA.txt"]).toBeDefined();
    expect(archiveFiles["validation-report.json"]).toBeDefined();
    expect(Object.keys(archiveFiles).some(name => name.includes("/"))).toBe(false);
    expect(manifest.files).toHaveLength(2);
    expect(manifest.files).toEqual(expect.arrayContaining([
      expect.objectContaining({ corpus: "documentacio", filename: "DOC-042-guia-de-prova.txt" }),
      expect.objectContaining({ corpus: "casos_especials", filename: "CAS-099-cas-de-prova.txt" }),
    ]));
  });

  it("filtra el ZIP pla només a documentació o només a casos", () => {
    const documentsCorpus = generateCombinedCorpus([document], [specialCase], generatedAt, "documents");
    const casesCorpus = generateCombinedCorpus([document], [specialCase], generatedAt, "specialCases");
    const documentFiles = Object.keys(unzipSync(documentsCorpus.archive));
    const caseFiles = Object.keys(unzipSync(casesCorpus.archive));
    const documentManifest = JSON.parse(
      strFromU8(unzipSync(documentsCorpus.archive)["manifest.json"]),
    ) as { scope: string; documents: number; special_cases: number };
    const caseManifest = JSON.parse(
      strFromU8(unzipSync(casesCorpus.archive)["manifest.json"]),
    ) as { scope: string; documents: number; special_cases: number };

    expect(documentsCorpus.kind).toBe("documents");
    expect(documentsCorpus.filename).toBe("consultes-it-documentacio-plana.zip");
    expect(documentFiles).toContain("DOC-042-guia-de-prova.txt");
    expect(documentFiles.some(name => name.startsWith("CAS-"))).toBe(false);
    expect(documentManifest).toMatchObject({ scope: "documents", documents: 1, special_cases: 0 });

    expect(casesCorpus.kind).toBe("specialCases");
    expect(casesCorpus.filename).toBe("consultes-it-casos-especials-plans.zip");
    expect(caseFiles).toContain("CAS-099-cas-de-prova.txt");
    expect(caseFiles.some(name => name.startsWith("DOC-"))).toBe(false);
    expect(caseManifest).toMatchObject({ scope: "specialCases", documents: 0, special_cases: 1 });
  });
});
