/**
 * Express router per a la pujada de PDFs des del panel d'administració.
 * Utilitza multer per processar el multipart/form-data,
 * pdf-parse per extreure el text, i S3 per emmagatzemar el fitxer.
 */
import express, { Request, Response } from "express";
import multer from "multer";
import * as pdfParseModule from "pdf-parse";
const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
import { nanoid } from "nanoid";
import { storagePut } from "./storage";
import { getDb } from "./db";
import { documents } from "../drizzle/schema";
import { sdk } from "./_core/sdk";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB màxim
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Només s'accepten fitxers PDF"));
    }
  },
});

export const uploadRouter = express.Router();

// POST /api/upload/pdf
uploadRouter.post(
  "/pdf",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      // Verificar autenticació i rol admin
      let dbUser;
      try {
        dbUser = await sdk.authenticateRequest(req);
      } catch {
        return res.status(401).json({ error: "No autenticat" });
      }
      if (!dbUser || dbUser.role !== "admin") {
        return res.status(403).json({ error: "Accés denegat: cal ser administrador" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No s'ha rebut cap fitxer PDF" });
      }

      const { title, type, source, jurisdiction, summary, url: docUrl } = req.body as {
        title?: string;
        type?: string;
        source?: string;
        jurisdiction?: string;
        summary?: string;
        url?: string;
      };

      if (!title) {
        return res.status(400).json({ error: "El títol del document és obligatori" });
      }

      // 1. Extreure text del PDF
      let extractedText = "";
      try {
        const parsed = await pdfParse(req.file.buffer);
        extractedText = parsed.text.trim();
      } catch (parseErr) {
        console.error("[PDF Parse] Error:", parseErr);
        extractedText = "[No s'ha pogut extreure el text del PDF]";
      }

      // 2. Pujar el PDF a S3
      const fileKey = `pindoles-it/${nanoid(10)}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      let s3Url = "";
      try {
        const uploaded = await storagePut(fileKey, req.file.buffer, "application/pdf");
        s3Url = uploaded.url;
      } catch (s3Err) {
        console.error("[S3 Upload] Error:", s3Err);
        // Continua sense S3 si falla
      }

      // 3. Inserir el document a la BD
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: "Base de dades no disponible" });
      }

      const validTypes = ["ley", "decreto", "guia", "manual", "pildora", "otro"] as const;
      const validJurisdictions = ["estatal", "autonomica", "ambas"] as const;

      const docType = validTypes.includes(type as any) ? (type as typeof validTypes[number]) : "pildora";
      const docJurisdiction = validJurisdictions.includes(jurisdiction as any)
        ? (jurisdiction as typeof validJurisdictions[number])
        : "autonomica";

      const [result] = await db.insert(documents).values({
        title: title.trim(),
        type: docType,
        source: source?.trim() || "Departament de Salut",
        jurisdiction: docJurisdiction,
        content: extractedText,
        summary: summary?.trim() || null,
        url: docUrl?.trim() || null,
        fileKey: fileKey,
        tags: [],
        createdBy: dbUser.id,
      });

      const insertId = (result as any).insertId;

      return res.status(201).json({
        success: true,
        documentId: insertId,
        fileKey,
        s3Url,
        extractedLength: extractedText.length,
        message: `Document "${title}" creat correctament amb ${extractedText.length} caràcters extrets`,
      });
    } catch (err: any) {
      console.error("[Upload PDF] Error:", err);
      return res.status(500).json({ error: err.message || "Error intern del servidor" });
    }
  }
);

// GET /api/upload/documents - Llistar tots els documents (admin)
uploadRouter.get("/documents", async (req: Request, res: Response) => {
  try {
    let dbUser;
      try {
        dbUser = await sdk.authenticateRequest(req);
      } catch {
        return res.status(401).json({ error: "No autenticat" });
      }
      if (!dbUser || dbUser.role !== "admin") {
        return res.status(403).json({ error: "Accés denegat" });
      }

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "BD no disponible" });

    const docs = await db.select({
      id: documents.id,
      title: documents.title,
      type: documents.type,
      source: documents.source,
      jurisdiction: documents.jurisdiction,
      summary: documents.summary,
      url: documents.url,
      fileKey: documents.fileKey,
      createdAt: documents.createdAt,
    }).from(documents).orderBy(documents.createdAt);

    return res.json(docs);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/upload/documents/:id - Eliminar document (admin)
uploadRouter.delete("/documents/:id", async (req: Request, res: Response) => {
  try {
    let dbUser;
    try {
      dbUser = await sdk.authenticateRequest(req);
    } catch {
      return res.status(401).json({ error: "No autenticat" });
    }
    if (!dbUser || dbUser.role !== "admin") {
      return res.status(403).json({ error: "Accés denegat" });
    }

    const docId = parseInt(req.params.id);
    if (isNaN(docId)) {
      return res.status(400).json({ error: "ID invàlid" });
    }

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "BD no disponible" });

    const { eq } = await import("drizzle-orm");
    await db.delete(documents).where(eq(documents.id, docId));

    return res.json({ success: true, message: "Document eliminat correctament" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
