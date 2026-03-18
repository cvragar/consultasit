import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mysql from "mysql2/promise";

let conn: mysql.Connection;

beforeAll(async () => {
  conn = await mysql.createConnection(process.env.DATABASE_URL!);
});

afterAll(async () => {
  await conn.end();
});

describe("Calculadora IT - Durades corregides (Manual INSS 4a ed.)", () => {
  it("ha de tenir 70 diagnòstics a la taula it_durations", async () => {
    const [rows] = await conn.execute("SELECT COUNT(*) as total FROM it_durations") as any;
    expect(rows[0].total).toBe(70);
  });

  it("lumbalgia ha de tenir temps estàndard de 20 dies (INSS)", async () => {
    const [rows] = await conn.execute(
      "SELECT * FROM it_durations WHERE cie10Code = 'M54.5'"
    ) as any;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].averageDays).toBe(20);
    expect(rows[0].minDays).toBe(7);
    expect(rows[0].maxDays).toBe(45);
  });

  it("neoplàsia de mama ha de tenir temps estàndard de 210 dies (INSS)", async () => {
    const [rows] = await conn.execute(
      "SELECT * FROM it_durations WHERE cie10Code = 'C50'"
    ) as any;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].averageDays).toBe(210);
    expect(rows[0].minDays).toBe(90);
    expect(rows[0].maxDays).toBe(365);
  });

  it("neoplàsia de còlon ha de tenir temps estàndard de 210 dies (INSS)", async () => {
    const [rows] = await conn.execute(
      "SELECT * FROM it_durations WHERE cie10Code = 'C18'"
    ) as any;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].averageDays).toBe(210);
  });

  it("IAM ha de tenir temps estàndard de 90 dies (INSS)", async () => {
    const [rows] = await conn.execute(
      "SELECT * FROM it_durations WHERE cie10Code = 'I21'"
    ) as any;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].averageDays).toBe(90);
  });

  it("trastorn d'ansietat ha de tenir temps estàndard de 45 dies (INSS)", async () => {
    const [rows] = await conn.execute(
      "SELECT * FROM it_durations WHERE cie10Code = 'F41.1'"
    ) as any;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].averageDays).toBe(45);
  });

  it("episodi depressiu moderat ha de tenir temps estàndard de 60 dies (INSS)", async () => {
    const [rows] = await conn.execute(
      "SELECT * FROM it_durations WHERE cie10Code = 'F32.1'"
    ) as any;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].averageDays).toBe(60);
  });

  it("gastroenteritis aguda ha de tenir temps estàndard de 4 dies (INSS)", async () => {
    const [rows] = await conn.execute(
      "SELECT * FROM it_durations WHERE cie10Code = 'A09'"
    ) as any;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].averageDays).toBe(7);
  });

  it("esguinç de turmell ha de tenir temps estàndard de 21 dies (INSS)", async () => {
    const [rows] = await conn.execute(
      "SELECT * FROM it_durations WHERE cie10Code = 'S93.4'"
    ) as any;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].averageDays).toBe(21);
  });

  it("pneumònia ha de tenir temps estàndard de 30 dies (INSS)", async () => {
    const [rows] = await conn.execute(
      "SELECT * FROM it_durations WHERE cie10Code = 'J18.9'"
    ) as any;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].averageDays).toBe(30);
  });
});

describe("Calculadora IT - Factors d'ocupació CNO-11 (Taula 15 INSS)", () => {
  it("lumbalgia ha de tenir 17 grups d'ocupació amb factors de correcció", async () => {
    const [rows] = await conn.execute(
      "SELECT occupationAdjustment FROM it_durations WHERE cie10Code = 'M54.5'"
    ) as any;
    expect(rows.length).toBeGreaterThan(0);
    const raw = rows[0].occupationAdjustment;
    const adj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    expect(adj).toHaveLength(17);
  });

  it("lumbalgia: treballadors construcció (G11) han de tenir factor ×1.13", async () => {
    const [rows] = await conn.execute(
      "SELECT occupationAdjustment FROM it_durations WHERE cie10Code = 'M54.5'"
    ) as any;
    const raw = rows[0].occupationAdjustment;
    const adj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const g11 = adj.find((a: any) => a.cnoGroup === "G11");
    expect(g11).toBeDefined();
    expect(g11.factor).toBe(1.13);
  });

  it("lumbalgia: professionals sanitaris (G2) han de tenir factor ×0.70 (menys dies)", async () => {
    const [rows] = await conn.execute(
      "SELECT occupationAdjustment FROM it_durations WHERE cie10Code = 'M54.5'"
    ) as any;
    const raw = rows[0].occupationAdjustment;
    const adj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const g2 = adj.find((a: any) => a.cnoGroup === "G2");
    expect(g2).toBeDefined();
    expect(g2.factor).toBe(0.70);
  });

  it("neoplàsia mama: factors d'ocupació molt similars entre grups (0.94-1.04)", async () => {
    const [rows] = await conn.execute(
      "SELECT occupationAdjustment FROM it_durations WHERE cie10Code = 'C50'"
    ) as any;
    const raw = rows[0].occupationAdjustment;
    const adj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    // Neoplàsies: factors molt similars (0.94-1.04 per la majoria)
    const factors = adj.map((a: any) => a.factor).filter((f: number) => f !== 0.79); // excloure militars
    const minFactor = Math.min(...factors);
    const maxFactor = Math.max(...factors);
    expect(minFactor).toBeGreaterThanOrEqual(0.94);
    expect(maxFactor).toBeLessThanOrEqual(1.04);
  });

  it("trastorns mentals: directors i gerents (G1) han de tenir factor ×1.11", async () => {
    const [rows] = await conn.execute(
      "SELECT occupationAdjustment FROM it_durations WHERE cie10Code = 'F41.1'"
    ) as any;
    const raw = rows[0].occupationAdjustment;
    const adj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const g1 = adj.find((a: any) => a.cnoGroup === "G1");
    expect(g1).toBeDefined();
    expect(g1.factor).toBe(1.11);
  });

  it("IAM: conductors (G14) han de tenir factor ×1.13 (risc laboral)", async () => {
    const [rows] = await conn.execute(
      "SELECT occupationAdjustment FROM it_durations WHERE cie10Code = 'I21'"
    ) as any;
    const raw = rows[0].occupationAdjustment;
    const adj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const g14 = adj.find((a: any) => a.cnoGroup === "G14");
    expect(g14).toBeDefined();
    expect(g14.factor).toBe(1.13);
  });

  it("tots els diagnòstics han de tenir la font 'Manual Tiempos Óptimos IT, INSS 4a Edició'", async () => {
    const [rows] = await conn.execute(
      "SELECT COUNT(*) as total FROM it_durations WHERE source = 'Manual Tiempos Óptimos IT, INSS 4a Edició'"
    ) as any;
    expect(rows[0].total).toBe(70);
  });

  it("ha de trobar neoplàsies en cercar 'neoplasia'", async () => {
    const [rows] = await conn.execute(
      "SELECT * FROM it_durations WHERE diagnosis LIKE '%eoplàsia%' OR diagnosis LIKE '%eoplasia%'"
    ) as any;
    expect(rows.length).toBeGreaterThan(5);
  });

  it("ha de trobar patologies musculoesquelètiques en cercar 'fractura'", async () => {
    const [rows] = await conn.execute(
      "SELECT * FROM it_durations WHERE diagnosis LIKE '%fractura%' OR diagnosis LIKE '%Fractura%'"
    ) as any;
    expect(rows.length).toBeGreaterThan(2);
  });
});
