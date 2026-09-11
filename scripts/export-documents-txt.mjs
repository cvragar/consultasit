import "dotenv/config";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const outputDir = path.resolve("exports/documentacio_txt_coloqia");
const catalogPath = path.resolve("exports/documentation_catalog.json");
const zipPath = `${outputDir}.zip`;
const corpusVersion = "2026.09.11.1";
const catalogExporterPath = process.env.DOCUMENT_CATALOG_EXPORTER
  ?? "/home/ubuntu/skills/document-catalog-exporter/scripts/export_catalog.py";

const notice = [
  "Exportació del catàleg documental de Consultes IT.",
  "Per a decisions professionals o jurídiques, cal verificar sempre la vigència i el text consolidat a la font oficial indicada.",
].join(" ");

const coloqiaInstructions = [
  "INSTRUCCIONS D'ÚS DEL CORPUS DOCUMENTAL",
  "=======================================",
  "",
  "OBJECTIU",
  "========",
  "",
  "Aquest corpus conté 12 documents independents sobre incapacitat temporal. Cada fitxer està codificat en UTF-8, usa text pla i conserva el títol, la font, l'àmbit, l'estat, l'URL, les etiquetes i el contingut disponible en català i castellà.",
  "",
  "CRITERIS PER A L'ASSISTENT",
  "===========================",
  "",
  "1. Identificar primer el document o documents rellevants mitjançant 00-INDEX.txt i la seva font, àmbit i estat.",
  "2. Respondre en l'idioma de la consulta. Quan existeixi, utilitzar el bloc català per a preguntes en català i el bloc castellà per a preguntes en castellà.",
  "3. Separar clarament el criteri aplicable, la base normativa, el procediment pràctic i la font que cal verificar.",
  "4. No presentar un document derogat, en revisió o merament orientatiu com si fos normativa vigent.",
  "5. Si falten dades decisives, com ara dates, durada acumulada, contingència, règim laboral o organisme emissor de l'alta, formular una pregunta aclaridora concreta.",
  "6. No completar dades per intuïció ni convertir exemples orientatius en regles generals.",
  "7. Quan el cas no encaixi de manera inequívoca o hi hagi conflicte entre fonts, reconèixer la incertesa i recomanar revisar la font oficial o l'organisme competent.",
  "8. Citar la font i l'URL incloses al document. Si la resposta pot dependre d'una modificació normativa, indicar que cal consultar el text consolidat vigent.",
  "9. No sol·licitar ni reproduir dades personals identificatives ni informació clínica innecessària.",
  "10. Presentar el contingut com a suport professional i informatiu, no com a substitut de la valoració clínica, administrativa o jurídica individual.",
  "",
  "ORDRE RECOMANAT DE CÀRREGA",
  "==========================",
  "",
  "1. Carregar els 12 fitxers documentals TXT individuals.",
  "2. Carregar 00-INDEX.txt perquè Coloq.ia conegui el catàleg complet.",
  "3. Carregar aquest fitxer d'instruccions si Coloq.ia permet incorporar directrius al corpus.",
  "4. No cal carregar manifest.json ni validation-report.json; són fitxers tècnics de control.",
  "",
].join("\n");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    ...options,
  });

  if (result.error) {
    throw new Error(`No s'ha pogut executar ${command}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error([
      `L'ordre ${command} ha finalitzat amb el codi ${result.status}.`,
      result.stdout?.trim(),
      result.stderr?.trim(),
    ].filter(Boolean).join("\n"));
  }

  return result.stdout;
}

async function createCatalogSource() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no està disponible a l'entorn.");
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    const [rows] = await connection.query(`
      SELECT
        id, title, titleEs, type, source, jurisdiction, content, summary,
        url, tags, publicationYear, status, summaryEs, contentEs,
        createdAt, updatedAt
      FROM documents
      ORDER BY type, publicationYear, id
    `);

    await fs.writeFile(catalogPath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
    return rows.length;
  } finally {
    await connection.end();
  }
}

async function validateExport(expectedRecords) {
  const reportPath = path.join(outputDir, "validation-report.json");
  const report = JSON.parse(await fs.readFile(reportPath, "utf8"));

  if (
    !report.valid
    || report.input_records !== expectedRecords
    || report.exported_records !== expectedRecords
    || report.empty_files.length
    || report.invalid_utf8_files.length
    || report.txt_markdown_artifacts.length
    || report.warnings.length
  ) {
    throw new Error(`La validació de l'exportació no s'ha superat:\n${JSON.stringify(report, null, 2)}`);
  }

  const textFiles = (await fs.readdir(outputDir)).filter(file => file.endsWith(".txt"));
  for (const fileName of textFiles) {
    const raw = await fs.readFile(path.join(outputDir, fileName));
    let text;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(raw);
    } catch {
      throw new Error(`El fitxer ${fileName} no està codificat correctament en UTF-8.`);
    }

    const hasUnsupportedSyntax = /^#{1,6}\s/m.test(text)
      || /\[[^\]]+\]\([^)]+\)/.test(text)
      || text.includes("```")
      || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text);

    if (!text.trim() || !text.endsWith("\n") || hasUnsupportedSyntax) {
      throw new Error(`El fitxer ${fileName} no compleix el format de text pla per a Coloq.ia.`);
    }
  }
}

async function addCorpusMetadata(recordCount) {
  const indexPath = path.join(outputDir, "00-INDEX.txt");
  const index = await fs.readFile(indexPath, "utf8");
  const metadata = [
    "VERSIÓ I GENERACIÓ DEL CORPUS",
    "==============================",
    "",
    `Data de generació (UTC): ${new Date().toISOString()}`,
    `Versió del corpus: ${corpusVersion}`,
    `Total de documents: ${recordCount}`,
    "",
  ].join("\n");
  await fs.writeFile(indexPath, `${metadata}${index.replace(/^\s+/, "")}`, "utf8");
}

async function main() {
  const recordCount = await createCatalogSource();

  run("python3", [
    catalogExporterPath,
    "--input", catalogPath,
    "--output-dir", outputDir,
    "--format", "txt",
    "--notice", notice,
    "--clean",
    "--strict",
  ]);

  await addCorpusMetadata(recordCount);

  await fs.writeFile(
    path.join(outputDir, "00-INSTRUCCIONES-COLOQIA.txt"),
    coloqiaInstructions,
    "utf8",
  );

  await validateExport(recordCount);
  await fs.rm(zipPath, { force: true });
  run("zip", ["-rq", zipPath, path.basename(outputDir)], { cwd: path.dirname(outputDir) });

  console.log(`Exportats ${recordCount} documents TXT a ${outputDir}`);
  console.log(`ZIP generat: ${zipPath}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
