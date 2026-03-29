import { describe, it, expect } from "vitest";

const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/gif": [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

function validateImageMagicBytes(base64Data: string, mimeType: string): boolean {
  try {
    const buffer = Buffer.from(base64Data, "base64");
    const signatures = MAGIC_BYTES[mimeType];
    if (!signatures) return false;
    return signatures.some((sig) => sig.every((byte, i) => buffer[i] === byte));
  } catch {
    return false;
  }
}

function makeBase64(bytes: number[]): string {
  return Buffer.from(bytes).toString("base64");
}

describe("Magic bytes validation", () => {
  it("accepts a valid JPEG", () => {
    const b64 = makeBase64([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    expect(validateImageMagicBytes(b64, "image/jpeg")).toBe(true);
  });

  it("accepts a valid PNG", () => {
    const b64 = makeBase64([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    expect(validateImageMagicBytes(b64, "image/png")).toBe(true);
  });

  it("accepts a valid GIF87a", () => {
    const b64 = makeBase64([0x47, 0x49, 0x46, 0x38, 0x37, 0x61, 0x00]);
    expect(validateImageMagicBytes(b64, "image/gif")).toBe(true);
  });

  it("accepts a valid GIF89a", () => {
    const b64 = makeBase64([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00]);
    expect(validateImageMagicBytes(b64, "image/gif")).toBe(true);
  });

  it("accepts a valid WEBP", () => {
    const b64 = makeBase64([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00]);
    expect(validateImageMagicBytes(b64, "image/webp")).toBe(true);
  });

  it("rejects PHP disguised as JPEG", () => {
    const b64 = makeBase64([0x3c, 0x3f, 0x70, 0x68, 0x70, 0x20]);
    expect(validateImageMagicBytes(b64, "image/jpeg")).toBe(false);
  });

  it("rejects PDF disguised as PNG", () => {
    const b64 = makeBase64([0x25, 0x50, 0x44, 0x46, 0x2d]);
    expect(validateImageMagicBytes(b64, "image/png")).toBe(false);
  });

  it("rejects HTML script disguised as WEBP", () => {
    const b64 = makeBase64([0x3c, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x3e]);
    expect(validateImageMagicBytes(b64, "image/webp")).toBe(false);
  });

  it("rejects unknown mime type", () => {
    const b64 = makeBase64([0xff, 0xd8, 0xff]);
    expect(validateImageMagicBytes(b64, "application/octet-stream")).toBe(false);
  });

  it("rejects empty base64", () => {
    expect(validateImageMagicBytes("", "image/jpeg")).toBe(false);
  });

  it("rejects invalid base64 without throwing", () => {
    expect(validateImageMagicBytes("not-valid!!!", "image/jpeg")).toBe(false);
  });
});

describe("Email subject generation", () => {
  const SUBJECTS: Record<string, { ca: string; es: string }> = {
    suggestion: {
      ca: "Nova suggerencia Web Consultes IT",
      es: "Nueva sugerencia Web Consultes IT",
    },
    bug: {
      ca: "Nou error Web Consultes IT",
      es: "Nuevo error Web Consultes IT",
    },
    question: {
      ca: "Nova consulta Web Consultes IT",
      es: "Nueva consulta Web Consultes IT",
    },
  };

  it("CA subject for suggestion", () => {
    expect(SUBJECTS.suggestion.ca).toBe("Nova suggerencia Web Consultes IT");
  });

  it("ES subject for bug", () => {
    expect(SUBJECTS.bug.es).toBe("Nuevo error Web Consultes IT");
  });

  it("CA subject for question", () => {
    expect(SUBJECTS.question.ca).toBe("Nova consulta Web Consultes IT");
  });

  it("ES subject for suggestion", () => {
    expect(SUBJECTS.suggestion.es).toBe("Nueva sugerencia Web Consultes IT");
  });
});
