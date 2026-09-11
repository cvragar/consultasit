import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const outputDir = path.resolve("exports/documentacio_txt_coloqia");

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "")
    .trim();
}

function markdownToPlainText(value) {
  return normalizeText(value)
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

function parseTags(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function section(title, body) {
  const cleanBody = markdownToPlainText(body);
  if (!cleanBody) return "";
  return `${title}\n${"=".repeat(title.length)}\n\n${cleanBody}\n`;
}

function renderDocument(document) {
  const tags = parseTags(document.tags);
  const titleEs = normalizeText(document.titleEs) || normalizeText(document.title);
  const lines = [
    "CONSULTES IT — DOCUMENTACIÓN PARA COLOQ.IA",
    "===========================================",
    "",
    `ID: ${document.id}`,
    `Título principal: ${normalizeText(document.title)}`,
    `Título en español: ${titleEs}`,
    `Tipo documental: ${document.type ?? "No indicado"}`,
    `Fuente: ${document.source ?? "No indicada"}`,
    `Ámbito: ${document.jurisdiction ?? "No indicado"}`,
    `Año de publicación: ${document.publicationYear ?? "No indicado"}`,
    `Estado: ${document.status ?? "No indicado"}`,
    `URL de la fuente: ${document.url ?? "No disponible"}`,
    `Etiquetas: ${tags.length ? tags.join(", ") : "No indicadas"}`,
    "",
    "AVISO",
    "=====",
    "",
    "Exportación del catálogo documental de Consultes IT. Para decisiones profesionales o jurídicas debe verificarse siempre la vigencia y el texto consolidado en la fuente oficial indicada.",
    "",
  ];

  const summary = section("RESUMEN PRINCIPAL", document.summary);
  if (summary) lines.push(summary);

  lines.push(section("CONTENIDO PRINCIPAL", document.content) || "CONTENIDO PRINCIPAL\n===================\n\nSin contenido disponible.\n");

  const summaryEs = section("RESUMEN EN ESPAÑOL", document.summaryEs);
  if (summaryEs) lines.push(summaryEs);

  const contentEs = section("CONTENIDO EN ESPAÑOL DISPONIBLE", document.contentEs);
  if (contentEs) lines.push(contentEs);

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

function renderIndex(documents) {
  const counts = new Map();
  for (const document of documents) {
    counts.set(document.type, (counts.get(document.type) ?? 0) + 1);
  }

  const lines = [
    "ÍNDICE DE DOCUMENTACIÓN — CONSULTES IT",
    "=======================================",
    "",
    `Número total de documentos: ${documents.length}`,
    "Codificación: UTF-8",
    "Formato: texto plano TXT, sin sintaxis Markdown",
    "",
    "RESUMEN POR TIPO",
    "================",
    "",
    ...[...counts.entries()].map(([type, count]) => `${type}: ${count}`),
    "",
    "CATÁLOGO COMPLETO",
    "=================",
    "",
  ];

  documents.forEach((document, index) => {
    lines.push(
      `${index + 1}. ${normalizeText(document.title)}`,
      `   Archivo: ${document.fileName}`,
      `   Tipo: ${document.type}`,
      `   Fuente: ${document.source ?? "No indicada"}`,
      `   Ámbito: ${document.jurisdiction ?? "No indicado"}`,
      `   Estado: ${document.status ?? "No indicado"}`,
      `   URL: ${document.url ?? "No disponible"}`,
      "",
    );
  });

  return `${lines.join("\n").trim()}\n`;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está disponible en el entorno.");
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await connection.query(`
    SELECT
      id, title, titleEs, type, source, jurisdiction, content, summary,
      url, tags, publicationYear, status, summaryEs, contentEs
    FROM documents
    ORDER BY type, publicationYear, id
  `);
  await connection.end();

  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const documents = [];
  for (const row of rows) {
    const fileName = `${String(row.id).padStart(3, "0")}-${slugify(row.title) || `document-${row.id}`}.txt`;
    const document = { ...row, fileName };
    await fs.writeFile(path.join(outputDir, fileName), renderDocument(document), "utf8");
    documents.push(document);
  }

  await fs.writeFile(path.join(outputDir, "00-INDICE.txt"), renderIndex(documents), "utf8");
  await fs.writeFile(
    path.join(outputDir, "00-LEEME.txt"),
    [
      "PAQUETE DOCUMENTAL DE CONSULTES IT PARA COLOQ.IA",
      "================================================",
      "",
      `Este paquete contiene ${documents.length} documentos independientes y un índice general.`,
      "Todos los archivos están codificados en UTF-8 y utilizan texto plano.",
      "No contienen cabeceras YAML, tablas Markdown, enlaces Markdown ni marcas de formato.",
      "",
      "Recomendación de importación:",
      "1. Descomprimir el archivo ZIP.",
      "2. Cargar los 12 archivos documentales TXT en Coloq.IA.",
      "3. Cargar también 00-INDICE.txt si se desea que el asistente conozca el catálogo completo.",
      "4. 00-LEEME.txt es informativo y no es necesario indexarlo.",
      "",
      "Aviso: el contenido debe contrastarse con la fuente oficial antes de utilizarse para decisiones profesionales o jurídicas.",
      "",
    ].join("\n"),
    "utf8",
  );

  console.log(`Exportados ${documents.length} documentos TXT a ${outputDir}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
