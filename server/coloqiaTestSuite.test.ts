import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import {
  COLOQIA_TEST_SUITE_VERSION,
  generateColoqiaTestSuite,
} from "./coloqiaTestSuite";

describe("joc de proves per a Coloq.ia", () => {
  it("genera un Excel de dues columnes amb preguntes i respostes esperades", () => {
    const suite = generateColoqiaTestSuite(new Date("2026-09-11T11:30:00.000Z"));
    const workbook = XLSX.read(suite.archive, { type: "buffer" });
    const sheet = workbook.Sheets["Test cases"];
    const headers = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      range: 0,
      blankrows: false,
    })[0];
    const tests = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

    expect(suite.filename).toBe("juego-pruebas-consultes-it-coloqia.xlsx");
    expect(suite.version).toBe(COLOQIA_TEST_SUITE_VERSION);
    expect(suite.testCount).toBe(22);
    expect(workbook.SheetNames).toEqual(["Test cases"]);
    expect(headers).toEqual(["question", "expected answer"]);
    expect(tests).toHaveLength(22);
    expect(tests.every(testCase => (
      Object.keys(testCase).length === 2
      && typeof testCase.question === "string"
      && String(testCase.question).length > 20
      && typeof testCase["expected answer"] === "string"
      && String(testCase["expected answer"]).length > 20
    ))).toBe(true);
  });
});
