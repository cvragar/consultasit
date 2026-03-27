import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  Home,
  Sparkles,
  FileText,
  AlertCircle,
  ChevronRight,
  Calendar,
  BookOpen,
  Scale,
  Gavel,
  ClipboardList,
  Star,
  MessageSquare,
  Calculator,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useT } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

// ─── helpers ────────────────────────────────────────────────────────────────

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\|.+/g, "")
    .replace(/[-*_]{3,}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .trim();
}

function timeAgo(date: Date, language: string): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  if (language === "ca") {
    if (diff < 60) return "Fa uns moments";
    if (diff < 3600) return `Fa ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Fa ${Math.floor(diff / 3600)} h`;
    if (diff < 7 * 86400) return `Fa ${Math.floor(diff / 86400)} dies`;
    return new Date(date).toLocaleDateString("ca-ES", { day: "numeric", month: "short" });
  } else {
    if (diff < 60) return "Hace un momento";
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    if (diff < 7 * 86400) return `Hace ${Math.floor(diff / 86400)} días`;
    return new Date(date).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  }
}

const docTypeIcons: Record<string, React.ElementType> = {
  ley: Scale,
  decreto: Gavel,
  guia: BookOpen,
  manual: ClipboardList,
  pildora: Star,
  otro: FileText,
};

const categoryColors: Record<string, string> = {
  menstruacion: "bg-pink-100 text-pink-800",
  embarazo: "bg-purple-100 text-purple-800",
  lactancia: "bg-blue-100 text-blue-800",
  donacion_organos: "bg-red-100 text-red-800",
  baja_retroactiva: "bg-yellow-100 text-yellow-800",
  pluriempleo: "bg-indigo-100 text-indigo-800",
  prision: "bg-gray-100 text-gray-800",
  extranjeros: "bg-teal-100 text-teal-800",
  vacaciones: "bg-green-100 text-green-800",
  recaida: "bg-orange-100 text-orange-800",
  accident_treball: "bg-red-100 text-red-800",
  otro: "bg-slate-100 text-slate-800",
};

// ─── component ──────────────────────────────────────────────────────────────

