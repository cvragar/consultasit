import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, FileText, AlertCircle, Calculator, Shield, LogIn, Star, Menu, X, Stethoscope, HardHat, HeartPulse, ChevronRight, Sparkles, Gavel } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { useState } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: MessageSquare,
      title: "Consulta amb IA",
      description: "Xat especialitzat en normativa d'IT amb respostes precises i citació de fonts",
      href: "/chat",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-l-blue-500",
    },
    {
      icon: AlertCircle,
      title: "Casos Especials",
      description: "Menstruació incapacitant, embaràs, donació d'òrgans, pluriocupació i més",
      href: "/casos-especials",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-l-orange-500",
    },
    {
      icon: FileText,
      title: "Documentació",
      description: "Normativa estatal i autonòmica, guies pràctiques i manuals de gestió d'IT",
      href: "/documents",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-l-green-500",
    },
    {
      icon: Calculator,
      title: "Calculadora d'IT",
      description: "Calcula la durada estimada per patologia, edat i ocupació (criteris INSS)",
      href: "/calculadora",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-l-purple-500",
    },
    {
      icon: Gavel,
      title: "Reclamacions",
      description: "Com impugnar una alta mèdica (ICAM, mútua, INSS) i sol·licitar la determinació de contingències",
      href: "/reclamacions",
      color: "text-slate-600",
      bgColor: "bg-slate-100",
      borderColor: "border-l-slate-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header responsive */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="container py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <Shield className="h-7 w-7 text-blue-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Consultes IT</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Assistent per a professionals sanitaris</p>
              </div>
            </div>

            {/* Nav desktop */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600 truncate max-w-[140px]">
                    {user?.name?.split(" ")[0] || "Usuari"}
                  </span>
                  <Link href="/novetats">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      Novetats
                    </Button>
                  </Link>
                  <Link href="/reclamacions">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Gavel className="h-4 w-4 text-slate-500" />
                      Reclamacions
                    </Button>
                  </Link>
                  <Link href="/favorits">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Favorits
                    </Button>
                  </Link>
                  {user?.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Shield className="h-3.5 w-3.5" />
                        Admin
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <Button asChild size="sm">
                  <a href={getLoginUrl()}>
                    <LogIn className="h-4 w-4 mr-1.5" />
                    Iniciar sessió
                  </a>
                </Button>
              )}
            </div>

            {/* Nav mòbil: botó hamburguesa */}
            <div className="flex md:hidden items-center gap-2">
              {!isAuthenticated && (
                <Button asChild size="sm">
                  <a href={getLoginUrl()}>
                    <LogIn className="h-4 w-4 mr-1" />
                    Entrar
                  </a>
                </Button>
              )}
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="h-9 w-9"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              )}
            </div>
          </div>

          {/* Menú mòbil desplegable */}
          {mobileMenuOpen && isAuthenticated && (
            <div className="md:hidden border-t mt-3 pt-3 pb-1 space-y-1">
              <p className="text-xs text-gray-500 px-1 mb-2">
                Hola, {user?.name || "Usuari"}
              </p>
              <Link href="/novetats" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  Novetats
                </Button>
              </Link>
              <Link href="/reclamacions" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Gavel className="h-4 w-4 text-slate-500" />
                  Reclamacions
                </Button>
              </Link>
              <Link href="/favorits" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Els meus Favorits
                </Button>
              </Link>
              <Link href="/chat" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  Consulta amb IA
                </Button>
              </Link>
              <Link href="/casos-especials" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Casos Especials
                </Button>
              </Link>
              <Link href="/documents" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  Documentació
                </Button>
              </Link>
              <Link href="/calculadora" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Calculator className="h-4 w-4 text-purple-500" />
                  Calculadora d'IT
                </Button>
              </Link>
              {user?.role === "admin" && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    Administració
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-10 sm:py-16">
        <div className="max-w-3xl mx-auto text-center px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            Plataforma especialitzada en normativa d'Incapacitat Temporal
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
            Resol dubtes sobre processos d'IT, normativa estatal i autonòmica, casos especials i situacions complexes
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/chat" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base">
                <MessageSquare className="h-5 w-5 mr-2" />
                Començar consulta
              </Button>
            </Link>
            <Link href="/casos-especials" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                <AlertCircle className="h-5 w-5 mr-2" />
                Casos especials
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-8 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.href} href={feature.href}>
                <Card className={`hover:shadow-lg transition-shadow cursor-pointer h-full border-l-4 ${feature.borderColor}`}>
                  <CardHeader className="pb-4">
                    <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center mb-3`}>
                      <Icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-base sm:text-lg">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Secció Contingències Professionals */}
      <section className="container py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <HardHat className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900">Contingències professionals</h3>
              <p className="text-sm text-gray-500">Diferències clau entre AT, malaltia professional i contingència comuna</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Accident de Treball */}
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <HardHat className="h-5 w-5 text-red-600" />
                <h4 className="font-bold text-red-800 text-base">Accident de Treball (AT)</h4>
              </div>
              <p className="text-xs text-red-700 mb-3">
                Lesió corporal que el treballador pateix amb ocasió o per conseqüència del treball (art. 156 LGSS).
              </p>
              <ul className="text-xs text-red-800 space-y-1.5 mb-4">
                <li className="flex items-start gap-1.5"><span className="text-red-500 mt-0.5 shrink-0">▸</span>Prestació: <strong>75% BR des del dia 2</strong> (dia 1 a càrrec empresa)</li>
                <li className="flex items-start gap-1.5"><span className="text-red-500 mt-0.5 shrink-0">▸</span>Gestió: <strong>mútua col·laboradora</strong></li>
                <li className="flex items-start gap-1.5"><span className="text-red-500 mt-0.5 shrink-0">▸</span>Part de baixa: <strong>mútua o eCap</strong></li>
                <li className="flex items-start gap-1.5"><span className="text-red-500 mt-0.5 shrink-0">▸</span>Inclou: <strong>accident in itinere</strong>, AT en pluriocupació, AT en RETA</li>
              </ul>
              <div className="flex flex-wrap gap-1.5">
                <Link href="/casos-especials">
                  <Badge variant="outline" className="text-xs cursor-pointer border-red-300 text-red-700 hover:bg-red-100 gap-1">
                    Casos AT <ChevronRight className="h-3 w-3" />
                  </Badge>
                </Link>
                <Link href="/documents">
                  <Badge variant="outline" className="text-xs cursor-pointer border-red-300 text-red-700 hover:bg-red-100 gap-1">
                    Normativa <ChevronRight className="h-3 w-3" />
                  </Badge>
                </Link>
              </div>
            </div>

            {/* Malaltia Professional */}
            <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="h-5 w-5 text-orange-600" />
                <h4 className="font-bold text-orange-800 text-base">Malaltia Professional (MP)</h4>
              </div>
              <p className="text-xs text-orange-700 mb-3">
                Malaltia contreta per l'exposició a agents o situacions laborals recollits al quadre del RD 1299/2006 (art. 157 LGSS).
              </p>
              <ul className="text-xs text-orange-800 space-y-1.5 mb-4">
                <li className="flex items-start gap-1.5"><span className="text-orange-500 mt-0.5 shrink-0">▸</span>Prestació: <strong>75% BR des del dia 1</strong></li>
                <li className="flex items-start gap-1.5"><span className="text-orange-500 mt-0.5 shrink-0">▸</span>Gestió: <strong>mútua col·laboradora</strong></li>
                <li className="flex items-start gap-1.5"><span className="text-orange-500 mt-0.5 shrink-0">▸</span>Exemples: <strong>hepatitis B/C per punxada</strong> (Grup 3A), síndrome del túnel carpià (Grup 2H), tuberculosi en sanitaris</li>
                <li className="flex items-start gap-1.5"><span className="text-orange-500 mt-0.5 shrink-0">▸</span>Notificació obligatòria: <strong>CEPROSS</strong></li>
              </ul>
              <div className="flex flex-wrap gap-1.5">
                <Link href="/casos-especials">
                  <Badge variant="outline" className="text-xs cursor-pointer border-orange-300 text-orange-700 hover:bg-orange-100 gap-1">
                    Cas punxada accidental <ChevronRight className="h-3 w-3" />
                  </Badge>
                </Link>
                <Link href="/documents">
                  <Badge variant="outline" className="text-xs cursor-pointer border-orange-300 text-orange-700 hover:bg-orange-100 gap-1">
                    RD 1299/2006 <ChevronRight className="h-3 w-3" />
                  </Badge>
                </Link>
              </div>
            </div>

            {/* Contingència Comuna */}
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <HeartPulse className="h-5 w-5 text-blue-600" />
                <h4 className="font-bold text-blue-800 text-base">Contingència Comuna (CC)</h4>
              </div>
              <p className="text-xs text-blue-700 mb-3">
                Malaltia o lesió no relacionada amb el treball, ni recollida al quadre de malalties professionals.
              </p>
              <ul className="text-xs text-blue-800 space-y-1.5 mb-4">
                <li className="flex items-start gap-1.5"><span className="text-blue-500 mt-0.5 shrink-0">▸</span>Prestació: <strong>60% BR dies 4–20, 75% des del dia 21</strong></li>
                <li className="flex items-start gap-1.5"><span className="text-blue-500 mt-0.5 shrink-0">▸</span>Gestió: <strong>INSS o mútua</strong> (si l'empresa ha optat)</li>
                <li className="flex items-start gap-1.5"><span className="text-blue-500 mt-0.5 shrink-0">▸</span>Part de baixa: <strong>metge de família (eCap)</strong></li>
                <li className="flex items-start gap-1.5"><span className="text-blue-500 mt-0.5 shrink-0">▸</span>Casos especials: <strong>menstruació, embaràs, donació d'òrgans</strong></li>
              </ul>
              <div className="flex flex-wrap gap-1.5">
                <Link href="/casos-especials">
                  <Badge variant="outline" className="text-xs cursor-pointer border-blue-300 text-blue-700 hover:bg-blue-100 gap-1">
                    Casos CC <ChevronRight className="h-3 w-3" />
                  </Badge>
                </Link>
                <Link href="/documents">
                  <Badge variant="outline" className="text-xs cursor-pointer border-blue-300 text-blue-700 hover:bg-blue-100 gap-1">
                    RD 625/2014 <ChevronRight className="h-3 w-3" />
                  </Badge>
                </Link>
              </div>
            </div>
          </div>

          {/* Taula comparativa */}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-xs border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2.5 font-semibold text-gray-700 border border-gray-200">Aspecte</th>
                  <th className="text-center p-2.5 font-semibold text-red-700 border border-gray-200">AT</th>
                  <th className="text-center p-2.5 font-semibold text-orange-700 border border-gray-200">MP</th>
                  <th className="text-center p-2.5 font-semibold text-blue-700 border border-gray-200">CC</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {[
                  ["Prestació dia 1", "75% BR", "75% BR", "No (dies 1-3 sense prestació)"],
                  ["Prestació dies 4-20", "75% BR", "75% BR", "60% BR"],
                  ["Prestació des del dia 21", "75% BR", "75% BR", "75% BR"],
                  ["Qui gestiona la IT", "Mútua", "Mútua", "INSS o mútua"],
                  ["Qui emet el part", "Mútua o eCap", "eCap (provisional)", "eCap"],
                  ["Normativa principal", "Art. 156 LGSS", "Art. 157 LGSS + RD 1299/2006", "Art. 169 LGSS + RD 625/2014"],
                ].map(([aspect, at, mp, cc]) => (
                  <tr key={aspect} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-2.5 font-medium text-gray-700 border border-gray-200">{aspect}</td>
                    <td className="p-2.5 text-center text-red-700 border border-gray-200">{at}</td>
                    <td className="p-2.5 text-center text-orange-700 border border-gray-200">{mp}</td>
                    <td className="p-2.5 text-center text-blue-700 border border-gray-200">{cc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="container py-8 sm:py-12">
        <div className="max-w-4xl mx-auto bg-blue-50 rounded-xl p-5 sm:p-8">
          <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4">Què inclou la plataforma?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              {
                title: "Normativa actualitzada",
                items: ["Reial Decret 625/2014 i modificacions", "Documentació del Departament de Salut", "Guies de l'ICS i materials formatius", "Temps estàndard de l'INSS"],
              },
              {
                title: "Casos especials",
                items: ["Menstruació incapacitant", "Interrupció de l'embaràs", "Donació d'òrgans", "Baixes retroactives, pluriocupació, presó..."],
              },
              {
                title: "Procediments",
                items: ["Gestió de baixes fins a 365 dies", "Pròrroga a 545 i 730 dies", "Incapacitat permanent", "Recaigudes i situacions complexes"],
              },
              {
                title: "Eines pràctiques",
                items: ["Calculadora de durada d'IT", "Cercador de documentació", "Xat amb IA especialitzada", "Exemples pràctics i resolucions"],
              },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{section.title}</h4>
                <ul className="text-gray-700 space-y-1">
                  {section.items.map((item) => (
                    <li key={item} className="text-xs sm:text-sm flex items-start gap-1.5">
                      <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container text-center text-xs sm:text-sm text-gray-500 space-y-1">
          <p>© 2026 Consultes IT — Plataforma especialitzada en Incapacitat Temporal</p>
          <p>Informació basada en normativa vigent. Consulta sempre amb professionals qualificats.</p>
        </div>
      </footer>
    </div>
  );
}
