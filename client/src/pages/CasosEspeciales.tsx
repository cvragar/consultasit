import { useState, useMemo } from "react";
import { useSEO } from "@/hooks/useSEO";
import { useT } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Shield,
  Home,
  Search,
  AlertCircle,
  BookOpen,
  Scale,
  FileText,
  Download,
  Loader2,
  Star,
  Filter,
  X,
  Pencil,
  AlertTriangle,
  Save,
  Sparkles,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

// categoryLabels es calcula dinàmicament via t.casos.categories dins del component

const categoryColors: Record<string, string> = {
  menstruacion: "bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300",
  embarazo: "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300",
  lactancia: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300",
  donacion_organos: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300",
  baja_retroactiva: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300",
  pluriempleo: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300",
  prision: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300",
  extranjeros: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300",
  vacaciones: "bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300",
  recaida: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300",
  accident_treball: "bg-red-200 dark:bg-red-900/50 text-red-900 dark:text-red-300",
  otro: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
};

type SpecialCase = {
  id: number;
  title: string;
  description: string;
  category: string;
  legalBasis: string | null;
  procedure: string | null;
  examples: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Elimina la sintaxi Markdown d'un string per mostrar text pla al preview */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")          // Capçaleres ##
    .replace(/\*\*(.+?)\*\*/g, "$1")      // Negreta **text**
    .replace(/\*(.+?)\*/g, "$1")          // Cursiva *text*
    .replace(/`(.+?)`/g, "$1")            // Codi `text`
    .replace(/^[-*+]\s+/gm, "")           // Llistes - item
    .replace(/^\d+\.\s+/gm, "")          // Llistes numerades 1. item
    .replace(/^>\s+/gm, "")              // Cites > text
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Links [text](url)
    .replace(/!\[.+?\]\(.+?\)/g, "")    // Imatges
    .replace(/^\|.+\|$/gm, "")           // Taules
    .replace(/^[-|\s]+$/gm, "")          // Separadors de taula
    .replace(/\n{2,}/g, " ")             // Salts de línia múltiples → espai
    .replace(/\n/g, " ")                 // Salts de línia → espai
    .trim();
}

/**
 * Normalitza el contingut Markdown de la BD:
 * Alguns camps usen "; " com a separador de línies (artefacte de la inserció SQL).
 * Aquesta funció els converteix en salts de línia reals perquè Streamdown els renderitzi correctament.
 */
function normalitzeMd(text: string | null | undefined): string {
  if (!text) return "";
  // Si el text ja conté salts de línia reals, no cal fer res
  if (text.includes("\n")) return text;
  // Reemplaça "; " per salt de línia (separador usat en inserció SQL)
  return text.replace(/; /g, "\n");
}

/** Retorna true si el cas s'ha creat en els últims N dies */
function isNew(createdAt: Date, days = 30): boolean {
  const now = new Date();
  const diff = now.getTime() - new Date(createdAt).getTime();
  return diff < days * 24 * 60 * 60 * 1000;
}

