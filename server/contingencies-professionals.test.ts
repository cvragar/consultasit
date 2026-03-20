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

describe("Cas especial: Malaltia Professional en personal sanitari (punxada accidental)", () => {
  it("ha d'existir el cas especial amb ID 80001", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM special_cases WHERE id = 80001"
    );
    expect(rows.length).toBe(1);
  });

  it("ha de tenir la categoria correcta (accident_treball o otro)", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT category FROM special_cases WHERE id = 80001"
    );
    expect(rows.length).toBe(1);
    // La categoria ha de ser una de les vàlides
    expect(["accident_treball", "otro"]).toContain(rows[0].category);
  });

  it("ha de tenir el títol sobre malaltia professional o punxada accidental", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT title FROM special_cases WHERE id = 80001"
    );
    expect(rows.length).toBe(1);
    const title = rows[0].title.toLowerCase();
    expect(
      title.includes("malaltia professional") ||
      title.includes("punxada") ||
      title.includes("hepatitis") ||
      title.includes("sanitari")
    ).toBe(true);
  });

  it("ha de tenir base legal amb referència al RD 1299/2006 o LGSS art. 157", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT legalBasis FROM special_cases WHERE id = 80001"
    );
    expect(rows.length).toBe(1);
    const legalBasis = rows[0].legalBasis || "";
    expect(
      legalBasis.includes("1299") ||
      legalBasis.includes("157") ||
      legalBasis.includes("LGSS") ||
      legalBasis.includes("malaltia professional")
    ).toBe(true);
  });

  it("ha de tenir procediment amb referència a l'eCap o la mútua", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT `procedure` FROM special_cases WHERE id = 80001"
    );
    expect(rows.length).toBe(1);
    const procedure = rows[0].procedure || "";
    expect(
      procedure.toLowerCase().includes("ecap") ||
      procedure.toLowerCase().includes("mútua") ||
      procedure.toLowerCase().includes("mutua") ||
      procedure.toLowerCase().includes("cepross")
    ).toBe(true);
  });

  it("ha de tenir exemples pràctics", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT examples FROM special_cases WHERE id = 80001"
    );
    expect(rows.length).toBe(1);
    expect(rows[0].examples).toBeTruthy();
    expect(rows[0].examples.length).toBeGreaterThan(50);
  });

  it("no ha de tenir contingut en format JSON array", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT examples, legalBasis, `procedure` FROM special_cases WHERE id = 80001"
    );
    expect(rows.length).toBe(1);
    const { examples, legalBasis, procedure } = rows[0];
    // Cap camp ha de començar amb '[' (JSON array)
    if (examples) expect(examples.trim()).not.toMatch(/^\[/);
    if (legalBasis) expect(legalBasis.trim()).not.toMatch(/^\[/);
    if (procedure) expect(procedure.trim()).not.toMatch(/^\[/);
  });
});

describe("Document: RD 625/2014 (gestió IT primers 365 dies)", () => {
  it("ha d'existir un document amb ID 15", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM documents WHERE id = 15"
    );
    expect(rows.length).toBe(1);
  });

  it("ha de tenir el títol del RD 625/2014", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT title FROM documents WHERE id = 15"
    );
    expect(rows.length).toBe(1);
    expect(rows[0].title).toContain("625");
  });

  it("ha de tenir l'any de publicació 2014", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT publicationYear FROM documents WHERE id = 15"
    );
    expect(rows.length).toBe(1);
    expect(rows[0].publicationYear).toBe(2014);
  });

  it("ha de tenir l'estat vigent", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT status FROM documents WHERE id = 15"
    );
    expect(rows.length).toBe(1);
    expect(rows[0].status).toBe("vigent");
  });

  it("ha de tenir un resum sobre gestió d'IT", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT summary FROM documents WHERE id = 15"
    );
    expect(rows.length).toBe(1);
    const summary = (rows[0].summary || "").toLowerCase();
    expect(
      summary.includes("incapacitat") ||
      summary.includes("parts") ||
      summary.includes("365") ||
      summary.includes("gestió")
    ).toBe(true);
  });
});

describe("Document: RD 1299/2006 (malalties professionals)", () => {
  it("ha d'existir un document sobre el RD 1299/2006", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM documents WHERE title LIKE '%1299%' OR title LIKE '%malalt%professional%'"
    );
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it("ha de tenir l'any de publicació 2006", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT publicationYear FROM documents WHERE title LIKE '%1299%'"
    );
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].publicationYear).toBe(2006);
  });

  it("ha de tenir l'estat vigent", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT status FROM documents WHERE title LIKE '%1299%'"
    );
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].status).toBe("vigent");
  });
});

describe("Verificació de la cobertura de contingències professionals", () => {
  it("ha d'haver casos especials de la categoria accident_treball", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM special_cases WHERE category = 'accident_treball'"
    );
    expect(rows[0].count).toBeGreaterThanOrEqual(3);
  });

  it("ha d'haver documents sobre normativa de contingències professionals", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM documents WHERE type = 'decreto' AND status = 'vigent'"
    );
    expect(rows[0].count).toBeGreaterThanOrEqual(2);
  });

  it("ha d'haver almenys un document per a cada contingència principal", async () => {
    // RD 625/2014 (CC), RD 1299/2006 (MP), RD 1060/2022 (modificació)
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT title FROM documents WHERE title LIKE '%625%' OR title LIKE '%1299%' OR title LIKE '%1060%'"
    );
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });
});
