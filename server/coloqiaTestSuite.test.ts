import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import {
  COLOQIA_TEST_SUITE_VERSION,
  generateColoqiaTestSuite,
} from "./coloqiaTestSuite";

describe("joc de proves per a Coloq.ia", () => {
  it("genera un ZIP pla amb instruccions, JSON i preguntes puntuables", () => {
    const suite = generateColoqiaTestSuite(new Date("2026-09-11T11:30:00.000Z"));
    const files = unzipSync(suite.archive);
    const payload = JSON.parse(strFromU8(files["juego-pruebas-coloqia.json"])) as {
      version: string;
      tests: Array<{
        id: string;
        language: string;
        prompt: string;
        expected_points: string[];
        scoring: { maximum: number };
      }>;
    };
    const validation = JSON.parse(strFromU8(files["validation-report.json"])) as {
      tests: number;
      unique_ids: number;
      valid: boolean;
    };

    expect(suite.filename).toBe("juego-pruebas-consultes-it-coloqia.zip");
    expect(suite.version).toBe(COLOQIA_TEST_SUITE_VERSION);
    expect(suite.testCount).toBe(22);
    expect(Object.keys(files).sort()).toEqual([
      "00-LEEME-JUEGO-DE-PRUEBAS.txt",
      "juego-pruebas-coloqia.json",
      "juego-pruebas-coloqia.txt",
      "validation-report.json",
    ]);
    expect(payload.version).toBe(COLOQIA_TEST_SUITE_VERSION);
    expect(payload.tests).toHaveLength(22);
    expect(new Set(payload.tests.map(testCase => testCase.id)).size).toBe(22);
    expect(payload.tests.filter(testCase => testCase.language === "ca").length).toBeGreaterThan(0);
    expect(payload.tests.filter(testCase => testCase.language === "es").length).toBeGreaterThan(0);
    expect(payload.tests.every(testCase => (
      testCase.prompt.length > 20
      && testCase.expected_points.length > 0
      && testCase.scoring.maximum === 5
    ))).toBe(true);
    expect(validation).toMatchObject({ tests: 22, unique_ids: 22, valid: true });
    expect(strFromU8(files["00-LEEME-JUEGO-DE-PRUEBAS.txt"])).toContain("No carreguis aquest joc de proves com si fos coneixement normatiu");
  });
});
