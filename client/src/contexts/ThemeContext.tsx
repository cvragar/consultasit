import { createContext, useContext, useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import { trpc } from "@/lib/trpc";

export type ThemeMode = "light" | "dark" | "auto";
export type Theme = "light" | "dark"; // tema efectiu aplicat

interface ThemeContextType {
  /** Mode seleccionat per l'usuari: "light" | "dark" | "auto" */
  mode: ThemeMode;
  /** Tema efectiu aplicat (resolució de "auto" → "light" | "dark") */
  theme: Theme;
  /** Drecera: true si el tema efectiu és fosc */
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  /** @deprecated Usa setMode. Mantingut per compatibilitat. */
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  theme: "light",
  isDark: false,
  setMode: () => {},
  setTheme: () => {},
});

/** Retorna true si l'hora local actual és entre les 20:00 i les 08:00 */
function isNightShiftHour(): boolean {
  const h = new Date().getHours();
  return h >= 20 || h < 8;
}

/** Resol el tema efectiu a partir del mode */
function resolveTheme(mode: ThemeMode): Theme {
  if (mode === "auto") return isNightShiftHour() ? "dark" : "light";
  return mode;
}

const STORAGE_KEY = "consultesit-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Inicialitzem el mode des de localStorage (per evitar flash en carregar)
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "auto") return stored;
    return "light";
  });

  // Tema efectiu derivat del mode
  const [theme, setThemeState] = useState<Theme>(() => resolveTheme(
    (() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark" || stored === "auto") return stored;
      return "light";
    })()
  ));

  /** Aplica el tema efectiu al DOM i actualitza meta theme-color */
  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    const themeColor = t === "dark" ? "#0f172a" : "#3b82f6";
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute("content", themeColor);
  }, []);

  // Apliquem el tema efectiu quan canvia el mode o el tema
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // En mode "auto": comprovem l'hora cada minut per canviar el tema si cal
  useEffect(() => {
    if (mode !== "auto") return;

    const tick = () => {
      const resolved = resolveTheme("auto");
      setThemeState((prev) => {
        if (prev !== resolved) return resolved;
        return prev;
      });
    };

    // Comprovem immediatament i després cada 60 s
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [mode]);

  // Llegim la preferència del servidor (si l'usuari està autenticat)
  const { data: serverTheme } = trpc.user.getTheme.useQuery(undefined, {
    retry: false,
  });

  // Sincronitzem amb el servidor una sola vegada
  const synced = useRef(false);
  useEffect(() => {
    if (serverTheme && !synced.current) {
      synced.current = true;
      const serverMode = serverTheme.theme as ThemeMode;
      if (serverMode !== mode) {
        setModeState(serverMode);
        setThemeState(resolveTheme(serverMode));
        localStorage.setItem(STORAGE_KEY, serverMode);
      }
    }
  }, [serverTheme]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mutació per desar al servidor
  const setThemeMutation = trpc.user.setTheme.useMutation();

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    const resolved = resolveTheme(m);
    setThemeState(resolved);
    localStorage.setItem(STORAGE_KEY, m);
    // Desem al servidor (si l'usuari no està autenticat, fallarà silenciosament)
    // El servidor accepta "light" | "dark" | "auto" — passem el mode directament
    setThemeMutation.mutate({ theme: m as "light" | "dark" });
  }, [setThemeMutation]);

  /** @deprecated Compatibilitat amb codi antic que usa setTheme("light"|"dark") */
  const setTheme = useCallback((t: Theme) => {
    setMode(t);
  }, [setMode]);

  return (
    <ThemeContext.Provider value={{ mode, theme, isDark: theme === "dark", setMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
