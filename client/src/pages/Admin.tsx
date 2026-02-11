import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Home, Database, FileText, AlertCircle, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: documents } = trpc.documents.list.useQuery();
  const { data: specialCases } = trpc.specialCases.list.useQuery();
  const { data: conversations } = trpc.chat.getUserConversations.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Verificar permisos de administrador
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Accés restringit</h2>
          <p className="text-gray-600 mb-6">
            Necessites permisos d'administrador per accedir a aquesta pàgina
          </p>
          <Link href="/">
            <Button className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Tornar a l'inici
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
                <Shield className="h-6 w-6 text-gray-900" />
                <h1 className="text-xl font-bold text-gray-900">Panell d'Administració</h1>
              </div>
            </div>
            <span className="text-sm text-gray-600">Admin: {user?.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Documents</CardTitle>
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{documents?.length || 0}</div>
                <p className="text-sm text-gray-600 mt-1">Documents carregats</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Casos Especials</CardTitle>
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{specialCases?.length || 0}</div>
                <p className="text-sm text-gray-600 mt-1">Casos documentats</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Converses</CardTitle>
                  <Database className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{conversations?.length || 0}</div>
                <p className="text-sm text-gray-600 mt-1">Converses totals</p>
              </CardContent>
            </Card>
          </div>

          {/* Management Sections */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Gestió de Documents
                </CardTitle>
                <CardDescription>
                  Afegir, editar o eliminar documents normatius
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Actualment hi ha {documents?.length || 0} documents carregats a la base de dades.
                  </p>
                  <p className="text-sm text-gray-600">
                    Per afegir nous documents, utilitza l'script de càrrega o contacta amb l'administrador del sistema.
                  </p>
                  <Link href="/documentos">
                    <Button variant="outline" className="w-full mt-4">
                      Veure tots els documents
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Gestió de Casos Especials
                </CardTitle>
                <CardDescription>
                  Afegir, editar o eliminar casos especials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Actualment hi ha {specialCases?.length || 0} casos especials documentats.
                  </p>
                  <p className="text-sm text-gray-600">
                    Per afegir nous casos, utilitza l'script de càrrega o contacta amb l'administrador del sistema.
                  </p>
                  <Link href="/casos-especiales">
                    <Button variant="outline" className="w-full mt-4">
                      Veure tots els casos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Base de Dades
                </CardTitle>
                <CardDescription>
                  Informació sobre l'estat de la base de dades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Documents:</span>
                    <span className="font-semibold">{documents?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Casos especials:</span>
                    <span className="font-semibold">{specialCases?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Converses:</span>
                    <span className="font-semibold">{conversations?.length || 0}</span>
                  </div>
                  <Separator />
                  <p className="text-xs text-gray-600">
                    La base de dades està operativa i sincronitzada
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuració
                </CardTitle>
                <CardDescription>
                  Opcions de configuració del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Configuració del sistema i paràmetres de la IA
                  </p>
                  <p className="text-sm text-gray-600">
                    Per modificar la configuració, contacta amb l'administrador del sistema.
                  </p>
                  <Button variant="outline" className="w-full mt-4" disabled>
                    Configuració avançada (Pròximament)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Informació del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Aquest panell d'administració permet gestionar el contingut de la plataforma Consultes IT.
                Per afegir nous documents o casos especials, utilitza els scripts de càrrega proporcionats
                o contacta amb l'administrador del sistema.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