/** Detecta si un string sembla un JSON array o object */
function looksLikeJson(value: string): boolean {
  const trimmed = value.trim();
  return (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"));
}

export default function CasosEspeciales() {
  const { t, language } = useT();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";

  useSEO({
    title: language === "ca"
      ? "Casos Especials d'IT — Consultes IT"
      : "Casos Especiales de IT — Consultas IT",
    description: language === "ca"
      ? "Casos especials d'Incapacitat Temporal: menstruació incapacitant, embaràs, donació d'òrgans, baixa retroactiva, pluriocupació i més."
      : "Casos especiales de Incapacidad Temporal: menstruación incapacitante, embarazo, donación de órganos, baja retroactiva, pluriempleo y más.",
    canonicalPath: "/casos-especials",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<SpecialCase | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Estat del diàleg d'edició
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<SpecialCase | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    description: "",
    legalBasis: "",
    procedure: "",
    examples: "",
  });
  const [jsonWarnings, setJsonWarnings] = useState<Record<string, boolean>>({});
  const [jsonConfirmOpen, setJsonConfirmOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  const utils = trpc.useUtils();
  const exportPDF = trpc.specialCases.exportPDF.useMutation();
  const updateCase = trpc.specialCases.update.useMutation({
    onSuccess: (updated) => {
      toast.success(language === "ca" ? "Cas especial actualitzat correctament" : "Caso especial actualizado correctamente");
      utils.specialCases.list.invalidate();
      // Actualitzar el cas seleccionat si és el mateix
      if (selectedCase?.id === updated.id) {
        setSelectedCase(updated as SpecialCase);
      }
      setEditDialogOpen(false);
    },
    onError: (err) => {
      toast.error(language === "ca" ? `Error en desar: ${err.message}` : `Error al guardar: ${err.message}`);
    },
  });

  const addFav = trpc.favorites.add.useMutation({ onSuccess: () => toast.success(language === "ca" ? "Afegit als favorits" : "Añadido a favoritos") });
  const removeFav = trpc.favorites.remove.useMutation({ onSuccess: () => toast.success(language === "ca" ? "Eliminat dels favorits" : "Eliminado de favoritos") });
  const { data: favoriteIds, refetch: refetchFavs } = trpc.favorites.getIds.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isFavorite = (caseId: number) =>
    favoriteIds?.some(f => f.entityType === "special_case" && f.entityId === caseId) ?? false;

  const toggleFavorite = (caseId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error(language === "ca" ? "Has d'iniciar sessió per gestionar favorits" : "Debes iniciar sesión para gestionar favoritos");
      return;
    }
    if (isFavorite(caseId)) {
      removeFav.mutate({ entityType: "special_case", entityId: caseId }, { onSuccess: () => refetchFavs() });
    } else {
      addFav.mutate({ entityType: "special_case", entityId: caseId }, { onSuccess: () => refetchFavs() });
    }
  };

  const handleExportPDF = async (caseId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const result = await exportPDF.mutateAsync({ id: caseId });
      const byteCharacters = atob(result.pdf);
      const byteNumbers = Array.from(byteCharacters).map(c => c.charCodeAt(0));
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      toast.error("Error en exportar el PDF");
    }
  };

  // Obrir el diàleg d'edició
  const handleOpenEdit = (caso: SpecialCase, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCase(caso);
    setEditForm({
      title: caso.title,
      category: caso.category,
      description: caso.description,
      legalBasis: caso.legalBasis ?? "",
      procedure: caso.procedure ?? "",
      examples: caso.examples ?? "",
    });
    setJsonWarnings({});
    setEditDialogOpen(true);
  };

  // Actualitzar un camp del formulari i detectar JSON
  const handleEditField = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    if (value.trim() && looksLikeJson(value)) {
      setJsonWarnings(prev => ({ ...prev, [field]: true }));
    } else {
      setJsonWarnings(prev => ({ ...prev, [field]: false }));
    }
  };

  // Desar el formulari (amb confirmació si hi ha JSON)
  const handleSave = () => {
    const hasJsonWarning = Object.values(jsonWarnings).some(Boolean);
    if (hasJsonWarning) {
      setJsonConfirmOpen(true);
      return;
    }
    doSave();
  };

  const doSave = () => {
    if (!editingCase) return;
    updateCase.mutate({
      id: editingCase.id,
      title: editForm.title.trim() || undefined,
      category: editForm.category || undefined,
      description: editForm.description.trim() || undefined,
      legalBasis: editForm.legalBasis.trim() || undefined,
      procedure: editForm.procedure.trim() || undefined,
      examples: editForm.examples.trim() || undefined,
    });
  };

  const { data: allCases } = trpc.specialCases.list.useQuery({ language });

  // Filtrat local combinat
  const displayedCases = useMemo(() => {
    let cases = allCases ?? [];
    if (searchQuery.length > 1) {
      const q = searchQuery.toLowerCase();
      cases = cases.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.legalBasis?.toLowerCase().includes(q)) ||
        (c.procedure?.toLowerCase().includes(q)) ||
        (c.examples?.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== "all") {
      cases = cases.filter(c => c.category === selectedCategory);
    }
    if (showOnlyNew) {
      cases = cases.filter(c => isNew(c.createdAt));
    }
    return cases;
  }, [allCases, searchQuery, selectedCategory, showOnlyNew]);

  // Agrupar per categoria
  const groupedCases = useMemo(() => {
    if (selectedCategory !== "all") {
      return { [selectedCategory]: displayedCases };
    }
    return displayedCases.reduce((acc, c) => {
      if (!acc[c.category]) acc[c.category] = [];
      acc[c.category]!.push(c);
      return acc;
    }, {} as Record<string, SpecialCase[]>);
  }, [displayedCases, selectedCategory]);

  const newCasesCount = useMemo(() => (allCases ?? []).filter(c => isNew(c.createdAt)).length, [allCases]);
  const hasActiveFilters = selectedCategory !== "all" || showOnlyNew;

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setShowOnlyNew(false);
  };

  const categoryLabels: Record<string, string> = {
    menstruacion: (t.casos.categories as Record<string,string>).menstruacion,
    embarazo: (t.casos.categories as Record<string,string>).embarazo,
    lactancia: (t.casos.categories as Record<string,string>).lactancia,
    donacion_organos: (t.casos.categories as Record<string,string>).donacion_organos,
    baja_retroactiva: (t.casos.categories as Record<string,string>).baja_retroactiva,
    pluriempleo: (t.casos.categories as Record<string,string>).pluriempleo,
    prision: (t.casos.categories as Record<string,string>).prision,
    extranjeros: (t.casos.categories as Record<string,string>).extranjeros,
    vacaciones: (t.casos.categories as Record<string,string>).vacaciones,
    recaida: (t.casos.categories as Record<string,string>).recaida,
    accident_treball: (t.casos.categories as Record<string,string>).accident_treball,
    otro: (t.casos.categories as Record<string,string>).otro,
  };

  const categories = Object.keys(categoryLabels);

  const fieldLabels: Record<string, string> = {
    title: language === "ca" ? "Títol" : "Título",
    description: language === "ca" ? "Descripció" : "Descripción",
    legalBasis: language === "ca" ? "Base Legal" : "Base Legal",
    procedure: language === "ca" ? "Procediment" : "Procedimiento",
    examples: language === "ca" ? "Exemples Pràctics" : "Ejemplos Prácticos",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1.5 px-2 shrink-0">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">{language === "ca" ? "Inici" : "Inicio"}</span>
                </Button>
              </Link>
              <span className="text-muted-foreground hidden sm:inline">/</span>
              <div className="flex items-center gap-1.5 min-w-0">
                <AlertCircle className="h-5 w-5 text-orange-600 shrink-0" />
                <h1 className="text-base sm:text-xl font-bold truncate">{String(t.casos.title)}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Badge variant="outline" className="gap-1 text-xs border-orange-300 text-orange-700 bg-orange-50">
                  <Shield className="h-3 w-3" />
                  {language === "ca" ? "Mode admin" : "Modo admin"}
                </Badge>
              )}
              {isAuthenticated && (
                <Link href="/favorits">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {t.nav.favorits}
                  </Button>
                </Link>
              )}
              <ThemeSwitcher />
              <LanguageSwitcher />
              <Badge variant="outline">
                {displayedCases.length} casos
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Barra de cerca i filtres */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={String(t.casos.searchPlaceholder)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {language === "ca" ? "Filtres" : "Filtros"}
              {hasActiveFilters && (
                <Badge className="ml-1 bg-white text-primary h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
          </div>

          {/* Filtres avançats: categories com a botons */}
          {showFilters && (
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {language === "ca" ? "Filtrar per categoria" : "Filtrar por categoría"}
                </h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 gap-1">
                    <X className="h-3 w-3" />
                    {language === "ca" ? "Netejar" : "Limpiar"}
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  {String(t.casos.filterAll)}
                </Button>
                <Button
                    variant={showOnlyNew ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setShowOnlyNew(!showOnlyNew); setSelectedCategory("all"); }}
                    className={showOnlyNew ? "bg-emerald-600 hover:bg-emerald-700" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    {language === "ca" ? "Nous" : "Nuevos"} ({newCasesCount})
                  </Button>
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setSelectedCategory(cat); setShowOnlyNew(false); }}
                  >
                    {categoryLabels[cat]}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Resum de filtres actius */}
                {(hasActiveFilters || searchQuery) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{language === "ca" ? "Mostrant" : "Mostrando"} {displayedCases.length} {language === "ca" ? "resultats" : "resultados"}</span>
              {searchQuery && <Badge variant="secondary">{language === "ca" ? "Cerca" : "Búsqueda"}: "{searchQuery}"</Badge>}
              {selectedCategory !== "all" && (
                <Badge variant="secondary">{categoryLabels[selectedCategory]}</Badge>
              )}
              {showOnlyNew && (
                <Badge className="bg-emerald-100 text-emerald-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {language === "ca" ? "Nous" : "Nuevos"}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Llista de casos */}
        {displayedCases.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">{String(t.casos.noResults)}</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              {language === "ca" ? "Netejar filtres" : "Limpiar filtros"}
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {(Object.entries(groupedCases) as [string, SpecialCase[]][]).map(([category, cases]) => (
              <section key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={`${categoryColors[category]} text-sm px-3 py-1`}>
                    {categoryLabels[category] || category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">({cases.length} {language === "ca" ? "casos" : "casos"})</span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cases.map((caso) => (
                    <Card
                      key={caso.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 group border-l-4 border-l-orange-500 relative"
                      onClick={() => { setSelectedCase(caso as SpecialCase); setDialogOpen(true); }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {isNew(caso.createdAt) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full mb-1">
                                <Sparkles className="h-2.5 w-2.5" />
                                {String(t.casos.badgeNew)}
                              </span>
                            )}
                            <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-orange-700 transition-colors">
                              {caso.title}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-orange-700 hover:bg-orange-50"
                                title={language === "ca" ? "Editar cas especial" : "Editar caso especial"}
                                onClick={(e) => handleOpenEdit(caso as SpecialCase, e)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={(e) => toggleFavorite(caso.id, e)}
                            >
                              <Star
                                className={`h-4 w-4 transition-colors ${
                                  isFavorite(caso.id)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground group-hover:text-yellow-400"
                                }`}
                              />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground line-clamp-3 mb-3 leading-relaxed">
                          {stripMarkdown(caso.description)}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            {caso.legalBasis && (
                              <span className="flex items-center gap-1">
                                <Scale className="h-3 w-3" />
                                {language === "ca" ? "Base legal" : "Base legal"}
                              </span>
                            )}
                            {caso.procedure && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {language === "ca" ? "Procediment" : "Procedimiento"}
                              </span>
                            )}
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 border-gray-200 text-gray-600 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50"
                                  onClick={(e) => handleExportPDF(caso.id, e)}
                                  disabled={exportPDF.isPending}
                                >
                                  {exportPDF.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Download className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>{language === "ca" ? "Exportar a PDF" : "Exportar a PDF"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Diàleg de visualització del cas especial */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
          {selectedCase && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <Badge className={categoryColors[selectedCase.category]}>
                    {categoryLabels[selectedCase.category] || selectedCase.category}
                  </Badge>
                  <div className="flex flex-wrap gap-2">
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          setDialogOpen(false);
                          setTimeout(() => handleOpenEdit(selectedCase, e), 100);
                        }}
                        className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <Pencil className="h-4 w-4" />
                        {language === "ca" ? "Editar" : "Editar"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => toggleFavorite(selectedCase.id, e)}
                      className="gap-2"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          isFavorite(selectedCase.id)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                      {isFavorite(selectedCase.id) ? (language === "ca" ? "Treure de favorits" : "Quitar de favoritos") : (language === "ca" ? "Afegir a favorits" : "Añadir a favoritos")}
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleExportPDF(selectedCase.id, e)}
                            disabled={exportPDF.isPending}
                            className="gap-2"
                          >
                            {exportPDF.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">{language === "ca" ? "Exportar PDF" : "Exportar PDF"}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="sm:hidden">
                          <p>{language === "ca" ? "Exportar a PDF" : "Exportar a PDF"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <DialogTitle className="text-xl sm:text-2xl break-words leading-tight">{selectedCase.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div className="prose prose-sm max-w-none bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 rounded-lg p-4 [&_table]:text-xs [&_table]:w-full [&_th]:whitespace-nowrap [&_td]:align-top [&_table]:block [&_table]:overflow-x-auto [&_table]:max-w-full">
                  <Streamdown>{normalitzeMd(selectedCase.description)}</Streamdown>
                </div>

                {selectedCase.legalBasis && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-blue-600" />
                      {language === "ca" ? "Base Legal" : "Base Legal"}
                    </h3>
                    <div className="prose prose-sm max-w-none bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 [&_table]:text-xs [&_table]:w-full [&_th]:whitespace-nowrap [&_td]:align-top [&_table]:block [&_table]:overflow-x-auto [&_table]:max-w-full">
                      <Streamdown>{normalitzeMd(selectedCase.legalBasis)}</Streamdown>
                    </div>
                  </div>
                )}

                {selectedCase.procedure && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      {language === "ca" ? "Procediment" : "Procedimiento"}
                    </h3>
                    <div className="prose prose-sm max-w-none bg-green-50 dark:bg-green-950/30 rounded-lg p-4 [&_table]:text-xs [&_table]:w-full [&_th]:whitespace-nowrap [&_td]:align-top [&_table]:block [&_table]:overflow-x-auto [&_table]:max-w-full">
                      <Streamdown>{normalitzeMd(selectedCase.procedure)}</Streamdown>
                    </div>
                  </div>
                )}

                {selectedCase.examples && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                      {language === "ca" ? "Exemples Pràctics" : "Ejemplos Prácticos"}
                    </h3>
                    <div className="prose prose-sm max-w-none bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 [&_table]:text-xs [&_table]:w-full [&_th]:whitespace-nowrap [&_td]:align-top [&_table]:block [&_table]:overflow-x-auto [&_table]:max-w-full">
                      <Streamdown>{normalitzeMd(selectedCase.examples)}</Streamdown>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diàleg d'edició (admin only) */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-orange-600" />
              {language === "ca" ? "Editar cas especial" : "Editar caso especial"}
            </DialogTitle>
            <DialogDescription>
              {language === "ca" ? "Modifica el contingut del cas especial. Els canvis es guardaran a la base de dades immediatament." : "Modifica el contenido del caso especial. Los cambios se guardarán en la base de datos inmediatamente."}
            </DialogDescription>
          </DialogHeader>

          {editingCase && (
            <div className="space-y-4 mt-2">
              {/* Títol */}
              <div>
                <Label htmlFor="edit-title">{language === "ca" ? "Títol *" : "Título *"}</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={e => handleEditField("title", e.target.value)}
                  className="mt-1"
                  placeholder={language === "ca" ? "Títol del cas especial" : "Título del caso especial"}
                />
              </div>

              {/* Categoria */}
              <div>
                <Label>{language === "ca" ? "Categoria" : "Categoría"}</Label>
                <Select
                  value={editForm.category}
                  onValueChange={v => setEditForm(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Descripció */}
              <div>
                <Label htmlFor="edit-description">{language === "ca" ? "Descripció *" : "Descripción *"}</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={e => handleEditField("description", e.target.value)}
                  className="mt-1 resize-none"
                  rows={3}
                  placeholder={language === "ca" ? "Descripció breu del cas especial" : "Descripción breve del caso especial"}
                />
                {jsonWarnings.description && (
                  <div className="flex items-center gap-2 mt-1 text-amber-600 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {language === "ca" ? "El contingut sembla un JSON. Assegura't que és text pla (Markdown), no dades estructurades." : "El contenido parece un JSON. Asegúrate de que es texto plano (Markdown), no datos estructurados."}
                  </div>
                )}
              </div>

              {/* Base Legal */}
              <div>
                <Label htmlFor="edit-legal">{language === "ca" ? "Base Legal" : "Base Legal"}</Label>
                <Textarea
                  id="edit-legal"
                  value={editForm.legalBasis}
                  onChange={e => handleEditField("legalBasis", e.target.value)}
                  className="mt-1 resize-none font-mono text-xs"
                  rows={5}
                  placeholder={language === "ca" ? "Normativa aplicable (Markdown acceptat: **negreta**, - llistes...)" : "Normativa aplicable (Markdown aceptado: **negrita**, - listas...)"}
                />
                {jsonWarnings.legalBasis && (
                  <div className="flex items-center gap-2 mt-1 text-amber-600 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {language === "ca" ? "El contingut sembla un JSON. Assegura't que és text pla (Markdown), no dades estructurades." : "El contenido parece un JSON. Asegúrate de que es texto plano (Markdown), no datos estructurados."}
                  </div>
                )}
              </div>

              {/* Procediment */}
              <div>
                <Label htmlFor="edit-procedure">{language === "ca" ? "Procediment" : "Procedimiento"}</Label>
                <Textarea
                  id="edit-procedure"
                  value={editForm.procedure}
                  onChange={e => handleEditField("procedure", e.target.value)}
                  className="mt-1 resize-none font-mono text-xs"
                  rows={5}
                  placeholder={language === "ca" ? "Passos a seguir (Markdown acceptat)" : "Pasos a seguir (Markdown aceptado)"}
                />
                {jsonWarnings.procedure && (
                  <div className="flex items-center gap-2 mt-1 text-amber-600 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {language === "ca" ? "El contingut sembla un JSON. Assegura't que és text pla (Markdown), no dades estructurades." : "El contenido parece un JSON. Asegúrate de que es texto plano (Markdown), no datos estructurados."}
                  </div>
                )}
              </div>

              {/* Exemples */}
              <div>
                <Label htmlFor="edit-examples">{language === "ca" ? "Exemples Pràctics" : "Ejemplos Prácticos"}</Label>
                <Textarea
                  id="edit-examples"
                  value={editForm.examples}
                  onChange={e => handleEditField("examples", e.target.value)}
                  className="mt-1 resize-none font-mono text-xs"
                  rows={5}
                  placeholder={language === "ca" ? "Exemples pràctics (Markdown acceptat)" : "Ejemplos prácticos (Markdown aceptado)"}
                />
                {jsonWarnings.examples && (
                  <div className="flex items-center gap-2 mt-1 text-amber-600 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {language === "ca" ? "El contingut sembla un JSON. Assegura't que és text pla (Markdown), no dades estructurades." : "El contenido parece un JSON. Asegúrate de que es texto plano (Markdown), no datos estructurados."}
                  </div>
                )}
              </div>

              {/* Avís general si hi ha JSON */}
              {Object.values(jsonWarnings).some(Boolean) && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold">{language === "ca" ? "Avís: contingut JSON detectat" : "Aviso: contenido JSON detectado"}</p>
                    <p className="mt-1">
                      {language === "ca" ? "Un o més camps contenen el que sembla ser dades JSON. Si deses, el contingut es mostrarà com a text JSON en brut en lloc de text formatat. Utilitza text pla o Markdown en lloc de JSON." : "Uno o más campos contienen lo que parece ser datos JSON. Si guardas, el contenido se mostrará como texto JSON en bruto en lugar de texto formateado. Usa texto plano o Markdown en lugar de JSON."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-6 gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={updateCase.isPending}
            >
              {language === "ca" ? "Cancel·lar" : "Cancelar"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateCase.isPending || !editForm.title.trim() || !editForm.description.trim()}
              className="gap-2 bg-orange-600 hover:bg-orange-700"
            >
              {updateCase.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {language === "ca" ? "Desar canvis" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmació per desar JSON */}
      <AlertDialog open={jsonConfirmOpen} onOpenChange={setJsonConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              {language === "ca" ? "Contingut JSON detectat" : "Contenido JSON detectado"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === "ca" ? "Un o més camps semblen contenir dades JSON. Si continues, el contingut es mostrarà com a text JSON en brut als usuaris, en lloc de text formatat correctament. Estàs segur que vols desar igualment?" : "Uno o más campos parecen contener datos JSON. Si continuas, el contenido se mostrará como texto JSON en bruto a los usuarios, en lugar de texto formateado correctamente. ¿Estás seguro de que quieres guardar igualmente?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setJsonConfirmOpen(false)}>
              {language === "ca" ? "Tornar a editar" : "Volver a editar"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setJsonConfirmOpen(false);
                doSave();
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {language === "ca" ? "Desar igualment" : "Guardar igualmente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
