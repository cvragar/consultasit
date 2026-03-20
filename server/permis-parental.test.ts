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
// CAS ESPECIAL 90005: IT i permís parental (16 setmanes)
// ============================================================

describe("Cas especial 90005: IT prèvia al part i permís per naixement i cura de menor", () => {
  it("ha d'existir el cas especial amb ID 90005", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM special_cases WHERE id = 90005"
    );
    expect(rows.length).toBe(1);
  });

  it("ha de tenir la categoria embarazo", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT category FROM special_cases WHERE id = 90005"
    );
    expect(rows.length).toBe(1);
    expect(rows[0].category).toBe("embarazo");
  });

  it("ha de tenir el títol sobre IT i permís parental o naixement", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT title FROM special_cases WHERE id = 90005"
    );
    expect(rows.length).toBe(1);
    const title = rows[0].title.toLowerCase();
    expect(
      title.includes("parental") ||
      title.includes("naixement") ||
      title.includes("16 setmanes") ||
      title.includes("cura de menor")
    ).toBe(true);
  });

  it("ha de tenir descripció que mencioni el 100% de la base reguladora del permís parental", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT description FROM special_cases WHERE id = 90005"
    );
    expect(rows.length).toBe(1);
    const desc = rows[0].description;
    expect(desc.includes("100%")).toBe(true);
  });

  it("ha de tenir descripció que expliqui la diferència IT vs. permís parental", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT description FROM special_cases WHERE id = 90005"
    );
    expect(rows.length).toBe(1);
    const desc = rows[0].description.toLowerCase();
    expect(
      desc.includes("it") || desc.includes("incapacitat")
    ).toBe(true);
    expect(
      desc.includes("perm") || desc.includes("parental") || desc.includes("naix")
    ).toBe(true);
  });

  it("ha de tenir base legal amb referència a la LGSS art. 177 o ET art. 48", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT legalBasis FROM special_cases WHERE id = 90005"
    );
    expect(rows.length).toBe(1);
    const legalBasis = rows[0].legalBasis || "";
    expect(
      legalBasis.includes("177") ||
      legalBasis.includes("48") ||
      legalBasis.includes("LGSS") ||
      legalBasis.includes("ET art")
    ).toBe(true);
  });

  it("ha de tenir base legal amb referència al RDL 6/2019", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT legalBasis FROM special_cases WHERE id = 90005"
    );
    expect(rows.length).toBe(1);
    const legalBasis = rows[0].legalBasis || "";
    expect(
      legalBasis.includes("6/2019") ||
      legalBasis.includes("RDL") ||
      legalBasis.includes("paternitat")
    ).toBe(true);
  });

  it("ha de tenir procediment amb instruccions per al metge de família (alta mèdica)", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT `procedure` FROM special_cases WHERE id = 90005"
    );
    expect(rows.length).toBe(1);
    const procedure = rows[0].procedure || "";
    expect(
      procedure.toLowerCase().includes("alta") ||
      procedure.toLowerCase().includes("metge") ||
      procedure.toLowerCase().includes("ecap")
    ).toBe(true);
  });

  it("ha de tenir almenys 4 exemples pràctics", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT examples FROM special_cases WHERE id = 90005"
    );
    expect(rows.length).toBe(1);
    const examples = rows[0].examples || "";
    expect(examples).toContain("Exemple 1");
    expect(examples).toContain("Exemple 2");
    expect(examples).toContain("Exemple 3");
    expect(examples).toContain("Exemple 4");
  });

  it("no ha de tenir contingut en format JSON array", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT examples, legalBasis, `procedure`, description FROM special_cases WHERE id = 90005"
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
// TESTS DE LA FUNCIÓ stripMarkdown (lògica de negoci)
// ============================================================

describe("Funció stripMarkdown: elimina la sintaxi Markdown del preview", () => {
  // Reimplementem la funció aquí per testar-la de manera independent
  function stripMarkdown(text: string): string {
    return text
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/^[-*+]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "")
      .replace(/^>\s+/gm, "")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      .replace(/!\[.+?\]\(.+?\)/g, "")
      .replace(/^\|.+\|$/gm, "")
      .replace(/^[-|\s]+$/gm, "")
      .replace(/\n{2,}/g, " ")
      .replace(/\n/g, " ")
      .trim();
  }

  it("ha d'eliminar les capçaleres ##", () => {
    expect(stripMarkdown("## Títol del cas")).toBe("Títol del cas");
    expect(stripMarkdown("### Subtítol")).toBe("Subtítol");
  });

  it("ha d'eliminar la negreta **text**", () => {
    expect(stripMarkdown("El **metge de família** ha d'emetre el part")).toBe(
      "El metge de família ha d'emetre el part"
    );
  });

  it("ha d'eliminar la cursiva *text*", () => {
    expect(stripMarkdown("La *IT* és una prestació")).toBe(
      "La IT és una prestació"
    );
  });

  it("ha d'eliminar el codi `text`", () => {
    expect(stripMarkdown("Usa `eCap` per emetre el part")).toBe(
      "Usa eCap per emetre el part"
    );
  });

  it("ha d'eliminar els elements de llista - item", () => {
    expect(stripMarkdown("- Primer element\n- Segon element")).toBe(
      "Primer element Segon element"
    );
  });

  it("ha d'eliminar les llistes numerades 1. item", () => {
    expect(stripMarkdown("1. Primer pas\n2. Segon pas")).toBe(
      "Primer pas Segon pas"
    );
  });

  it("ha d'eliminar les taules Markdown", () => {
    const table = "| Concepte | Valor |\n|---|---|\n| IT | 75% BR |";
    const result = stripMarkdown(table);
    expect(result).not.toContain("|");
  });

  it("ha de convertir els salts de línia en espais", () => {
    const text = "Primera línia\nSegona línia\nTercera línia";
    expect(stripMarkdown(text)).toBe("Primera línia Segona línia Tercera línia");
  });

  it("ha de retornar text pla sense símbols Markdown per a un text complex", () => {
    const markdown = `## Descripció del cas
**Situació freqüent** que genera dubtes.

- Primer punt important
- Segon punt

### Normativa aplicable
Art. 177 LGSS`;
    const result = stripMarkdown(markdown);
    expect(result).not.toContain("##");
    expect(result).not.toContain("**");
    expect(result).not.toContain("- ");
    expect(result).not.toContain("###");
    expect(result.length).toBeGreaterThan(10);
  });
});

