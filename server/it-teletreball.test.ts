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

describe("Cas especial IT en teletreball (ID 90006)", () => {
  it("existeix a la BD amb el títol correcte", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT id, title, category FROM special_cases WHERE id = 90006"
    );
    expect(rows.length).toBe(1);
    expect(rows[0].title).toContain("teletreball");
    expect(rows[0].category).toBe("accident_treball");
  });

  it("té descripció substancial (>1000 caràcters)", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT LENGTH(description) as len FROM special_cases WHERE id = 90006"
    );
    expect(rows[0].len).toBeGreaterThan(1000);
  });

  it("la descripció conté la taula comparativa AT vs CC", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT description FROM special_cases WHERE id = 90006"
    );
    const desc = rows[0].description as string;
    expect(desc).toContain("Accident de Treball");
    expect(desc).toContain("Contingència Comuna");
    expect(desc).toContain("156.3");
  });

  it("la base legal conté la Llei 10/2021 i la jurisprudència clau", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT legalBasis FROM special_cases WHERE id = 90006"
    );
    const legal = rows[0].legalBasis as string;
    expect(legal).toContain("Llei 10/2021");
    expect(legal).toContain("STSJ Madrid");
    expect(legal).toContain("156.3");
  });

  it("el procediment explica quan emetre part d'AT i quan de CC", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT `procedure` FROM special_cases WHERE id = 90006"
    );
    const proc = rows[0].procedure as string;
    expect(proc).toContain("mútua");
    expect(proc).toContain("CAP");
    expect(proc).toContain("AT");
    expect(proc).toContain("CC");
  });

  it("els exemples inclouen 5 casos pràctics", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT examples FROM special_cases WHERE id = 90006"
    );
    const ex = rows[0].examples as string;
    expect(ex).toContain("Exemple 1");
    expect(ex).toContain("Exemple 2");
    expect(ex).toContain("Exemple 3");
    expect(ex).toContain("Exemple 4");
    expect(ex).toContain("Exemple 5");
  });

  it("els exemples inclouen casos d'AT i de CC", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT examples FROM special_cases WHERE id = 90006"
    );
    const ex = rows[0].examples as string;
    // AT
    expect(ex).toContain("AT");
    // CC
    expect(ex).toContain("CC");
  });

  it("el suggeriment ràpid sobre teletreball existeix al Chat.tsx", async () => {
    const fs = await import("fs/promises");
    const chatContent = await fs.readFile(
      "/home/ubuntu/consultasit/client/src/pages/Chat.tsx",
      "utf-8"
    );
    expect(chatContent).toContain("teletreball");
    expect(chatContent).toContain("accident de treball");
  });

  it("el total de casos especials és 26", async () => {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM special_cases"
    );
    expect(rows[0].total).toBe(26);
  });
});
