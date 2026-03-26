import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { ca } from "@/translations/ca";
import { es } from "@/translations/es";
import { trpc } from "@/lib/trpc";

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
  // Inicialitzem des de localStorage per evitar flash en carregar
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("consultesit-lang");
    return stored === "ca" || stored === "es" ? stored : "ca";
  });

  // Llegim la preferència del servidor (si l'usuari està autenticat)
  const { data: serverLang } = trpc.user.getLanguage.useQuery(undefined, {
    retry: false,
  });

  // Quan el servidor retorna la preferència, la sincronitzem (una sola vegada)
  const synced = useRef(false);
  useEffect(() => {
    if (serverLang && !synced.current) {
      synced.current = true;
      const lang = serverLang.language as Language;
      if (lang !== language) {
        setLanguageState(lang);
        localStorage.setItem("consultesit-lang", lang);
      }
    }
  }, [serverLang]);

  // Mutació per desar al servidor
  const setLanguageMutation = trpc.user.setLanguage.useMutation();

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("consultesit-lang", lang);
    // Intentem desar al servidor (si l'usuari no està autenticat, fallarà silenciosament)
    setLanguageMutation.mutate({ language: lang });
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
