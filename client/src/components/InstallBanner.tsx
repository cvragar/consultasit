import { useState, useEffect } from "react";
import { X, Download, Share, Plus } from "lucide-react";
import { useT } from "@/contexts/LanguageContext";

/**
 * InstallBanner — Banner d'instal·lació de la PWA
 *
 * Android/Chrome: captura l'event `beforeinstallprompt` i mostra un botó
 * que activa el diàleg natiu d'instal·lació.
 *
 * iOS/Safari: detecta iOS i mostra instruccions manuals (Compartir → Afegir
 * a la pantalla d'inici), ja que Safari no suporta `beforeinstallprompt`.
 *
 * El banner es descarta permanentment un cop l'usuari el tanca o instal·la
 * l'app (es guarda a localStorage).
 */

const DISMISSED_KEY = "consultesit-install-dismissed";

function isIOS(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPad OS 13+ s'identifica com a Mac amb touch
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isInStandaloneMode(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true
  );
}

export function InstallBanner() {
  const { language } = useT();
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    // No mostrem si ja s'ha descartat o si ja s'executa com a PWA
    if (localStorage.getItem(DISMISSED_KEY) || isInStandaloneMode()) return;

    if (isIOS()) {
      // iOS: mostrem instruccions manuals
      setShowIOS(true);
      return;
    }

    // Android/Chrome: escoltem l'event beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroid(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShowAndroid(false);
    setShowIOS(false);
  };

  const installAndroid = async () => {
    if (!deferredPrompt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (deferredPrompt as any).prompt();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { outcome } = await (deferredPrompt as any).userChoice;
    if (outcome === "accepted") {
      localStorage.setItem(DISMISSED_KEY, "1");
    }
    setShowAndroid(false);
    setDeferredPrompt(null);
  };

  const ca = language === "ca";

  if (!showAndroid && !showIOS) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe">
      <div className="max-w-md mx-auto bg-card border border-border rounded-2xl shadow-2xl p-4 flex flex-col gap-3">
        {/* Capçalera */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <img src="/favicon-32x32.png" alt="Consultes IT" className="w-7 h-7" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm leading-tight">
                {ca ? "Instal·la Consultes IT" : "Instala Consultes IT"}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                {ca
                  ? "Accés ràpid des de la pantalla d'inici"
                  : "Acceso rápido desde la pantalla de inicio"}
              </p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -mt-1 -mr-1 rounded-lg hover:bg-muted"
            aria-label={ca ? "Tancar" : "Cerrar"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Android: botó d'instal·lació directa */}
        {showAndroid && (
          <button
            onClick={installAndroid}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl transition-colors"
          >
            <Download className="h-4 w-4" />
            {ca ? "Instal·la l'aplicació" : "Instalar la aplicación"}
          </button>
        )}

        {/* iOS: instruccions manuals */}
        {showIOS && (
          <div className="bg-muted/60 rounded-xl p-3 space-y-2">
            <p className="text-xs font-medium text-foreground">
              {ca ? "Com instal·lar a iOS:" : "Cómo instalar en iOS:"}
            </p>
            <ol className="space-y-1.5">
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">1</span>
                <span className="flex items-center gap-1">
                  {ca ? "Toca" : "Toca"}
                  <Share className="h-3.5 w-3.5 text-blue-500 inline" />
                  <strong>{ca ? "Compartir" : "Compartir"}</strong>
                  {ca ? " a la barra de Safari" : " en la barra de Safari"}
                </span>
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">2</span>
                <span className="flex items-center gap-1">
                  {ca ? "Selecciona" : "Selecciona"}
                  <Plus className="h-3.5 w-3.5 text-blue-500 inline" />
                  <strong>{ca ? '"Afegir a l\'inici"' : '"Añadir a inicio"'}</strong>
                </span>
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">3</span>
                <span>
                  {ca
                    ? 'Confirma tocant "Afegir" a dalt a la dreta'
                    : 'Confirma tocando "Añadir" arriba a la derecha'}
                </span>
              </li>
            </ol>
          </div>
        )}

        {/* Beneficis */}
        <p className="text-[11px] text-muted-foreground text-center">
          {ca
            ? "Funciona parcialment sense connexió · Accés instantani · Sense publicitat"
            : "Funciona parcialmente sin conexión · Acceso instantáneo · Sin publicidad"}
        </p>
      </div>
    </div>
  );
}
