import { strToU8, zipSync } from "fflate";
import type { Document, SpecialCase } from "../drizzle/schema";

export const CORPUS_EXPORT_VERSION = "2026.09.11.1";
export type CorpusKind = "documents" | "specialCases" | "all";

type CorpusFile = {
  name: string;
  content: string;
};

type ValidationReport = {
  input_records: number;
  exported_records: number;
  formats: ["txt"];
  generated_at: string;
  corpus_version: string;
  empty_files: string[];
  invalid_utf8_files: string[];
  txt_markdown_artifacts: string[];
  warnings: string[];
  valid: boolean;
};

export type GeneratedCorpus = {
  kind: CorpusKind;
  version: string;
  generatedAt: string;
  filename: string;
  files: CorpusFile[];
  validation: ValidationReport;
  archive: Buffer;
};

function normalize(value: unknown) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "")
    .trim();
}

function plainText(value: unknown) {
  return normalize(value)
    .replace(/```[^\n]*\n?/g, "")
    .replace(/```/g, "")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1. Imagen: $2")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^\s*[-*_]{3,}\s*$/gm, "")
    .replace(/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/gm, "")
    .replace(/^\s*\|\s?/gm, "")
    .replace(/\s?\|\s*$/gm, "")
    .replace(/\s*\|\s*/g, " ; ")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "$1")
    .replace(/(?<!_)_([^_\n]+)_(?!_)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "document";
}

function filenamePrefix(id: number) {
  const value = String(id);
  return value.length < 3 ? value.padStart(3, "0") : value;
}

function section(title: string, body: unknown) {
  const clean = plainText(body);
  return clean ? `${title}\n${"=".repeat(title.length)}\n\n${clean}\n` : "";
}

function readTags(tags: Document["tags"]) {
  return Array.isArray(tags) ? tags.map(normalize).filter(Boolean) : [];
}

function makeFile(name: string, content: string): CorpusFile {
  return { name, content: `${content.replace(/\n{3,}/g, "\n\n").trim()}\n` };
}

function validate(files: CorpusFile[], inputRecords: number, generatedAt: string): ValidationReport {
  const emptyFiles: string[] = [];
  const markdownArtifacts: string[] = [];
  const invalidUtf8Files: string[] = [];

  for (const file of files) {
    if (!file.content.trim()) emptyFiles.push(file.name);
    if (
      /^#{1,6}\s/m.test(file.content)
      || /\[[^\]]+\]\([^)]+\)/.test(file.content)
      || file.content.includes("```")
      || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(file.content)
    ) {
      markdownArtifacts.push(file.name);
    }
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(strToU8(file.content));
    } catch {
      invalidUtf8Files.push(file.name);
    }
  }

  return {
    input_records: inputRecords,
    exported_records: inputRecords,
    formats: ["txt"],
    generated_at: generatedAt,
    corpus_version: CORPUS_EXPORT_VERSION,
    empty_files: emptyFiles,
    invalid_utf8_files: invalidUtf8Files,
    txt_markdown_artifacts: markdownArtifacts,
    warnings: [],
    valid: !emptyFiles.length && !invalidUtf8Files.length && !markdownArtifacts.length,
  };
}

function archiveCorpus(folder: string, files: CorpusFile[]) {
  const entries: Record<string, Uint8Array> = {};
  for (const file of files) {
    entries[`${folder}/${file.name}`] = strToU8(file.content);
  }
  return Buffer.from(zipSync(entries, { level: 6 }));
}

