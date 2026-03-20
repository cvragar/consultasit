import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

let conn: mysql.Connection;
let doc: Record<string, unknown> | undefined;

beforeAll(async () => {
  conn = await mysql.createConnection(process.env.DATABASE_URL!);
  const [rows] = await conn.execute(
    "SELECT id, title, content, summary, tags, url, publicationYear, status FROM documents WHERE id = 15"
  );
  doc = (rows as Record<string, unknown>[])[0];
});

afterAll(async () => {
  await conn.end();
});

describe("Document RD 625/2014 (ID 15) - Contingut ampliat", () => {
  it("ha de trobar el document ID 15", () => {
    expect(doc).toBeDefined();
  });

  it("ha de tenir el títol correcte", () => {
    expect(String(doc?.title)).toContain("625/2014");
  });

  it("ha de tenir un contingut substancial (>15.000 caràcters)", () => {
    expect(String(doc?.content).length).toBeGreaterThan(15000);
  });

  it("ha de contenir l'article 1 (àmbit d'aplicació)", () => {
    const content = String(doc?.content);
    expect(content).toContain("Artículo 1");
    expect(content).toContain("trescientos sesenta y cinco días");
  });

  it("ha de contenir els quatre grups de processos de l'article 2.3", () => {
    const content = String(doc?.content);
    expect(content).toContain("cuatro grupos de procesos");
    expect(content).toContain("< 5 días naturales");
    expect(content).toContain("5 – 30 días naturales");
    expect(content).toContain("31 – 60 días naturales");
    expect(content).toContain("≥ 61 días naturales");
  });

  it("ha de contenir la taula de terminis de confirmació", () => {
    const content = String(doc?.content);
    expect(content).toContain("≤ 7 días desde la baja");
    expect(content).toContain("≤ 14 días entre sí");
    expect(content).toContain("≤ 28 días entre sí");
    expect(content).toContain("≤ 35 días entre sí");
  });

  it("ha de contenir l'article 3 (determinació de la contingència)", () => {
    const content = String(doc?.content);
    expect(content).toContain("Artículo 3");
    expect(content).toContain("contingencia causante");
  });

  it("ha de contenir l'article 4 (informes complementaris i de control)", () => {
    const content = String(doc?.content);
    expect(content).toContain("Artículo 4");
    expect(content).toContain("informe médico complementario");
    expect(content).toContain("trimestralmente");
    expect(content).toContain("informe de control");
  });

  it("ha de contenir l'article 5 (altes mèdiques)", () => {
    const content = String(doc?.content);
    expect(content).toContain("Artículo 5");
    expect(content).toContain("efectos laborales del día siguiente");
  });

  it("ha de contenir l'article 6 (propostes d'alta de les mútues)", () => {
    const content = String(doc?.content);
    expect(content).toContain("Artículo 6");
    expect(content).toContain("propuestas motivadas de alta médica");
    expect(content).toContain("5 días");
  });

  it("ha de contenir l'article 7 amb la nova tramitació electrònica (RD 1060/2022)", () => {
    const content = String(doc?.content);
    expect(content).toContain("Artículo 7");
    expect(content).toContain("01/04/2023");
    expect(content).toContain("sistema RED");
    expect(content).toContain("3 dies hàbils");
  });

  it("ha de contenir la nota important sobre la no entrega de còpia a l'empresa", () => {
    const content = String(doc?.content);
    expect(content).toContain("NO");
    expect(content).toContain("còpia");
    expect(content).toContain("empresa");
  });

  it("ha de contenir l'article 7.5 (180 dies competència exclusiva INSS)", () => {
    const content = String(doc?.content);
    expect(content).toContain("180 días naturales");
    expect(content).toContain("únicas competentes");
  });

  it("ha de contenir l'article 9 (requeriments a treballadors)", () => {
    const content = String(doc?.content);
    expect(content).toContain("Artículo 9");
    expect(content).toContain("4 días hábiles");
    expect(content).toContain("10 días hábiles");
    expect(content).toContain("extinción del derecho");
  });

  it("ha de contenir l'article 10 (cooperació i coordinació)", () => {
    const content = String(doc?.content);
    expect(content).toContain("Artículo 10");
    expect(content).toContain("cooperación y coordinación");
  });

  it("ha de contenir el resum executiu amb la taula", () => {
    const content = String(doc?.content);
    expect(content).toContain("Resum executiu per al metge de família");
    expect(content).toContain("Alta simultánea con la baja");
  });

  it("ha de tenir l'any de publicació 2014", () => {
    expect(Number(doc?.publicationYear)).toBe(2014);
  });

  it("ha de tenir l'estat 'vigent'", () => {
    expect(String(doc?.status)).toBe("vigent");
  });

  it("ha de tenir la URL oficial del BOE", () => {
    const url = String(doc?.url);
    expect(url).toContain("boe.es");
    expect(url).toContain("BOE-A-2014-7684");
  });

  it("ha de tenir tags que incloguin RD 625/2014", () => {
    const tagsRaw = String(doc?.tags ?? "");
    expect(tagsRaw).toContain("RD 625/2014");
  });

  it("ha de tenir un resum no buit", () => {
    const summary = String(doc?.summary);
    expect(summary.length).toBeGreaterThan(100);
    expect(summary).toContain("365 dies");
  });
});
