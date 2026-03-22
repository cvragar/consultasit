import { useState, useMemo } from "react";
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

const categoryLabels: Record<string, string> = {
  menstruacion: "Menstruació incapacitant",
  embarazo: "Embaràs",
  lactancia: "Lactància",
  donacion_organos: "Donació d'òrgans",
  baja_retroactiva: "Baixa retroactiva",
  pluriempleo: "Pluriocupació / Pluriactivitat",
  prision: "Presó",
  extranjeros: "Estrangers",
  vacaciones: "Vacances i IT",
  recaida: "Recaiguda",
  accident_treball: "Accident de Treball",
  otro: "Altres",
};

const categoryColors: Record<string, string> = {
  menstruacion: "bg-pink-100 text-pink-800",
  embarazo: "bg-purple-100 text-purple-800",
  lactancia: "bg-blue-100 text-blue-800",
  donacion_organos: "bg-green-100 text-green-800",
  baja_retroactiva: "bg-orange-100 text-orange-800",
  pluriempleo: "bg-yellow-100 text-yellow-800",
  prision: "bg-red-100 text-red-800",
  extranjeros: "bg-indigo-100 text-indigo-800",
  vacaciones: "bg-teal-100 text-teal-800",
  recaida: "bg-amber-100 text-amber-800",
  accident_treball: "bg-red-200 text-red-900",
  otro: "bg-gray-100 text-gray-800",
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
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";

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
      toast.success("Cas especial actualitzat correctament");
      utils.specialCases.list.invalidate();
      // Actualitzar el cas seleccionat si és el mateix
      if (selectedCase?.id === updated.id) {
        setSelectedCase(updated as SpecialCase);
      }
      setEditDialogOpen(false);
    },
    onError: (err) => {
      toast.error(`Error en desar: ${err.message}`);
    },
  });

  const addFav = trpc.favorites.add.useMutation({ onSuccess: () => toast.success("Afegit als favorits") });
  const removeFav = trpc.favorites.remove.useMutation({ onSuccess: () => toast.success("Eliminat dels favorits") });
  const { data: favoriteIds, refetch: refetchFavs } = trpc.favorites.getIds.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isFavorite = (caseId: number) =>
    favoriteIds?.some(f => f.entityType === "special_case" && f.entityId === caseId) ?? false;

  const toggleFavorite = (caseId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Has d'iniciar sessió per gestionar favorits");
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

  const { data: allCases } = trpc.specialCases.list.useQuery();

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

  const categories = Object.keys(categoryLabels);
  const newCasesCount = useMemo(() => (allCases ?? []).filter(c => isNew(c.createdAt)).length, [allCases]);
  const hasActiveFilters = selectedCategory !== "all" || showOnlyNew;

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setShowOnlyNew(false);
  };

  const fieldLabels: Record<string, string> = {
    title: "Títol",
    description: "Descripció",
    legalBasis: "Base Legal",
    procedure: "Procediment",
    examples: "Exemples Pràctics",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1.5 px-2 shrink-0">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Inici</span>
                </Button>
              </Link>
              <span className="text-muted-foreground hidden sm:inline">/</span>
              <div className="flex items-center gap-1.5 min-w-0">
                <AlertCircle className="h-5 w-5 text-orange-600 shrink-0" />
                <h1 className="text-base sm:text-xl font-bold truncate">Casos Especials</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Badge variant="outline" className="gap-1 text-xs border-orange-300 text-orange-700 bg-orange-50">
                  <Shield className="h-3 w-3" />
                  Mode admin
                </Badge>
              )}
              {isAuthenticated && (
                <Link href="/favorits">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Favorits
                  </Button>
                </Link>
              )}
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
                placeholder="Cercar per títol, descripció, base legal o procediment..."
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
              Filtres
              {hasActiveFilters && (
                <Badge className="ml-1 bg-white text-primary h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
          </div>

          {/* Filtres avançats: categories com a botons */}
          {showFilters && (
            <div className="bg-white border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtrar per categoria
                </h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 gap-1">
                    <X className="h-3 w-3" />
                    Netejar
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  Tots
                </Button>
                <Button
                    variant={showOnlyNew ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setShowOnlyNew(!showOnlyNew); setSelectedCategory("all"); }}
                    className={showOnlyNew ? "bg-emerald-600 hover:bg-emerald-700" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Nous ({newCasesCount})
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
              <span>Mostrant {displayedCases.length} resultats</span>
              {searchQuery && <Badge variant="secondary">Cerca: "{searchQuery}"</Badge>}
              {selectedCategory !== "all" && (
                <Badge variant="secondary">{categoryLabels[selectedCategory]}</Badge>
              )}
              {showOnlyNew && (
                <Badge className="bg-emerald-100 text-emerald-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Nous
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Llista de casos */}
        {displayedCases.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No s'han trobat casos amb els filtres actuals</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Netejar filtres
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedCases).map(([category, cases]) => (
              <section key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={`${categoryColors[category]} text-sm px-3 py-1`}>
                    {categoryLabels[category] || category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">({cases.length} casos)</span>
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
                                Nou
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
                                title="Editar cas especial"
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
                                Base legal
                              </span>
                            )}
                            {caso.procedure && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Procediment
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
                                <p>Exportar a PDF</p>
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
                        Editar
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
                      {isFavorite(selectedCase.id) ? "Treure de favorits" : "Afegir a favorits"}
                    </Button>
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
                      Exportar PDF
                    </Button>
                  </div>
                </div>
                <DialogTitle className="text-xl sm:text-2xl break-words leading-tight">{selectedCase.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div className="prose prose-sm max-w-none bg-orange-50 border border-orange-200 rounded-lg p-4 [&_table]:text-xs [&_table]:w-full [&_th]:whitespace-nowrap [&_td]:align-top [&_table]:block [&_table]:overflow-x-auto [&_table]:max-w-full">
                  <Streamdown>{selectedCase.description}</Streamdown>
                </div>

                {selectedCase.legalBasis && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-blue-600" />
                      Base Legal
                    </h3>
                    <div className="prose prose-sm max-w-none bg-blue-50 rounded-lg p-4 [&_table]:text-xs [&_table]:w-full [&_th]:whitespace-nowrap [&_td]:align-top [&_table]:block [&_table]:overflow-x-auto [&_table]:max-w-full">
                      <Streamdown>{selectedCase.legalBasis}</Streamdown>
                    </div>
                  </div>
                )}

                {selectedCase.procedure && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      Procediment
                    </h3>
                    <div className="prose prose-sm max-w-none bg-green-50 rounded-lg p-4 [&_table]:text-xs [&_table]:w-full [&_th]:whitespace-nowrap [&_td]:align-top [&_table]:block [&_table]:overflow-x-auto [&_table]:max-w-full">
                      <Streamdown>{selectedCase.procedure}</Streamdown>
                    </div>
                  </div>
                )}

                {selectedCase.examples && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                      Exemples Pràctics
                    </h3>
                    <div className="prose prose-sm max-w-none bg-purple-50 rounded-lg p-4 [&_table]:text-xs [&_table]:w-full [&_th]:whitespace-nowrap [&_td]:align-top [&_table]:block [&_table]:overflow-x-auto [&_table]:max-w-full">
                      <Streamdown>{selectedCase.examples}</Streamdown>
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
              Editar cas especial
            </DialogTitle>
            <DialogDescription>
              Modifica el contingut del cas especial. Els canvis es guardaran a la base de dades immediatament.
            </DialogDescription>
          </DialogHeader>

          {editingCase && (
            <div className="space-y-4 mt-2">
              {/* Títol */}
              <div>
                <Label htmlFor="edit-title">Títol *</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={e => handleEditField("title", e.target.value)}
                  className="mt-1"
                  placeholder="Títol del cas especial"
                />
              </div>

              {/* Categoria */}
              <div>
                <Label>Categoria</Label>
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
                <Label htmlFor="edit-description">Descripció *</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={e => handleEditField("description", e.target.value)}
                  className="mt-1 resize-none"
                  rows={3}
                  placeholder="Descripció breu del cas especial"
                />
                {jsonWarnings.description && (
                  <div className="flex items-center gap-2 mt-1 text-amber-600 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    El contingut sembla un JSON. Assegura't que és text pla (Markdown), no dades estructurades.
                  </div>
                )}
              </div>

              {/* Base Legal */}
              <div>
                <Label htmlFor="edit-legal">Base Legal</Label>
                <Textarea
                  id="edit-legal"
                  value={editForm.legalBasis}
                  onChange={e => handleEditField("legalBasis", e.target.value)}
                  className="mt-1 resize-none font-mono text-xs"
                  rows={5}
                  placeholder="Normativa aplicable (Markdown acceptat: **negreta**, - llistes...)"
                />
                {jsonWarnings.legalBasis && (
                  <div className="flex items-center gap-2 mt-1 text-amber-600 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    El contingut sembla un JSON. Assegura't que és text pla (Markdown), no dades estructurades.
                  </div>
                )}
              </div>

              {/* Procediment */}
              <div>
                <Label htmlFor="edit-procedure">Procediment</Label>
                <Textarea
                  id="edit-procedure"
                  value={editForm.procedure}
                  onChange={e => handleEditField("procedure", e.target.value)}
                  className="mt-1 resize-none font-mono text-xs"
                  rows={5}
                  placeholder="Passos a seguir (Markdown acceptat)"
                />
                {jsonWarnings.procedure && (
                  <div className="flex items-center gap-2 mt-1 text-amber-600 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    El contingut sembla un JSON. Assegura't que és text pla (Markdown), no dades estructurades.
                  </div>
                )}
              </div>

              {/* Exemples */}
              <div>
                <Label htmlFor="edit-examples">Exemples Pràctics</Label>
                <Textarea
                  id="edit-examples"
                  value={editForm.examples}
                  onChange={e => handleEditField("examples", e.target.value)}
                  className="mt-1 resize-none font-mono text-xs"
                  rows={5}
                  placeholder="Exemples pràctics (Markdown acceptat)"
                />
                {jsonWarnings.examples && (
                  <div className="flex items-center gap-2 mt-1 text-amber-600 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    El contingut sembla un JSON. Assegura't que és text pla (Markdown), no dades estructurades.
                  </div>
                )}
              </div>

              {/* Avís general si hi ha JSON */}
              {Object.values(jsonWarnings).some(Boolean) && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold">Avís: contingut JSON detectat</p>
                    <p className="mt-1">
                      Un o més camps contenen el que sembla ser dades JSON. Si deses, el contingut es mostrarà
                      com a text JSON en brut en lloc de text formatat. Utilitza text pla o Markdown en lloc de JSON.
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
              Cancel·lar
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
              Desar canvis
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
              Contingut JSON detectat
            </AlertDialogTitle>
            <AlertDialogDescription>
              Un o més camps semblen contenir dades JSON. Si continues, el contingut es mostrarà
              com a text JSON en brut als usuaris, en lloc de text formatat correctament.
              Estàs segur que vols desar igualment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setJsonConfirmOpen(false)}>
              Tornar a editar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setJsonConfirmOpen(false);
                doSave();
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Desar igualment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