function documentsInstructions(total: number) {
  return [
    "INSTRUCCIONES DE USO DEL CORPUS DOCUMENTAL",
    "============================================",
    "",
    "OBJETIVO",
    "========",
    "",
    `Este corpus contiene ${total} documentos sobre incapacidad temporal. Todos los archivos utilizan texto plano UTF-8, incluyen metadatos de trazabilidad y contienen versiones en catalán y castellano cuando están disponibles.`,
    "",
    "CRITERIOS PARA EL ASISTENTE",
    "============================",
    "",
    "1. Identificar el documento relevante por título, fuente, ámbito y estado.",
    "2. Responder en el idioma de la consulta y priorizar el bloque correspondiente.",
    "3. Diferenciar siempre criterio, base normativa, procedimiento y fuente oficial.",
    "4. No presentar un documento derogado o en revisión como normativa vigente.",
    "5. Si faltan datos decisivos, formular una pregunta aclaratoria concreta.",
    "6. No inventar datos ni convertir ejemplos orientativos en reglas generales.",
    "7. Indicar que debe verificarse el texto consolidado y la fuente oficial cuando pueda existir un cambio normativo.",
    "",
    "ORDEN RECOMENDADO DE CARGA",
    "==========================",
    "",
    "1. Cargar los documentos TXT individuales.",
    "2. Cargar 00-INDEX.txt para que el asistente conozca el catálogo completo.",
    "3. Cargar este archivo de instrucciones si Coloq.ia permite incorporar directrices al corpus.",
    "4. No es necesario cargar manifest.json ni validation-report.json; son archivos técnicos de control.",
  ].join("\n");
}

function specialCasesInstructions(total: number) {
  return [
    "INSTRUCCIONES DE USO DEL CORPUS DE CASOS ESPECIALES",
    "===================================================",
    "",
    "OBJETIVO",
    "========",
    "",
    `Este corpus contiene ${total} casos especiales sobre incapacidad temporal. Cada archivo es autocontenido e incluye descripción, base legal, procedimiento, ejemplos y bloques en catalán y castellano.`,
    "",
    "CRITERIOS PARA EL ASISTENTE",
    "============================",
    "",
    "1. Identificar primero si la consulta coincide con uno de los casos especiales del índice.",
    "2. Antes de cerrar una respuesta, comprobar si faltan fechas, duración acumulada, contingencia, régimen laboral, cobertura de mutua u organismo que emitió el alta.",
    "3. Si falta un dato decisivo, formular una pregunta aclaratoria concreta. No completar datos por intuición.",
    "4. Separar claramente criterio aplicable, base legal, procedimiento, límites o incertidumbres y fuente a verificar.",
    "5. No convertir ejemplos orientativos en reglas generales ni mezclar supuestos parecidos.",
    "6. Cuando una medida sea una propuesta o no esté en vigor, decirlo expresamente.",
    "7. Responder en el idioma de la consulta y utilizar el bloque correspondiente.",
    "8. No solicitar ni reproducir datos personales identificativos o información clínica innecesaria.",
    "",
    "ORDEN RECOMENDADO DE CARGA",
    "==========================",
    "",
    "1. Cargar los casos TXT individuales.",
    "2. Cargar 00-INDEX.txt para que el asistente conozca el catálogo completo.",
    "3. Cargar este archivo de instrucciones si Coloq.ia permite incorporar directrices al corpus.",
    "4. No es necesario cargar manifest.json ni validation-report.json; son archivos técnicos de control.",
  ].join("\n");
}