export default function Novetats() {
  const { language } = useT();
  const [days, setDays] = useState(30);

  const { data, isLoading } = trpc.novetats.getRecent.useQuery({ days });

  const totalItems = (data?.documents.length ?? 0) + (data?.cases.length ?? 0);

  const docTypeLabels: Record<string, string> = {
    ley: language === "ca" ? "Llei" : "Ley",
    decreto: language === "ca" ? "Decret" : "Decreto",
    guia: language === "ca" ? "Guia" : "Guía",
    manual: "Manual",
    pildora: language === "ca" ? "Píndola" : "Píldora",
    otro: language === "ca" ? "Altre" : "Otro",
  };

  const categoryLabels: Record<string, string> = {
    menstruacion: language === "ca" ? "Menstruació incapacitant" : "Menstruación incapacitante",
    embarazo: language === "ca" ? "Embaràs" : "Embarazo",
    lactancia: language === "ca" ? "Lactància" : "Lactancia",
    donacion_organos: language === "ca" ? "Donació d'òrgans" : "Donación de órganos",
    baja_retroactiva: language === "ca" ? "Baixa retroactiva" : "Baja retroactiva",
    pluriempleo: language === "ca" ? "Pluriocupació" : "Pluriempleo",
    prision: language === "ca" ? "Presó" : "Prisión",
    extranjeros: language === "ca" ? "Estrangers" : "Extranjeros",
    vacaciones: language === "ca" ? "Vacances i IT" : "Vacaciones e IT",
    recaida: language === "ca" ? "Recaiguda" : "Recaída",
    accident_treball: language === "ca" ? "Accident de Treball" : "Accidente de Trabajo",
    otro: language === "ca" ? "Altres" : "Otros",
  };

  const dayLabels: Record<number, string> = {
    7: language === "ca" ? "7 dies" : "7 días",
    30: language === "ca" ? "30 dies" : "30 días",
    60: language === "ca" ? "2 mesos" : "2 meses",
    90: language === "ca" ? "3 mesos" : "3 meses",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="container py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <Shield className="h-7 w-7 text-blue-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  {language === "ca" ? "Consultes IT" : "Consultas IT"}
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {language === "ca" ? "Assistent per a professionals sanitaris" : "Asistente para profesionales sanitarios"}
                </p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Home className="h-4 w-4" />
                  {language === "ca" ? "Inici" : "Inicio"}
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  {language === "ca" ? "Xat" : "Chat"}
                </Button>
              </Link>
              <Link href="/casos-especials">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  {language === "ca" ? "Casos Especials" : "Casos Especiales"}
                </Button>
              </Link>
              <Link href="/documents">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <FileText className="h-4 w-4" />
                  {language === "ca" ? "Documents" : "Documentos"}
                </Button>
              </Link>
              <Link href="/calculadora">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Calculator className="h-4 w-4" />
                  {language === "ca" ? "Calculadora" : "Calculadora"}
                </Button>
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="container py-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/">
            <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              {language === "ca" ? "Inici" : "Inicio"}
            </span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 font-medium flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
            {language === "ca" ? "Novetats" : "Novedades"}
          </span>
        </div>
      </div>

      {/* Contingut principal */}
      <main className="container pb-16">
        {/* Títol i filtre de dies */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              {language === "ca" ? "Novetats" : "Novedades"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isLoading
                ? (language === "ca" ? "Carregant..." : "Cargando...")
                : language === "ca"
                  ? `${totalItems} element${totalItems !== 1 ? "s" : ""} afegit${totalItems !== 1 ? "s" : ""} en els últims ${days} dies`
                  : `${totalItems} elemento${totalItems !== 1 ? "s" : ""} añadido${totalItems !== 1 ? "s" : ""} en los últimos ${days} días`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{language === "ca" ? "Mostrar:" : "Mostrar:"}</span>
            {[7, 30, 60, 90].map((d) => (
              <Button
                key={d}
                variant={days === d ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(d)}
                className="text-xs px-3"
              >
                {dayLabels[d]}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : totalItems === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {language === "ca"
                ? `Cap novetat en els últims ${days} dies`
                : `Sin novedades en los últimos ${days} días`}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {language === "ca"
                ? "Prova ampliar el rang de dates per veure contingut anterior"
                : "Prueba ampliar el rango de fechas para ver contenido anterior"}
            </p>
            <Button variant="outline" onClick={() => setDays(90)}>
              {language === "ca" ? "Mostrar últims 3 mesos" : "Mostrar últimos 3 meses"}
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Nous documents */}
            {data && data.documents.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === "ca" ? "Documents normatius" : "Documentos normativos"}
                    <Badge variant="secondary" className="ml-2 text-xs">{data.documents.length}</Badge>
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.documents.map((doc) => {
                    const DocIcon = docTypeIcons[doc.type] ?? FileText;
                    return (
                      <Link key={doc.id} href={`/documents?id=${doc.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-green-400">
                          <CardHeader className="pb-2 pt-4 px-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                  <DocIcon className="h-4 w-4 text-green-600" />
                                </div>
                                <CardTitle className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                                  {doc.title}
                                </CardTitle>
                              </div>
                              <Badge className="bg-green-100 text-green-800 text-xs shrink-0 ml-1">
                                {language === "ca" ? "Nou" : "Nuevo"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="px-4 pb-4">
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {docTypeLabels[doc.type] ?? doc.type}
                              </Badge>
                              {doc.jurisdiction && (
                                <Badge variant="outline" className="text-xs capitalize">
                                  {doc.jurisdiction}
                                </Badge>
                              )}
                              {doc.publicationYear && (
                                <Badge variant="outline" className="text-xs">
                                  {doc.publicationYear}
                                </Badge>
                              )}
                            </div>
                            {doc.summary && (
                              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                {stripMarkdown(doc.summary)}
                              </p>
                            )}
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Calendar className="h-3 w-3" />
                              {timeAgo(doc.createdAt, language)}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Nous casos especials */}
            {data && data.cases.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === "ca" ? "Casos especials" : "Casos especiales"}
                    <Badge variant="secondary" className="ml-2 text-xs">{data.cases.length}</Badge>
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.cases.map((cas) => (
                    <Link key={cas.id} href={`/casos-especials?id=${cas.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-orange-400">
                        <CardHeader className="pb-2 pt-4 px-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                              </div>
                              <CardTitle className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                                {cas.title}
                              </CardTitle>
                            </div>
                            <Badge className="bg-orange-100 text-orange-800 text-xs shrink-0 ml-1">
                              {language === "ca" ? "Nou" : "Nuevo"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <Badge
                              className={`text-xs ${categoryColors[cas.category] ?? "bg-gray-100 text-gray-800"}`}
                            >
                              {categoryLabels[cas.category] ?? cas.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                            {stripMarkdown(cas.description)}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {timeAgo(cas.createdAt, language)}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
