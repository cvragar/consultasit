import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, FileText, AlertCircle, Calculator, Shield, LogIn, Star, Menu, X, Stethoscope, HardHat, HeartPulse, ChevronRight, Sparkles, Gavel } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { useT } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, language } = useT();

  const features = [
    {
      icon: MessageSquare,
      title: t.home.features.chat.title,
      description: t.home.features.chat.description,
      href: "/chat",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-l-blue-500",
    },
    {
      icon: AlertCircle,
      title: t.home.features.casos.title,
      description: t.home.features.casos.description,
      href: "/casos-especials",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-l-orange-500",
    },
    {
      icon: FileText,
      title: t.home.features.docs.title,
      description: t.home.features.docs.description,
      href: "/documents",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-l-green-500",
    },
    {
      icon: Calculator,
      title: t.home.features.calc.title,
      description: t.home.features.calc.description,
      href: "/calculadora",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-l-purple-500",
    },
    {
      icon: Gavel,
      title: t.home.features.reclamacions.title,
      description: t.home.features.reclamacions.description,
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
                <h1 className="text-lg font-bold text-gray-900 leading-tight">{t.nav.title}</h1>
                <p className="text-xs text-gray-500 hidden sm:block">{t.nav.subtitle}</p>
              </div>
            </div>

            {/* Nav desktop */}
            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600 truncate max-w-[140px]">
                    {user?.name?.split(" ")[0] || t.nav.user}
                  </span>
                  <Link href="/novetats">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      {t.nav.novetats}
                    </Button>
                  </Link>
                  <Link href="/reclamacions">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Gavel className="h-4 w-4 text-slate-500" />
                      {t.nav.reclamacions}
                    </Button>
                  </Link>
                  <Link href="/favorits">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {t.nav.favorits}
                    </Button>
                  </Link>
                  {user?.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Shield className="h-3.5 w-3.5" />
                        {t.nav.admin}
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <Button asChild size="sm">
                  <a href={getLoginUrl()}>
                    <LogIn className="h-4 w-4 mr-1.5" />
                    {t.nav.login}
                  </a>
                </Button>
              )}
            </div>

            {/* Nav mòbil: botó hamburguesa + switcher */}
            <div className="flex md:hidden items-center gap-2">
              <LanguageSwitcher />
              {!isAuthenticated && (
                <Button asChild size="sm">
                  <a href={getLoginUrl()}>
                    <LogIn className="h-4 w-4 mr-1" />
                    {t.nav.loginMobile}
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
                {t.nav.hello}, {user?.name || t.nav.user}
              </p>
              <Link href="/novetats" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  {t.nav.novetats}
                </Button>
              </Link>
              <Link href="/reclamacions" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Gavel className="h-4 w-4 text-slate-500" />
                  {t.nav.reclamacions}
                </Button>
              </Link>
              <Link href="/favorits" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {t.nav.favorits}
                </Button>
              </Link>
              <Link href="/chat" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  {t.nav.consultaIA}
                </Button>
              </Link>
              <Link href="/casos-especials" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  {t.nav.casosEspecials}
                </Button>
              </Link>
              <Link href="/documents" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  {t.nav.documentacio}
                </Button>
              </Link>
              <Link href="/calculadora" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Calculator className="h-4 w-4 text-purple-500" />
                  {t.nav.calculadora}
                </Button>
              </Link>
              {user?.role === "admin" && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    {t.nav.administracio}
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
            {t.home.heroTitle}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
            {t.home.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link href="/chat" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base">
                <MessageSquare className="h-5 w-5 mr-2" />
                {t.home.ctaChat}
              </Button>
            </Link>
            <Link href="/casos-especials" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                <AlertCircle className="h-5 w-5 mr-2" />
                {t.home.ctaCasos}
              </Button>
            </Link>
            <Link href="/reclamacions" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base border-slate-400 text-slate-700 hover:bg-slate-100">
                <Gavel className="h-5 w-5 mr-2" />
                {t.home.ctaReclamacions}
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
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900">{t.home.contingencies.title}</h3>
              <p className="text-sm text-gray-500">{t.home.contingencies.subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Accident de Treball */}
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <HardHat className="h-5 w-5 text-red-600" />
                <h4 className="font-bold text-red-800 text-base">{t.home.contingencies.atTitle}</h4>
              </div>
              <p className="text-xs text-red-700 mb-3">
                {language === "ca"
                  ? "Lesió corporal que el treballador pateix amb ocasió o per conseqüència del treball (art. 156 LGSS)."
                  : "Lesión corporal que el trabajador sufre con ocasión o por consecuencia del trabajo (art. 156 LGSS)."}
              </p>
              <ul className="text-xs text-red-800 space-y-1.5 mb-4">
                <li className="flex items-start gap-1.5"><span className="text-red-500 mt-0.5 shrink-0">▸</span>{language === "ca" ? "Prestació:" : "Prestación:"} <strong>75% BR {language === "ca" ? "des del dia 2" : "desde el día 2"}</strong></li>
                <li className="flex items-start gap-1.5"><span className="text-red-500 mt-0.5 shrink-0">▸</span>{language === "ca" ? "Gestió:" : "Gestión:"} <strong>{language === "ca" ? "mútua col·laboradora" : "mutua colaboradora"}</strong></li>
                <li className="flex items-start gap-1.5"><span className="text-red-500 mt-0.5 shrink-0">▸</span>{language === "ca" ? "Part de baixa:" : "Parte de baja:"} <strong>{language === "ca" ? "mútua o eCap" : "mutua o eCap"}</strong></li>
                <li className="flex items-start gap-1.5"><span className="text-red-500 mt-0.5 shrink-0">▸</span>{language === "ca" ? "Inclou:" : "Incluye:"} <strong>{language === "ca" ? "accident in itinere" : "accidente in itinere"}</strong></li>
              </ul>
              <div className="flex flex-wrap gap-1.5">
                <Link href="/casos-especials">
                  <Badge variant="outline" className="text-xs cursor-pointer border-red-300 text-red-700 hover:bg-red-100 gap-1">
                    {language === "ca" ? "Casos AT" : "Casos AT"} <ChevronRight className="h-3 w-3" />
                  </Badge>
                </Link>
                <Link href="/documents">
                  <Badge variant="outline" className="text-xs cursor-pointer border-red-300 text-red-700 hover:bg-red-100 gap-1">
                    {language === "ca" ? "Normativa" : "Normativa"} <ChevronRight className="h-3 w-3" />
                  </Badge>
                </Link>
              </div>
            </div>

            {/* Malaltia Professional */}
            <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="h-5 w-5 text-orange-600" />
                <h4 className="font-bold text-orange-800 text-base">{t.home.contingencies.mpTitle}</h4>
              </div>
              <p className="text-xs text-orange-700 mb-3">
                {language === "ca"
                  ? "Malaltia contreta per l'exposició a agents laborals recollits al quadre del RD 1299/2006 (art. 157 LGSS)."
                  : "Enfermedad contraída por la exposición a agentes laborales recogidos en el cuadro del RD 1299/2006 (art. 157 LGSS)."}
              </p>
              <ul className="text-xs text-orange-800 space-y-1.5 mb-4">
                <li className="flex items-start gap-1.5"><span className="text-orange-500 mt-0.5 shrink-0">▸</span>{language === "ca" ? "Prestació:" : "Prestación:"} <strong>75% BR {language === "ca" ? "des del dia 1" : "desde el día 1"}</strong></li>
                <li className="flex items-start gap-1.5"><span className="text-orange-500 mt-0.5 shrink-0">▸</span>{language === "ca" ? "Gestió:" : "Gestión:"} <strong>{language === "ca" ? "mútua col·laboradora" : "mutua colaboradora"}</strong></li>
                <li className="flex items-start gap-1.5"><span className="text-orange-500 mt-0.5 shrink-0">▸</span>{language === "ca" ? "Exemples:" : "Ejemplos:"} <strong>{language === "ca" ? "hepatitis B/C per punxada (Grup 3A)" : "hepatitis B/C por pinchazo (Grupo 3A)"}</strong></li>
                <li className="flex items-start gap-1.5"><span className="text-orange-500 mt-0.5 shrink-0">▸</span>{language === "ca" ? "Notificació obligatòria:" : "Notificación obligatoria:"} <strong>CEPROSS</strong></li>
              </ul>
              <div className="flex flex-wrap gap-1.5">
                <Link href="/casos-especials">
                  <Badge variant="outline" className="text-xs cursor-pointer border-orange-300 text-orange-700 hover:bg-orange-100 gap-1">
                    {language === "ca" ? "Cas punxada accidental" : "Caso pinchazo accidental"} <ChevronRight className="h-3 w-3" />
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
                <h4 className="font-bold text-blue-800 text-base">{t.home.contingencies.ccTitle}</h4>
              </div>
              <p className="text-xs text-blue-700 mb-3">
                {language === "ca"
                  ? "Malaltia o lesió no relacionada amb el treball, ni recollida al quadre de malalties professionals."
                  : "Enfermedad o lesión no relacionada con el trabajo, ni recogida en el cuadro de enfermedades profesionales."}
              </p>
              <ul className="text-xs text-blue-800 space-y-1.5 mb-4">
                <li className="flex items-start gap-1.5"><span className="text-blue-500 mt-0.5 shrink-0">▸</span>{language === "ca" ? "Prestació:" : "Prestación:"} <strong>60% BR {language === "ca" ? "dies 4–20, 75% des del dia 21" : "días 4–20, 75% desde el día 21"}</strong></li>
                <li className="flex items-start gap-1.5"><span className="text-blue-500 mt-0.5 shrink-0">▸</span>{language === "ca" ? "Gestió:" : "Gestión:"} <strong>INSS {language === "ca" ? "o mútua" : "o mutua"}</strong></li>
                <li className="flex items-start gap-1.5"><span className="text-blue-500 mt-0.5 shrink-0">▸</span>{language === "ca" ? "Part de baixa:" : "Parte de baja:"} <strong>{language === "ca" ? "metge de família (eCap)" : "médico de familia (eCap)"}</strong></li>
                <li className="flex items-start gap-1.5"><span className="text-blue-500 mt-0.5 shrink-0">▸</span>{language === "ca" ? "Casos especials:" : "Casos especiales:"} <strong>{language === "ca" ? "menstruació, embaràs, donació d'òrgans" : "menstruación, embarazo, donación de órganos"}</strong></li>
              </ul>
              <div className="flex flex-wrap gap-1.5">
                <Link href="/casos-especials">
                  <Badge variant="outline" className="text-xs cursor-pointer border-blue-300 text-blue-700 hover:bg-blue-100 gap-1">
                    {language === "ca" ? "Casos CC" : "Casos CC"} <ChevronRight className="h-3 w-3" />
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
                  <th className="text-left p-2.5 font-semibold text-gray-700 border border-gray-200">{language === "ca" ? "Aspecte" : "Aspecto"}</th>
                  <th className="text-center p-2.5 font-semibold text-red-700 border border-gray-200">AT</th>
                  <th className="text-center p-2.5 font-semibold text-orange-700 border border-gray-200">MP</th>
                  <th className="text-center p-2.5 font-semibold text-blue-700 border border-gray-200">CC</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {(language === "ca" ? [
                  ["Prestació dia 1", "75% BR", "75% BR", "No (dies 1-3 sense prestació)"],
                  ["Prestació dies 4-20", "75% BR", "75% BR", "60% BR"],
                  ["Prestació des del dia 21", "75% BR", "75% BR", "75% BR"],
                  ["Qui gestiona la IT", "Mútua", "Mútua", "INSS o mútua"],
                  ["Qui emet el part", "Mútua o eCap", "eCap (provisional)", "eCap"],
                  ["Normativa principal", "Art. 156 LGSS", "Art. 157 LGSS + RD 1299/2006", "Art. 169 LGSS + RD 625/2014"],
                ] : [
                  ["Prestación día 1", "75% BR", "75% BR", "No (días 1-3 sin prestación)"],
                  ["Prestación días 4-20", "75% BR", "75% BR", "60% BR"],
                  ["Prestación desde el día 21", "75% BR", "75% BR", "75% BR"],
                  ["Quién gestiona la IT", "Mutua", "Mutua", "INSS o mutua"],
                  ["Quién emite el parte", "Mutua o eCap", "eCap (provisional)", "eCap"],
                  ["Normativa principal", "Art. 156 LGSS", "Art. 157 LGSS + RD 1299/2006", "Art. 169 LGSS + RD 625/2014"],
                ]).map(([aspect, at, mp, cc]) => (
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
          <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4">
            {language === "ca" ? "Què inclou la plataforma?" : "¿Qué incluye la plataforma?"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {(language === "ca" ? [
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
            ] : [
              {
                title: "Normativa actualizada",
                items: ["Real Decreto 625/2014 y modificaciones", "Documentación del Departamento de Salud", "Guías del ICS y materiales formativos", "Tiempos estándar del INSS"],
              },
              {
                title: "Casos especiales",
                items: ["Menstruación incapacitante", "Interrupción del embarazo", "Donación de órganos", "Bajas retroactivas, pluriempleo, prisión..."],
              },
              {
                title: "Procedimientos",
                items: ["Gestión de bajas hasta 365 días", "Prórroga a 545 y 730 días", "Incapacidad permanente", "Recaídas y situaciones complejas"],
              },
              {
                title: "Herramientas prácticas",
                items: ["Calculadora de duración de IT", "Buscador de documentación", "Chat con IA especializada", "Ejemplos prácticos y resoluciones"],
              },
            ]).map((section) => (
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
          <p>© 2026 {t.nav.title} — {language === "ca" ? "Plataforma especialitzada en Incapacitat Temporal" : "Plataforma especializada en Incapacidad Temporal"}</p>
          <p>{language === "ca" ? "Informació basada en normativa vigent. Consulta sempre amb professionals qualificats." : "Información basada en normativa vigente. Consulta siempre con profesionales cualificados."}</p>
        </div>
      </footer>
    </div>
  );
}
