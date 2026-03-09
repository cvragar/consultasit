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
  createdAt: Date;
  updatedAt: Date;
};

export default function Documentos() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterJurisdiction, setFilterJurisdiction] = useState<string>("all");
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

  // Filtrat local combinat
  const displayedDocuments = useMemo(() => {
    let docs = allDocuments ?? [];
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
    return docs;
  }, [allDocuments, searchQuery, filterType, filterJurisdiction]);

  const hasActiveFilters = filterType !== "all" || filterJurisdiction !== "all";

  const clearFilters = () => {
    setFilterType("all");
    setFilterJurisdiction("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />
                  Inici
                </Button>
              </Link>
              <span className="text-muted-foreground">/</span>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <h1 className="text-xl font-bold">Documentació Normativa</h1>
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
                {displayedDocuments.length} documents
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
              {hasActiveFilters && (
                <Badge className="ml-1 bg-white text-primary h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Tipus de document
                  </label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tots els tipus" />
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
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Jurisdicció
                  </label>
                  <Select value={filterJurisdiction} onValueChange={setFilterJurisdiction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Totes les jurisdiccions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Totes les jurisdiccions</SelectItem>
                      <SelectItem value="estatal">Estatal</SelectItem>
                      <SelectItem value="autonomica">Autonòmica (Catalunya)</SelectItem>
                      <SelectItem value="ambas">Estatal i Autonòmica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Resum de filtres actius */}
          {(hasActiveFilters || searchQuery) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Mostrant {displayedDocuments.length} resultats</span>
              {searchQuery && <Badge variant="secondary">Cerca: "{searchQuery}"</Badge>}
              {filterType !== "all" && <Badge variant="secondary">{typeLabels[filterType]}</Badge>}
              {filterJurisdiction !== "all" && <Badge variant="secondary">{jurisdictionLabels[filterJurisdiction]}</Badge>}
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
                className="cursor-pointer hover:shadow-lg transition-all duration-200 group border-l-4 border-l-green-500"
                onClick={() => { setSelectedDocument(doc as Document); setDialogOpen(true); }}
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
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{doc.summary}</p>
                  )}
                  <div className="flex items-center justify-between">
                    {doc.source && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {doc.source}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 ml-auto"
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
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={typeColors[selectedDocument.type]}>
                      {typeLabels[selectedDocument.type] || selectedDocument.type}
                    </Badge>
                    <Badge variant="outline">
                      {jurisdictionLabels[selectedDocument.jurisdiction]}
                    </Badge>
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
