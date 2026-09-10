import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const outputDir = path.resolve("exports/documentacio_md");

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function yamlString(value) {
  if (value === null || value === undefined || value === "") return "null";
  return JSON.stringify(String(value));
}

function normalizeContent(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "")
    .trim();
}

function formatDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
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

function renderDocument(document) {
  const tags = parseTags(document.tags);
  const titleEs = document.titleEs || document.title;
  const summaryCa = normalizeContent(document.summary);
  const summaryEs = normalizeContent(document.summaryEs);
  const contentCa = normalizeContent(document.content);
  const contentEs = normalizeContent(document.contentEs);

  const lines = [
    "---",
    `id: ${document.id}`,
    `title_ca: ${yamlString(document.title)}`,
    `title_es: ${yamlString(titleEs)}`,
    `type: ${yamlString(document.type)}`,
    `source: ${yamlString(document.source)}`,
    `jurisdiction: ${yamlString(document.jurisdiction)}`,
    `publication_year: ${document.publicationYear ?? "null"}`,
    `status: ${yamlString(document.status)}`,
    `url: ${yamlString(document.url)}`,
    `file_key: ${yamlString(document.fileKey)}`,
    `tags: ${JSON.stringify(tags)}`,
    `created_at: ${yamlString(formatDate(document.createdAt))}`,
    `updated_at: ${yamlString(formatDate(document.updatedAt))}`,
    "---",
    "",
    `# ${document.title}`,
    "",
    "> Exportació del catàleg documental de Consultes IT. Cal contrastar sempre la vigència i el text consolidat amb la font oficial enllaçada.",
    "",
    "## Fitxa documental",
    "",
    `| Camp | Valor |`,
    `|---|---|`,
    `| Tipus | ${document.type ?? "—"} |`,
    `| Font | ${document.source ?? "—"} |`,
    `| Àmbit | ${document.jurisdiction ?? "—"} |`,
    `| Any de publicació | ${document.publicationYear ?? "—"} |`,
    `| Estat | ${document.status ?? "—"} |`,
    `| Enllaç oficial | ${document.url ? `[Obrir font](${document.url})` : "No disponible"} |`,
    `| Etiquetes | ${tags.length ? tags.join(", ") : "—"} |`,
    "",
  ];

  if (summaryCa) {
    lines.push("## Resum", "", summaryCa, "");
  }

  lines.push("## Contingut original del catàleg", "", contentCa || "_Sense contingut._", "");

  if (titleEs || summaryEs || contentEs) {
    lines.push("---", "", "## Versión en español", "", `# ${titleEs}`, "");
    if (summaryEs) lines.push("### Resumen", "", summaryEs, "");
    if (contentEs) lines.push("### Contenido traducido disponible", "", contentEs, "");
  }

  return `${lines.join("\n").trim()}\n`;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está disponible en el entorno.");
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [documents] = await connection.query(`
    SELECT
      id, title, titleEs, type, source, jurisdiction, content, summary,
      url, fileKey, tags, publicationYear, status, summaryEs, contentEs,
      createdAt, updatedAt
    FROM documents
    ORDER BY type, publicationYear, id
  `);
  await connection.end();

  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const usedNames = new Set();
  const exported = [];

  for (const document of documents) {
    const baseSlug = slugify(document.title) || `document-${document.id}`;
    let fileName = `${String(document.id).padStart(3, "0")}-${baseSlug}.md`;
    if (usedNames.has(fileName)) fileName = `${String(document.id).padStart(3, "0")}-${baseSlug}-${document.id}.md`;
    usedNames.add(fileName);

    await fs.writeFile(path.join(outputDir, fileName), renderDocument(document), "utf8");
    exported.push({ ...document, fileName });
  }

  const byType = new Map();
  for (const document of exported) {
    const list = byType.get(document.type) ?? [];
    list.push(document);
    byType.set(document.type, list);
  }

  const indexLines = [
    "# Índex de documentació — Consultes IT",
    "",
    `Exportació generada a partir dels **${exported.length} registres** actuals de la taula \`documents\` de Consultes IT.`,
    "",
    "> Aquesta còpia és material de consulta. Per a decisions professionals o jurídiques, cal verificar la vigència i el text consolidat a la font oficial indicada a cada fitxer.",
    "",
    "## Resum",
    "",
    "| Tipus | Nombre de documents |",
    "|---|---:|",
    ...[...byType.entries()].map(([type, items]) => `| ${type} | ${items.length} |`),
    `| **Total** | **${exported.length}** |`,
    "",
  ];

  for (const [type, items] of [...byType.entries()]) {
    indexLines.push(`## ${type.charAt(0).toUpperCase()}${type.slice(1)}`, "");
    indexLines.push("| ID | Document | Font | Àmbit | Estat |", "|---:|---|---|---|---|");
    for (const document of items) {
      indexLines.push(
        `| ${document.id} | [${document.title}](./${document.fileName}) | ${document.source ?? "—"} | ${document.jurisdiction ?? "—"} | ${document.status ?? "—"} |`,
      );
    }
    indexLines.push("");
  }

  await fs.writeFile(path.join(outputDir, "README.md"), `${indexLines.join("\n").trim()}\n`, "utf8");

  const manifest = exported.map(document => ({
    id: document.id,
    file: document.fileName,
    title: document.title,
    titleEs: document.titleEs,
    type: document.type,
    source: document.source,
    jurisdiction: document.jurisdiction,
    publicationYear: document.publicationYear,
    status: document.status,
    url: document.url,
    contentChars: normalizeContent(document.content).length,
    contentEsChars: normalizeContent(document.contentEs).length,
  }));
  await fs.writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(`Exportados ${exported.length} documentos a ${outputDir}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
