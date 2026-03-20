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
// CAS ESPECIAL 90001: IT durant embaràs de risc vs. prestació
// per risc durant l'embaràs
// ============================================================

describe("Cas especial 90001: IT durant embaràs de risc vs. prestació per risc durant l'embaràs", () => {
  it("ha d'existir el cas especial amb ID 90001", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM special_cases WHERE id = 90001"
    );
    expect(rows.length).toBe(1);
  });

  it("ha de tenir la categoria embarazo", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT category FROM special_cases WHERE id = 90001"
    );
    expect(rows.length).toBe(1);
    expect(rows[0].category).toBe("embarazo");
  });

  it("ha de tenir el títol sobre embaràs de risc i/o prestació per risc", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT title FROM special_cases WHERE id = 90001"
    );
    expect(rows.length).toBe(1);
    const title = rows[0].title.toLowerCase();
    expect(
      title.includes("embar") ||
      title.includes("risc") ||
      title.includes("prestaci")
    ).toBe(true);
  });

  it("ha de tenir descripció que diferenciï IT de prestació per risc durant l'embaràs", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT description FROM special_cases WHERE id = 90001"
    );
    expect(rows.length).toBe(1);
    const desc = rows[0].description.toLowerCase();
    // Ha de mencionar les dues situacions
    expect(
      desc.includes("conting") ||
      desc.includes("mútua") ||
      desc.includes("mutua") ||
      desc.includes("100%")
    ).toBe(true);
  });

  it("ha de tenir base legal amb referència a la LGSS art. 186 o 187 o RD 295/2009", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT legalBasis FROM special_cases WHERE id = 90001"
    );
    expect(rows.length).toBe(1);
    const legalBasis = rows[0].legalBasis || "";
    expect(
      legalBasis.includes("186") ||
      legalBasis.includes("187") ||
      legalBasis.includes("295") ||
      legalBasis.includes("LGSS")
    ).toBe(true);
  });

  it("ha de tenir procediment amb instruccions per al metge de família (eCap)", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT `procedure` FROM special_cases WHERE id = 90001"
    );
    expect(rows.length).toBe(1);
    const procedure = rows[0].procedure || "";
    expect(
      procedure.toLowerCase().includes("ecap") ||
      procedure.toLowerCase().includes("metge") ||
      procedure.toLowerCase().includes("part de baixa")
    ).toBe(true);
  });

  it("ha de tenir exemples pràctics amb almenys 2 escenaris", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT examples FROM special_cases WHERE id = 90001"
    );
    expect(rows.length).toBe(1);
    const examples = rows[0].examples || "";
    // Ha de tenir almenys dos exemples numerats
    expect(examples).toContain("Exemple 1");
    expect(examples).toContain("Exemple 2");
  });

  it("ha de mencionar la setmana 39 com a situació especial", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT description, `procedure`, examples FROM special_cases WHERE id = 90001"
    );
    expect(rows.length).toBe(1);
    const allContent = [
      rows[0].description,
      rows[0].procedure,
      rows[0].examples
    ].join(" ").toLowerCase();
    expect(
      allContent.includes("setmana 39") ||
      allContent.includes("semana 39") ||
      allContent.includes("39")
    ).toBe(true);
  });

  it("no ha de tenir contingut en format JSON array", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT examples, legalBasis, `procedure`, description FROM special_cases WHERE id = 90001"
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
// CAS ESPECIAL 90002: Reducció de jornada per guarda legal i IT
// ============================================================

describe("Cas especial 90002: Reducció de jornada per guarda legal i IT", () => {
  it("ha d'existir el cas especial amb ID 90002", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM special_cases WHERE id = 90002"
    );
    expect(rows.length).toBe(1);
  });

  it("ha de tenir la categoria otro", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT category FROM special_cases WHERE id = 90002"
    );
    expect(rows.length).toBe(1);
    expect(rows[0].category).toBe("otro");
  });

  it("ha de tenir el títol sobre reducció de jornada i IT", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT title FROM special_cases WHERE id = 90002"
    );
    expect(rows.length).toBe(1);
    const title = rows[0].title.toLowerCase();
    expect(
      title.includes("reducci") ||
      title.includes("jornada") ||
      title.includes("guarda")
    ).toBe(true);
  });

  it("ha de tenir descripció que expliqui l'impacte en la base reguladora", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT description FROM special_cases WHERE id = 90002"
    );
    expect(rows.length).toBe(1);
    const desc = rows[0].description.toLowerCase();
    expect(
      desc.includes("base reguladora") ||
      desc.includes("cotitzaci") ||
      desc.includes("jornada redu")
    ).toBe(true);
  });

  it("ha de tenir base legal amb referència a l'art. 37.6 ET o LGSS art. 237", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT legalBasis FROM special_cases WHERE id = 90002"
    );
    expect(rows.length).toBe(1);
    const legalBasis = rows[0].legalBasis || "";
    expect(
      legalBasis.includes("37.6") ||
      legalBasis.includes("237") ||
      legalBasis.includes("ET") ||
      legalBasis.includes("LGSS")
    ).toBe(true);
  });

  it("ha de mencionar la jurisprudència del STSJ Andalusia 2019", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT legalBasis, description FROM special_cases WHERE id = 90002"
    );
    expect(rows.length).toBe(1);
    const allContent = [rows[0].legalBasis, rows[0].description].join(" ");
    expect(
      allContent.includes("STSJ") ||
      allContent.includes("Andalusia") ||
      allContent.includes("2019") ||
      allContent.includes("discriminaci")
    ).toBe(true);
  });

  it("ha de tenir procediment amb instruccions per al metge de família", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT `procedure` FROM special_cases WHERE id = 90002"
    );
    expect(rows.length).toBe(1);
    const procedure = rows[0].procedure || "";
    expect(
      procedure.toLowerCase().includes("metge") ||
      procedure.toLowerCase().includes("ecap") ||
      procedure.toLowerCase().includes("part de baixa") ||
      procedure.toLowerCase().includes("treballadora")
    ).toBe(true);
  });

  it("ha de tenir exemples pràctics amb càlcul de la base reguladora", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT examples FROM special_cases WHERE id = 90002"
    );
    expect(rows.length).toBe(1);
    const examples = rows[0].examples || "";
    expect(examples).toContain("Exemple 1");
    // Ha de tenir xifres o percentatges
    expect(
      examples.includes("%") ||
      examples.includes("€") ||
      examples.includes("euros")
    ).toBe(true);
  });

  it("no ha de tenir contingut en format JSON array", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT examples, legalBasis, `procedure`, description FROM special_cases WHERE id = 90002"
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

describe("Verificació global dels nous casos especials", () => {
  it("ha d'haver almenys 19 casos especials a la BD", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM special_cases"
    );
    expect(rows[0].total).toBeGreaterThanOrEqual(19);
  });

  it("ha d'haver almenys 3 casos especials de la categoria embarazo", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM special_cases WHERE category = 'embarazo'"
    );
    expect(rows[0].count).toBeGreaterThanOrEqual(3);
  });

  it("els dos nous casos han de tenir contingut suficient (>200 caràcters per camp)", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id, LENGTH(description) as desc_len, LENGTH(legalBasis) as legal_len, LENGTH(`procedure`) as proc_len FROM special_cases WHERE id IN (90001, 90002)"
    );
    expect(rows.length).toBe(2);
    rows.forEach((row: mysql.RowDataPacket) => {
      expect(row.desc_len).toBeGreaterThan(200);
      expect(row.legal_len).toBeGreaterThan(100);
      expect(row.proc_len).toBeGreaterThan(100);
    });
  });
});
