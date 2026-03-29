import { useT } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useState, useMemo } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Home, Calculator, AlertCircle, Calendar, Info, ChevronDown, ChevronUp, Briefcase } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

// Grups d'ocupació CNO-11 (17 grups EPA/INE)
const OCCUPATION_GROUPS = [
  { id: "G1",  label: "Directors i gerents", cnoCodes: "CNO 11-15" },
  { id: "G2",  label: "Tècnics professionals científics (salut/ensenyament)", cnoCodes: "CNO 21-23" },
  { id: "G3",  label: "Altres tècnics professionals científics", cnoCodes: "CNO 24-29" },
  { id: "G4",  label: "Tècnics i professionals de suport", cnoCodes: "CNO 31-38" },
  { id: "G5",  label: "Empleats d'oficina (sense atenció al públic)", cnoCodes: "CNO 41-43" },
  { id: "G6",  label: "Empleats d'oficina (amb atenció al públic)", cnoCodes: "CNO 44-45" },
  { id: "G7",  label: "Treballadors serveis restauració i comerç", cnoCodes: "CNO 50-55" },
  { id: "G8",  label: "Treballadors serveis salut i cura de persones", cnoCodes: "CNO 56-58" },
  { id: "G9",  label: "Treballadors serveis protecció i seguretat", cnoCodes: "CNO 59" },
  { id: "G10", label: "Treballadors qualificats sector agrícola/forestal", cnoCodes: "CNO 61-64" },
  { id: "G11", label: "Treballadors qualificats de la construcció", cnoCodes: "CNO 71-72" },
  { id: "G12", label: "Treballadors qualificats indústries manufactureres", cnoCodes: "CNO 73-78" },
  { id: "G13", label: "Operadors instal·lacions i maquinària fixes", cnoCodes: "CNO 81-82" },
  { id: "G14", label: "Conductors i operadors maquinària mòbil", cnoCodes: "CNO 83-84" },
  { id: "G15", label: "Treballadors no qualificats en serveis", cnoCodes: "CNO 91-94" },
  { id: "G16", label: "Peons agricultura, pesca, construcció, indústria", cnoCodes: "CNO 95-98" },
  { id: "G17", label: "Ocupacions militars", cnoCodes: "CNO 00" },
];

function getFactorForGroup(occupationAdjustment: any[], groupId: string): number | null {
  if (!occupationAdjustment || !Array.isArray(occupationAdjustment)) return null;
  const entry = occupationAdjustment.find((o: any) => o.cnoGroup === groupId);
  return entry ? entry.factor : null;
}

