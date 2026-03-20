/**
 * Tests per al Reial Decret 1299/2006 (BOE-A-2006-22169)
 * Quadre de malalties professionals en el sistema de la Seguretat Social
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

describe("RD 1299/2006 (BOE-A-2006-22169) - Integració a la BD", () => {
  it("el document existeix a la BD amb el títol correcte", async () => {
    const [rows] = await conn.execute(
      "SELECT * FROM documents WHERE title LIKE '%1299/2006%' OR title LIKE '%BOE-A-2006-22169%'"
    ) as any;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].title).toContain("BOE-A-2006-22169");
  });

  it("el document té tipus 'decreto'", async () => {
    const [rows] = await conn.execute(
      "SELECT type FROM documents WHERE title LIKE '%1299/2006%'"
    ) as any;
    expect(rows[0].type).toBe("decreto");
  });

  it("el document té jurisdicció 'estatal'", async () => {
    const [rows] = await conn.execute(
      "SELECT jurisdiction FROM documents WHERE title LIKE '%1299/2006%'"
    ) as any;
    expect(rows[0].jurisdiction).toBe("estatal");
  });

  it("el document té any de publicació 2006", async () => {
    const [rows] = await conn.execute(
      "SELECT publicationYear FROM documents WHERE title LIKE '%1299/2006%'"
    ) as any;
    expect(Number(rows[0].publicationYear)).toBe(2006);
  });

  it("el document té estat 'vigent'", async () => {
    const [rows] = await conn.execute(
      "SELECT status FROM documents WHERE title LIKE '%1299/2006%'"
    ) as any;
    expect(rows[0].status).toBe("vigent");
  });

  it("el document té URL del PDF pujat a S3/CDN", async () => {
    const [rows] = await conn.execute(
      "SELECT url FROM documents WHERE title LIKE '%1299/2006%'"
    ) as any;
    expect(rows[0].url).toContain("cloudfront.net");
    expect(rows[0].url).toContain("BOE-A-2006-22169");
  });

  it("el contingut inclou els 6 grups de malalties professionals", async () => {
    const [rows] = await conn.execute(
      "SELECT content FROM documents WHERE title LIKE '%1299/2006%'"
    ) as any;
    const content = rows[0].content as string;
    expect(content).toContain("Grup 1");
    expect(content).toContain("Grup 2");
    expect(content).toContain("Grup 3");
    expect(content).toContain("Grup 4");
    expect(content).toContain("Grup 5");
    expect(content).toContain("Grup 6");
  });

  it("el contingut inclou informació sobre agents biològics per al personal sanitari", async () => {
    const [rows] = await conn.execute(
      "SELECT content FROM documents WHERE title LIKE '%1299/2006%'"
    ) as any;
    const content = rows[0].content as string;
    expect(content).toContain("personal sanitari");
    expect(content).toContain("agents biològics");
  });

  it("el contingut inclou la síndrome del túnel carpià (Grup 2H)", async () => {
    const [rows] = await conn.execute(
      "SELECT content FROM documents WHERE title LIKE '%1299/2006%'"
    ) as any;
    const content = rows[0].content as string;
    expect(content).toContain("túnel carpià");
  });

  it("el contingut inclou les implicacions pràctiques per al metge de família (eCap)", async () => {
    const [rows] = await conn.execute(
      "SELECT content FROM documents WHERE title LIKE '%1299/2006%'"
    ) as any;
    const content = rows[0].content as string;
    expect(content).toContain("eCap");
    expect(content).toContain("mútua");
  });

  it("el contingut inclou la diferència entre AT i malaltia professional", async () => {
    const [rows] = await conn.execute(
      "SELECT content FROM documents WHERE title LIKE '%1299/2006%'"
    ) as any;
    const content = rows[0].content as string;
    expect(content).toContain("accident de treball");
    expect(content).toContain("malaltia professional");
  });

  it("el document té resum (summary) no buit", async () => {
    const [rows] = await conn.execute(
      "SELECT summary FROM documents WHERE title LIKE '%1299/2006%'"
    ) as any;
    expect(rows[0].summary).toBeTruthy();
    expect(rows[0].summary.length).toBeGreaterThan(100);
  });

  it("el document té etiquetes (tags) que inclouen 'malalties professionals'", async () => {
    const [rows] = await conn.execute(
      "SELECT tags FROM documents WHERE title LIKE '%1299/2006%'"
    ) as any;
    const tags = typeof rows[0].tags === "string"
      ? JSON.parse(rows[0].tags)
      : rows[0].tags;
    expect(Array.isArray(tags)).toBe(true);
    const hasMP = tags.some((t: string) =>
      t.toLowerCase().includes("malalties professionals") ||
      t.toLowerCase().includes("1299/2006")
    );
    expect(hasMP).toBe(true);
  });

  it("el document és cercable per 'malalties professionals' al contingut", async () => {
    const [rows] = await conn.execute(
      "SELECT id, title FROM documents WHERE content LIKE '%malalties professionals%'"
    ) as any;
    const found = rows.some((r: any) => r.title.includes("1299/2006"));
    expect(found).toBe(true);
  });

  it("la BD conté ara almenys 2 decrets estatals vigents (RD 1060/2022 i RD 1299/2006)", async () => {
    const [rows] = await conn.execute(
      "SELECT COUNT(*) as total FROM documents WHERE type = 'decreto' AND jurisdiction = 'estatal' AND status = 'vigent'"
    ) as any;
    expect(Number(rows[0].total)).toBeGreaterThanOrEqual(2);
  });
});
