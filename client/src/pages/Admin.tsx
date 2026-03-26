import { useAuth } from "@/_core/hooks/useAuth";
import { useT } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Shield, Home, Database, FileText, AlertCircle, Settings,
  Upload, Trash2, CheckCircle, XCircle, Loader2, RefreshCw,
  FileUp, Eye
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadedDoc {
  id: number;
  title: string;
  type: string;
  source: string;
  jurisdiction: string;
  summary: string | null;
  url: string | null;
  fileKey: string | null;
  createdAt: Date;
}

// TYPE_LABELS i JURISDICTION_LABELS es generen dins del component per tenir accés a language

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useT();

  const TYPE_LABELS: Record<string, string> = {
    ley: language === "ca" ? "Llei" : "Ley",
    decreto: language === "ca" ? "Decret" : "Decreto",
    guia: language === "ca" ? "Guia" : "Guía",
    manual: "Manual",
    pildora: language === "ca" ? "Píndola IT" : "Píldora IT",
    otro: language === "ca" ? "Altre" : "Otro",
  };

  const JURISDICTION_LABELS: Record<string, string> = {
    estatal: language === "ca" ? "Estatal" : "Estatal",
    autonomica: language === "ca" ? "Autonòmica" : "Autonómica",
    ambas: language === "ca" ? "Ambdues" : "Ambas",
  };

  // Upload form state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadResult, setUploadResult] = useState<{ documentId: number; extractedLength: number; message: string } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "pildora",
    source: "Departament de Salut",
    jurisdiction: "autonomica",
    summary: "",
    url: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Documents list state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [adminDocs, setAdminDocs] = useState<UploadedDoc[] | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const { data: documents, refetch: refetchDocuments } = trpc.documents.list.useQuery();
  const { data: specialCases } = trpc.specialCases.list.useQuery();
  const { data: conversations } = trpc.chat.getUserConversations.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Carregar llista de documents per a l'admin
  const loadAdminDocs = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch("/api/upload/documents", { credentials: "include" });
      if (!res.ok) throw new Error("Error carregant documents");
      const data = await res.json();
      setAdminDocs(data);
    } catch (err: any) {
      toast.error(language === "ca" ? "Error carregant la llista de documents" : "Error cargando la lista de documentos");
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  // Gestió del drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      setSelectedFile(file);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.replace(/\.pdf$/i, "").replace(/_/g, " ") }));
      }
    } else {
      toast.error(language === "ca" ? "Només s'accepten fitxers PDF" : "Solo se aceptan archivos PDF");
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.replace(/\.pdf$/i, "").replace(/_/g, " ") }));
      }
    }
  };

  // Enviar el formulari de pujada
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error(language === "ca" ? "Selecciona un fitxer PDF" : "Selecciona un archivo PDF");
      return;
    }
    if (!formData.title.trim()) {
      toast.error(language === "ca" ? "El títol és obligatori" : "El título es obligatorio");
      return;
    }

    setUploadStatus("uploading");
    setUploadError(null);
    setUploadResult(null);

    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("title", formData.title.trim());
      fd.append("type", formData.type);
      fd.append("source", formData.source.trim() || "Departament de Salut");
      fd.append("jurisdiction", formData.jurisdiction);
      if (formData.summary.trim()) fd.append("summary", formData.summary.trim());
      if (formData.url.trim()) fd.append("url", formData.url.trim());

      const res = await fetch("/api/upload/pdf", {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error pujant el document");
      }

      setUploadStatus("success");
      setUploadResult(data);
      toast.success(language === "ca" ? `Document "${formData.title}" afegit correctament` : `Documento "${formData.title}" añadido correctamente`);

      // Refrescar la llista de documents
      refetchDocuments();
      if (adminDocs !== null) loadAdminDocs();

      // Reset form
      setSelectedFile(null);
      setFormData({ title: "", type: "pildora", source: "Departament de Salut", jurisdiction: "autonomica", summary: "", url: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (err: any) {
      setUploadStatus("error");
      setUploadError(err.message || "Error desconegut");
      toast.error(err.message || (language === "ca" ? "Error pujant el document" : "Error subiendo el documento"));
    }
  };

  // Eliminar document
  const handleDelete = async (docId: number, docTitle: string) => {
    setDeletingId(docId);
    try {
      const res = await fetch(`/api/upload/documents/${docId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error eliminant el document");
      toast.success(language === "ca" ? `Document "${docTitle}" eliminat` : `Documento "${docTitle}" eliminado`);
      refetchDocuments();
      if (adminDocs !== null) {
        setAdminDocs(prev => prev?.filter(d => d.id !== docId) ?? null);
      }
    } catch (err: any) {
      toast.error(err.message || (language === "ca" ? "Error eliminant el document" : "Error eliminando el documento"));
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{language === "ca" ? "Accés restringit" : "Acceso restringido"}</h2>
          <p className="text-gray-600 mb-6">
            {language === "ca" ? "Necessites permisos d'administrador per accedir a aquesta pàgina" : "Necesitas permisos de administrador para acceder a esta página"}
          </p>
          <Link href="/">
            <Button className="w-full">
              <Home className="h-4 w-4 mr-2" />
              {language === "ca" ? "Tornar a l'inici" : "Volver al inicio"}
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
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{language === "ca" ? "Inici" : "Inicio"}</span>
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-900" />
                <h1 className="text-lg font-bold text-gray-900">{language === "ca" ? "Panell d'Administració" : "Panel de Administración"}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block">Admin: {user?.name}</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">{language === "ca" ? "Documents" : "Documentos"}</CardTitle>
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold text-blue-600">{documents?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">{language === "ca" ? "Casos" : "Casos"}</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold text-orange-600">{specialCases?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">{language === "ca" ? "Converses" : "Conversaciones"}</CardTitle>
                  <Database className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold text-green-600">{conversations?.length || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Upload PDF Section */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <FileUp className="h-5 w-5" />
                    {language === "ca" ? "Pujar Píndola de IT / Document PDF" : "Subir Píldora de IT / Documento PDF"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {language === "ca" ? "Puja un PDF del Departament de Salut, ICS o altra font. El text s'extreu automàticament i s'indexa a la base de dades." : "Sube un PDF del Departamento de Salud, ICS u otra fuente. El texto se extrae automáticamente y se indexa en la base de datos."}
                  </CardDescription>
                </div>
                <Dialog open={uploadOpen} onOpenChange={(open) => {
                  setUploadOpen(open);
                  if (!open) {
                    setUploadStatus("idle");
                    setUploadResult(null);
                    setUploadError(null);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-700 hover:bg-blue-800 text-white shrink-0">
                      <Upload className="h-4 w-4 mr-2" />
                      {language === "ca" ? "Pujar PDF" : "Subir PDF"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <FileUp className="h-5 w-5 text-blue-600" />
                        {language === "ca" ? "Pujar nou document PDF" : "Subir nuevo documento PDF"}
                      </DialogTitle>
                      <DialogDescription>
                        {language === "ca" ? "El text del PDF s'extraurà automàticament i estarà disponible per a la IA i el cercador." : "El texto del PDF se extraerá automáticamente y estará disponible para la IA y el buscador."}
                      </DialogDescription>
                    </DialogHeader>

                    {uploadStatus === "success" && uploadResult ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="h-8 w-8 text-green-600 shrink-0" />
                          <div>
                            <p className="font-semibold text-green-800">{language === "ca" ? "Document afegit correctament" : "Documento añadido correctamente"}</p>
                            <p className="text-sm text-green-700">{uploadResult.message}</p>
                            <p className="text-xs text-green-600 mt-1">
                              {uploadResult.extractedLength.toLocaleString()} {language === "ca" ? "caràcters extrets del PDF" : "caracteres extraídos del PDF"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setUploadStatus("idle");
                              setUploadResult(null);
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            {language === "ca" ? "Pujar un altre" : "Subir otro"}
                          </Button>
                          <Button onClick={() => setUploadOpen(false)} className="flex-1">
                            {language === "ca" ? "Tancar" : "Cerrar"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Drop Zone */}
                        <div
                          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            dragOver
                              ? "border-blue-500 bg-blue-50"
                              : selectedFile
                              ? "border-green-400 bg-green-50"
                              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={handleFileSelect}
                          />
                          {selectedFile ? (
                            <div className="space-y-2">
                              <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
                              <p className="font-medium text-green-700">{selectedFile.name}</p>
                              <p className="text-sm text-green-600">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              <p className="text-xs text-gray-500">{language === "ca" ? "Clica per canviar el fitxer" : "Haz clic para cambiar el archivo"}</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-10 w-10 text-gray-400 mx-auto" />
                              <p className="text-gray-600 font-medium">
                                {language === "ca" ? "Arrossega el PDF aquí o clica per seleccionar" : "Arrastra el PDF aquí o haz clic para seleccionar"}
                              </p>
                              <p className="text-sm text-gray-400">{language === "ca" ? "Màxim 20 MB · Només PDF" : "Máximo 20 MB · Solo PDF"}</p>
                            </div>
                          )}
                        </div>

                        {/* Form Fields */}
                        <div className="grid gap-3">
                          <div>
                            <Label htmlFor="doc-title">{language === "ca" ? "Títol del document *" : "Título del documento *"}</Label>
                            <Input
                              id="doc-title"
                              value={formData.title}
                              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder={language === "ca" ? "Ex: Píndola IT 15 - Gestació setmana 39" : "Ej: Píldora IT 15 - Gestación semana 39"}
                              className="mt-1"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>{language === "ca" ? "Tipus de document" : "Tipo de documento"}</Label>
                              <Select
                                value={formData.type}
                                onValueChange={v => setFormData(prev => ({ ...prev, type: v }))}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pildora">{language === "ca" ? "Píndola IT" : "Píldora IT"}</SelectItem>
                                  <SelectItem value="guia">{language === "ca" ? "Guia" : "Guía"}</SelectItem>
                                  <SelectItem value="manual">Manual</SelectItem>
                                  <SelectItem value="ley">{language === "ca" ? "Llei" : "Ley"}</SelectItem>
                                  <SelectItem value="decreto">{language === "ca" ? "Decret" : "Decreto"}</SelectItem>
                                  <SelectItem value="otro">{language === "ca" ? "Altre" : "Otro"}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>{language === "ca" ? "Jurisdicció" : "Jurisdicción"}</Label>
                              <Select
                                value={formData.jurisdiction}
                                onValueChange={v => setFormData(prev => ({ ...prev, jurisdiction: v }))}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="autonomica">{language === "ca" ? "Autonòmica (Cat)" : "Autonómica (Cat)"}</SelectItem>
                                  <SelectItem value="estatal">Estatal</SelectItem>
                                  <SelectItem value="ambas">{language === "ca" ? "Ambdues" : "Ambas"}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="doc-source">{language === "ca" ? "Font / Organisme" : "Fuente / Organismo"}</Label>
                            <Input
                              id="doc-source"
                              value={formData.source}
                              onChange={e => setFormData(prev => ({ ...prev, source: e.target.value }))}
                              placeholder={language === "ca" ? "Ex: Departament de Salut, ICS, INSS..." : "Ej: Departamento de Salud, ICS, INSS..."}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="doc-summary">{language === "ca" ? "Resum (opcional)" : "Resumen (opcional)"}</Label>
                            <Textarea
                              id="doc-summary"
                              value={formData.summary}
                              onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                              placeholder={language === "ca" ? "Breu descripció del contingut del document..." : "Breve descripción del contenido del documento..."}
                              className="mt-1 resize-none"
                              rows={2}
                            />
                          </div>

                          <div>
                            <Label htmlFor="doc-url">{language === "ca" ? "URL original (opcional)" : "URL original (opcional)"}</Label>
                            <Input
                              id="doc-url"
                              value={formData.url}
                              onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
                              placeholder="https://..."
                              className="mt-1"
                              type="url"
                            />
                          </div>
                        </div>

                        {uploadError && (
                          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            <XCircle className="h-4 w-4 shrink-0" />
                            {uploadError}
                          </div>
                        )}

                        <Button
                          onClick={handleUpload}
                          disabled={uploadStatus === "uploading" || !selectedFile || !formData.title.trim()}
                          className="w-full"
                        >
                          {uploadStatus === "uploading" ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {language === "ca" ? "Pujant i extraient text..." : "Subiendo y extrayendo texto..."}
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              {language === "ca" ? "Pujar i indexar document" : "Subir e indexar documento"}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {language === "ca" ? "Gestió de Documents" : "Gestión de Documentos"}
                  </CardTitle>
                  <CardDescription>
                    {documents?.length || 0} {language === "ca" ? "documents a la base de dades" : "documentos en la base de datos"}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAdminDocs}
                  disabled={loadingDocs}
                >
                  {loadingDocs ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">{language === "ca" ? "Carregar llista" : "Cargar lista"}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {adminDocs === null ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">{language === "ca" ? 'Clica "Carregar llista" per veure tots els documents' : 'Haz clic en "Cargar lista" para ver todos los documentos'}</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={loadAdminDocs}>
                    {language === "ca" ? "Carregar llista de documents" : "Cargar lista de documentos"}
                  </Button>
                </div>
              ) : loadingDocs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : adminDocs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">{language === "ca" ? "No hi ha documents a la base de dades" : "No hay documentos en la base de datos"}</p>
              ) : (
                <div className="space-y-2">
                  {adminDocs.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm truncate">{doc.title}</p>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {TYPE_LABELS[doc.type] || doc.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs shrink-0 text-blue-600 border-blue-200">
                            {JURISDICTION_LABELS[doc.jurisdiction] || doc.jurisdiction}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {doc.source} · {new Date(doc.createdAt).toLocaleDateString("ca-ES")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {doc.url && (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              disabled={deletingId === doc.id}
                            >
                              {deletingId === doc.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{language === "ca" ? "Eliminar document" : "Eliminar documento"}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {language === "ca" ? (
                                  <>Estàs segur que vols eliminar <strong>"{doc.title}"</strong>? Aquesta acció no es pot desfer.</>
                                ) : (
                                  <>¿Estás seguro de que quieres eliminar <strong>"{doc.title}"</strong>? Esta acción no se puede deshacer.</>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{language === "ca" ? "Cancel·lar" : "Cancelar"}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(doc.id, doc.title)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {language === "ca" ? "Eliminar" : "Eliminar"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottom Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {language === "ca" ? "Casos Especials" : "Casos Especiales"}
                </CardTitle>
                <CardDescription>
                  {specialCases?.length || 0} {language === "ca" ? "casos documentats" : "casos documentados"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {language === "ca" ? "Per afegir nous casos especials, utilitza els scripts de càrrega o contacta amb l'administrador del sistema." : "Para añadir nuevos casos especiales, utiliza los scripts de carga o contacta con el administrador del sistema."}
                </p>
                <Link href="/casos-especials">
                  <Button variant="outline" className="w-full">
                    {language === "ca" ? "Veure tots els casos" : "Ver todos los casos"}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {language === "ca" ? "Informació del Sistema" : "Información del Sistema"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{language === "ca" ? "Documents:" : "Documentos:"}</span>
                    <span className="font-semibold">{documents?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{language === "ca" ? "Casos especials:" : "Casos especiales:"}</span>
                    <span className="font-semibold">{specialCases?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{language === "ca" ? "Converses:" : "Conversaciones:"}</span>
                    <span className="font-semibold">{conversations?.length || 0}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>{language === "ca" ? "Base de dades operativa" : "Base de datos operativa"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
