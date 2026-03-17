import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "lucide-react";
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

export default function CasosEspeciales() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<SpecialCase | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const exportPDF = trpc.specialCases.exportPDF.useMutation();
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
    return cases;
  }, [allCases, searchQuery, selectedCategory]);

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
  const hasActiveFilters = selectedCategory !== "all";

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
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
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className={selectedCategory === cat ? "" : ""}
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
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 group border-l-4 border-l-orange-500"
                      onClick={() => { setSelectedCase(caso as SpecialCase); setDialogOpen(true); }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-orange-700 transition-colors flex-1">
                            {caso.title}
                          </CardTitle>
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
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                          {caso.description}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => handleExportPDF(caso.id, e)}
                            disabled={exportPDF.isPending}
                          >
                            {exportPDF.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Download className="h-3 w-3" />
                            )}
                          </Button>
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

      {/* Diàleg de cas especial */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedCase && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-3">
                  <Badge className={categoryColors[selectedCase.category]}>
                    {categoryLabels[selectedCase.category] || selectedCase.category}
                  </Badge>
                  <div className="flex gap-2">
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
                <DialogTitle className="text-2xl">{selectedCase.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">{selectedCase.description}</p>
                </div>

                {selectedCase.legalBasis && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-blue-600" />
                      Base Legal
                    </h3>
                    <div className="prose prose-sm max-w-none bg-blue-50 rounded-lg p-4">
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
                    <div className="prose prose-sm max-w-none bg-green-50 rounded-lg p-4">
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
                    <div className="prose prose-sm max-w-none bg-purple-50 rounded-lg p-4">
                      <Streamdown>{selectedCase.examples}</Streamdown>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
