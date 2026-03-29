import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

const RECIPIENT = "cvragar+IT@gmail.com";

function createTransport() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "cvragar+IT@gmail.com",
      pass: ENV.gmailAppPassword,
    },
  });
}

export interface FeedbackEmailOptions {
  type: "suggestion" | "bug" | "question";
  description: string;
  senderName?: string;
  senderEmail?: string;
  language: "ca" | "es";
  images?: Array<{
    name: string;
    mimeType: string;
    base64: string;
  }>;
}

const SUBJECTS: Record<FeedbackEmailOptions["type"], { ca: string; es: string }> = {
  suggestion: { ca: "Nova suggerencia Web Consultes IT", es: "Nueva sugerencia Web Consultes IT" },
  bug: { ca: "Nou error Web Consultes IT", es: "Nuevo error Web Consultes IT" },
  question: { ca: "Nova consulta Web Consultes IT", es: "Nueva consulta Web Consultes IT" },
};

const TYPE_LABELS: Record<FeedbackEmailOptions["type"], { ca: string; es: string }> = {
  suggestion: { ca: "Suggerencia", es: "Sugerencia" },
  bug: { ca: "Error / Falla", es: "Error / Fallo" },
  question: { ca: "Dubte / Consulta", es: "Duda / Consulta" },
};

export async function sendFeedbackEmail(opts: FeedbackEmailOptions): Promise<void> {
  const { type, description, senderName, senderEmail, language, images } = opts;
  const lang = language ?? "ca";
  const subject = SUBJECTS[type][lang];
  const typeLabel = TYPE_LABELS[type][lang];

  const senderInfo = senderName || senderEmail
    ? `De: ${[senderName, senderEmail].filter(Boolean).join(" - ")}`
    : lang === "ca" ? "Remitent anonim" : "Remitente anonimo";

  const htmlBody = `<html><body style="font-family:sans-serif;color:#1e293b">
<div style="max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
<div style="background:#1e3a5f;color:#fff;padding:24px">
<h2 style="margin:0">Consultes IT - ${typeLabel}</h2>
<p style="margin:4px 0 0;opacity:.8">${lang === "ca" ? "Bustia de contacte" : "Buzon de contacto"}</p>
</div>
<div style="padding:24px">
<p><strong>${lang === "ca" ? "De" : "De"}:</strong> ${senderInfo}</p>
<p><strong>${lang === "ca" ? "Descripcio" : "Descripcion"}:</strong></p>
<div style="background:#f1f5f9;border-radius:8px;padding:12px;white-space:pre-wrap">${description.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
${images && images.length > 0 ? "<p style=\"color:#64748b;font-size:13px;margin-top:16px\">" + (lang === "ca" ? "S'adjunten " + images.length + " captura(es)." : "Se adjuntan " + images.length + " captura(s).") + "</p>" : ""}
</div>
<div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px;font-size:12px;color:#94a3b8">
consultesit.com
</div>
</div>
</body></html>`;

  const attachments = (images ?? []).map((img) => ({
    filename: img.name,
    content: Buffer.from(img.base64, "base64"),
    contentType: img.mimeType,
  }));

  const transport = createTransport();
  await transport.sendMail({
    from: '"Consultes IT" <cvragar+IT@gmail.com>',
    to: RECIPIENT,
    replyTo: senderEmail ?? undefined,
    subject,
    html: htmlBody,
    attachments,
  });
}
