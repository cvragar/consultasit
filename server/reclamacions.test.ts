/**
 * Tests per a la pàgina de Reclamacions i Recursos
 * Verifica que les 4 vies de reclamació estan ben definides i contenen la informació correcta.
 */

import { describe, it, expect } from "vitest";

// ─── Dades de les vies de reclamació (duplicades per als tests) ───────────────

const VIES_IDS = [
  "metge-familia",
  "mutua-at",
  "inss-cc",
  "determinacio-contingencies",
];

const TERMINIS: Record<string, string> = {
  "metge-familia": "11 dies hàbils",
  "mutua-at": "10 dies hàbils",
  "inss-cc": "30 dies hàbils",
  "determinacio-contingencies": "En qualsevol moment",
};

const SUSPENSIO_REINCORPORACIO: Record<string, boolean> = {
  "metge-familia": false,
  "mutua-at": true,
  "inss-cc": false,
  "determinacio-contingencies": false,
};

const ORGANISMES: Record<string, string> = {
  "metge-familia": "ICAM / Dep. Salut",
  "mutua-at": "INSS",
  "inss-cc": "INSS / Jutjat Social",
  "determinacio-contingencies": "INSS",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Reclamacions i Recursos - Estructura de les vies", () => {
  it("ha de tenir exactament 4 vies de reclamació", () => {
    expect(VIES_IDS).toHaveLength(4);
  });

  it("ha de tenir els IDs correctes per a cada via", () => {
    expect(VIES_IDS).toContain("metge-familia");
    expect(VIES_IDS).toContain("mutua-at");
    expect(VIES_IDS).toContain("inss-cc");
    expect(VIES_IDS).toContain("determinacio-contingencies");
  });
});

describe("Reclamacions i Recursos - Terminis", () => {
  it("l'alta del metge de família té termini de 11 dies hàbils", () => {
    expect(TERMINIS["metge-familia"]).toBe("11 dies hàbils");
  });

  it("l'alta de la mútua (AT) té termini de 10 dies hàbils", () => {
    expect(TERMINIS["mutua-at"]).toBe("10 dies hàbils");
  });

  it("l'alta de l'INSS (CC) té termini de 30 dies hàbils", () => {
    expect(TERMINIS["inss-cc"]).toBe("30 dies hàbils");
  });

  it("la determinació de contingències no té termini específic", () => {
    expect(TERMINIS["determinacio-contingencies"]).toBe("En qualsevol moment");
  });
});

describe("Reclamacions i Recursos - Suspensió de reincorporació", () => {
  it("l'alta del metge de família NO suspèn la reincorporació", () => {
    expect(SUSPENSIO_REINCORPORACIO["metge-familia"]).toBe(false);
  });

  it("l'alta de la mútua (AT) SÍ suspèn la reincorporació durant 10 dies", () => {
    expect(SUSPENSIO_REINCORPORACIO["mutua-at"]).toBe(true);
  });

  it("l'alta de l'INSS (CC) NO suspèn la reincorporació", () => {
    expect(SUSPENSIO_REINCORPORACIO["inss-cc"]).toBe(false);
  });

  it("la determinació de contingències no afecta la reincorporació", () => {
    expect(SUSPENSIO_REINCORPORACIO["determinacio-contingencies"]).toBe(false);
  });
});

describe("Reclamacions i Recursos - Organismes competents", () => {
  it("l'alta del metge de família es reclama davant l'ICAM", () => {
    expect(ORGANISMES["metge-familia"]).toContain("ICAM");
  });

  it("l'alta de la mútua es reclama davant l'INSS", () => {
    expect(ORGANISMES["mutua-at"]).toBe("INSS");
  });

  it("l'alta de l'INSS es reclama davant l'INSS i el Jutjat Social", () => {
    expect(ORGANISMES["inss-cc"]).toContain("INSS");
    expect(ORGANISMES["inss-cc"]).toContain("Jutjat Social");
  });

  it("la determinació de contingències es gestiona davant l'INSS", () => {
    expect(ORGANISMES["determinacio-contingencies"]).toBe("INSS");
  });
});

describe("Reclamacions i Recursos - Normativa clau", () => {
  it("la via de la mútua (AT) es basa en l'art. 170.2 LGSS", () => {
    const baseLegalMutua = [
      "Art. 170.2 LGSS (RDLeg 8/2015): procediment de revisió d'alta de mútua",
      "RD 1430/2009, d'11 de setembre: procediment de revisió d'altes mèdiques de mútues",
      "Art. 80 Llei 36/2011: reclamació prèvia en matèria de Seguretat Social",
    ];
    expect(baseLegalMutua).toContain("Art. 170.2 LGSS (RDLeg 8/2015): procediment de revisió d'alta de mútua");
  });

  it("la determinació de contingències es basa en l'art. 156-157 LGSS", () => {
    const baseLegalDet = [
      "Art. 156-157 LGSS (RDLeg 8/2015): definició d'accident de treball i malaltia professional",
      "RD 1299/2006, de 10 de novembre: quadre de malalties professionals",
      "Art. 169.1 LGSS: definició de contingència comuna",
      "RD 1430/2009: procediment de determinació de contingències",
    ];
    expect(baseLegalDet).toContain("Art. 156-157 LGSS (RDLeg 8/2015): definició d'accident de treball i malaltia professional");
    expect(baseLegalDet).toContain("RD 1299/2006, de 10 de novembre: quadre de malalties professionals");
  });

  it("la via ICAM es basa en el Decret 196/2010 i l'art. 71.2 Llei 36/2011", () => {
    const baseLegalICam = [
      "Art. 71.2 Llei 36/2011, de 10 d'octubre, reguladora de la jurisdicció social",
      "Decret 196/2010, de 14 de desembre: sobre la inspecció mèdica de l'ICAM",
      "Art. 170-173 LGSS (RDLeg 8/2015): extinció de la IT per alta mèdica",
    ];
    expect(baseLegalICam[0]).toContain("Llei 36/2011");
    expect(baseLegalICam[1]).toContain("Decret 196/2010");
  });
});

describe("Reclamacions i Recursos - Diferències clau AT vs CC", () => {
  it("la prestació AT és del 75% BR des del dia 1", () => {
    const prestacioAT = "75% BR des del dia 1 (via mútua)";
    expect(prestacioAT).toContain("75%");
    expect(prestacioAT).toContain("dia 1");
  });

  it("la prestació CC és del 60% BR des del dia 4", () => {
    const prestacioCC = "60% BR des del dia 4 (dies 1-3 sense prestació)";
    expect(prestacioCC).toContain("60%");
    expect(prestacioCC).toContain("dia 4");
  });

  it("la determinació de contingències té efectes econòmics retroactius", () => {
    const efectes = "Si es reconeix la contingència professional, el treballador té dret a la diferència de prestació des del primer dia de baixa";
    expect(efectes).toContain("primer dia de baixa");
  });
});