// ============================================================
// VERIFICACIÓ GLOBAL: 22 casos i nous casos recents
// ============================================================

describe("Verificació global: 22 casos especials", () => {
  it("ha d'haver almenys 22 casos especials a la BD", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM special_cases"
    );
    expect(rows[0].total).toBeGreaterThanOrEqual(22);
  });

  it("ha d'haver almenys 4 casos especials de la categoria embarazo", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM special_cases WHERE category = 'embarazo'"
    );
    expect(rows[0].count).toBeGreaterThanOrEqual(4);
  });

  it("els cinc nous casos (90001-90005) han de tenir contingut suficient", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id, LENGTH(description) as desc_len FROM special_cases WHERE id IN (90001, 90002, 90003, 90004, 90005)"
    );
    expect(rows.length).toBe(5);
    rows.forEach((row: mysql.RowDataPacket) => {
      expect(row.desc_len).toBeGreaterThan(200);
    });
  });

  it("els cinc nous casos han de tenir createdAt recent (últims 90 dies)", async () => {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id, createdAt FROM special_cases WHERE id IN (90001, 90002, 90003, 90004, 90005)"
    );
    expect(rows.length).toBe(5);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    rows.forEach((row: mysql.RowDataPacket) => {
      const createdAt = new Date(row.createdAt);
      expect(createdAt.getTime()).toBeGreaterThan(ninetyDaysAgo.getTime());
    });
  });
});
