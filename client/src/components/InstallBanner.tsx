import { useState, useEffect, useRef } from "react";
import { X, Download, Share, Plus, Smartphone } from "lucide-react";
import { useT } from "@/contexts/LanguageContext";

/**
 * InstallBanner — Banner d'instal·lació de la PWA
 *
 * Android/Chrome: captura l'event `beforeinstallprompt` i mostra un botó
 * que activa el diàleg natiu d'instal·lació.
 *
 * iOS/Safari (iOS 26+): detecta iOS i mostra instruccions actualitzades.
 * A partir d'iOS 26, els llocs afegits a la pantalla d'inici s'obren
 * automàticament com a web apps (mode standalone) per defecte, sense
 * necessitat de manifest amb display:standalone.
 *
 * El banner es descarta permanentment un cop l'usuari el tanca o instal·la
 * l'app (es guarda a localStorage).
 *
 * Millores:
 * - Animació subtil d'entrada (slide-up + fade-in)
 * - Detecció automàtica si l'app ja està instal·lada (display-mode: standalone,
 *   navigator.standalone, appinstalled event, getInstalledRelatedApps API)
 * - S'oculta automàticament si es detecta que l'app ja està instal·lada
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

/**
 * Comprova si l'app ja està instal·lada utilitzant l'API getInstalledRelatedApps
 * (disponible a Chrome 80+ i Edge)
 */
async function checkInstalledRelatedApps(): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    if ("getInstalledRelatedApps" in nav) {
      const apps = await nav.getInstalledRelatedApps();
      return apps.length > 0;
    }
  } catch {
    // API no disponible o error — ignorem
  }
  return false;
}

export function InstallBanner() {
  const { language } = useT();
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [visible, setVisible] = useState(false); // controla l'animació d'entrada
  const [exiting, setExiting] = useState(false); // controla l'animació de sortida
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // No mostrem si ja s'ha descartat o si ja s'executa com a PWA
    if (localStorage.getItem(DISMISSED_KEY) || isInStandaloneMode()) return;

    // Comprovar amb l'API getInstalledRelatedApps (async)
    checkInstalledRelatedApps().then((installed) => {
      if (installed) {
        localStorage.setItem(DISMISSED_KEY, "1");
        return;
      }

      if (isIOS()) {
        setShowIOS(true);
        // Retardem l'animació d'entrada per a una experiència més suau
        setTimeout(() => setVisible(true), 300);
        return;
      }

      // Android/Chrome: escoltem l'event beforeinstallprompt
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowAndroid(true);
        setTimeout(() => setVisible(true), 100);
      };
      window.addEventListener("beforeinstallprompt", handler);

      // Escoltem l'event appinstalled per ocultar el banner automàticament
      const installedHandler = () => {
        localStorage.setItem(DISMISSED_KEY, "1");
        animateOut();
      };
      window.addEventListener("appinstalled", installedHandler);

      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        window.removeEventListener("appinstalled", installedHandler);
      };
    });
  }, []);

  // Monitoritzar canvis en display-mode (per si l'usuari instal·la des del menú del navegador)
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        localStorage.setItem(DISMISSED_KEY, "1");
        animateOut();
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const animateOut = () => {
    setExiting(true);
    setTimeout(() => {
      setShowAndroid(false);
      setShowIOS(false);
      setVisible(false);
      setExiting(false);
    }, 300);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    animateOut();
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
    animateOut();
    setDeferredPrompt(null);
  };

  const ca = language === "ca";

  if (!showAndroid && !showIOS) return null;

  return (
    <div
      ref={bannerRef}
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300 ease-out ${
        visible && !exiting
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0"
      }`}
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-md mx-auto bg-card border border-border rounded-2xl shadow-2xl p-4 flex flex-col gap-3">
        {/* Capçalera */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <img
                src="/favicon-32x32.png"
                alt="Consultes IT"
                className="w-7 h-7"
              />
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
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl transition-colors active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            {ca ? "Instal·la l'aplicació" : "Instalar la aplicación"}
          </button>
        )}

        {/* iOS: instruccions actualitzades per a iOS 26+ */}
        {showIOS && (
          <div className="bg-muted/60 rounded-xl p-3 space-y-2">
            <p className="text-xs font-medium text-foreground">
              {ca
                ? "Com instal·lar a iOS (26 o superior):"
                : "Cómo instalar en iOS (26 o superior):"}
            </p>
            <ol className="space-y-1.5">
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">
                  1
                </span>
                <span className="flex items-center gap-1">
                  {ca ? "Obre aquesta pàgina a" : "Abre esta página en"}
                  <strong> Safari</strong>
                </span>
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">
                  2
                </span>
                <span className="flex items-center gap-1">
                  {ca ? "Toca" : "Toca"}
                  <Share className="h-3.5 w-3.5 text-blue-500 inline" />
                  <strong>{ca ? " Compartir" : " Compartir"}</strong>
                  {ca ? " (barra inferior)" : " (barra inferior)"}
                </span>
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">
                  3
                </span>
                <span className="flex items-center gap-1">
                  {ca ? "Toca" : "Toca"}
                  <Plus className="h-3.5 w-3.5 text-blue-500 inline" />
                  <strong>
                    {ca
                      ? ' "Afegir a la pantalla d\'inici"'
                      : ' "Añadir a pantalla de inicio"'}
                  </strong>
                </span>
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">
                  4
                </span>
                <span className="flex items-center gap-1">
                  {ca ? "Toca" : "Toca"}
                  <strong>{ca ? ' "Afegir"' : ' "Añadir"'}</strong>
                  {ca ? " a dalt a la dreta" : " arriba a la derecha"}
                </span>
              </li>
            </ol>
            <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-border/50">
              <Smartphone className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground">
                {ca
                  ? "A iOS 26+, l'app s'obrirà automàticament en mode pantalla completa (sense barra de Safari), com una app nativa."
                  : "En iOS 26+, la app se abrirá automáticamente en modo pantalla completa (sin barra de Safari), como una app nativa."}
              </p>
            </div>
          </div>
        )}

        {/* Beneficis */}
        <p className="text-[11px] text-muted-foreground text-center">
          {ca
            ? "Funciona parcialment sense connexió · Notificacions · Sense publicitat"
            : "Funciona parcialmente sin conexión · Notificaciones · Sin publicidad"}
        </p>
      </div>
    </div>
  );
}
