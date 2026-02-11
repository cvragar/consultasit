import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Home, Search, FileText, BookOpen, Building2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

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

export default function Documentos() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allDocuments } = trpc.documents.list.useQuery();
  const { data: searchResults } = trpc.documents.search.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: searchQuery.length > 2 }
  );

  const displayedDocuments = searchQuery.length > 2 ? searchResults : allDocuments;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
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
                <FileText className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-bold text-gray-900">Documentació d'IT</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cerca en títols, contingut i fonts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Cerca en normativa estatal, autonòmica, guies pràctiques i manuals
            </p>
          </div>
        </div>

        {/* Documents List */}
        <div className="max-w-4xl mx-auto space-y-4">
          {displayedDocuments?.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className={typeColors[doc.type]}>
                        {typeLabels[doc.type] || doc.type}
                      </Badge>
                      <Badge variant="outline">
                        {jurisdictionLabels[doc.jurisdiction]}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                  </div>
                </div>
                {doc.source && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    {doc.source}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {doc.summary && (
                  <p className="text-sm text-gray-700 mb-3">{doc.summary}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span className="line-clamp-2">
                    {doc.content.substring(0, 200)}...
                  </span>
                </div>
                {doc.tags && Array.isArray(doc.tags) && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {doc.tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {displayedDocuments?.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No s'han trobat documents</h3>
            <p className="text-gray-600">Prova amb una altra cerca</p>
          </div>
        )}
      </div>
    </div>
  );
}