export function generateDocumentsCorpus(records: Document[], date = new Date()): GeneratedCorpus {
  const generatedAt = date.toISOString();
  const folder = "documentacio_txt_coloqia";
  const documentFiles = records.map(record => {
    const titleEs = normalize(record.titleEs) || normalize(record.title);
    const tags = readTags(record.tags);
    const content = [
      "DOCUMENT CATALOG EXPORT",
      "=======================",
      "",
      `ID: ${record.id}`,
      `Título: ${normalize(record.title)}`,
      `Título en español: ${titleEs}`,
      `Tipo: ${normalize(record.type) || "No indicado"}`,
      `Fuente: ${normalize(record.source) || "No indicada"}`,
      `Ámbito: ${normalize(record.jurisdiction) || "No indicado"}`,
      `Año de publicación: ${record.publicationYear ?? "No indicado"}`,
      `Estado: ${normalize(record.status) || "No indicado"}`,
      `URL: ${normalize(record.url) || "No disponible"}`,
      `Etiquetas: ${tags.length ? tags.join(", ") : "No indicadas"}`,
      "",
      "AVISO",
      "=====",
      "",
      "Exportación del catálogo documental de Consultes IT. Para decisiones profesionales o jurídicas debe verificarse siempre la vigencia y el texto consolidado en la fuente oficial indicada.",
      "",
      section("RESUMEN", record.summary),
      section("CONTENIDO", record.content) || "CONTENIDO\n=========\n\nSin contenido disponible.\n",
      section("RESUMEN EN ESPAÑOL", record.summaryEs),
      section("CONTENIDO EN ESPAÑOL", record.contentEs),
    ].join("\n");
    return makeFile(`${filenamePrefix(record.id)}-${slugify(record.title)}.txt`, content);
  });

  const manifest = records.map((record, index) => ({
    id: record.id,
    title: record.title,
    type: record.type,
    source: record.source,
    url: record.url,
    files: { txt: documentFiles[index].name },
  }));
  const typeCounts = new Map<string, number>();
  for (const record of records) typeCounts.set(record.type, (typeCounts.get(record.type) ?? 0) + 1);
  const index = [
    "ÍNDICE DEL CATÁLOGO DOCUMENTAL",
    "===============================",
    "",
    `Fecha de generación (UTC): ${generatedAt}`,
    `Versión del corpus: ${CORPUS_EXPORT_VERSION}`,
    `Total de documentos: ${records.length}`,
    "Codificación: UTF-8",
    "Formato: texto plano TXT, sin sintaxis Markdown",
    "",
    "RESUMEN POR TIPO",
    "================",
    "",
    ...Array.from(typeCounts.entries()).sort(([left], [right]) => left.localeCompare(right)).map(([type, count]) => `${type}: ${count}`),
    "",
    "DOCUMENTOS",
    "==========",
    "",
    ...records.flatMap((record, indexNumber) => [
      `${indexNumber + 1}. ${normalize(record.title)}`,
      `   Archivo: ${documentFiles[indexNumber].name}`,
      `   Tipo: ${record.type}`,
      `   Fuente: ${normalize(record.source) || "No indicada"}`,
      `   Ámbito: ${record.jurisdiction}`,
      `   Estado: ${record.status}`,
      `   URL: ${normalize(record.url) || "No disponible"}`,
      "",
    ]),
  ].join("\n");

  const files = [
    ...documentFiles,
    makeFile("00-INDEX.txt", index),
    makeFile("00-INSTRUCCIONES-COLOQIA.txt", documentsInstructions(records.length)),
    makeFile("manifest.json", JSON.stringify(manifest, null, 2)),
  ];
  const validation = validate(files, records.length, generatedAt);
  files.push(makeFile("validation-report.json", JSON.stringify(validation, null, 2)));

  return {
    kind: "documents",
    version: CORPUS_EXPORT_VERSION,
    generatedAt,
    filename: `${folder}.zip`,
    files,
    validation,
    archive: archiveCorpus(folder, files),
  };
}

