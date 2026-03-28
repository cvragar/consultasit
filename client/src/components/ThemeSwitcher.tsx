import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useT } from "@/contexts/LanguageContext";

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { setTheme, isDark } = useTheme();
  const { language } = useT();

  const label = isDark
    ? (language === "ca" ? "Clar" : "Claro")
    : (language === "ca" ? "Fosc" : "Oscuro");

  const ariaLabel = isDark
    ? (language === "ca" ? "Canviar a mode clar" : "Cambiar a modo claro")
    : (language === "ca" ? "Canviar a mode fosc" : "Cambiar a modo oscuro");

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm text-xs font-medium ${className ?? ""}`}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {isDark ? (
        <Sun className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <Moon className="h-3.5 w-3.5 shrink-0" />
      )}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
