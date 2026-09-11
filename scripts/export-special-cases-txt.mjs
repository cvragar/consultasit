import "dotenv/config";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const outputDir = path.resolve("exports/casos_especiales_txt_coloqia");
const catalogPath = path.resolve("exports/special_cases_catalog.json");
const curatedTranslationsPath = path.resolve("exports/special_cases_catalog.before_translation.json");
const languageAuditPath = path.resolve("exports/casos_especiales_language_audit.json");
const zipPath = `${outputDir}.zip`;
const sourceExporterPath = path.resolve("scripts/export-special-cases-catalog.mjs");
const languageAuditScriptPath = path.resolve("scripts/audit-special-cases-language.mjs");
const catalogExporterPath = process.env.DOCUMENT_CATALOG_EXPORTER
  ?? "/home/ubuntu/skills/document-catalog-exporter/scripts/export_catalog.py";

const notice = [
  "Contenido de apoyo profesional.",
  "Verificar siempre la vigencia normativa y la fuente oficial antes de tomar decisiones clínicas, laborales o jurídicas.",
].join(" ");

const coloqiaInstructions = [
  "INSTRUCCIONS D'ÚS DEL CORPUS DE CASOS ESPECIALS",
  "=================================================",
  "",
  "OBJECTIU",
  "========",
  "",
  "Aquest corpus conté casos especials sobre incapacitat temporal. Cada fitxer és autocontingut i inclou descripció, base legal, procediment, exemples i versions en català i castellà.",
  "",
  "CRITERIS PER A L'ASSISTENT",
  "===========================",
  "",
  "1. Identificar primer si la consulta coincideix amb un dels casos especials de l'índex.",
  "2. Abans de donar una resposta tancada, comprovar si falten dades decisives: dates, durada acumulada, contingència, règim laboral, cobertura de mútua, organisme que ha emès l'alta, relació entre patologies i situació contractual.",
  "3. Si falta una dada decisiva, formular una pregunta aclaridora concreta. No completar dades per intuïció.",
  "4. Separar clarament a la resposta el criteri aplicable, la base legal, el procediment pràctic, els límits o incerteses i la font que cal verificar.",
  "5. No convertir exemples orientatius en regles generals. Serveixen per comprendre el supòsit, però no substitueixen el criteri ni la norma.",
  "6. No barrejar casos semblants. Distingir especialment entre recaiguda i procés nou, contingència comuna i professional, pluriocupació i pluriactivitat, treball autònom i règim general, incapacitat temporal i risc durant l'embaràs o la lactància.",
  "7. Quan un fitxer indiqui que una mesura és una proposta, està en negociació o encara no és vigent, dir-ho expressament. No presentar-la com a normativa vigent.",
  "8. Citar la base legal inclosa al cas. Si el contingut pot haver canviat, indicar que cal verificar el text consolidat i la font oficial.",
  "9. Si dues fonts semblen contradictòries o el cas no encaixa de manera inequívoca, reconèixer la incertesa i recomanar revisió per l'organisme competent. No inventar una resolució.",
  "10. Respondre en l'idioma de la consulta. Utilitzar el bloc castellà per a preguntes en castellà i el bloc català per a preguntes en català.",
  "11. No sol·licitar ni reproduir dades personals identificatives ni informació clínica innecessària.",
  "12. Presentar el contingut com a suport professional i informatiu, no com a substitut de la valoració clínica, administrativa o jurídica individual.",
  "",
  "ORDRE RECOMANAT DE CÀRREGA",
  "==========================",
  "",
  "1. Carregar els fitxers individuals de casos especials.",
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

function normalizeSpanishTranslation(value) {
  return value
    .replace(/\bMÚTUA\b/g, "MUTUA")
    .replace(/\bmútua\b/g, "mutua")
    .replace(/\bLlei\b/g, "Ley")
    .replace(/\bpluriocupació\b/g, "pluriempleo")
    .replace(/\bpartes de baja\b/gi, "comunicados de baja")
    .replace(/\bparte de baja\b/gi, "comunicado de baja");
}

function preserveNumericComparators(value, language) {
  const lessThan = language === "es" ? "menos de" : "menys de";
  const isLessThan = language === "es" ? "es inferior a" : "és inferior a";
  return value
    .replace(/(\d+)\s*<\s*(\d+)/g, (_, left, right) => `${left} ${isLessThan} ${right}`)
    .replace(/(^|[\s(\[])[<]\s*(\d+)/gm, (_, prefix, number) => `${prefix}${lessThan} ${number}`);
}

async function applyCuratedSpanishTranslations() {
  const [catalog, curatedCatalog] = await Promise.all([
    fs.readFile(catalogPath, "utf8").then(JSON.parse),
    fs.readFile(curatedTranslationsPath, "utf8").then(JSON.parse),
  ]);
  const curatedById = new Map(curatedCatalog.map(record => [Number(record.id), record]));

  for (const id of [30001, 30002]) {
    const record = catalog.find(item => Number(item.id) === id);
    const curated = curatedById.get(id);
    if (!record || !curated) {
      throw new Error(`No s'ha trobat la traducció verificada del cas ${id}.`);
    }

    const currentSource = JSON.stringify([record.title, record.summary, record.content]);
    const curatedSource = JSON.stringify([curated.title, curated.summary, curated.content]);
    if (currentSource !== curatedSource) {
      throw new Error(
        `El contingut font del cas ${id} ha canviat i requereix una nova traducció castellana verificada.`,
      );
    }

    for (const field of ["title_es", "summary_es", "content_es"]) {
      if (typeof curated[field] !== "string" || !curated[field].trim()) {
        throw new Error(`Falta el camp ${field} de la traducció verificada del cas ${id}.`);
      }
      record[field] = normalizeSpanishTranslation(curated[field]);
    }
  }

  await fs.writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
}

async function protectNumericComparators() {
  const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8"));
  for (const record of catalog) {
    for (const field of ["summary", "content"]) {
      if (typeof record[field] === "string") {
        record[field] = preserveNumericComparators(record[field], "ca");
      }
    }
    for (const field of ["summary_es", "content_es"]) {
      if (typeof record[field] === "string") {
        record[field] = preserveNumericComparators(record[field], "es");
      }
    }
  }
  await fs.writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
}

async function validateExport() {
  const [catalog, report, languageAudit] = await Promise.all([
    fs.readFile(catalogPath, "utf8").then(JSON.parse),
    fs.readFile(path.join(outputDir, "validation-report.json"), "utf8").then(JSON.parse),
    fs.readFile(languageAuditPath, "utf8").then(JSON.parse),
  ]);
  const expectedRecords = catalog.length;

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

  if (
    languageAudit.total !== expectedRecords
    || languageAudit.suspects !== 0
    || !languageAudit.results.every(result => result.catalanScore === 0)
  ) {
    throw new Error(`L'auditoria lingüística no s'ha superat:\n${JSON.stringify(languageAudit, null, 2)}`);
  }

  const textFiles = (await fs.readdir(outputDir)).filter(file => file.endsWith(".txt"));
  const caseFiles = textFiles.filter(file => !file.startsWith("00-"));
  if (caseFiles.length !== expectedRecords) {
    throw new Error(`S'han exportat ${caseFiles.length} casos TXT, però el catàleg en conté ${expectedRecords}.`);
  }

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

async function main() {
  run(process.execPath, [sourceExporterPath]);
  await applyCuratedSpanishTranslations();
  await protectNumericComparators();
  run(process.execPath, [languageAuditScriptPath]);
  run("python3", [
    catalogExporterPath,
    "--input", catalogPath,
    "--output-dir", outputDir,
    "--format", "txt",
    "--notice", notice,
    "--clean",
    "--strict",
  ]);

  await fs.writeFile(
    path.join(outputDir, "00-INSTRUCCIONES-COLOQIA.txt"),
    coloqiaInstructions,
    "utf8",
  );

  await validateExport();
  await fs.rm(zipPath, { force: true });
  run("zip", ["-rq", zipPath, path.basename(outputDir)], { cwd: path.dirname(outputDir) });

  console.log(`Exportats ${JSON.parse(await fs.readFile(catalogPath, "utf8")).length} casos especials TXT a ${outputDir}`);
  console.log(`ZIP generat: ${zipPath}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
