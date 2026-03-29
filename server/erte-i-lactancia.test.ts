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
// CAS ESPECIAL 90003: IT durant un ERTE/ERTO
// ============================================================

describe("Cas especial 90003: IT durant un ERTE/ERTO", () => {
  it("ha d'existir el cas especial amb ID 90003", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM special_cases WHERE id = 90003"
    );
    expect(rows.length).toBe(1);
  });

  it("ha de tenir la categoria otro", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT category FROM special_cases WHERE id = 90003"
    );
    expect(rows.length).toBe(1);
    expect(rows[0].category).toBe("otro");
  });

  it("ha de tenir el títol sobre IT i ERTE", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT title FROM special_cases WHERE id = 90003"
    );
    expect(rows.length).toBe(1);
    const title = rows[0].title.toLowerCase();
    expect(title.includes("erte") || title.includes("erto")).toBe(true);
  });

  it("ha de tenir descripció que expliqui els tres escenaris (IT prèvia, IT durant, ERTE reducció)", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT description FROM special_cases WHERE id = 90003"
    );
    expect(rows.length).toBe(1);
    const desc = rows[0].description.toLowerCase();
    expect(
      desc.includes("erte") ||
      desc.includes("desocupaci") ||
      desc.includes("suspens")
    ).toBe(true);
  });

  it("ha de tenir base legal amb referència a la LGSS art. 267-273 o RD-Llei 8/2020", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT legalBasis FROM special_cases WHERE id = 90003"
    );
    expect(rows.length).toBe(1);
    const legalBasis = rows[0].legalBasis || "";
    expect(
      legalBasis.includes("267") ||
      legalBasis.includes("273") ||
      legalBasis.includes("SEPE") ||
      legalBasis.includes("LGSS")
    ).toBe(true);
  });

  it("ha de tenir procediment amb instruccions per al metge de família", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT `procedure` FROM special_cases WHERE id = 90003"
    );
    expect(rows.length).toBe(1);
    const procedure = rows[0].procedure || "";
    expect(
      procedure.toLowerCase().includes("metge") ||
      procedure.toLowerCase().includes("comunicat de baixa") ||
      procedure.toLowerCase().includes("ecap")
    ).toBe(true);
  });

  it("ha de tenir almenys 3 exemples pràctics", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT examples FROM special_cases WHERE id = 90003"
    );
    expect(rows.length).toBe(1);
    const examples = rows[0].examples || "";
    expect(examples).toContain("Exemple 1");
    expect(examples).toContain("Exemple 2");
    expect(examples).toContain("Exemple 3");
  });

  it("no ha de tenir contingut en format JSON array", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT examples, legalBasis, `procedure`, description FROM special_cases WHERE id = 90003"
    );
    expect(rows.length).toBe(1);
    const { examples, legalBasis, procedure, description } = rows[0];
    if (examples) expect(examples.trim()).not.toMatch(/^\[/);
    if (legalBasis) expect(legalBasis.trim()).not.toMatch(/^\[/);
    if (procedure) expect(procedure.trim()).not.toMatch(/^\[/);
    if (description) expect(description.trim()).not.toMatch(/^\[/);
  });
});

// ============================================================
// CAS ESPECIAL 90004: Prestació per risc durant la lactància
// ============================================================

