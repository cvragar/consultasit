import { useState, useMemo } from "react";
import { useSEO } from "@/hooks/useSEO";
import { useT } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Shield,
  Home,
  Search,
  FileText,
  BookOpen,
  Building2,
  ExternalLink,
  Download,
  Loader2,
  Star,
  Filter,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

// typeLabels es defineix dins del component per ser reactiu a l'idioma

const typeColors: Record<string, string> = {
  ley: "bg-red-100 text-red-800",
  decreto: "bg-orange-100 text-orange-800",
  guia: "bg-blue-100 text-blue-800",
  manual: "bg-green-100 text-green-800",
  pildora: "bg-purple-100 text-purple-800",
  otro: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
};

/**
 * Normalitza el contingut Markdown de la BD:
 * Alguns camps usen "; " com a separador de línies (artefacte de la inserció SQL).
 * Aquesta funció els converteix en salts de línia reals perquè Streamdown els renderitzi correctament.
 */
function normalitzeMd(text: string | null | undefined): string {
  if (!text) return "";
  if (text.includes("\n")) return text;
  return text.replace(/; /g, "\n");
}



type Document = {
  id: number;
  title: string;
  type: string;
  jurisdiction: string;
  source: string | null;
  content: string;
  summary: string | null;
  tags: string[] | null;
  url: string | null;
  publicationYear: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function Documentos() {
  const { isAuthenticated } = useAuth();
  const { t, language } = useT();

  useSEO({
    title: language === "ca"
      ? "Documentació i Normativa d'IT — Consultes IT"
      : "Documentación y Normativa de IT — Consultas IT",
    description: language === "ca"
      ? "Normativa actualitzada d'Incapacitat Temporal: RD 625/2014, LGSS, guïes de l'ICS, temps estàndard de l'INSS i més."
      : "Normativa actualizada de Incapacidad Temporal: RD 625/2014, LGSS, guías del ICS, tiempos estándar del INSS y más.",
    canonicalPath: "/documents",
  });

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; badgeClass: string }> = {
    vigent: {
      label: language === "ca" ? "Vigent" : "Vigente",
      color: "text-green-700",
      icon: CheckCircle2,
      badgeClass: "bg-green-100 text-green-800 border-green-200",
    },
    derogada: {
      label: language === "ca" ? "Derogada" : "Derogada",
      color: "text-red-700",
      icon: XCircle,
      badgeClass: "bg-red-100 text-red-800 border-red-200",
    },
    en_revisio: {
      label: language === "ca" ? "En revisió" : "En revisión",
      color: "text-amber-700",
      icon: AlertCircle,
      badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    },
  };

  function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status] ?? statusConfig.vigent;
    const Icon = cfg.icon;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.badgeClass} cursor-help`}
          >
            <Icon className="h-3 w-3" />
            {cfg.label}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {status === "vigent" && (language === "ca" ? "Normativa en vigor. Aplicable actualment." : "Normativa en vigor. Aplicable actualmente.")}
          {status === "derogada" && (language === "ca" ? "Normativa derogada. No és d'aplicació actual." : "Normativa derogada. No es de aplicación actual.")}
          {status === "en_revisio" && (language === "ca" ? "Normativa parcialment modificada o pendent de revisió." : "Normativa parcialmente modificada o pendiente de revisión.")}
        </TooltipContent>
      </Tooltip>
    );
  }

  const typeLabels: Record<string, string> = {
    ley: language === "ca" ? "Llei" : "Ley",
    decreto: language === "ca" ? "Decret" : "Decreto",
    guia: language === "ca" ? "Guia" : "Guía",
    manual: language === "ca" ? "Manual" : "Manual",
    pildora: language === "ca" ? "Píndola" : "Píldora",
    otro: language === "ca" ? "Altre" : "Otro",
  };

  const jurisdictionLabelsLocal: Record<string, string> = {
    estatal: language === "ca" ? "Estatal" : "Estatal",
    autonomica: language === "ca" ? "Autonòmica" : "Autonómica",
    ambas: language === "ca" ? "Estatal i Autonòmica" : "Estatal y Autonómica",
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterJurisdiction, setFilterJurisdiction] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const exportPDF = trpc.documents.exportPDF.useMutation();
  const addFav = trpc.favorites.add.useMutation({ onSuccess: () => toast.success(language === "ca" ? "Afegit als favorits" : "Añadido a favoritos") });
  const removeFav = trpc.favorites.remove.useMutation({ onSuccess: () => toast.success(language === "ca" ? "Eliminat dels favorits" : "Eliminado de favoritos") });
  const { data: favoriteIds, refetch: refetchFavs } = trpc.favorites.getIds.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isFavorite = (docId: number) =>
    favoriteIds?.some(f => f.entityType === "document" && f.entityId === docId) ?? false;

  const toggleFavorite = (docId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error(language === "ca" ? "Has d'iniciar sessió per gestionar favorits" : "Debes iniciar sesión para gestionar favoritos");
      return;
    }
    if (isFavorite(docId)) {
      removeFav.mutate({ entityType: "document", entityId: docId }, { onSuccess: () => refetchFavs() });
    } else {
      addFav.mutate({ entityType: "document", entityId: docId }, { onSuccess: () => refetchFavs() });
    }
  };

  const handleExportPDF = async (docId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const result = await exportPDF.mutateAsync({ id: docId });
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
      toast.error(language === "ca" ? "Error en exportar el PDF" : "Error al exportar el PDF");
    }
  };

  const { data: allDocuments } = trpc.documents.list.useQuery({ language });

  // Extreure anys únics per al selector
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    (allDocuments ?? []).forEach(d => {
      if ((d as Document).publicationYear) years.add((d as Document).publicationYear!);
    });
    return Array.from(years).sort((a, b) => b - a); // Ordre descendent
  }, [allDocuments]);

  // Filtrat local combinat
  const displayedDocuments = useMemo(() => {
    let docs = (allDocuments ?? []) as Document[];
    if (searchQuery.length > 1) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        (d.summary?.toLowerCase().includes(q)) ||
        (d.source?.toLowerCase().includes(q))
      );
    }
    if (filterType !== "all") {
      docs = docs.filter(d => d.type === filterType);
    }
    if (filterJurisdiction !== "all") {
      docs = docs.filter(d => d.jurisdiction === filterJurisdiction);
    }
    if (filterYear !== "all") {
      docs = docs.filter(d => d.publicationYear === parseInt(filterYear));
    }
    if (filterStatus !== "all") {
      docs = docs.filter(d => d.status === filterStatus);
    }
    return docs;
  }, [allDocuments, searchQuery, filterType, filterJurisdiction, filterYear, filterStatus]);

  const hasActiveFilters = filterType !== "all" || filterJurisdiction !== "all" || filterYear !== "all" || filterStatus !== "all";

  const clearFilters = () => {
    setFilterType("all");
    setFilterJurisdiction("all");
    setFilterYear("all");
    setFilterStatus("all");
    setSearchQuery("");
  };

  const activeFilterCount = [filterType, filterJurisdiction, filterYear, filterStatus].filter(f => f !== "all").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/90 backdrop-blur-sm sticky top-0 z-10 sticky-safe">
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
                <Shield className="h-5 w-5 text-green-600 shrink-0" />
                <h1 className="text-base sm:text-xl font-bold truncate">{language === "ca" ? "Documentació Normativa" : "Documentación Normativa"}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isAuthenticated && (
                <Link href="/favorits">
                  <Button variant="ghost" size="sm" className="gap-1.5 px-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="hidden sm:inline">{language === "ca" ? "Favorits" : "Favoritos"}</span>
                  </Button>
                </Link>
              )}
              <ThemeSwitcher />
              <LanguageSwitcher />
              <Badge variant="outline" className="text-xs">
                {displayedDocuments.length} docs
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
                placeholder={language === "ca" ? "Cercar per títol, contingut o font..." : "Buscar por título, contenido o fuente..."}
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
              {activeFilterCount > 0 && (
                <Badge className="ml-1 bg-background text-primary h-5 w-5 p-0 flex items-center justify-center text-xs font-bold">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filtres avançats */}
          {showFilters && (
            <div className="bg-card border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {language === "ca" ? "Filtres avançats" : "Filtros avanzados"}
                </h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 gap-1">
                    <X className="h-3 w-3" />
                    {language === "ca" ? "Netejar filtres" : "Limpiar filtros"}
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Filtre per tipus */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    {language === "ca" ? "Tipus" : "Tipo"}
                  </label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={language === "ca" ? "Tots" : "Todos"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === "ca" ? "Tots els tipus" : "Todos los tipos"}</SelectItem>
                      <SelectItem value="ley">{language === "ca" ? "Llei" : "Ley"}</SelectItem>
                      <SelectItem value="decreto">{language === "ca" ? "Decret" : "Decreto"}</SelectItem>
                      <SelectItem value="guia">{language === "ca" ? "Guia" : "Guía"}</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="pildora">{language === "ca" ? "Píndola" : "Píldora"}</SelectItem>
                      <SelectItem value="otro">{language === "ca" ? "Altre" : "Otro"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtre per jurisdicció */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    {language === "ca" ? "Jurisdicció" : "Jurisdicción"}
                  </label>
                  <Select value={filterJurisdiction} onValueChange={setFilterJurisdiction}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={language === "ca" ? "Totes" : "Todas"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === "ca" ? "Totes" : "Todas"}</SelectItem>
                      <SelectItem value="estatal">Estatal</SelectItem>
                      <SelectItem value="autonomica">{language === "ca" ? "Autonòmica (Cat.)" : "Autonómica (Cat.)"}</SelectItem>
                      <SelectItem value="ambas">{language === "ca" ? "Estatal i Autonòmica" : "Estatal y Autonómica"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtre per any de publicació */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {language === "ca" ? "Any de publicació" : "Año de publicación"}
                  </label>
                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={language === "ca" ? "Tots els anys" : "Todos los años"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === "ca" ? "Tots els anys" : "Todos los años"}</SelectItem>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtre per estat de vigència */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {language === "ca" ? "Vigència" : "Vigencia"}
                  </label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={language === "ca" ? "Tots els estats" : "Todos los estados"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === "ca" ? "Tots els estats" : "Todos los estados"}</SelectItem>
                      <SelectItem value="vigent">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          {language === "ca" ? "Vigent" : "Vigente"}
                        </span>
                      </SelectItem>
                      <SelectItem value="en_revisio">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                          {language === "ca" ? "En revisió" : "En revisión"}
                        </span>
                      </SelectItem>
                      <SelectItem value="derogada">
                        <span className="flex items-center gap-1.5">
                          <XCircle className="h-3.5 w-3.5 text-red-600" />
                          {language === "ca" ? "Derogada" : "Derogada"}
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Resum de filtres actius */}
          {(hasActiveFilters || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{language === "ca" ? "Mostrant" : "Mostrando"} {displayedDocuments.length} {language === "ca" ? "resultats" : "resultados"}</span>
              {searchQuery && <Badge variant="secondary">{language === "ca" ? "Cerca" : "Búsqueda"}: "{searchQuery}"</Badge>}
              {filterType !== "all" && <Badge variant="secondary">{typeLabels[filterType]}</Badge>}
              {filterJurisdiction !== "all" && <Badge variant="secondary">{jurisdictionLabelsLocal[filterJurisdiction]}</Badge>}
              {filterYear !== "all" && <Badge variant="secondary" className="flex items-center gap-1"><Calendar className="h-3 w-3" />{filterYear}</Badge>}
              {filterStatus !== "all" && (
                <Badge variant="secondary" className={`flex items-center gap-1 ${statusConfig[filterStatus]?.badgeClass}`}>
                  {filterStatus === "vigent" && <CheckCircle2 className="h-3 w-3" />}
                  {filterStatus === "derogada" && <XCircle className="h-3 w-3" />}
                  {filterStatus === "en_revisio" && <AlertCircle className="h-3 w-3" />}
                  {statusConfig[filterStatus]?.label}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Llista de documents */}
        {displayedDocuments.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">{language === "ca" ? "No s'han trobat documents amb els filtres actuals" : "No se han encontrado documentos con los filtros actuales"}</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              {language === "ca" ? "Netejar filtres" : "Limpiar filtros"}
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedDocuments.map((doc) => (
              <Card
                key={doc.id}
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 group border-l-4 ${
                  doc.status === "derogada"
                    ? "border-l-red-400 opacity-80"
                    : doc.status === "en_revisio"
                    ? "border-l-amber-400"
                    : "border-l-green-500"
                }`}
                onClick={() => { setSelectedDocument(doc); setDialogOpen(true); }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      <Badge className={`${typeColors[doc.type]} text-xs`}>
                        {typeLabels[doc.type] || doc.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {jurisdictionLabelsLocal[doc.jurisdiction]}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={(e) => toggleFavorite(doc.id, e)}
                    >
                      <Star
                        className={`h-4 w-4 transition-colors ${
                          isFavorite(doc.id)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground group-hover:text-yellow-400"
                        }`}
                      />
                    </Button>
                  </div>
                  <CardTitle className="text-sm font-semibold line-clamp-2 mt-2 group-hover:text-green-700 transition-colors">
                    {doc.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {doc.summary && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{doc.summary}</p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      {/* Indicador de vigència */}
                      <StatusBadge status={doc.status} />
                      {/* Any de publicació */}
                      {doc.publicationYear && (
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Calendar className="h-3 w-3" />
                          {doc.publicationYear}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {doc.source && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1 hidden sm:flex">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate max-w-[80px]">{doc.source}</span>
                        </span>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 border-gray-200 text-gray-600 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50"
                              onClick={(e) => handleExportPDF(doc.id, e)}
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Diàleg de document */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedDocument && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={typeColors[selectedDocument.type]}>
                      {typeLabels[selectedDocument.type] || selectedDocument.type}
                    </Badge>
                    <Badge variant="outline">
                      {jurisdictionLabelsLocal[selectedDocument.jurisdiction]}
                    </Badge>
                    <StatusBadge status={selectedDocument.status} />
                      {selectedDocument.publicationYear && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {language === "ca" ? "Publicat" : "Publicado"}: {selectedDocument.publicationYear}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => toggleFavorite(selectedDocument.id, e)}
                      className="gap-2"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          isFavorite(selectedDocument.id)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                      {isFavorite(selectedDocument.id) ? (language === "ca" ? "Treure de favorits" : "Quitar de favoritos") : (language === "ca" ? "Afegir a favorits" : "Añadir a favoritos")}
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleExportPDF(selectedDocument.id, e)}
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
                <DialogTitle className="text-2xl">{selectedDocument.title}</DialogTitle>
                {selectedDocument.source && (
                  <DialogDescription className="text-base flex items-center gap-2 mt-2">
                    <Building2 className="h-4 w-4" />
                    {selectedDocument.source}
                  </DialogDescription>
                )}
                {selectedDocument.status === "derogada" && (
                  <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      {language === "ca" ? <><strong>Normativa derogada.</strong> Aquest document ja no és d'aplicació. Consulta la normativa vigent actualitzada.</> : <><strong>Normativa derogada.</strong> Este documento ya no es de aplicación. Consulta la normativa vigente actualizada.</>}
                    </span>
                  </div>
                )}
                {selectedDocument.status === "en_revisio" && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      {language === "ca" ? <><strong>Normativa en revisió.</strong> Aquest document pot estar parcialment modificat. Verifica la versió actualitzada.</> : <><strong>Normativa en revisión.</strong> Este documento puede estar parcialmente modificado. Verifica la versión actualizada.</>}
                    </span>
                  </div>
                )}
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {selectedDocument.summary && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-green-600" />
                      {language === "ca" ? "Resum" : "Resumen"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{selectedDocument.summary}</p>
                  </div>
                )}

                {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="prose prose-sm max-w-none">
                  <Streamdown>{normalitzeMd(selectedDocument.content)}</Streamdown>
                </div>

                {selectedDocument.url && (
                  <a
                    href={selectedDocument.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {language === "ca" ? "Accedir al document original" : "Acceder al documento original"}
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
