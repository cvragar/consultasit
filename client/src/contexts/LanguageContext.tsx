import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { ca } from "@/translations/ca";
import { es } from "@/translations/es";

export type Language = "ca" | "es";
export type Translations = typeof ca;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "ca",
  setLanguage: () => {},
  t: ca,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("consultesit-lang");
    return (stored === "ca" || stored === "es") ? stored : "ca";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("consultesit-lang", lang);
  };

  const t = language === "ca" ? ca : es;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

// Shorthand hook: const { t } = useT();
export function useT() {
  const { t, language, setLanguage } = useContext(LanguageContext);
  return { t, language, setLanguage };
}
