import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const exportDir = path.resolve("exports/documentacio_txt_coloqia");
const zipPath = path.resolve("exports/documentacio_txt_coloqia.zip");

type ValidationReport = {
  input_records: number;
  exported_records: number;
  empty_files: string[];
  invalid_utf8_files: string[];
  txt_markdown_artifacts: string[];
  warnings: string[];
  valid: boolean;
};

describe("exportació documental TXT per a Coloq.ia", () => {
  const files = fs.readdirSync(exportDir).filter(file => file.endsWith(".txt"));
  const documentFiles = files.filter(file => !file.startsWith("00-"));

  it("inclou els 12 documents, l'índex i les instruccions de càrrega", () => {
    expect(documentFiles).toHaveLength(12);
    expect(files).toContain("00-INDEX.txt");
    expect(files).toContain("00-INSTRUCCIONES-COLOQIA.txt");
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

  it("conserva metadades, font, URL, contingut i blocs d'idioma en cada document", () => {
    for (const file of documentFiles) {
      const content = fs.readFileSync(path.join(exportDir, file), "utf8");
      expect(content).toContain("DOCUMENT CATALOG EXPORT");
      expect(content).toContain("Título:");
      expect(content).toContain("Fuente:");
      expect(content).toContain("URL:");
      expect(content).toContain("CONTENIDO");
    }
  });

  it("publica manifest, informe de validació net i ZIP per a Coloq.ia", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(exportDir, "manifest.json"), "utf8"),
    ) as Array<{ files: { txt: string } }>;
    const validation = JSON.parse(
      fs.readFileSync(path.join(exportDir, "validation-report.json"), "utf8"),
    ) as ValidationReport;

    expect(manifest).toHaveLength(12);
    expect(manifest.every(item => item.files.txt.endsWith(".txt"))).toBe(true);
    expect(validation).toEqual({
      input_records: 12,
      exported_records: 12,
      formats: ["txt"],
      empty_files: [],
      invalid_utf8_files: [],
      txt_markdown_artifacts: [],
      warnings: [],
      valid: true,
    });
    expect(fs.statSync(zipPath).size).toBeGreaterThan(0);
  });

  it("inclou instruccions de prudència i càrrega que Coloq.ia pot interpretar", () => {
    const instructions = fs.readFileSync(
      path.join(exportDir, "00-INSTRUCCIONES-COLOQIA.txt"),
      "utf8",
    );

    expect(instructions).toContain("CRITERIS PER A L'ASSISTENT");
    expect(instructions).toContain("No completar dades per intuïció");
    expect(instructions).toContain("ORDRE RECOMANAT DE CÀRREGA");
  });
});
