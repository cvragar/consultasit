import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, FileText, AlertCircle, Calculator, Shield, LogIn } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: MessageSquare,
      title: "Consulta amb IA",
      description: "Xat especialitzat en normativa d'Incapacitat Temporal amb respostes precises i citació de fonts",
      href: "/chat",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: AlertCircle,
      title: "Casos Especials",
      description: "Repositori de situacions extremes: menstruació incapacitant, embaràs, donació d'òrgans, pluriocupació...",
      href: "/casos-especiales",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: FileText,
      title: "Documentació",
      description: "Cerca en normativa estatal i autonòmica, guies pràctiques i manuals de gestió d'IT",
      href: "/documentos",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Calculator,
      title: "Calculadora d'IT",
      description: "Calcula la durada estimada d'IT per patologia, edat i ocupació segons criteris de l'INSS",
      href: "/calculadora",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Consultes IT</h1>
                <p className="text-sm text-gray-600">Assistent per a professionals sanitaris</p>
              </div>
            </div>
            <div>
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Hola, {user?.name || "Usuari"}</span>
                  {user?.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <Button asChild>
                  <a href={getLoginUrl()}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar sessió
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Plataforma especialitzada en normativa d'Incapacitat Temporal
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Resol dubtes sobre processos d'IT, normativa estatal i autonòmica, casos especials i situacions complexes
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" className="text-lg">
                <MessageSquare className="h-5 w-5 mr-2" />
                Començar consulta
              </Button>
            </Link>
            <Link href="/casos-especiales">
              <Button size="lg" variant="outline" className="text-lg">
                <AlertCircle className="h-5 w-5 mr-2" />
                Veure casos especials
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-16">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.href} href={feature.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Info Section */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto bg-blue-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Què inclou la plataforma?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Normativa actualitzada</h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Real Decret 625/2014 i modificacions</li>
                <li>• Documentació del Departament de Salut</li>
                <li>• Guies de l'ICS i materials formatius</li>
                <li>• Temps estàndard de l'INSS</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Casos especials</h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Menstruació incapacitant</li>
                <li>• Interrupció de l'embaràs</li>
                <li>• Donació d'òrgans</li>
                <li>• Baixes retroactives, pluriocupació, presó...</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Procediments</h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Gestió de baixes fins a 365 dies</li>
                <li>• Pròrroga a 545 i 730 dies</li>
                <li>• Incapacitat permanent</li>
                <li>• Recaigudes i situacions complexes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Eines pràctiques</h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Calculadora de durada d'IT</li>
                <li>• Cercador de documentació</li>
                <li>• Xat amb IA especialitzada</li>
                <li>• Exemples pràctics i resolucions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container text-center text-sm text-gray-600">
          <p>© 2026 Consultes IT - Plataforma especialitzada en Incapacitat Temporal</p>
          <p className="mt-2">Informació basada en normativa vigent. Consulta sempre amb professionals qualificats.</p>
        </div>
      </footer>
    </div>
  );
}
