import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { sendFeedbackEmail } from "../email";

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

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 3;

const imageSchema = z.object({
  name: z.string().max(255),
  mimeType: z.enum(ALLOWED_MIME),
  base64: z.string().max(10 * 1024 * 1024),
  sizeBytes: z.number().max(MAX_FILE_SIZE),
});

export const feedbackRouter = router({
  send: publicProcedure
    .input(
      z.object({
        type: z.enum(["suggestion", "bug", "question"]),
        description: z.string().min(10).max(5000),
        senderName: z.string().max(100).optional(),
        senderEmail: z.string().email().max(200).optional(),
        language: z.enum(["ca", "es"]).default("ca"),
        images: z.array(imageSchema).max(MAX_FILES).optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (input.images && input.images.length > 0) {
        for (const img of input.images) {
          const valid = validateImageMagicBytes(img.base64, img.mimeType);
          if (!valid) {
            throw new Error(
              `El fitxer "${img.name}" no es una imatge valida (comprovacio de seguretat fallida).`
            );
          }
        }
      }

      await sendFeedbackEmail({
        type: input.type,
        description: input.description,
        senderName: input.senderName,
        senderEmail: input.senderEmail,
        language: input.language,
        images: input.images?.map(({ name, mimeType, base64 }) => ({
          name,
          mimeType,
          base64,
        })),
      });

      return { success: true };
    }),
});
