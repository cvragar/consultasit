import { useState, useRef, useEffect } from "react";
import { Moon, Sun, Stethoscope, ChevronDown } from "lucide-react";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";
import { useT } from "@/contexts/LanguageContext";

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { mode, setMode, isDark } = useTheme();
  const { language } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const ca = language === "ca";

  // Tanquem el desplegable si es fa clic fora
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const options: { value: ThemeMode; icon: React.ReactNode; label: string; desc: string }[] = [
    {
      value: "light",
      icon: <Sun className="h-3.5 w-3.5 shrink-0 text-amber-500" />,
      label: ca ? "Clar" : "Claro",
      desc: ca ? "Sempre mode clar" : "Siempre modo claro",
    },
    {
      value: "dark",
      icon: <Moon className="h-3.5 w-3.5 shrink-0 text-blue-400" />,
      label: ca ? "Fosc" : "Oscuro",
      desc: ca ? "Sempre mode fosc" : "Siempre modo oscuro",
    },
    {
      value: "auto",
      icon: <Stethoscope className="h-3.5 w-3.5 shrink-0 text-emerald-500" />,
      label: ca ? "Guàrdia" : "Guardia",
      desc: ca ? "Fosc 21:00–08:00 · Clar la resta" : "Oscuro 21:00–08:00 · Claro el resto",
    },
  ];

  const current = options.find((o) => o.value === mode) ?? options[0];

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      {/* Botó principal */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-colors shadow-sm text-xs font-medium
          ${isDark
            ? "border-gray-600 bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-blue-400"
            : "border-gray-300 bg-white/80 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
          }`}
        aria-label={ca ? "Canviar el tema" : "Cambiar el tema"}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {current.icon}
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown
          className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Desplegable */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden"
          role="listbox"
          aria-label={ca ? "Selecciona el tema" : "Selecciona el tema"}
        >
          {/* Capçalera */}
          <div className="px-3 py-2 border-b border-border">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              {ca ? "Tema de la interfície" : "Tema de la interfaz"}
            </p>
          </div>

          {/* Opcions */}
          {options.map((opt) => (
            <button
              key={opt.value}
              role="option"
              aria-selected={mode === opt.value}
              onClick={() => {
                setMode(opt.value);
                setOpen(false);
              }}
              className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors
                ${mode === opt.value
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "hover:bg-muted text-foreground"
                }`}
            >
              <span className="mt-0.5">{opt.icon}</span>
              <span className="flex flex-col min-w-0">
                <span className="text-xs font-semibold leading-tight">{opt.label}</span>
                <span className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">
                  {opt.desc}
                </span>
              </span>
              {mode === opt.value && (
                <span className="ml-auto mt-0.5 flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>
          ))}

          {/* Nota sobre el mode Guàrdia */}
          {mode === "auto" && (
            <div className="px-3 py-2 border-t border-border bg-emerald-50 dark:bg-emerald-950/30">
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-snug">
                {ca
                  ? "Mode Guàrdia actiu · Es comprova l'hora cada minut"
                  : "Modo Guardia activo · Se comprueba la hora cada minuto"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
