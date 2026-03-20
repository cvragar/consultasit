import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

let connection: mysql.Connection;

beforeAll(async () => {
  connection = await mysql.createConnection(process.env.DATABASE_URL!);
});

afterAll(async () => {
  await connection.end();
});

// ─── Document Llei 1/2023 (ID 17) ───────────────────────────────────────────

describe("Document Llei 1/2023 - Menstruació incapacitant (ID 17)", () => {
  it("existeix a la BD amb el títol correcte", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT id, title FROM documents WHERE id = 17"
    );
    expect(rows.length).toBe(1);
    expect(rows[0].title).toContain("Llei Orgànica 1/2023");
    expect(rows[0].title).toContain("Menstruació incapacitant");
  });

  it("té contingut substancial (>5000 caràcters)", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT LENGTH(content) as len FROM documents WHERE id = 17"
    );
    expect(rows[0].len).toBeGreaterThan(5000);
  });

  it("conté el text de l'article 169 LGSS modificat", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT content FROM documents WHERE id = 17"
    );
    expect(rows[0].content).toContain("169");
    expect(rows[0].content).toContain("menstruació incapacitant");
  });

  it("conté informació sobre el protocol de Catalunya (ASSIR)", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT content FROM documents WHERE id = 17"
    );
    expect(rows[0].content).toContain("ASSIR");
    expect(rows[0].content).toContain("Catalunya");
  });

  it("conté les tres situacions especials de la Llei 1/2023", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT content FROM documents WHERE id = 17"
    );
    const content = rows[0].content as string;
    expect(content).toContain("Menstruació incapacitant secundària");
    expect(content).toContain("Interrupció de l'embaràs");
    expect(content).toContain("setmana 39");
  });

  it("conté informació sobre qui paga des del primer dia", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT content FROM documents WHERE id = 17"
    );
    expect(rows[0].content).toContain("primer dia");
    expect(rows[0].content).toContain("Seguretat Social");
  });

  it("conté les patologies reconegudes (endometriosi, adenomiosi)", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT content FROM documents WHERE id = 17"
    );
    const content = rows[0].content as string;
    expect(content).toContain("ndometriosi");
    expect(content).toContain("denomiosi");
  });

  it("té l'any de publicació 2023", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT publicationYear FROM documents WHERE id = 17"
    );
    expect(rows[0].publicationYear).toBe(2023);
  });

  it("té la URL del BOE correcta", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT url FROM documents WHERE id = 17"
    );
    expect(rows[0].url).toContain("boe.es");
    expect(rows[0].url).toContain("BOE-A-2023-5364");
  });
});

// ─── Funció getRecentItems (novetats) ────────────────────────────────────────

describe("Novetats - documents i casos especials recents", () => {
  it("hi ha documents a la BD", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM documents"
    );
    expect(rows[0].total).toBeGreaterThan(0);
  });

  it("hi ha casos especials a la BD", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM special_cases"
    );
    expect(rows[0].total).toBeGreaterThan(0);
  });

  it("els documents tenen el camp createdAt", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT createdAt FROM documents LIMIT 1"
    );
    expect(rows.length).toBe(1);
    expect(rows[0].createdAt).toBeDefined();
  });

  it("els casos especials tenen el camp createdAt", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT createdAt FROM special_cases LIMIT 1"
    );
    expect(rows.length).toBe(1);
    expect(rows[0].createdAt).toBeDefined();
  });

  it("la query de novetats (últims 90 dies) retorna resultats", async () => {
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const sinceStr = since.toISOString().slice(0, 19).replace("T", " ");

    const [docs] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM documents WHERE createdAt >= ?",
      [sinceStr]
    );
    const [cases] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM special_cases WHERE createdAt >= ?",
      [sinceStr]
    );

    const total = docs[0].total + cases[0].total;
    expect(total).toBeGreaterThan(0);
  });

  it("la ruta /novetats existeix al router del client (App.tsx)", async () => {
    const fs = await import("fs/promises");
    const appContent = await fs.readFile(
      "/home/ubuntu/consultasit/client/src/App.tsx",
      "utf-8"
    );
    expect(appContent).toContain("/novetats");
    expect(appContent).toContain("Novetats");
  });

  it("la pàgina Novetats.tsx existeix", async () => {
    const fs = await import("fs/promises");
    const exists = await fs
      .access("/home/ubuntu/consultasit/client/src/pages/Novetats.tsx")
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);
  });

  it("la procedure novetats.getRecent existeix al router", async () => {
    const fs = await import("fs/promises");
    const routerContent = await fs.readFile(
      "/home/ubuntu/consultasit/server/routers.ts",
      "utf-8"
    );
    expect(routerContent).toContain("novetats");
    expect(routerContent).toContain("getRecent");
    expect(routerContent).toContain("getRecentItems");
  });
});
