import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Star,
  Home,
  FileText,
  AlertCircle,
  Building2,
  ExternalLink,
  Trash2,
  Download,
  Loader2,
  BookOpen,
  Shield,
} from "lucide-react";
import { Link } from "wouter";
import { Streamdown } from "streamdown";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

const typeColors: Record<string, string> = {
  ley: "bg-blue-100 text-blue-800",
  decreto: "bg-purple-100 text-purple-800",
  guia: "bg-green-100 text-green-800",
  manual: "bg-orange-100 text-orange-800",
  pildora: "bg-pink-100 text-pink-800",
  otro: "bg-gray-100 text-gray-800",
};

const typeLabels: Record<string, string> = {
  ley: "Llei",
  decreto: "Decret",
  guia: "Guia",
  manual: "Manual",
  pildora: "Píndola",
  otro: "Altre",
};

const categoryLabels: Record<string, string> = {
  menstruacion: "Menstruació incapacitant",
  embarazo: "Embaràs",
  lactancia: "Lactància",
  donacion_organos: "Donació d'òrgans",
  baja_retroactiva: "Baixa retroactiva",
  pluriempleo: "Pluriocupació",
  prision: "Presó",
  extranjeros: "Estrangers",
  vacaciones: "Vacances i IT",
  recaida: "Recaiguda",
  otro: "Altre",
};

const categoryColors: Record<string, string> = {
  menstruacion: "bg-pink-100 text-pink-800",
  embarazo: "bg-purple-100 text-purple-800",
  lactancia: "bg-blue-100 text-blue-800",
  donacion_organos: "bg-red-100 text-red-800",
  baja_retroactiva: "bg-orange-100 text-orange-800",
  pluriempleo: "bg-yellow-100 text-yellow-800",
  prision: "bg-gray-100 text-gray-800",
  extranjeros: "bg-green-100 text-green-800",
  vacaciones: "bg-teal-100 text-teal-800",
  recaida: "bg-indigo-100 text-indigo-800",
  otro: "bg-gray-100 text-gray-800",
};

type Document = {
  id: number;
  title: string;
  type: string;
  source: string | null;
  jurisdiction: string;
  content: string;
  summary: string | null;
  url: string | null;
  tags: string[] | null;
  createdAt: Date;
  updatedAt: Date;
};

