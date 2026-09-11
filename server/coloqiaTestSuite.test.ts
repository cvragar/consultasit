import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import {
  COLOQIA_TEST_SUITE_VERSION,
  generateColoqiaTestSuite,
} from "./coloqiaTestSuite";

describe("joc de proves per a Coloq.ia", () => {
  it("genera un Excel amb instruccions i casos de prova puntuables", () => {
    const suite = generateColoqiaTestSuite(new Date("2026-09-11T11:30:00.000Z"));
    const workbook = XLSX.read(suite.archive, { type: "buffer" });
    const tests = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      workbook.Sheets.Pruebas,
      { defval: "" },
    );
    const instructions = XLSX.utils.sheet_to_json<string[]>(
      workbook.Sheets.Instrucciones,
      { header: 1, defval: "" },
    );

    expect(suite.filename).toBe("juego-pruebas-consultes-it-coloqia.xlsx");
    expect(suite.version).toBe(COLOQIA_TEST_SUITE_VERSION);
    expect(suite.testCount).toBe(22);
    expect(workbook.SheetNames).toEqual(["Pruebas", "Instrucciones"]);
    expect(tests).toHaveLength(22);
    expect(new Set(tests.map(testCase => testCase["ID Prueba"])).size).toBe(22);
    expect(tests.every(testCase => (
      typeof testCase.Pregunta === "string"
      && String(testCase.Pregunta).length > 20
      && typeof testCase["Puntos esperados"] === "string"
      && String(testCase["Puntos esperados"]).includes("•")
      && testCase["Puntuación máxima"] === 5
    ))).toBe(true);
    expect(tests.some(testCase => testCase["Idioma esperado"] === "ca")).toBe(true);
    expect(tests.some(testCase => testCase["Idioma esperado"] === "es")).toBe(true);
    expect(instructions.flat().join(" ")).toContain("No cambies los encabezados de la hoja Pruebas");
  });
});
