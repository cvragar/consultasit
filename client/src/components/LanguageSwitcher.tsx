import { useT } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

interface LanguageSwitcherProps {
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
}

export function LanguageSwitcher({ className, size = "sm" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useT();

  return (
    <Button
      variant="outline"
      size={size}
      className={`font-semibold tracking-wide px-2.5 min-w-[48px] bg-white/80 hover:bg-blue-50 border-gray-300 text-gray-700 hover:text-blue-700 hover:border-blue-400 transition-colors ${className ?? ""}`}
      onClick={() => setLanguage(language === "ca" ? "es" : "ca")}
      title={language === "ca" ? "Cambiar a castellano" : "Canviar a català"}
      aria-label={language === "ca" ? "Cambiar a castellano" : "Canviar a català"}
    >
      {language === "ca" ? "ES" : "CA"}
    </Button>
  );
}
