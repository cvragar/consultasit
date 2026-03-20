/**
 * Tests per al Reial Decret 1060/2022 (BOE-A-2023-160)
 * Verifica que el document s'ha inserit correctament a la BD
 * i que el sistema de RAG pot accedir-hi.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mysql from "mysql2/promise";

let conn: mysql.Connection;

beforeAll(async () => {
  conn = await mysql.createConnection(process.env.DATABASE_URL!);
});

afterAll(async () => {
  await conn.end();
});

describe("RD 1060/2022 (BOE-A-2023-160) - Integració a la BD", () => {
  it("el document existeix a la BD amb el títol correcte", async () => {
    const [rows] = await conn.execute(
      "SELECT * FROM documents WHERE title LIKE '%1060/2022%' OR title LIKE '%BOE-A-2023-160%'"
    ) as any;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].title).toContain("BOE-A-2023-160");
  });

  it("el document té tipus 'decreto'", async () => {
    const [rows] = await conn.execute(
      "SELECT type FROM documents WHERE title LIKE '%1060/2022%'"
    ) as any;
    expect(rows[0].type).toBe("decreto");
  });

  it("el document té jurisdicció 'estatal'", async () => {
    const [rows] = await conn.execute(
      "SELECT jurisdiction FROM documents WHERE title LIKE '%1060/2022%'"
    ) as any;
    expect(rows[0].jurisdiction).toBe("estatal");
  });

  it("el document té any de publicació 2023", async () => {
    const [rows] = await conn.execute(
      "SELECT publicationYear FROM documents WHERE title LIKE '%1060/2022%'"
    ) as any;
    expect(Number(rows[0].publicationYear)).toBe(2023);
  });

  it("el document té estat 'vigent'", async () => {
    const [rows] = await conn.execute(
      "SELECT status FROM documents WHERE title LIKE '%1060/2022%'"
    ) as any;
    expect(rows[0].status).toBe("vigent");
  });

  it("el document té URL del BOE oficial", async () => {
    const [rows] = await conn.execute(
      "SELECT url FROM documents WHERE title LIKE '%1060/2022%'"
    ) as any;
    expect(rows[0].url).toContain("BOE-A-2023-160");
  });

  it("el contingut inclou informació sobre la tramitació electrònica", async () => {
    const [rows] = await conn.execute(
      "SELECT content FROM documents WHERE title LIKE '%1060/2022%'"
    ) as any;
    const content = rows[0].content as string;
    expect(content).toContain("electrònica");
    expect(content).toContain("empresa");
  });

  it("el contingut inclou la regla dels 180 dies de competència exclusiva INSS", async () => {
    const [rows] = await conn.execute(
      "SELECT content FROM documents WHERE title LIKE '%1060/2022%'"
    ) as any;
    const content = rows[0].content as string;
    expect(content).toContain("180 dies");
  });

  it("el contingut inclou les implicacions pràctiques per al metge de família (eCap)", async () => {
    const [rows] = await conn.execute(
      "SELECT content FROM documents WHERE title LIKE '%1060/2022%'"
    ) as any;
    const content = rows[0].content as string;
    expect(content).toContain("eCap");
  });

  it("el document és cercable per 'parts mèdics' a la cerca avançada", async () => {
    const [rows] = await conn.execute(
      "SELECT id, title FROM documents WHERE content LIKE '%parts m%dics%' OR content LIKE '%partes m%dicos%'"
    ) as any;
    const found = rows.some((r: any) => r.title.includes("1060/2022"));
    expect(found).toBe(true);
  });

  it("el document és cercable per 'tramitació electrònica' a la cerca avançada", async () => {
    const [rows] = await conn.execute(
      "SELECT id, title FROM documents WHERE content LIKE '%tramitació electrònica%'"
    ) as any;
    const found = rows.some((r: any) => r.title.includes("1060/2022"));
    expect(found).toBe(true);
  });

  it("el document té resum (summary) no buit", async () => {
    const [rows] = await conn.execute(
      "SELECT summary FROM documents WHERE title LIKE '%1060/2022%'"
    ) as any;
    expect(rows[0].summary).toBeTruthy();
    expect(rows[0].summary.length).toBeGreaterThan(100);
  });

  it("el document té etiquetes (tags) que inclouen 'RD 1060/2022'", async () => {
    const [rows] = await conn.execute(
      "SELECT tags FROM documents WHERE title LIKE '%1060/2022%'"
    ) as any;
    const tags = typeof rows[0].tags === "string"
      ? JSON.parse(rows[0].tags)
      : rows[0].tags;
    expect(Array.isArray(tags)).toBe(true);
    const hasRD = tags.some((t: string) => t.includes("1060/2022"));
    expect(hasRD).toBe(true);
  });
});
