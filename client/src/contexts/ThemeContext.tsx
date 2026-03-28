import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { trpc } from "@/lib/trpc";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Inicialitzem des de localStorage per evitar flash en carregar
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("consultesit-theme");
    return stored === "light" || stored === "dark" ? stored : "light";
  });

  // Apliquem la classe .dark al <html> i actualitzem meta theme-color quan canvia el tema
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // Actualitzem meta theme-color per a la barra d'adreces del navegador mòbil
    const themeColor = theme === "dark" ? "#0f172a" : "#3b82f6";
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute("content", themeColor);
  }, [theme]);

  // Llegim la preferència del servidor (si l'usuari està autenticat)
  const { data: serverTheme } = trpc.user.getTheme.useQuery(undefined, {
    retry: false,
  });

  // Quan el servidor retorna la preferència, la sincronitzem (una sola vegada)
  const synced = useRef(false);
  useEffect(() => {
    if (serverTheme && !synced.current) {
      synced.current = true;
      const t = serverTheme.theme as Theme;
      if (t !== theme) {
        setThemeState(t);
        localStorage.setItem("consultesit-theme", t);
      }
    }
  }, [serverTheme]);

  // Mutació per desar al servidor
  const setThemeMutation = trpc.user.setTheme.useMutation();

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("consultesit-theme", t);
    // Intentem desar al servidor (si l'usuari no està autenticat, fallarà silenciosament)
    setThemeMutation.mutate({ theme: t });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
