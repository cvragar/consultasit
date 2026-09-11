import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const exportDir = path.resolve("exports/casos_especiales_txt_coloqia");
const catalogPath = path.resolve("exports/special_cases_catalog.json");
const languageAuditPath = path.resolve("exports/casos_especiales_language_audit.json");
const zipPath = path.resolve("exports/casos_especiales_txt_coloqia.zip");

type ValidationReport = {
  input_records: number;
  exported_records: number;
  formats: string[];
  empty_files: string[];
  invalid_utf8_files: string[];
  txt_markdown_artifacts: string[];
  warnings: string[];
  valid: boolean;
};

type LanguageAudit = {
  total: number;
  suspects: number;
  results: Array<{ catalanScore: number }>;
};

describe("exportació de casos especials TXT per a Coloq.ia", () => {
  const files = fs.readdirSync(exportDir).filter(file => file.endsWith(".txt"));
  const caseFiles = files.filter(file => !file.startsWith("00-"));
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8")) as Array<Record<string, unknown>>;

  it("exporta exactament els 29 casos, índex i instruccions", () => {
    expect(catalog).toHaveLength(29);
    expect(caseFiles).toHaveLength(29);
    expect(files).toContain("00-INDEX.txt");
    expect(files).toContain("00-INSTRUCCIONES-COLOQIA.txt");
  });

  it("inclou en cada cas les seccions decisives en català i castellà", () => {
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

  it("genera text pla UTF-8 sense sintaxi Markdown ni caràcters de control", () => {
    for (const file of files) {
      const content = fs.readFileSync(path.join(exportDir, file), "utf8");
      expect(content.length).toBeGreaterThan(100);
      expect(content).toMatch(/\n$/);
      expect(content).not.toMatch(/^#{1,6}\s/m);
      expect(content).not.toMatch(/\[[^\]]+\]\([^)]+\)/);
      expect(content).not.toContain("```");
      expect(content).not.toContain("\u0000");
      expect(content).not.toMatch(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/);
    }
  });

  it("preserva comparadors numèrics sense introduir sintaxi HTML", () => {
    const content = fs.readFileSync(
      path.join(exportDir, "300001-recaiguda-post-alta-icam.txt"),
      "utf8",
    );

    expect(content).toContain("60 és inferior a 180 dies");
    expect(content).toContain("60 es inferior a 180 días");
    expect(content).not.toMatch(/\d+\s*<\s*\d+/);
  });

  it("supera els informes d'integritat i de llengua", () => {
    const validation = JSON.parse(
      fs.readFileSync(path.join(exportDir, "validation-report.json"), "utf8"),
    ) as ValidationReport;
    const languageAudit = JSON.parse(fs.readFileSync(languageAuditPath, "utf8")) as LanguageAudit;

    expect(validation).toEqual({
      input_records: 29,
      exported_records: 29,
      formats: ["txt"],
      empty_files: [],
      invalid_utf8_files: [],
      txt_markdown_artifacts: [],
      warnings: [],
      valid: true,
    });
    expect(languageAudit.total).toBe(29);
    expect(languageAudit.suspects).toBe(0);
    expect(languageAudit.results.every(result => result.catalanScore === 0)).toBe(true);
  });

  it("publica manifest, instruccions en català i ZIP per a Coloq.ia", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(exportDir, "manifest.json"), "utf8"),
    ) as Array<{ files: { txt: string } }>;
    const instructions = fs.readFileSync(
      path.join(exportDir, "00-INSTRUCCIONES-COLOQIA.txt"),
      "utf8",
    );

    expect(manifest).toHaveLength(29);
    expect(manifest.every(item => item.files.txt.endsWith(".txt"))).toBe(true);
    expect(instructions).toContain("CRITERIS PER A L'ASSISTENT");
    expect(instructions).toContain("No completar dades per intuïció");
    expect(instructions).toContain("ORDRE RECOMANAT DE CÀRREGA");
    expect(fs.statSync(zipPath).size).toBeGreaterThan(0);
  });

  it("inclou data de generació i versió a l'índex", () => {
    const index = fs.readFileSync(path.join(exportDir, "00-INDEX.txt"), "utf8");

    expect(index).toContain("VERSIÓ I GENERACIÓ DEL CORPUS");
    expect(index).toMatch(/Data de generació \(UTC\): \d{4}-\d{2}-\d{2}T/);
    expect(index).toContain("Versió del corpus: 2026.09.11.1");
  });
});
