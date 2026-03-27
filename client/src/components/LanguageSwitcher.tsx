import { useT } from "@/contexts/LanguageContext";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useT();

  return (
    <div
      className={`flex items-center rounded-full border border-gray-300 bg-white/80 overflow-hidden text-xs font-semibold tracking-wide shadow-sm ${className ?? ""}`}
      role="group"
      aria-label="Seleccionar idioma"
    >
      <button
        onClick={() => setLanguage("ca")}
        className={`px-2.5 py-1 transition-colors ${
          language === "ca"
            ? "bg-blue-600 text-white"
            : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
        }`}
        aria-pressed={language === "ca"}
        title="Canviar a català"
      >
        CA
      </button>
      <span className="text-gray-300 select-none">|</span>
      <button
        onClick={() => setLanguage("es")}
        className={`px-2.5 py-1 transition-colors ${
          language === "es"
            ? "bg-blue-600 text-white"
            : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
        }`}
        aria-pressed={language === "es"}
        title="Cambiar a castellano"
      >
        ES
      </button>
    </div>
  );
}
