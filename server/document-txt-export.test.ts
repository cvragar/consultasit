import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const exportDir = path.resolve("exports/documentacio_txt_coloqia");

describe("exportación documental TXT para Coloq.IA", () => {
  const files = fs.readdirSync(exportDir).filter(file => file.endsWith(".txt"));
  const documentFiles = files.filter(file => !file.startsWith("00-"));

  it("incluye los 12 documentos, el índice y el archivo de instrucciones", () => {
    expect(documentFiles).toHaveLength(12);
    expect(files).toContain("00-INDICE.txt");
    expect(files).toContain("00-LEEME.txt");
  });

  it("genera texto legible sin sintaxis Markdown específica", () => {
    for (const file of files) {
      const content = fs.readFileSync(path.join(exportDir, file), "utf8");
      expect(content.length).toBeGreaterThan(100);
      expect(content).not.toMatch(/^#{1,6}\s/m);
      expect(content).not.toMatch(/\[[^\]]+\]\([^)]+\)/);
      expect(content).not.toContain("```");
      expect(content).not.toContain("\u0000");
    }
  });

  it("conserva metadatos, fuentes y contenido en cada documento", () => {
    for (const file of documentFiles) {
      const content = fs.readFileSync(path.join(exportDir, file), "utf8");
      expect(content).toContain("Título principal:");
      expect(content).toContain("Fuente:");
      expect(content).toContain("URL de la fuente:");
      expect(content).toContain("CONTENIDO PRINCIPAL");
    }
  });
});
