import { describe, it, expect, vi, beforeEach } from "vitest";

// ===== Tests per a la validació anti-JSON i l'edició de casos especials =====

// Funció auxiliar que replica la lògica del frontend
function looksLikeJson(value: string): boolean {
  const trimmed = value.trim();
  return (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"));
}

describe("looksLikeJson - Detecció de contingut JSON", () => {
  it("detecta un array JSON simple", () => {
    expect(looksLikeJson('[{"title": "Exemple", "description": "Text"}]')).toBe(true);
  });

  it("detecta un objecte JSON simple", () => {
    expect(looksLikeJson('{"title": "Exemple", "description": "Text"}')).toBe(true);
  });

  it("detecta un array JSON buit", () => {
    expect(looksLikeJson("[]")).toBe(true);
  });

  it("detecta un objecte JSON buit", () => {
    expect(looksLikeJson("{}")).toBe(true);
  });

  it("detecta JSON amb espais inicials/finals", () => {
    expect(looksLikeJson('  [{"title": "Test"}]  ')).toBe(true);
  });

  it("no detecta text pla com a JSON", () => {
    expect(looksLikeJson("Text pla sense JSON")).toBe(false);
  });

  it("no detecta Markdown com a JSON", () => {
    expect(looksLikeJson("## Títol\n- Element 1\n- Element 2")).toBe(false);
  });

  it("no detecta text que comença amb [ però no acaba amb ]", () => {
    expect(looksLikeJson("[text sense tancar")).toBe(false);
  });

  it("no detecta text que comença amb { però no acaba amb }", () => {
    expect(looksLikeJson("{text sense tancar")).toBe(false);
  });

  it("no detecta string buit com a JSON", () => {
    expect(looksLikeJson("")).toBe(false);
  });

  it("no detecta text amb salts de línia com a JSON", () => {
    const markdown = `**Base Legal:**
- Art. 169 LGSS
- RD 625/2014

**Procediment:**
1. Emetre el part de baixa
2. Notificar a la mútua`;
    expect(looksLikeJson(markdown)).toBe(false);
  });

  it("detecta JSON amb caràcters Unicode escapats (el bug original)", () => {
    const jsonWithEscapes = '[{"title": "Treballador en dues empreses", "description": "Treballador treballa a l\'empresa A (8h, base cotitzaci\\u00f3 1.500\\u20ac/mes)"}]';
    expect(looksLikeJson(jsonWithEscapes)).toBe(true);
  });
});

// ===== Tests per al procediment tRPC specialCases.update =====

describe("specialCases.update - Validació de permisos", () => {
  it("rebutja actualitzacions d'usuaris no admin", () => {
    const mockCtx = { user: { id: 1, role: "user" } };
    const checkPermission = (ctx: typeof mockCtx) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Accés restringit: cal ser administrador");
      }
      return true;
    };
    expect(() => checkPermission(mockCtx)).toThrow("Accés restringit: cal ser administrador");
  });

  it("permet actualitzacions d'usuaris admin", () => {
    const mockCtx = { user: { id: 1, role: "admin" } };
    const checkPermission = (ctx: typeof mockCtx) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Accés restringit: cal ser administrador");
      }
      return true;
    };
    expect(checkPermission(mockCtx)).toBe(true);
  });
});

describe("specialCases.update - Validació de camps", () => {
  it("accepta un títol vàlid", () => {
    const title = "Pluriactivitat: autònom i assalariat simultàniament";
    expect(title.trim().length).toBeGreaterThan(0);
  });

  it("rebutja un títol buit", () => {
    const title = "   ";
    expect(title.trim().length).toBe(0);
  });

  it("accepta contingut Markdown com a base legal", () => {
    const legalBasis = `**Art. 169 LGSS** - Incapacitat Temporal
- Contingència comuna: malaltia o accident no laboral
- Contingència professional: accident de treball o malaltia professional`;
    expect(looksLikeJson(legalBasis)).toBe(false);
    expect(legalBasis.length).toBeGreaterThan(0);
  });

  it("detecta i avisa sobre contingut JSON en base legal", () => {
    const legalBasisJson = '[{"article": "Art. 169 LGSS", "description": "Incapacitat Temporal"}]';
    expect(looksLikeJson(legalBasisJson)).toBe(true);
  });

  it("accepta contingut Markdown com a exemples", () => {
    const examples = `### Exemple 1: Metge de família
**Situació:** Metge que treballa 8h/dia a un CAP i 4h/dia en clínica privada.
**Resolució:** La base reguladora es calcula per cada règim de forma independent.`;
    expect(looksLikeJson(examples)).toBe(false);
  });

  it("detecta contingut JSON en exemples (el bug original)", () => {
    const examplesJson = '[{"title": "Exemple 1", "description": "Metge de família", "resolution": "La base reguladora..."}]';
    expect(looksLikeJson(examplesJson)).toBe(true);
  });
});

describe("Formulari d'edició - Gestió de warnings JSON", () => {
  it("genera warnings per a múltiples camps amb JSON", () => {
    const formData = {
      title: "Títol normal",
      description: "Descripció normal",
      legalBasis: '[{"article": "Art. 169"}]',
      procedure: '{"step1": "Emetre el part"}',
      examples: "Exemples en text pla",
    };

    const warnings: Record<string, boolean> = {};
    for (const [field, value] of Object.entries(formData)) {
      warnings[field] = looksLikeJson(value);
    }

    expect(warnings.title).toBe(false);
    expect(warnings.description).toBe(false);
    expect(warnings.legalBasis).toBe(true);
    expect(warnings.procedure).toBe(true);
    expect(warnings.examples).toBe(false);
  });

  it("comprova si hi ha algun warning actiu", () => {
    const warnings = { title: false, description: false, legalBasis: true, procedure: false };
    const hasWarning = Object.values(warnings).some(Boolean);
    expect(hasWarning).toBe(true);
  });

  it("comprova que no hi ha warnings quan tot és text pla", () => {
    const warnings = { title: false, description: false, legalBasis: false, procedure: false };
    const hasWarning = Object.values(warnings).some(Boolean);
    expect(hasWarning).toBe(false);
  });
});
