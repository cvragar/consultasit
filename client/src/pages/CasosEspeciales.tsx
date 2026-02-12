import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Home, Search, AlertCircle, BookOpen, Scale, FileText, ChevronRight, Download, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const categoryLabels: Record<string, string> = {
  menstruacion: "Menstruació",
  embarazo: "Embaràs",
  lactancia: "Lactància",
  donacion_organos: "Donació d'òrgans",
  baja_retroactiva: "Baixa retroactiva",
  pluriempleo: "Pluriocupació",
  prision: "Presó",
  extranjeros: "Estrangers",
  vacaciones: "Vacances",
  recaida: "Recaiguda",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<SpecialCase | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const exportPDF = trpc.specialCases.exportPDF.useMutation();

  const handleExportPDF = async (caseId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const result = await exportPDF.mutateAsync({ id: caseId });
      
      // Convertir base64 a blob y descargar
      const byteCharacters = atob(result.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  const { data: allCases } = trpc.specialCases.list.useQuery();
  const { data: searchResults } = trpc.specialCases.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 2 }
  );

  const displayedCases = searchQuery.length > 2
    ? searchResults
    : selectedCategory
    ? allCases?.filter((c) => c.category === selectedCategory)
    : allCases;

  const categories = Array.from(new Set(allCases?.map((c) => c.category) || []));

  const handleCaseClick = (caso: SpecialCase) => {
    setSelectedCase(caso);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Inici
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <h1 className="text-xl font-bold text-gray-900">Casos Especials d'IT</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cerca casos especials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Tots
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {categoryLabels[cat] || cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCases?.map((caso) => (
            <Card
              key={caso.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCaseClick(caso)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={categoryColors[caso.category]}>
                    {categoryLabels[caso.category] || caso.category}
                  </Badge>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <CardTitle className="text-lg">{caso.title}</CardTitle>
                <CardDescription className="line-clamp-3">{caso.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  Fes clic per veure els detalls complets
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayedCases?.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No s'han trobat casos</h3>
            <p className="text-gray-600">Prova amb una altra cerca o categoria</p>
          </div>
        )}
      </div>

      {/* Dialog for Case Details */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedCase && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-3">
                  <Badge className={categoryColors[selectedCase.category]}>
                    {categoryLabels[selectedCase.category] || selectedCase.category}
                  </Badge>
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
                <DialogTitle className="text-2xl">{selectedCase.title}</DialogTitle>
                <DialogDescription className="text-base mt-2">
                  {selectedCase.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {selectedCase.legalBasis && (
                  <div>
                    <div className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-2">
                      <Scale className="h-5 w-5 text-orange-600" />
                      Base legal
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedCase.legalBasis}
                    </p>
                  </div>
                )}

                {selectedCase.procedure && (
                  <div>
                    <div className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      Procediment
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedCase.procedure}
                    </p>
                  </div>
                )}

                {selectedCase.examples && (
                  <div>
                    <div className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-2">
                      <BookOpen className="h-5 w-5 text-orange-600" />
                      Exemples
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedCase.examples}
                    </p>
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