export function generateSpecialCasesCorpus(records: SpecialCase[], date = new Date()): GeneratedCorpus {
  const generatedAt = date.toISOString();
  const folder = "casos_especiales_txt_coloqia";
  const caseFiles = records.map(record => {
    const content = [
      "DOCUMENT CATALOG EXPORT",
      "=======================",
      "",
      `ID: ${record.id}`,
      `Título: ${normalize(record.title)}`,
      `Título en español: ${normalize(record.titleEs) || normalize(record.title)}`,
      "Tipo: caso_especial",
      "Fuente: Consultes IT; base legal detallada dentro del caso",
      "Ámbito: España y Cataluña según el supuesto",
      "Año de publicación: No indicado",
      "Estado: activo en el catálogo",
      "URL: https://consultasit-dirvlpm6.manus.space/casos-especials",
      `Etiquetas: caso especial, ${normalize(record.category)}, ${normalize(record.title)}, ${normalize(record.titleEs) || normalize(record.title)}`,
      "",
      "AVISO",
      "=====",
      "",
      "Contenido de apoyo profesional. Verificar siempre la vigencia normativa y la fuente oficial antes de tomar decisiones clínicas, laborales o jurídicas.",
      "",
      section("RESUMEN", record.description),
      section("CONTENIDO", [
        "CAS ESPECIAL",
        record.title,
        "",
        "CATEGORIA",
        record.category,
        "",
        "DESCRIPCIÓ I CRITERI",
        record.description,
        "",
        "BASE LEGAL",
        record.legalBasis || "No especificada al catàleg.",
        "",
        "PROCEDIMENT RECOMANAT",
        record.procedure || "No especificat al catàleg.",
        "",
        "EXEMPLES PRÀCTICS",
        record.examples || "No disponibles al catàleg.",
        "",
        "INSTRUCCIONS PER A L'ASSISTENT",
        "1. Utilitza aquest cas com a font prioritària quan la consulta coincideixi amb el seu supòsit.",
        "2. Distingeix sempre entre descripció, base legal, procediment i exemples.",
        "3. No converteixis un exemple orientatiu en una regla general.",
        "4. Cita la base legal inclosa i reconeix la necessitat de verificar-ne la vigència a la font oficial.",
        "5. Si manca una dada decisiva o hi ha conflicte entre normes, indica-ho en lloc d'inventar una resposta.",
      ].join("\n")),
      section("RESUMEN EN ESPAÑOL", record.descriptionEs),
      section("CONTENIDO EN ESPAÑOL", [
        "CASO ESPECIAL",
        record.titleEs || record.title,
        "",
        "CATEGORÍA",
        record.category,
        "",
        "DESCRIPCIÓN Y CRITERIO",
        record.descriptionEs || record.description,
        "",
        "BASE LEGAL",
        record.legalBasisEs || record.legalBasis || "No especificada en el catálogo.",
        "",
        "PROCEDIMIENTO RECOMENDADO",
        record.procedureEs || record.procedure || "No especificado en el catálogo.",
        "",
        "EJEMPLOS PRÁCTICOS",
        record.examplesEs || record.examples || "No disponibles en el catálogo.",
        "",
        "INSTRUCCIONES PARA EL ASISTENTE",
        "1. Utiliza este caso como fuente prioritaria cuando la consulta coincida con su supuesto.",
        "2. Distingue siempre entre descripción, base legal, procedimiento y ejemplos.",
        "3. No conviertas un ejemplo orientativo en una regla general.",
        "4. Cita la base legal incluida y reconoce la necesidad de verificar la vigencia en la fuente oficial.",
        "5. Si falta un dato decisivo o existe conflicto entre normas, indícalo en lugar de inventar una respuesta.",
      ].join("\n")),
    ].join("\n");
    return makeFile(`${filenamePrefix(record.id)}-${slugify(record.title)}.txt`, content);
  });

  const manifest = records.map((record, index) => ({
    id: record.id,
    title: record.title,
    type: "caso_especial",
    source: "Consultes IT; base legal detallada dentro del caso",
    url: "https://consultasit-dirvlpm6.manus.space/casos-especials",
    files: { txt: caseFiles[index].name },
  }));
  const index = [
    "ÍNDICE DEL CATÁLOGO DE CASOS ESPECIALES",
    "========================================",
    "",
    `Fecha de generación (UTC): ${generatedAt}`,
    `Versión del corpus: ${CORPUS_EXPORT_VERSION}`,
    `Total de casos: ${records.length}`,
    "Codificación: UTF-8",
    "Formato: texto plano TXT, sin sintaxis Markdown",
    "",
    "CASOS ESPECIALES",
    "================",
    "",
    ...records.flatMap((record, indexNumber) => [
      `${indexNumber + 1}. ${normalize(record.title)}`,
      `   Archivo: ${caseFiles[indexNumber].name}`,
      `   Categoría: ${record.category}`,
      "   Fuente: Consultes IT; base legal detallada dentro del caso",
      "   URL: https://consultasit-dirvlpm6.manus.space/casos-especials",
      "",
    ]),
  ].join("\n");

  const files = [
    ...caseFiles,
    makeFile("00-INDEX.txt", index),
    makeFile("00-INSTRUCCIONES-COLOQIA.txt", specialCasesInstructions(records.length)),
    makeFile("manifest.json", JSON.stringify(manifest, null, 2)),
  ];
  const validation = validate(files, records.length, generatedAt);
  files.push(makeFile("validation-report.json", JSON.stringify(validation, null, 2)));

  return {
    kind: "specialCases",
    version: CORPUS_EXPORT_VERSION,
    generatedAt,
    filename: `${folder}.zip`,
    files,
    validation,
    archive: archiveCorpus(folder, files),
  };
}

