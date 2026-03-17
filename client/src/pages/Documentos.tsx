import { useState, useMemo } from "react";
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

const typeLabels: Record<string, string> = {
  ley: "Llei",
  decreto: "Decret",
  guia: "Guia",
  manual: "Manual",
  pildora: "Píndola",
  otro: "Altre",
};

const typeColors: Record<string, string> = {
  ley: "bg-red-100 text-red-800",
  decreto: "bg-orange-100 text-orange-800",
  guia: "bg-blue-100 text-blue-800",
  manual: "bg-green-100 text-green-800",
  pildora: "bg-purple-100 text-purple-800",
  otro: "bg-gray-100 text-gray-800",
};

const jurisdictionLabels: Record<string, string> = {
  estatal: "Estatal",
  autonomica: "Autonòmica",
  ambas: "Estatal i Autonòmica",
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; badgeClass: string }> = {
  vigent: {
    label: "Vigent",
    color: "text-green-700",
    icon: CheckCircle2,
    badgeClass: "bg-green-100 text-green-800 border-green-200",
  },
  derogada: {
    label: "Derogada",
    color: "text-red-700",
    icon: XCircle,
    badgeClass: "bg-red-100 text-red-800 border-red-200",
  },
  en_revisio: {
    label: "En revisió",
    color: "text-amber-700",
    icon: AlertCircle,
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
};

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
        {status === "vigent" && "Normativa en vigor. Aplicable actualment."}
        {status === "derogada" && "Normativa derogada. No és d'aplicació actual."}
        {status === "en_revisio" && "Normativa parcialment modificada o pendent de revisió."}
      </TooltipContent>
    </Tooltip>
  );
}

export default function Documentos() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterJurisdiction, setFilterJurisdiction] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const exportPDF = trpc.documents.exportPDF.useMutation();
  const addFav = trpc.favorites.add.useMutation({ onSuccess: () => toast.success("Afegit als favorits") });
  const removeFav = trpc.favorites.remove.useMutation({ onSuccess: () => toast.success("Eliminat dels favorits") });
  const { data: favoriteIds, refetch: refetchFavs } = trpc.favorites.getIds.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isFavorite = (docId: number) =>
    favoriteIds?.some(f => f.entityType === "document" && f.entityId === docId) ?? false;

  const toggleFavorite = (docId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Has d'iniciar sessió per gestionar favorits");
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
      toast.error("Error en exportar el PDF");
    }
  };

  const { data: allDocuments } = trpc.documents.list.useQuery();

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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
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
                <Shield className="h-5 w-5 text-green-600 shrink-0" />
                <h1 className="text-base sm:text-xl font-bold truncate">Documentació Normativa</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isAuthenticated && (
                <Link href="/favorits">
                  <Button variant="ghost" size="sm" className="gap-1.5 px-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="hidden sm:inline">Favorits</span>
                  </Button>
                </Link>
              )}
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
                placeholder="Cercar per títol, contingut o font..."
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
              {activeFilterCount > 0 && (
                <Badge className="ml-1 bg-white text-primary h-5 w-5 p-0 flex items-center justify-center text-xs font-bold">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filtres avançats */}
          {showFilters && (
            <div className="bg-white border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtres avançats
                </h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 gap-1">
                    <X className="h-3 w-3" />
                    Netejar filtres
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Filtre per tipus */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Tipus
                  </label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Tots" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tots els tipus</SelectItem>
                      <SelectItem value="ley">Llei</SelectItem>
                      <SelectItem value="decreto">Decret</SelectItem>
                      <SelectItem value="guia">Guia</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="pildora">Píndola</SelectItem>
                      <SelectItem value="otro">Altre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtre per jurisdicció */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Jurisdicció
                  </label>
                  <Select value={filterJurisdiction} onValueChange={setFilterJurisdiction}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Totes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Totes</SelectItem>
                      <SelectItem value="estatal">Estatal</SelectItem>
                      <SelectItem value="autonomica">Autonòmica (Cat.)</SelectItem>
                      <SelectItem value="ambas">Estatal i Autonòmica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtre per any de publicació */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Any de publicació
                  </label>
                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Tots els anys" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tots els anys</SelectItem>
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
                    Vigència
                  </label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Tots els estats" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tots els estats</SelectItem>
                      <SelectItem value="vigent">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          Vigent
                        </span>
                      </SelectItem>
                      <SelectItem value="en_revisio">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                          En revisió
                        </span>
                      </SelectItem>
                      <SelectItem value="derogada">
                        <span className="flex items-center gap-1.5">
                          <XCircle className="h-3.5 w-3.5 text-red-600" />
                          Derogada
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
              <span>Mostrant {displayedDocuments.length} resultats</span>
              {searchQuery && <Badge variant="secondary">Cerca: "{searchQuery}"</Badge>}
              {filterType !== "all" && <Badge variant="secondary">{typeLabels[filterType]}</Badge>}
              {filterJurisdiction !== "all" && <Badge variant="secondary">{jurisdictionLabels[filterJurisdiction]}</Badge>}
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
            <p className="text-muted-foreground text-lg">No s'han trobat documents amb els filtres actuals</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Netejar filtres
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
                        {jurisdictionLabels[doc.jurisdiction]}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => handleExportPDF(doc.id, e)}
                        disabled={exportPDF.isPending}
                      >
                        {exportPDF.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3" />
                        )}
                      </Button>
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
                      {jurisdictionLabels[selectedDocument.jurisdiction]}
                    </Badge>
                    <StatusBadge status={selectedDocument.status} />
                    {selectedDocument.publicationYear && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Publicat: {selectedDocument.publicationYear}
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
                      {isFavorite(selectedDocument.id) ? "Treure de favorits" : "Afegir a favorits"}
                    </Button>
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
                      Exportar PDF
                    </Button>
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
                      <strong>Normativa derogada.</strong> Aquest document ja no és d'aplicació. Consulta la normativa vigent actualitzada.
                    </span>
                  </div>
                )}
                {selectedDocument.status === "en_revisio" && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      <strong>Normativa en revisió.</strong> Aquest document pot estar parcialment modificat. Verifica la versió actualitzada.
                    </span>
                  </div>
                )}
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {selectedDocument.summary && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-green-600" />
                      Resum
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
                  <Streamdown>{selectedDocument.content}</Streamdown>
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
                    Accedir al document original
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
