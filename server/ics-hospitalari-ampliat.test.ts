import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

let conn: mysql.Connection;
let doc: Record<string, unknown> | undefined;

beforeAll(async () => {
  conn = await mysql.createConnection(process.env.DATABASE_URL!);
  const [rows] = await conn.execute(
    "SELECT id, title, content, summary, tags, url, publicationYear, status FROM documents WHERE id = 19"
  );
  doc = (rows as Record<string, unknown>[])[0];
});

afterAll(async () => {
  await conn.end();
});

describe("Document ICS Hospitalari (ID 19) - Contingut ampliat", () => {
  it("ha de trobar el document ID 19", () => {
    expect(doc).toBeDefined();
  });

  it("ha de tenir el títol actualitzat", () => {
    expect(String(doc?.title)).toContain("Hospitalari");
    expect(String(doc?.title)).toContain("ICS");
  });

  it("ha de tenir un contingut substancial (>8.000 caràcters)", () => {
    expect(String(doc?.content).length).toBeGreaterThan(8000);
  });

  it("ha de contenir el principi general de gestió des del centre hospitalari", () => {
    const content = String(doc?.content);
    expect(content).toContain("es gestionen des del mateix hospital");
  });

  it("ha de contenir els tres escenaris principals", () => {
    const content = String(doc?.content);
    expect(content).toContain("Ingrés hospitalari");
    expect(content).toContain("Cirurgia Major Ambulatòria");
    expect(content).toContain("Ingrés per part");
  });

  it("ha de contenir la taula de terminis per a ingrés hospitalari", () => {
    const content = String(doc?.content);
    expect(content).toContain("≥ 7 dies");
    expect(content).toContain("< 7 dies");
    expect(content).toContain("14 dies");
  });

  it("ha de contenir els requisits del pacient", () => {
    const content = String(doc?.content);
    expect(content).toContain("16 i 70 anys");
    expect(content).toContain("CIP");
  });

  it("ha de contenir els casos que NO es poden tramitar des de l'hospital", () => {
    const content = String(doc?.content);
    expect(content).toContain("via privada");
    expect(content).toContain("accident laboral");
  });

  it("ha de contenir la lògica de la CMA per durada < 5 dies", () => {
    const content = String(doc?.content);
    expect(content).toContain("< 5 dies");
    expect(content).toContain("baixa i l'alta en el mateix moment");
  });

  it("ha de contenir la gestió especial per ingrés per part", () => {
    const content = String(doc?.content);
    expect(content).toContain("dia anterior al part");
    expect(content).toContain("permís de maternitat");
  });

  it("ha de contenir la secció de coordinació hospital-eCap", () => {
    const content = String(doc?.content);
    expect(content).toContain("eCap");
    expect(content).toContain("ZAS_GESTIO_IT");
  });

  it("ha de contenir la taula dels grups del RD 625/2014 per hospitalitzacions prolongades", () => {
    const content = String(doc?.content);
    expect(content).toContain("Grup RD 625/2014");
    expect(content).toContain("5 – 30 dies");
    expect(content).toContain("31 – 60 dies");
    expect(content).toContain("≥ 61 dies");
  });

  it("ha de contenir la regla crítica sobre errors de documentació", () => {
    const content = String(doc?.content);
    expect(content).toContain("primers dies immediatament posteriors");
  });

  it("ha de contenir el cas especial d'embaràs de risc i ingrés hospitalari", () => {
    const content = String(doc?.content);
    expect(content).toContain("embaràs de risc");
    expect(content).toContain("contingència comuna");
  });

  it("ha de contenir el cas especial d'accident de treball i ingrés hospitalari", () => {
    const content = String(doc?.content);
    expect(content).toContain("Accident de treball");
    expect(content).toContain("mútua col·laboradora");
  });

  it("ha de contenir el resum executiu per al metge de família", () => {
    const content = String(doc?.content);
    expect(content).toContain("Resum executiu per al metge de família");
    expect(content).toContain("Metge família (CAP)");
  });

  it("ha de contenir les preguntes freqüents del metge de família", () => {
    const content = String(doc?.content);
    expect(content).toContain("data retroactiva");
    expect(content).toContain("dia 180");
  });

  it("ha de tenir l'any de publicació 2024", () => {
    expect(Number(doc?.publicationYear)).toBe(2024);
  });

  it("ha de tenir l'estat vigent", () => {
    expect(String(doc?.status)).toBe("vigent");
  });

  it("ha de tenir la URL del Canal Salut", () => {
    const url = String(doc?.url);
    expect(url).toContain("canalsalut.gencat.cat");
    expect(url).toContain("gestio-ingres-hospitalari");
  });

  it("ha de tenir tags que incloguin ICS i IT hospitalari", () => {
    const tagsRaw = String(doc?.tags ?? "");
    expect(tagsRaw).toContain("ICS");
    expect(tagsRaw).toContain("IT hospitalari");
  });

  it("ha de tenir un resum no buit", () => {
    const summary = String(doc?.summary);
    expect(summary.length).toBeGreaterThan(100);
    expect(summary).toContain("ICS");
  });
});
