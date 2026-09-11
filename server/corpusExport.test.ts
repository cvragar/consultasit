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

  it("uneix els dos corpus en un ZIP amb carpetes i índex general", () => {
    const corpus = generateCombinedCorpus([document], [specialCase], generatedAt);
    const archiveFiles = unzipSync(corpus.archive);
    const generalIndex = strFromU8(archiveFiles["00-INDEX-CORPUS-COMPLET.txt"]);

    expect(corpus.kind).toBe("all");
    expect(corpus.filename).toBe("consultes-it-corpus-complet.zip");
    expect(corpus.validation.input_records).toBe(2);
    expect(corpus.validation.valid).toBe(true);
    expect(generalIndex).toContain("Total de fitxers de contingut: 2");
    expect(generalIndex).toContain("documentacio_txt_coloqia/");
    expect(generalIndex).toContain("casos_especiales_txt_coloqia/");
    expect(archiveFiles["documentacio_txt_coloqia/00-INDEX.txt"]).toBeDefined();
    expect(archiveFiles["casos_especiales_txt_coloqia/00-INDEX.txt"]).toBeDefined();
    expect(archiveFiles["validation-report.json"]).toBeDefined();
  });
});
