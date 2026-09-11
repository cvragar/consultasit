import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const outputPath = path.resolve("exports/special_cases_catalog.json");
const catalogUrl = "https://consultasit-dirvlpm6.manus.space/casos-especials";

function normalize(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function parseRelatedIds(value) {
  if (Array.isArray(value)) return value.map(Number).filter(Number.isFinite);
  if (!value) return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
}

function renderLanguage(caseItem, language, relatedDocuments) {
  const isSpanish = language === "es";
  const title = normalize(isSpanish ? caseItem.titleEs : caseItem.title);
  const description = normalize(isSpanish ? caseItem.descriptionEs : caseItem.description);
  const legalBasis = normalize(isSpanish ? caseItem.legalBasisEs : caseItem.legalBasis);
  const procedure = normalize(isSpanish ? caseItem.procedureEs : caseItem.procedure);
  const examples = normalize(isSpanish ? caseItem.examplesEs : caseItem.examples);
  const labels = isSpanish
    ? {
        heading: "CASO ESPECIAL",
        category: "CATEGORÍA",
        description: "DESCRIPCIÓN Y CRITERIO",
        legal: "BASE LEGAL",
        procedure: "PROCEDIMIENTO RECOMENDADO",
        examples: "EJEMPLOS PRÁCTICOS",
        documents: "DOCUMENTOS RELACIONADOS",
        none: "No hay documentos relacionados mediante identificador en el catálogo.",
        assistant: "INSTRUCCIONES PARA EL ASISTENTE",
        rules: [
          "Utiliza este caso como fuente prioritaria cuando la consulta coincida con su supuesto.",
          "Distingue siempre entre descripción, base legal, procedimiento y ejemplos.",
          "No conviertas un ejemplo orientativo en una regla general.",
          "Cita la base legal incluida y reconoce la necesidad de verificar la vigencia en la fuente oficial.",
          "Si falta un dato decisivo o existe conflicto entre normas, indícalo en lugar de inventar una respuesta.",
        ],
      }
    : {
        heading: "CAS ESPECIAL",
        category: "CATEGORIA",
        description: "DESCRIPCIÓ I CRITERI",
        legal: "BASE LEGAL",
        procedure: "PROCEDIMENT RECOMANAT",
        examples: "EXEMPLES PRÀCTICS",
        documents: "DOCUMENTS RELACIONATS",
        none: "No hi ha documents relacionats mitjançant identificador al catàleg.",
        assistant: "INSTRUCCIONS PER A L'ASSISTENT",
        rules: [
          "Utilitza aquest cas com a font prioritària quan la consulta coincideixi amb el seu supòsit.",
          "Distingeix sempre entre descripció, base legal, procediment i exemples.",
          "No converteixis un exemple orientatiu en una regla general.",
          "Cita la base legal inclosa i reconeix la necessitat de verificar-ne la vigència a la font oficial.",
          "Si manca una dada decisiva o hi ha conflicte entre normes, indica-ho en lloc d'inventar una resposta.",
        ],
      };

  const relatedLines = relatedDocuments.length
    ? relatedDocuments.map(document => `- ${isSpanish ? document.titleEs || document.title : document.title} | ${document.url || "URL no disponible"}`)
    : [labels.none];

  return [
    labels.heading,
    title,
    "",
    labels.category,
    normalize(caseItem.category),
    "",
    labels.description,
    description,
    "",
    labels.legal,
    legalBasis || (isSpanish ? "No especificada en el catálogo." : "No especificada al catàleg."),
    "",
    labels.procedure,
    procedure || (isSpanish ? "No especificado en el catálogo." : "No especificat al catàleg."),
    "",
    labels.examples,
    examples || (isSpanish ? "No disponibles en el catálogo." : "No disponibles al catàleg."),
    "",
    labels.documents,
    ...relatedLines,
    "",
    labels.assistant,
    ...labels.rules.map((rule, index) => `${index + 1}. ${rule}`),
  ].join("\n");
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL no está disponible.");

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [cases] = await connection.query(`
    SELECT
      id, title, titleEs, category, description, descriptionEs,
      legalBasis, legalBasisEs, \`procedure\`, procedureEs,
      examples, examplesEs, relatedDocumentIds, createdAt, updatedAt
    FROM special_cases
    ORDER BY category, id
  `);
  const [documents] = await connection.query(`
    SELECT id, title, titleEs, source, url
    FROM documents
    ORDER BY id
  `);
  await connection.end();

  const documentsById = new Map(documents.map(document => [Number(document.id), document]));
  const catalog = cases.map(caseItem => {
    const relatedIds = parseRelatedIds(caseItem.relatedDocumentIds);
    const relatedDocuments = relatedIds.map(id => documentsById.get(id)).filter(Boolean);
    return {
      id: caseItem.id,
      title: caseItem.title,
      title_es: caseItem.titleEs || caseItem.title,
      type: "caso_especial",
      source: "Consultes IT; base legal detallada dentro del caso",
      jurisdiction: "España y Cataluña según el supuesto",
      status: "activo en el catálogo",
      url: catalogUrl,
      tags: ["caso especial", caseItem.category, caseItem.title, caseItem.titleEs].filter(Boolean),
      summary: caseItem.description,
      content: renderLanguage(caseItem, "ca", relatedDocuments),
      summary_es: caseItem.descriptionEs,
      content_es: renderLanguage(caseItem, "es", relatedDocuments),
      created_at: caseItem.createdAt,
      updated_at: caseItem.updatedAt,
    };
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  console.log(`Exportados ${catalog.length} casos especiales a ${outputPath}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
