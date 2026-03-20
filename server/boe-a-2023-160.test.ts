import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

let conn: mysql.Connection;

beforeAll(async () => {
  conn = await mysql.createConnection(process.env.DATABASE_URL!);
});

afterAll(async () => {
  await conn.end();
});

// ============================================================
// DOCUMENT BOE-A-2023-160 (ID 60001): RD 1060/2022
// ============================================================

describe("Document BOE-A-2023-160 (RD 1060/2022) — Gestió electrònica dels parts d'IT", () => {
  it("ha d'existir el document amb ID 60001", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM documents WHERE id = 60001"
    );
    expect(rows.length).toBe(1);
  });

  it("ha de tenir el títol correcte amb referència al RD 1060/2022 i BOE-A-2023-160", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT title FROM documents WHERE id = 60001"
    );
    expect(rows.length).toBe(1);
    expect(rows[0].title).toContain("1060/2022");
    expect(rows[0].title).toContain("BOE-A-2023-160");
  });

  it("ha de tenir el tipus 'decreto'", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT type FROM documents WHERE id = 60001"
    );
    expect(rows[0].type).toBe("decreto");
  });

  it("ha de tenir la jurisdicció 'estatal'", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT jurisdiction FROM documents WHERE id = 60001"
    );
    expect(rows[0].jurisdiction).toBe("estatal");
  });

  it("ha de tenir l'any de publicació 2023 (any de publicació al BOE)", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT publicationYear FROM documents WHERE id = 60001"
    );
    expect(rows[0].publicationYear).toBe(2023);
  });

  it("ha de tenir l'estat 'vigent'", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT status FROM documents WHERE id = 60001"
    );
    expect(rows[0].status).toBe("vigent");
  });

  it("ha de tenir la URL del BOE correcta", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT url FROM documents WHERE id = 60001"
    );
    expect(rows[0].url).toContain("BOE-A-2023-160");
  });

  it("ha de tenir contingut substancial (> 5000 caràcters)", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT LENGTH(content) as len FROM documents WHERE id = 60001"
    );
    expect(rows[0].len).toBeGreaterThan(5000);
  });

  it("el contingut ha de mencionar els quatre grups de processos (a, b, c, d)", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT content FROM documents WHERE id = 60001"
    );
    const content = rows[0].content;
    expect(content).toContain("Grup a)");
    expect(content).toContain("Grup b)");
    expect(content).toContain("Grup c)");
    expect(content).toContain("Grup d)");
  });

  it("el contingut ha de mencionar la tramitació electrònica i l'eliminació del paper", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT content FROM documents WHERE id = 60001"
    );
    const content = rows[0].content;
    expect(
      content.includes("electrònic") || content.includes("electrónic")
    ).toBe(true);
    expect(
      content.includes("paper") || content.includes("còpia")
    ).toBe(true);
  });

  it("el contingut ha de mencionar el sistema RED i el termini de 3 dies hàbils", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT content FROM documents WHERE id = 60001"
    );
    const content = rows[0].content;
    expect(content).toContain("RED");
    expect(content).toContain("3 dies hàbils");
  });

  it("el contingut ha de mencionar els 180 dies de competència exclusiva de l'INSS", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT content FROM documents WHERE id = 60001"
    );
    const content = rows[0].content;
    expect(content).toContain("180 dies");
  });

  it("el contingut ha de mencionar l'entrada en vigor l'1 d'abril de 2023", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT content FROM documents WHERE id = 60001"
    );
    const content = rows[0].content;
    expect(
      content.includes("1 d'abril de 2023") ||
      content.includes("abril de 2023")
    ).toBe(true);
  });

  it("ha de tenir un resum (summary) no buit", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT summary FROM documents WHERE id = 60001"
    );
    expect(rows[0].summary).toBeTruthy();
    expect(rows[0].summary.length).toBeGreaterThan(100);
  });

  it("ha de tenir tags amb 'IT', 'sistema RED' i 'RD 1060/2022'", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT tags FROM documents WHERE id = 60001"
    );
    const tagsRaw = rows[0].tags;
    // MySQL pot retornar el camp JSON com a string o com a objecte
    const tags = typeof tagsRaw === "string" ? JSON.parse(tagsRaw) : tagsRaw;
    expect(Array.isArray(tags)).toBe(true);
    expect(tags.some((t: string) => t.includes("IT"))).toBe(true);
    expect(tags.some((t: string) => t.toLowerCase().includes("red"))).toBe(true);
    expect(tags.some((t: string) => t.includes("1060/2022"))).toBe(true);
  });

  it("el document defectuós (ID 30002) ha de ser eliminat", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id FROM documents WHERE id = 30002"
    );
    expect(rows.length).toBe(0);
  });

  it("no ha d'haver cap altre document amb títol BOE-A-2023-160 a part del 60001", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id FROM documents WHERE title LIKE '%BOE-A-2023-160%' AND id != 60001"
    );
    expect(rows.length).toBe(0);
  });

  it("el contingut ha de contenir els 5 exemples pràctics", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT content FROM documents WHERE id = 60001"
    );
    const content = rows[0].content;
    expect(content).toContain("Exemple 1");
    expect(content).toContain("Exemple 2");
    expect(content).toContain("Exemple 3");
    expect(content).toContain("Exemple 4");
    expect(content).toContain("Exemple 5");
  });
});

// ============================================================
// VERIFICACIÓ GLOBAL DE DOCUMENTS
// ============================================================

describe("Verificació global de documents", () => {
  it("ha d'haver almenys 12 documents a la BD", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM documents"
    );
    expect(rows[0].total).toBeGreaterThanOrEqual(12);
  });

  it("tots els documents han de tenir contingut no buit", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id, title FROM documents WHERE content IS NULL OR content = ''"
    );
    expect(rows.length).toBe(0);
  });

  it("tots els documents han de tenir títol no buit", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id FROM documents WHERE title IS NULL OR title = ''"
    );
    expect(rows.length).toBe(0);
  });
});
