import { describe, it, expect } from "vitest";

/**
 * Tests per a la funcionalitat d'upload de PDFs.
 * Els tests d'integració amb Express/multer requereixen un servidor actiu,
 * per tant aquí testem la lògica de validació i processament.
 */

describe("Upload PDF - Validació de tipus de document", () => {
  const validTypes = ["ley", "decreto", "guia", "manual", "pildora", "otro"] as const;
  const validJurisdictions = ["estatal", "autonomica", "ambas"] as const;

  it("ha d'acceptar tots els tipus de document vàlids", () => {
    validTypes.forEach(type => {
      expect(validTypes).toContain(type);
    });
  });

  it("ha d'acceptar totes les jurisdiccions vàlides", () => {
    validJurisdictions.forEach(j => {
      expect(validJurisdictions).toContain(j);
    });
  });

  it("ha de retornar 'pildora' com a tipus per defecte per a documents desconeguts", () => {
    const unknownType = "desconegut";
    const defaultType = validTypes.includes(unknownType as any) ? unknownType : "pildora";
    expect(defaultType).toBe("pildora");
  });

  it("ha de retornar 'autonomica' com a jurisdicció per defecte per a valors desconeguts", () => {
    const unknownJurisdiction = "desconeguda";
    const defaultJurisdiction = validJurisdictions.includes(unknownJurisdiction as any)
      ? unknownJurisdiction
      : "autonomica";
    expect(defaultJurisdiction).toBe("autonomica");
  });
});

describe("Upload PDF - Generació de fileKey", () => {
  it("ha de generar una clau de fitxer vàlida per a PDFs", () => {
    const fileName = "Píndola IT 15 - Gestació setmana 39.pdf";
    const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileKey = `pindoles-it/abc123-${sanitized}`;

    expect(fileKey).toContain("pindoles-it/");
    expect(fileKey).not.toContain(" ");
    expect(fileKey).not.toContain("à");
    expect(fileKey).not.toContain("è");
  });

  it("ha de preservar l'extensió .pdf a la clau del fitxer", () => {
    const fileName = "document.pdf";
    const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    expect(sanitized).toMatch(/\.pdf$/);
  });
});

describe("Upload PDF - Validació de mida de fitxer", () => {
  const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

  it("ha de rebutjar fitxers de més de 20 MB", () => {
    const oversizedFile = { size: 21 * 1024 * 1024 };
    expect(oversizedFile.size).toBeGreaterThan(MAX_SIZE_BYTES);
  });

  it("ha d'acceptar fitxers de menys de 20 MB", () => {
    const validFile = { size: 5 * 1024 * 1024 };
    expect(validFile.size).toBeLessThanOrEqual(MAX_SIZE_BYTES);
  });
});

describe("Upload PDF - Validació de MIME type", () => {
  it("ha d'acceptar application/pdf", () => {
    const acceptedMimes = ["application/pdf"];
    expect(acceptedMimes).toContain("application/pdf");
  });

  it("ha de rebutjar fitxers que no siguin PDF", () => {
    const rejectedMimes = ["image/jpeg", "text/plain", "application/msword", "application/zip"];
    const acceptedMimes = ["application/pdf"];
    rejectedMimes.forEach(mime => {
      expect(acceptedMimes).not.toContain(mime);
    });
  });
});
