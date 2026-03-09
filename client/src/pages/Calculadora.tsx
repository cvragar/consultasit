import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, Home, Calculator, AlertCircle, Calendar, Info } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Calculadora() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<any>(null);

  const { data: searchResults } = trpc.itDurations.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 2 }
  );

  const calculateDuration = (diagnosis: any) => {
    return {
      min: diagnosis.minDays,
      max: diagnosis.maxDays,
      average: diagnosis.averageDays,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-3">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 px-2 shrink-0">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Inici</span>
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-5 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Calculator className="h-5 w-5 text-purple-600 shrink-0" />
              <h1 className="text-base sm:text-xl font-bold text-gray-900">Calculadora d'IT</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Info Card */}
          <Card className="mb-8 border-purple-200 bg-purple-50">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <CardTitle className="text-lg">Sobre la calculadora</CardTitle>
                  <CardDescription className="mt-2">
                    Aquesta eina proporciona temps orientatius d'IT basats en criteris de l'INSS i guies
                    clíniques. Els temps reals poden variar segons l'edat, ocupació i comorbiditats del pacient.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Search Diagnosis */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Cerca per diagnòstic</CardTitle>
              <CardDescription>
                Introdueix el nom de la patologia o el codi CIE-10
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="diagnosis">Diagnòstic o codi CIE-10</Label>
                  <Input
                    id="diagnosis"
                    placeholder="Ex: Hernia discal, lumbalgia, fractura..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {searchResults && searchResults.length > 0 && (
                  <div className="space-y-2">
                    <Label>Resultats de la cerca:</Label>
                    {searchResults.map((result) => (
                      <Button
                        key={result.id}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3"
                        onClick={() => setSelectedDiagnosis(result)}
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{result.diagnosis}</div>
                          {result.cie10Code && (
                            <div className="text-xs text-gray-600">CIE-10: {result.cie10Code}</div>
                          )}
                          {result.category && (
                            <div className="text-xs text-gray-600">Categoria: {result.category}</div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}

                {searchQuery.length > 2 && (!searchResults || searchResults.length === 0) && (
                  <div className="text-center py-6 text-gray-600">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No s'han trobat resultats per aquesta cerca</p>
                    <p className="text-sm mt-1">Prova amb un altre terme o consulta amb el xat d'IA</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {selectedDiagnosis && (
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Temps estimat d'IT
                </CardTitle>
                <CardDescription className="text-base font-semibold">
                  {selectedDiagnosis.diagnosis}
                </CardDescription>
                {selectedDiagnosis.cie10Code && (
                  <p className="text-sm text-gray-600">Codi CIE-10: {selectedDiagnosis.cie10Code}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedDiagnosis.minDays}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Dies mínims</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      {selectedDiagnosis.averageDays}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Dies mitjans</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">
                      {selectedDiagnosis.maxDays}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Dies màxims</div>
                  </div>
                </div>

                {selectedDiagnosis.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Notes clíniques:</h4>
                    <p className="text-sm text-gray-700">{selectedDiagnosis.notes}</p>
                  </div>
                )}

                {selectedDiagnosis.source && (
                  <div className="mt-4 text-sm text-gray-600">
                    <strong>Font:</strong> {selectedDiagnosis.source}
                  </div>
                )}

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <strong>Important:</strong> Aquests temps són orientatius. La durada real de la IT depèn
                      de l'evolució clínica del pacient, l'edat, l'ocupació i les comorbiditats. El metge
                      responsable ha de valorar cada cas individualment.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Guide Card */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle>Guia de durada de processos d'IT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Durada estàndard</h4>
                  <p className="text-sm text-gray-700">
                    La durada màxima d'una IT és de <strong>365 dies naturals</strong> des de la data de la baixa mèdica.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Primera pròrroga</h4>
                  <p className="text-sm text-gray-700">
                    Al complir-se els 365 dies, l'INSS pot prorrogar la IT per altres <strong>180 dies més</strong> (total: 545 dies / 18 mesos).
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Segona pròrroga excepcional</h4>
                  <p className="text-sm text-gray-700">
                    En casos excepcionals, es pot concedir una segona pròrroga de fins a <strong>185 dies més</strong> (total màxim: 730 dies / 24 mesos).
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <Link href="/chat">
                    <Button variant="outline" className="w-full">
                      Tens dubtes? Consulta amb la IA especialitzada
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