export function generateCombinedCorpus(
  documents: Document[],
  specialCases: SpecialCase[],
  date = new Date(),
): GeneratedCorpus {
  const documentsCorpus = generateDocumentsCorpus(documents, date);
  const specialCasesCorpus = generateSpecialCasesCorpus(specialCases, date);
  const generatedAt = date.toISOString();
  const index = makeFile("00-INDEX-CORPUS-COMPLET.txt", [
    "ÍNDEX DEL CORPUS COMPLET PER A COLOQ.IA",
    "=======================================",
    "",
    `Data de generació (UTC): ${generatedAt}`,
    `Versió del corpus: ${CORPUS_EXPORT_VERSION}`,
    `Total de documents: ${documents.length}`,
    `Total de casos especials: ${specialCases.length}`,
    `Total de fitxers de contingut: ${documents.length + specialCases.length}`,
    "Codificació: UTF-8",
    "Format: text pla TXT, sense sintaxi Markdown",
    "",
    "CONTINGUTS DEL ZIP",
    "==================",
    "",
    "1. documentacio_txt_coloqia/",
    "   Corpus documental complet. Consulteu documentacio_txt_coloqia/00-INDEX.txt.",
    "2. casos_especiales_txt_coloqia/",
    "   Corpus de casos especials complet. Consulteu casos_especiales_txt_coloqia/00-INDEX.txt.",
    "",
    "ORDRE RECOMANAT DE CÀRREGA",
    "==========================",
    "",
    "1. Carregar primer aquest índex general.",
    "2. Carregar els dos índexs de cada subcorpus.",
    "3. Carregar els fitxers TXT individuals que siguin rellevants per a la consulta.",
    "4. Carregar els fitxers d'instruccions de cada subcorpus si Coloq.ia permet incorporar directrius.",
    "5. No cal carregar manifests ni informes de validació; són fitxers tècnics de control.",
  ].join("\n"));

  const files = [
    index,
    ...documentsCorpus.files.map(file => ({
      name: `documentacio_txt_coloqia/${file.name}`,
      content: file.content,
    })),
    ...specialCasesCorpus.files.map(file => ({
      name: `casos_especiales_txt_coloqia/${file.name}`,
      content: file.content,
    })),
  ];
  const validation = validate(files, documents.length + specialCases.length, generatedAt);
  files.push(makeFile("validation-report.json", JSON.stringify(validation, null, 2)));

  const entries: Record<string, Uint8Array> = {};
  for (const file of files) entries[file.name] = strToU8(file.content);

  return {
    kind: "all",
    version: CORPUS_EXPORT_VERSION,
    generatedAt,
    filename: "consultes-it-corpus-complet.zip",
    files,
    validation,
    archive: Buffer.from(zipSync(entries, { level: 6 })),
  };
}