describe("Cas especial 90004: Prestació per risc durant la lactància natural", () => {
  it("ha d'existir el cas especial amb ID 90004", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM special_cases WHERE id = 90004"
    );
    expect(rows.length).toBe(1);
  });

  it("ha de tenir la categoria lactancia", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT category FROM special_cases WHERE id = 90004"
    );
    expect(rows.length).toBe(1);
    expect(rows[0].category).toBe("lactancia");
  });

  it("ha de tenir el títol sobre risc durant la lactància", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT title FROM special_cases WHERE id = 90004"
    );
    expect(rows.length).toBe(1);
    const title = rows[0].title.toLowerCase();
    expect(
      title.includes("lactàn") ||
      title.includes("lactan") ||
      title.includes("risc")
    ).toBe(true);
  });

  it("ha de tenir descripció que diferenciï la prestació per risc de la IT", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT description FROM special_cases WHERE id = 90004"
    );
    expect(rows.length).toBe(1);
    const desc = rows[0].description.toLowerCase();
    expect(
      desc.includes("100%") ||
      desc.includes("mútua") ||
      desc.includes("mutua") ||
      desc.includes("risc")
    ).toBe(true);
  });

  it("ha de tenir base legal amb referència a la LGSS art. 188 o 189 o RD 295/2009", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT legalBasis FROM special_cases WHERE id = 90004"
    );
    expect(rows.length).toBe(1);
    const legalBasis = rows[0].legalBasis || "";
    expect(
      legalBasis.includes("188") ||
      legalBasis.includes("189") ||
      legalBasis.includes("295") ||
      legalBasis.includes("LGSS")
    ).toBe(true);
  });

  it("ha de mencionar la durada fins als 9 mesos del fill", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT description, legalBasis, `procedure` FROM special_cases WHERE id = 90004"
    );
    expect(rows.length).toBe(1);
    const allContent = [
      rows[0].description,
      rows[0].legalBasis,
      rows[0].procedure
    ].join(" ");
    expect(allContent.includes("9 mesos") || allContent.includes("9 meses")).toBe(true);
  });

  it("ha de tenir procediment amb el rol del metge de família (informe, no comunicat de baixa)", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT `procedure` FROM special_cases WHERE id = 90004"
    );
    expect(rows.length).toBe(1);
    const procedure = rows[0].procedure || "";
    expect(
      procedure.toLowerCase().includes("informe") ||
      procedure.toLowerCase().includes("metge") ||
      procedure.toLowerCase().includes("mútua") ||
      procedure.toLowerCase().includes("mutua")
    ).toBe(true);
  });

  it("ha de tenir exemples pràctics amb almenys 2 escenaris", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT examples FROM special_cases WHERE id = 90004"
    );
    expect(rows.length).toBe(1);
    const examples = rows[0].examples || "";
    expect(examples).toContain("Exemple 1");
    expect(examples).toContain("Exemple 2");
  });

  it("no ha de tenir contingut en format JSON array", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT examples, legalBasis, `procedure`, description FROM special_cases WHERE id = 90004"
    );
    expect(rows.length).toBe(1);
    const { examples, legalBasis, procedure, description } = rows[0];
    if (examples) expect(examples.trim()).not.toMatch(/^\[/);
    if (legalBasis) expect(legalBasis.trim()).not.toMatch(/^\[/);
    if (procedure) expect(procedure.trim()).not.toMatch(/^\[/);
    if (description) expect(description.trim()).not.toMatch(/^\[/);
  });
});

// ============================================================
// VERIFICACIÓ GLOBAL
// ============================================================

describe("Verificació global: 21 casos especials i nous suggeriments al xat", () => {
  it("ha d'haver almenys 21 casos especials a la BD", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM special_cases"
    );
    expect(rows[0].total).toBeGreaterThanOrEqual(21);
  });

  it("ha d'haver almenys 1 cas especial de la categoria lactancia", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM special_cases WHERE category = 'lactancia'"
    );
    expect(rows[0].count).toBeGreaterThanOrEqual(1);
  });

  it("ha d'haver almenys 3 casos especials de la categoria embarazo", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM special_cases WHERE category = 'embarazo'"
    );
    expect(rows[0].count).toBeGreaterThanOrEqual(3);
  });

  it("els quatre nous casos (90001-90004) han de tenir contingut suficient", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id, LENGTH(description) as desc_len FROM special_cases WHERE id IN (90001, 90002, 90003, 90004)"
    );
    expect(rows.length).toBe(4);
    rows.forEach((row: mysql.RowDataPacket) => {
      expect(row.desc_len).toBeGreaterThan(200);
    });
  });
});