type SpecialCase = {
  id: number;
  title: string;
  category: string;
  description: string;
  legalBasis: string | null;
  procedure: string | null;
  examples: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function Favorits() {
  const { isAuthenticated } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [selectedCase, setSelectedCase] = useState<SpecialCase | null>(null);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [caseDialogOpen, setCaseDialogOpen] = useState(false);

  const { data: favorites, refetch } = trpc.favorites.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const removeFav = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Eliminat dels favorits");
    },
  });

  const exportDocPDF = trpc.documents.exportPDF.useMutation();
  const exportCasePDF = trpc.specialCases.exportPDF.useMutation();

  const handleRemoveDoc = (docId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFav.mutate({ entityType: "document", entityId: docId });
  };

  const handleRemoveCase = (caseId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFav.mutate({ entityType: "special_case", entityId: caseId });
  };

  const handleExportDocPDF = async (docId: number, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await exportDocPDF.mutateAsync({ id: docId });
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

  const handleExportCasePDF = async (caseId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await exportCasePDF.mutateAsync({ id: caseId });
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Inicia sessió per veure els teus favorits</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Necessites estar autenticat per gestionar els teus favorits.
            </p>
            <Button asChild>
              <a href={getLoginUrl()}>Iniciar sessió</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const favDocs = (favorites?.documents ?? []) as Document[];
  const favCases = (favorites?.cases ?? []) as SpecialCase[];
  const totalFavs = favDocs.length + favCases.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
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
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <h1 className="text-xl font-bold">Els meus Favorits</h1>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {totalFavs} {totalFavs === 1 ? "element" : "elements"}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {totalFavs === 0 ? (
          <div className="text-center py-20">
            <Star className="h-16 w-16 text-yellow-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
              Encara no tens favorits
            </h2>
            <p className="text-muted-foreground mb-8">
              Marca documents i casos especials com a favorits per accedir-hi ràpidament des d'aquí.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/documentos">
                  <FileText className="h-4 w-4 mr-2" />
                  Explorar documents
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/casos-especiales">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Explorar casos especials
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                Tots ({totalFavs})
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                Documents ({favDocs.length})
              </TabsTrigger>
              <TabsTrigger value="cases">
                <AlertCircle className="h-4 w-4 mr-2" />
                Casos especials ({favCases.length})
              </TabsTrigger>
            </TabsList>

            {/* Tots */}
            <TabsContent value="all">
              <div className="space-y-6">
                {favDocs.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      Documents ({favDocs.length})
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favDocs.map(doc => (
                        <FavoriteDocCard
                          key={doc.id}
                          doc={doc}
                          onOpen={() => { setSelectedDoc(doc); setDocDialogOpen(true); }}
                          onRemove={(e) => handleRemoveDoc(doc.id, e)}
                          onExport={(e) => handleExportDocPDF(doc.id, doc.title, e)}
                          isExporting={exportDocPDF.isPending}
                        />
                      ))}
                    </div>
                  </section>
                )}
                {favCases.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      Casos especials ({favCases.length})
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favCases.map(c => (
                        <FavoriteCaseCard
                          key={c.id}
                          caso={c}
                          onOpen={() => { setSelectedCase(c); setCaseDialogOpen(true); }}
                          onRemove={(e) => handleRemoveCase(c.id, e)}
                          onExport={(e) => handleExportCasePDF(c.id, e)}
                          isExporting={exportCasePDF.isPending}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </TabsContent>

            {/* Documents */}
            <TabsContent value="documents">
              {favDocs.length === 0 ? (
                <EmptyState type="documents" />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favDocs.map(doc => (
                    <FavoriteDocCard
                      key={doc.id}
                      doc={doc}
                      onOpen={() => { setSelectedDoc(doc); setDocDialogOpen(true); }}
                      onRemove={(e) => handleRemoveDoc(doc.id, e)}
                      onExport={(e) => handleExportDocPDF(doc.id, doc.title, e)}
                      isExporting={exportDocPDF.isPending}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Casos */}
            <TabsContent value="cases">
              {favCases.length === 0 ? (
                <EmptyState type="cases" />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favCases.map(c => (
                    <FavoriteCaseCard
                      key={c.id}
                      caso={c}
                      onOpen={() => { setSelectedCase(c); setCaseDialogOpen(true); }}
                      onRemove={(e) => handleRemoveCase(c.id, e)}
                      onExport={(e) => handleExportCasePDF(c.id, e)}
                      isExporting={exportCasePDF.isPending}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Diàleg document */}
      <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedDoc && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={typeColors[selectedDoc.type]}>
                      {typeLabels[selectedDoc.type] || selectedDoc.type}
                    </Badge>
                    <Badge variant="outline">{selectedDoc.jurisdiction}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleRemoveDoc(selectedDoc.id, e)}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      Treure de favorits
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleExportDocPDF(selectedDoc.id, selectedDoc.title, e)}
                      disabled={exportDocPDF.isPending}
                      className="gap-2"
                    >
                      {exportDocPDF.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      PDF
                    </Button>
                  </div>
                </div>
                <DialogTitle className="text-2xl">{selectedDoc.title}</DialogTitle>
                {selectedDoc.source && (
                  <DialogDescription className="text-base flex items-center gap-2 mt-2">
                    <Building2 className="h-4 w-4" />
                    {selectedDoc.source}
                  </DialogDescription>
                )}
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {selectedDoc.summary && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-yellow-600" />
                      Resum
                    </h3>
                    <p className="text-sm text-muted-foreground">{selectedDoc.summary}</p>
                  </div>
                )}
                <div className="prose prose-sm max-w-none">
                  <Streamdown>{selectedDoc.content}</Streamdown>
                </div>
                {selectedDoc.url && (
                  <a href={selectedDoc.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <ExternalLink className="h-4 w-4" />
                    Accedir al document original
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diàleg cas especial */}
      <Dialog open={caseDialogOpen} onOpenChange={setCaseDialogOpen}>
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
                      onClick={(e) => handleRemoveCase(selectedCase.id, e)}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      Treure de favorits
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleExportCasePDF(selectedCase.id, e)}
                      disabled={exportCasePDF.isPending}
                      className="gap-2"
                    >
                      {exportCasePDF.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      PDF
                    </Button>
                  </div>
                </div>
                <DialogTitle className="text-2xl">{selectedCase.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm">{selectedCase.description}</p>
                </div>
                {selectedCase.legalBasis && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Base legal
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      <Streamdown>{selectedCase.legalBasis}</Streamdown>
                    </div>
                  </div>
                )}
                {selectedCase.procedure && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      Procediment
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      <Streamdown>{selectedCase.procedure}</Streamdown>
                    </div>
                  </div>
                )}
                {selectedCase.examples && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                      Exemples pràctics
                    </h3>
                    <div className="prose prose-sm max-w-none">
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

function FavoriteDocCard({ doc, onOpen, onRemove, onExport, isExporting }: {
  doc: Document;
  onOpen: () => void;
  onRemove: (e: React.MouseEvent) => void;
  onExport: (e: React.MouseEvent) => void;
  isExporting: boolean;
}) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-green-500"
      onClick={onOpen}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Badge className={`${typeColors[doc.type]} text-xs`}>
            {typeLabels[doc.type] || doc.type}
          </Badge>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onExport}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:text-red-600"
              onClick={onRemove}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <CardTitle className="text-sm font-semibold line-clamp-2 mt-1">{doc.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {doc.summary && (
          <p className="text-xs text-muted-foreground line-clamp-2">{doc.summary}</p>
        )}
        {doc.source && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {doc.source}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function FavoriteCaseCard({ caso, onOpen, onRemove, onExport, isExporting }: {
  caso: SpecialCase;
  onOpen: () => void;
  onRemove: (e: React.MouseEvent) => void;
  onExport: (e: React.MouseEvent) => void;
  isExporting: boolean;
}) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-orange-500"
      onClick={onOpen}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Badge className={`${categoryColors[caso.category]} text-xs`}>
            {categoryLabels[caso.category] || caso.category}
          </Badge>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onExport}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:text-red-600"
              onClick={onRemove}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <CardTitle className="text-sm font-semibold line-clamp-2 mt-1">{caso.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground line-clamp-3">{caso.description}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ type }: { type: "documents" | "cases" }) {
  return (
    <div className="text-center py-12">
      <Star className="h-12 w-12 text-yellow-300 mx-auto mb-3" />
      <p className="text-muted-foreground">
        {type === "documents"
          ? "No tens cap document als favorits"
          : "No tens cap cas especial als favorits"}
      </p>
      <Button asChild variant="outline" className="mt-4">
        <Link href={type === "documents" ? "/documentos" : "/casos-especiales"}>
          {type === "documents" ? "Explorar documents" : "Explorar casos especials"}
        </Link>
      </Button>
    </div>
  );
}
