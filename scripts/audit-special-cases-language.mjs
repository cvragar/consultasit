import fs from "node:fs/promises";
import path from "node:path";

const inputPath = path.resolve("exports/special_cases_catalog.json");
const outputPath = path.resolve("exports/casos_especiales_language_audit.json");

const catalanMarkers = [
  "amb", "aquest", "aquesta", "aquests", "aquestes", "treballador", "treballadora",
  "baixa", "altes", "dels", "seva", "seves", "seu", "això", "quan", "perquè",
  "cal", "gestió", "procediment", "exemple", "exemples", "malaltia", "embaràs",
  "lactància", "mútua", "seguretat social", "comunicat", "contingència", "dies",
];
const spanishMarkers = [
  "con", "este", "esta", "estos", "estas", "trabajador", "trabajadora", "baja",
  "altas", "de los", "su", "cuando", "porque", "debe", "gestión", "procedimiento",
  "ejemplo", "ejemplos", "enfermedad", "embarazo", "lactancia", "mutua",
  "seguridad social", "parte", "contingencia", "días",
];

function countMarkers(text, markers) {
  const normalized = String(text ?? "").toLowerCase();
  return markers.reduce((total, marker) => {
    const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = normalized.match(new RegExp(`(^|[^a-záéíóúüñàèìòùç])${escaped}([^a-záéíóúüñàèìòùç]|$)`, "g"));
    return total + (matches?.length ?? 0);
  }, 0);
}

async function main() {
  const records = JSON.parse(await fs.readFile(inputPath, "utf8"));
  const results = records.map(record => {
    const text = `${record.title_es ?? ""}\n${record.summary_es ?? ""}\n${record.content_es ?? ""}`;
    const catalanScore = countMarkers(text, catalanMarkers);
    const spanishScore = countMarkers(text, spanishMarkers);
    return {
      id: record.id,
      title: record.title,
      titleEs: record.title_es,
      catalanScore,
      spanishScore,
      suspect: catalanScore >= 8 && catalanScore > spanishScore,
      preview: String(record.summary_es ?? "").slice(0, 300),
    };
  });
  const report = {
    total: results.length,
    suspects: results.filter(result => result.suspect).length,
    results,
  };
  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Auditados ${report.total} casos; sospechosos: ${report.suspects}`);
  console.log(outputPath);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
