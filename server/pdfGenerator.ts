import PDFDocument from "pdfkit";
import { Readable } from "stream";

interface Message {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  sources?: any;
  createdAt: Date;
}

interface SpecialCase {
  id: number;
  title: string;
  description: string;
  category: string;
  legalBasis: string | null;
  procedure: string | null;
  examples: string | null;
  tags?: string | null;
}

interface Document {
  id: number;
  title: string;
  content: string;
  type: string;
  source: string | null;
  summary: string | null;
  tags: string[] | null;
  publicationDate?: Date | null;
}

/**
 * Genera un PDF de una conversación de chat
 */
export async function generateConversationPDF(
  conversationTitle: string,
  messages: Message[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Título
    doc.fontSize(20).font("Helvetica-Bold").text("Consultes IT", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).text(conversationTitle || "Conversa sense títol", { align: "center" });
    doc.moveDown();
    
    // Fecha
    doc.fontSize(10).font("Helvetica").fillColor("#666666")
      .text(`Exportat el ${new Date().toLocaleDateString("ca-ES")}`, { align: "center" });
    doc.moveDown(2);

    // Mensajes
    messages.forEach((msg, index) => {
      const isUser = msg.role === "user";
      
      // Separador
      if (index > 0) {
        doc.moveDown(1.5);
      }

      // Etiqueta del rol
      doc.fontSize(11).font("Helvetica-Bold")
        .fillColor(isUser ? "#2563eb" : "#059669")
        .text(isUser ? "USUARI:" : "ASSISTENT IA:", { continued: false });
      
      doc.moveDown(0.3);

      // Contenido del mensaje
      doc.fontSize(10).font("Helvetica").fillColor("#000000")
        .text(msg.content, { align: "left", lineGap: 2 });

      // Fuentes citadas
      if (msg.sources && msg.sources.length > 0) {
        doc.moveDown(0.5);
        doc.fontSize(9).font("Helvetica-Oblique").fillColor("#666666")
          .text("Fonts consultades:", { continued: false });
        msg.sources.forEach((source: any) => {
          doc.fontSize(8).text(`  • ${source.title}`, { indent: 10 });
        });
      }

      // Línea divisoria
      if (index < messages.length - 1) {
        doc.moveDown(0.5);
        doc.strokeColor("#e5e7eb").lineWidth(0.5)
          .moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
      }
    });

    // Pie de página
    doc.moveDown(3);
    doc.fontSize(8).fillColor("#999999")
      .text("Document generat per Consultes IT - Plataforma especialitzada en normativa d'Incapacitat Temporal", 
        { align: "center" });

    doc.end();
  });
}

/**
 * Genera un PDF de un caso especial
 */
export async function generateSpecialCasePDF(specialCase: SpecialCase): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Título
    doc.fontSize(20).font("Helvetica-Bold").text("Consultes IT", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#dc2626").text("CAS ESPECIAL", { align: "center" });
    doc.moveDown(2);

    // Título del caso
    doc.fontSize(16).font("Helvetica-Bold").fillColor("#000000")
      .text(specialCase.title, { align: "left" });
    doc.moveDown();

    // Categoría
    doc.fontSize(10).font("Helvetica").fillColor("#666666")
      .text(`Categoria: ${specialCase.category}`, { align: "left" });
    doc.moveDown(1.5);

    // Descripción
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#000000").text("Descripció:");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica").text(specialCase.description, { align: "justify", lineGap: 2 });
    doc.moveDown(1.5);

    // Base legal
    if (specialCase.legalBasis) {
      doc.fontSize(12).font("Helvetica-Bold").text("Base legal:");
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica").text(specialCase.legalBasis, { align: "justify", lineGap: 2 });
      doc.moveDown(1.5);
    }

    // Procedimiento
    if (specialCase.procedure) {
      doc.fontSize(12).font("Helvetica-Bold").text("Procediment:");
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica").text(specialCase.procedure, { align: "justify", lineGap: 2 });
      doc.moveDown(1.5);
    }

    // Ejemplos
    if (specialCase.examples) {
      doc.fontSize(12).font("Helvetica-Bold").text("Exemples pràctics:");
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica").text(specialCase.examples, { align: "justify", lineGap: 2 });
      doc.moveDown(1.5);
    }

    // Etiquetas
    if (specialCase.tags) {
      doc.fontSize(10).font("Helvetica-Oblique").fillColor("#666666")
        .text(`Etiquetes: ${specialCase.tags}`, { align: "left" });
    }

    // Pie de página
    doc.moveDown(3);
    doc.fontSize(8).fillColor("#999999")
      .text(`Document generat el ${new Date().toLocaleDateString("ca-ES")} per Consultes IT`, 
        { align: "center" });

    doc.end();
  });
}

/**
 * Genera un PDF de un documento normativo
 */
export async function generateDocumentPDF(document: Document): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Título
    doc.fontSize(20).font("Helvetica-Bold").text("Consultes IT", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#2563eb").text("DOCUMENT NORMATIU", { align: "center" });
    doc.moveDown(2);

    // Título del documento
    doc.fontSize(16).font("Helvetica-Bold").fillColor("#000000")
      .text(document.title, { align: "left" });
    doc.moveDown();

    // Metadatos
    doc.fontSize(10).font("Helvetica").fillColor("#666666")
      .text(`Tipus: ${document.type}`, { align: "left" });
    doc.text(`Font: ${document.source}`, { align: "left" });
    if (document.publicationDate) {
      doc.text(`Data de publicació: ${new Date(document.publicationDate).toLocaleDateString("ca-ES")}`, 
        { align: "left" });
    }
    doc.moveDown(1.5);

    // Resumen
    if (document.summary) {
      doc.fontSize(12).font("Helvetica-Bold").fillColor("#000000").text("Resum:");
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica-Oblique").fillColor("#333333")
        .text(document.summary, { align: "justify", lineGap: 2 });
      doc.moveDown(1.5);
    }

    // Contenido
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#000000").text("Contingut:");
    doc.moveDown(0.3);
    
    // Dividir el contenido en párrafos para mejor legibilidad
    const paragraphs = document.content.split("\n\n");
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.trim()) {
        doc.fontSize(10).font("Helvetica").fillColor("#000000")
          .text(paragraph.trim(), { align: "justify", lineGap: 2 });
        if (index < paragraphs.length - 1) {
          doc.moveDown(0.8);
        }
      }
    });

    // Etiquetas
    if (document.tags && document.tags.length > 0) {
      doc.moveDown(2);
      doc.fontSize(10).font("Helvetica-Oblique").fillColor("#666666")
        .text(`Etiquetes: ${Array.isArray(document.tags) ? document.tags.join(", ") : document.tags}`, { align: "left" });
    }

    // Pie de página
    doc.moveDown(3);
    doc.fontSize(8).fillColor("#999999")
      .text(`Document generat el ${new Date().toLocaleDateString("ca-ES")} per Consultes IT`, 
        { align: "center" });

    doc.end();
  });
}
