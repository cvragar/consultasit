import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Image as ImageIcon, Send, MessageSquarePlus } from "lucide-react";

// ---- Magic bytes validation (client-side) ----
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/gif": [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

async function validateMagicBytes(file: File): Promise<boolean> {
  const signatures = MAGIC_BYTES[file.type];
  if (!signatures) return false;
  const headerBytes = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(headerBytes);
  return signatures.some((sig) => sig.every((byte, i) => bytes[i] === byte));
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface AttachedImage {
  file: File;
  preview: string;
  base64: string;
}

const TEXTS = {
  ca: {
    title: "Bústia de contacte",
    subtitle: "Envia'ns suggerències, errors o dubtes sobre la plataforma",
    typeLabel: "Tipus de missatge",
    typePlaceholder: "Selecciona el tipus",
    typeSuggestion: "💡 Suggerència / Millora",
    typeBug: "🐛 Error / Problema tècnic",
    typeQuestion: "❓ Dubte / Consulta",
    descLabel: "Descripció",
    descPlaceholder: "Descriu el problema o suggerència amb el màxim detall possible...",
    nameLabel: "Nom (opcional)",
    namePlaceholder: "El teu nom",
    emailLabel: "Email de resposta (opcional)",
    emailPlaceholder: "exemple@hospital.cat",
    imagesLabel: "Captures de pantalla (màx. 3, fins a 5 MB cadascuna)",
    imagesBtn: "Afegir",
    imagesHint: "Formats acceptats: JPEG, PNG, GIF, WEBP",
    imageInvalid: "Fitxer no vàlid o no és una imatge real (comprovació de seguretat)",
    imageTooLarge: "La imatge supera els 5 MB",
    send: "Enviar",
    sending: "Enviant...",
    cancel: "Cancel·lar",
    successTitle: "Missatge enviat!",
    successMsg: "Gràcies per la teva aportació. Revisarem el teu missatge aviat.",
    errorMsg: "Error en enviar el missatge. Torna-ho a intentar.",
    minLength: "La descripció ha de tenir almenys 10 caràcters.",
    typeRequired: "Selecciona el tipus de missatge.",
    close: "Tancar",
  },
  es: {
    title: "Buzón de contacto",
    subtitle: "Envíanos sugerencias, errores o dudas sobre la plataforma",
    typeLabel: "Tipo de mensaje",
    typePlaceholder: "Selecciona el tipo",
    typeSuggestion: "💡 Sugerencia / Mejora",
    typeBug: "🐛 Error / Problema técnico",
    typeQuestion: "❓ Duda / Consulta",
    descLabel: "Descripción",
    descPlaceholder: "Describe el problema o sugerencia con el máximo detalle posible...",
    nameLabel: "Nombre (opcional)",
    namePlaceholder: "Tu nombre",
    emailLabel: "Email de respuesta (opcional)",
    emailPlaceholder: "ejemplo@hospital.es",
    imagesLabel: "Capturas de pantalla (máx. 3, hasta 5 MB cada una)",
    imagesBtn: "Añadir",
    imagesHint: "Formatos aceptados: JPEG, PNG, GIF, WEBP",
    imageInvalid: "Archivo no válido o no es una imagen real (comprobación de seguridad)",
    imageTooLarge: "La imagen supera los 5 MB",
    send: "Enviar",
    sending: "Enviando...",
    cancel: "Cancelar",
    successTitle: "¡Mensaje enviado!",
    successMsg: "Gracias por tu aportación. Revisaremos tu mensaje pronto.",
    errorMsg: "Error al enviar el mensaje. Inténtalo de nuevo.",
    minLength: "La descripción debe tener al menos 10 caracteres.",
    typeRequired: "Selecciona el tipo de mensaje.",
    close: "Cerrar",
  },
};

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const { language } = useLanguage();
  const t = TEXTS[(language as "ca" | "es")] ?? TEXTS.ca;

  const [type, setType] = useState<"suggestion" | "bug" | "question" | "">("");
  const [description, setDescription] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [images, setImages] = useState<AttachedImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMutation = trpc.feedback.send.useMutation({
    onSuccess: () => setSent(true),
    onError: (err) => setServerError(err.message || t.errorMsg),
  });

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      if (images.length >= 3) break;
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, images: t.imageTooLarge }));
        continue;
      }
      const valid = await validateMagicBytes(file);
      if (!valid) {
        setErrors((prev) => ({ ...prev, images: t.imageInvalid }));
        continue;
      }
      const base64 = await fileToBase64(file);
      const preview = URL.createObjectURL(file);
      setImages((prev) => [...prev, { file, preview, base64 }]);
      setErrors((prev) => ({ ...prev, images: "" }));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!type) errs.type = t.typeRequired;
    if (description.trim().length < 10) errs.description = t.minLength;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    setServerError("");
    if (!validate()) return;
    sendMutation.mutate({
      type: type as "suggestion" | "bug" | "question",
      description: description.trim(),
      senderName: senderName.trim() || undefined,
      senderEmail: senderEmail.trim() || undefined,
      language: (language as "ca" | "es") ?? "ca",
      images: images.map((img) => ({
        name: img.file.name,
        mimeType: img.file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
        base64: img.base64,
        sizeBytes: img.file.size,
      })),
    });
  };

  const handleClose = () => {
    setType("");
    setDescription("");
    setSenderName("");
    setSenderEmail("");
    setImages([]);
    setErrors({});
    setSent(false);
    setServerError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageSquarePlus className="w-5 h-5 text-blue-600" />
            {t.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{t.successTitle}</h3>
            <p className="text-muted-foreground text-sm">{t.successMsg}</p>
            <Button onClick={handleClose} className="mt-2">
              {t.close}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pt-2">
            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <Label>{t.typeLabel}</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder={t.typePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suggestion">{t.typeSuggestion}</SelectItem>
                  <SelectItem value="bug">{t.typeBug}</SelectItem>
                  <SelectItem value="question">{t.typeQuestion}</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <Label>{t.descLabel}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.descPlaceholder}
                rows={5}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>

            {/* Name + Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>{t.nameLabel}</Label>
                <Input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder={t.namePlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t.emailLabel}</Label>
                <Input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                />
              </div>
            </div>

            {/* Images */}
            <div className="flex flex-col gap-1.5">
              <Label>{t.imagesLabel}</Label>
              <div className="flex flex-wrap gap-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-border"
                  >
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {images.length < 3 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-blue-400 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-xs text-center leading-tight">{t.imagesBtn}</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{t.imagesHint}</p>
              {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                className="hidden"
                onChange={handleAddImage}
              />
            </div>

            {/* Server error */}
            {serverError && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {serverError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={sendMutation.isPending}
                className="flex-1 gap-2"
              >
                <Send className="w-4 h-4" />
                {sendMutation.isPending ? t.sending : t.send}
              </Button>
              <Button variant="outline" onClick={handleClose} className="bg-background">
                {t.cancel}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---- Floating button ----
interface FeedbackButtonProps {
  onClick: () => void;
}

export function FeedbackButton({ onClick }: FeedbackButtonProps) {
  const { language } = useLanguage();
  const label = language === "es" ? "Contacto" : "Contacte";

  return (
    <button
      onClick={onClick}
      title={label}
      className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-medium"
    >
      <MessageSquarePlus className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
