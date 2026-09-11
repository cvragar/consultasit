import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const exportDir = path.resolve("exports/casos_especiales_txt_coloqia");
const catalogPath = path.resolve("exports/special_cases_catalog.json");

describe("exportación de casos especiales TXT para Coloq.IA", () => {
  const files = fs.readdirSync(exportDir).filter(file => file.endsWith(".txt"));
  const caseFiles = files.filter(file => !file.startsWith("00-"));
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8")) as Array<Record<string, unknown>>;

  it("exporta exactamente los 29 casos y un índice general", () => {
    expect(catalog).toHaveLength(29);
    expect(caseFiles).toHaveLength(29);
    expect(files).toContain("00-INDEX.txt");
  });

  it("incluye en cada caso las secciones decisivas en catalán y castellano", () => {
    for (const file of caseFiles) {
      const content = fs.readFileSync(path.join(exportDir, file), "utf8");
      expect(content).toContain("BASE LEGAL");
      expect(content).toContain("PROCEDIMENT RECOMANAT");
      expect(content).toContain("PROCEDIMIENTO RECOMENDADO");
      expect(content).toContain("EJEMPLOS PRÁCTICOS");
      expect(content).toContain("INSTRUCCIONES PARA EL ASISTENTE");
      expect(content).toContain("Verificar siempre la vigencia normativa");
    }
  });

  it("supera los informes de integridad y de idioma", () => {
    const validation = JSON.parse(
      fs.readFileSync(path.join(exportDir, "validation-report.json"), "utf8"),
    );
    const languageAudit = JSON.parse(
      fs.readFileSync(path.resolve("exports/casos_especiales_language_audit.json"), "utf8"),
    );
    expect(validation.valid).toBe(true);
    expect(validation.input_records).toBe(29);
    expect(validation.exported_records).toBe(29);
    expect(validation.warnings).toEqual([]);
    expect(languageAudit.total).toBe(29);
    expect(languageAudit.suspects).toBe(0);
  });
});