function getFactorLabel(factor: number): { label: string; color: string } {
  if (factor < 0.80) return { label: "Molt inferior a la mitjana", color: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300" };
  if (factor < 0.95) return { label: "Inferior a la mitjana", color: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300" };
  if (factor <= 1.05) return { label: "En la mitjana", color: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200" };
  if (factor <= 1.15) return { label: "Superior a la mitjana", color: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300" };
  return { label: "Molt superior a la mitjana", color: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300" };
}

export default function Calculadora() {
  const { t, language } = useT();

  useSEO({
    title: language === "ca"
      ? "Calculadora d'IT — Durada i Temps Estàndard — Consultes IT"
      : "Calculadora de IT — Duración y Tiempos Estándar — Consultas IT",
    description: language === "ca"
      ? "Calcula la durada estimada d'una Incapacitat Temporal segons el diagnòstic i l'ocupació. Basada en la Taula 15 del Manual de Temps Òptims de l'INSS."
      : "Calcula la duración estimada de una Incapacidad Temporal según el diagnóstico y la ocupación. Basada en la Tabla 15 del Manual de Tiempos Óptimos del INSS.",
    canonicalPath: "/calculadora",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<any>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [showAllFactors, setShowAllFactors] = useState(false);

  const { data: searchResults } = trpc.itDurations.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 2 }
  );

  // Calcular dies ajustats per ocupació
  const adjustedDays = useMemo(() => {
    if (!selectedDiagnosis || !selectedGroupId) return null;
    const factor = getFactorForGroup(selectedDiagnosis.occupationAdjustment, selectedGroupId);
    if (!factor) return null;
    return {
      factor,
      min: Math.round(selectedDiagnosis.minDays * factor),
      average: Math.round(selectedDiagnosis.averageDays * factor),
      max: Math.round(selectedDiagnosis.maxDays * factor),
    };
  }, [selectedDiagnosis, selectedGroupId]);

  const selectedGroup = OCCUPATION_GROUPS.find(g => g.id === selectedGroupId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-3">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 px-2 shrink-0">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">{language === "ca" ? "Inici" : "Inicio"}</span>
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-5 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Calculator className="h-5 w-5 text-purple-600 shrink-0" />
              <h1 className="text-base sm:text-xl font-bold text-foreground">{language === "ca" ? "Calculadora d'IT" : "Calculadora de IT"}</h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Info Card */}
            <Card className="mb-8 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <CardTitle className="text-lg">{language === "ca" ? "Sobre la calculadora" : "Sobre la calculadora"}</CardTitle>
                  <CardDescription className="mt-2">
                    {language === "ca" ? (
                      <>Temps estàndard basats en el <strong>Manual de Tiempos Óptimos de IT (INSS, 4a edició)</strong>. Inclou factors de correcció per <strong>grup d'ocupació CNO-11</strong> extrets de la Taula 15 del manual. Els temps reals poden variar segóns l'edat, comorbiditats i evolució clínica.</>
                    ) : (
                      <>Tiempos estándar basados en el <strong>Manual de Tiempos Óptimos de IT (INSS, 4a edición)</strong>. Incluye factores de corrección por <strong>grupo de ocupación CNO-11</strong> extraídos de la Tabla 15 del manual. Los tiempos reales pueden variar según la edad, comorbilidades y evolución clínica.</>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Search Diagnosis */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{language === "ca" ? "1. Cerca per diagnòstic" : "1. Buscar por diagnóstico"}</CardTitle>
              <CardDescription>
                {language === "ca" ? "Introdueix el nom de la patologia o el codi CIE-10 (mínim 3 caràcters)" : "Introduce el nombre de la patología o el código CIE-10 (mínimo 3 caracteres)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="diagnosis">{language === "ca" ? "Diagnòstic o codi CIE-10" : "Diagnóstico o código CIE-10"}</Label>
                  <Input
                    id="diagnosis"
                    placeholder={language === "ca" ? "Ex: lumbalgia, hèrnia discal, depressió, neoplàsia mama..." : "Ej: lumbalgia, hernia discal, depresión, neoplasia mama..."}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedDiagnosis(null);
                      setSelectedGroupId("");
                    }}
                    className="mt-1"
                  />
                </div>

                {searchResults && searchResults.length > 0 && (
                  <div className="space-y-2">
                    <Label>{language === "ca" ? `Resultats (${searchResults.length}):` : `Resultados (${searchResults.length}):`}</Label>
                    <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                            selectedDiagnosis?.id === result.id
                              ? "border-purple-400 bg-purple-50 dark:bg-purple-950/40 dark:border-purple-700"
                              : "border-border bg-card hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/30"
                          }`}
                          onClick={() => {
                            setSelectedDiagnosis(result);
                            setSelectedGroupId("");
                          }}
                        >
                          <div className="font-semibold text-foreground text-sm">{result.diagnosis}</div>
                          <div className="flex gap-3 mt-1">
                            {result.cie10Code && (
                              <span className="text-xs text-muted-foreground">CIE-10: <strong>{result.cie10Code}</strong></span>
                            )}
                            {result.category && (
                              <span className="text-xs text-muted-foreground">{result.category}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchQuery.length > 2 && (!searchResults || searchResults.length === 0) && (
                  <div className="text-center py-6 text-gray-600">
                    <AlertCircle className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium">{language === "ca" ? "No s'han trobat resultats" : "No se han encontrado resultados"}</p>
                    <p className="text-sm mt-1">{language === "ca" ? "Prova amb un altre terme o consulta amb el xat d'IA" : "Prueba con otro término o consulta con el chat de IA"}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Occupation Selector */}
          {selectedDiagnosis && (
            <Card className="mb-6 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  {language === "ca" ? "2. Grup d'ocupació del pacient (opcional)" : "2. Grupo de ocupación del paciente (opcional)"}
                </CardTitle>
                <CardDescription>
                  {language === "ca" ? "Selecciona el grup CNO-11 per aplicar el factor de correcció de l'INSS" : "Selecciona el grupo CNO-11 para aplicar el factor de corrección del INSS"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "ca" ? "Selecciona el grup d'ocupació..." : "Selecciona el grupo de ocupación..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCUPATION_GROUPS.map((g) => {
                      const factor = getFactorForGroup(selectedDiagnosis.occupationAdjustment, g.id);
                      return (
                        <SelectItem key={g.id} value={g.id}>
                          <span className="flex items-center gap-2">
                            <span>{g.label}</span>
                            {factor && (
                              <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                                factor < 0.95 ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" :
                                factor > 1.05 ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300" :
                                "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                              }`}>
                                ×{factor.toFixed(2)}
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedGroupId && (
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedGroup?.cnoCodes} · Factor: ×{adjustedDays?.factor.toFixed(2)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {selectedDiagnosis && (
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  {language === "ca" ? "Temps estimat d'IT" : "Tiempo estimado de IT"}
                </CardTitle>
                <div className="space-y-1">
                  <CardDescription className="text-base font-semibold text-foreground">
                    {selectedDiagnosis.diagnosis}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedDiagnosis.cie10Code && (
                      <Badge variant="outline" className="text-xs font-mono">
                        CIE-10: {selectedDiagnosis.cie10Code}
                      </Badge>
                    )}
                    {selectedDiagnosis.category && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedDiagnosis.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dies base (INSS) */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-purple-500" />
                    {language === "ca" ? "Temps estàndard INSS (sense ajust per ocupació)" : "Tiempos estándar INSS (sin ajuste por ocupación)"}
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{selectedDiagnosis.minDays}</div>
                      <div className="text-xs text-muted-foreground mt-1">{language === "ca" ? "Dies mínims" : "Días mínimos"}</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/40 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{selectedDiagnosis.averageDays}</div>
                      <div className="text-xs text-muted-foreground mt-1">{language === "ca" ? "Dies estàndard" : "Días estándar"}</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/40 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{selectedDiagnosis.maxDays}</div>
                      <div className="text-xs text-muted-foreground mt-1">{language === "ca" ? "Dies màxims" : "Días máximos"}</div>
                    </div>
                  </div>
                </div>

                {/* Dies ajustats per ocupació */}
                {adjustedDays && selectedGroup && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-blue-500" />
                        {language === "ca" ? "Temps ajustat per ocupació" : "Tiempo ajustado por ocupación"}: {selectedGroup.label}
                        <Badge className={`ml-1 text-xs font-mono ${getFactorLabel(adjustedDays.factor).color}`}>
                          ×{adjustedDays.factor.toFixed(2)} — {getFactorLabel(adjustedDays.factor).label}
                        </Badge>
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-100 dark:bg-blue-950/40 rounded-lg">
                          <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{adjustedDays.min}</div>
                          <div className="text-xs text-muted-foreground mt-1">{language === "ca" ? "Dies mínims" : "Días mínimos"}</div>
                          </div>
                          <div className="text-center p-4 bg-purple-100 dark:bg-purple-950/40 rounded-lg border-2 border-purple-300 dark:border-purple-800">
                          <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">{adjustedDays.average}</div>
                          <div className="text-xs text-muted-foreground mt-1">{language === "ca" ? "Dies estàndard" : "Días estándar"}</div>
                          </div>
                          <div className="text-center p-4 bg-orange-100 dark:bg-orange-950/40 rounded-lg">
                          <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">{adjustedDays.max}</div>
                          <div className="text-xs text-muted-foreground mt-1">{language === "ca" ? "Dies màxims" : "Días máximos"}</div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        {language === "ca" ? "Font" : "Fuente"}: Taula 15 del Manual de Tiempos Óptimos de IT (INSS, 4a edició) · {selectedGroup.cnoCodes}
                      </p>
                    </div>
                  </>
                )}

                {/* Taula de tots els factors per ocupació */}
                {selectedDiagnosis.occupationAdjustment && Array.isArray(selectedDiagnosis.occupationAdjustment) && (
                  <>
                    <Separator />
                    <div>
                      <button
                        className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-purple-600 transition-colors w-full"
                        onClick={() => setShowAllFactors(!showAllFactors)}
                      >
                        <Briefcase className="h-4 w-4" />
                        {language === "ca" ? "Factors de correcció per tots els grups d'ocupació (CNO-11)" : "Factores de corrección para todos los grupos de ocupación (CNO-11)"}
                        {showAllFactors ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
                      </button>
                      {showAllFactors && (
                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="text-left px-3 py-2 border border-border font-semibold">{language === "ca" ? "Grup d'ocupació" : "Grupo de ocupación"}</th>
                                <th className="text-center px-3 py-2 border border-border font-semibold">CNO</th>
                                <th className="text-center px-3 py-2 border border-border font-semibold">Factor</th>
                                <th className="text-center px-3 py-2 border border-border font-semibold">{language === "ca" ? "Dies ajustats" : "Días ajustados"}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedDiagnosis.occupationAdjustment.map((adj: any, i: number) => {
                                const adjDays = Math.round(selectedDiagnosis.averageDays * adj.factor);
                                const { color } = getFactorLabel(adj.factor);
                                return (
                                  <tr key={i} className={`${selectedGroupId === adj.cnoGroup ? "bg-purple-50 dark:bg-purple-900/20" : "hover:bg-muted/30"}`}>
                                    <td className="px-3 py-1.5 border border-border">{adj.type}</td>
                                    <td className="px-3 py-1.5 border border-border text-center font-mono text-muted-foreground">{adj.cnoCodes}</td>
                                    <td className="px-3 py-1.5 border border-border text-center">
                                      <span className={`px-1.5 py-0.5 rounded font-mono font-semibold ${color}`}>
                                        ×{adj.factor.toFixed(2)}
                                      </span>
                                    </td>
                                    <td className="px-3 py-1.5 border border-border text-center font-semibold text-purple-700 dark:text-purple-400">
                                      {adjDays} {language === "ca" ? "dies" : "días"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          <p className="text-xs text-muted-foreground mt-2">
                                {language === "ca" ? `Dies ajustats calculats sobre el temps estàndard de ${selectedDiagnosis.averageDays} dies.` : `Días ajustados calculados sobre el tiempo estándar de ${selectedDiagnosis.averageDays} días.`}
                            {language === "ca" ? "Font" : "Fuente"}: Taula 15, Manual de Tiempos Óptimos de IT, INSS 4a edició.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Notes clíniques */}
                {selectedDiagnosis.notes && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2 text-sm">{language === "ca" ? "Notes clíniques i font:" : "Notas clínicas y fuente:"}</h4>
                    <p className="text-sm text-muted-foreground">{selectedDiagnosis.notes}</p>
                  </div>
                )}

                {/* Avís */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-foreground">
                      {language === "ca" ? (
                        <><strong>Important:</strong> Aquests temps són orientatius basats en el Manual de Tiempos Óptimos de l'INSS. La durada real depèn de l'evolució clínica, l'edat, les comorbiditats i el criteri mèdic. Els factors d'ocupació s'apliquen sobre el temps estàndard i no substitueixen la valoració individual.</>
                      ) : (
                        <><strong>Importante:</strong> Estos tiempos son orientativos basados en el Manual de Tiempos Óptimos del INSS. La duración real depende de la evolución clínica, la edad, las comorbilidades y el criterio médico. Los factores de ocupación se aplican sobre el tiempo estándar y no sustituyen la valoración individual.</>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Guide Card */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/40 dark:to-purple-950/40">
            <CardHeader>
              <CardTitle>{language === "ca" ? "Guia de durada de processos d'IT" : "Guía de duración de procesos de IT"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground dark:text-blue-300 mb-2">{language === "ca" ? "Durada màxima estàndard" : "Duración máxima estándar"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {language === "ca" ? <><span>La durada màxima d'una IT és de </span><strong>365 dies naturals</strong><span> des de la data de la baixa mèdica.</span></> : <><span>La duración máxima de una IT es de </span><strong>365 días naturales</strong><span> desde la fecha de la baja médica.</span></>}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground dark:text-blue-300 mb-2">{language === "ca" ? "Primera pròrroga (art. 174 LGSS)" : "Primera prórroga (art. 174 LGSS)"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {language === "ca" ? <><span>Al complir-se els 365 dies, l'INSS pot prorrogar la IT per altres </span><strong>180 dies més</strong><span> (total: 545 dies / 18 mesos).</span></> : <><span>Al cumplirse los 365 días, el INSS puede prorrogar la IT por otros </span><strong>180 días más</strong><span> (total: 545 días / 18 meses).</span></>}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground dark:text-blue-300 mb-2">{language === "ca" ? "Segona pròrroga excepcional" : "Segunda prórroga excepcional"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {language === "ca" ? <><span>En casos excepcionals (neoplàsies, cirurgia major, malalties greus), es pot concedir una pròrroga de fins a </span><strong>185 dies més</strong><span> (total màxim: 730 dies / 24 mesos).</span></> : <><span>En casos excepcionales (neoplasias, cirugía mayor, enfermedades graves), se puede conceder una prórroga de hasta </span><strong>185 días más</strong><span> (total máximo: 730 días / 24 meses).</span></>}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <Link href="/chat">
                    <Button variant="outline" className="w-full">
                      {language === "ca" ? "Tens dubtes? Consulta amb la IA especialitzada" : "¿Tienes dudas? Consulta con la IA especializada"}
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
