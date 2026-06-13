import { useT } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useSEO } from "@/hooks/useSEO";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, Send, Loader2, Home, MessageSquare, Trash2, Plus, Menu, X, Download, Zap } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { getLoginUrl } from "@/const";

type Conversation = {
  id: number;
  userId: number;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Message = {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  sources?: Array<{ title: string; documentId?: number; caseId?: number }> | null;
  createdAt: Date;
};

// Missatge temporal mentre s'està fent streaming
type StreamingMessage = {
  id: "streaming";
  role: "assistant";
  content: string;
  sources?: Array<{ title: string; documentId?: number; caseId?: number }>;
};

// Suggeriments ràpids per a la pantalla inicial
const QUICK_SUGGESTIONS_CA = [
  "Quina és la durada màxima d'una IT per contingència comuna?",
  "Com es gestiona una baixa mèdica retroactiva?",
  "Procediment per a la menstruació incapacitant",
  "AT en treballador autònom del RETA: com es gestiona?",
  "Pròrroga de la IT més enllà dels 365 dies",
  "Pluriactivitat: IT cobrant per dos règims alhora",
  "Recaiguda en IT: quan es considera nova baixa?",
  "Baixa mèdica durant les vacances: quins drets té el treballador?",
  "Diferència entre embaràs de risc (IT) i prestació per risc durant l'embaràs",
  "IT amb reducció de jornada per guarda legal: com es calcula la base reguladora?",
  "Com funciona la nova tramitació electrònica dels parts mèdics des de l'abril de 2023?",
  "Quins són els terminis de confirmació de la baixa per a cada grup de processos (RD 625/2014)?",
  "Com es gestiona la IT quan el pacient és ingressat a l'hospital?",
  "IT en teletreball: quan es considera accident de treball i quan contingència comuna?",
  "Com pot reclamar un pacient l'alta de la mútua per accident de treball?",
  "Quin termini té el pacient per impugnar una alta del metge de família a Catalunya?",
  "La mútua ha proposat l'alta a l'ICAM, el metge de família ha discrepat però l'ICAM confirma l'alta: com pot reclamar el pacient?",
  "Recaiguda post-alta de l'ICAM: com tramitar la nova baixa a través del formulari IS3 de l'eCap?",
  "IT i permís parental (16 setmanes): què passa amb la IT si la mare està de baixa quan arriba el part?",
];

const QUICK_SUGGESTIONS_ES = [
  "¿Cuál es la duración máxima de una IT por contingencia común?",
  "¿Cómo se gestiona una baja médica retroactiva?",
  "Procedimiento para la menstruación incapacitante",
  "AT en trabajador autónomo del RETA: ¿cómo se gestiona?",
  "Prórroga de la IT más allá de los 365 días",
  "Pluriactividad: IT cobrando por dos regímenes a la vez",
  "Recaida en IT: ¿cuándo se considera nueva baja?",
  "Baja médica durante las vacaciones: ¿qué derechos tiene el trabajador?",
  "Diferencia entre embarazo de riesgo (IT) y prestación por riesgo durante el embarazo",
  "IT con reducción de jornada por guarda legal: ¿cómo se calcula la base reguladora?",
  "¿Cómo funciona la nueva tramitación electrónica de los partes médicos desde abril de 2023?",
  "¿Cuáles son los plazos de confirmación de la baja para cada grupo de procesos (RD 625/2014)?",
  "¿Cómo se gestiona la IT cuando el paciente está ingresado en el hospital?",
  "IT en teletrabajo: ¿cuándo se considera accidente de trabajo y cuándo contingencia común?",
  "¿Cómo puede reclamar un paciente el alta de la mutua por accidente de trabajo?",
  "¿Qué plazo tiene el paciente para impugnar un alta del médico de familia en Cataluña?",
  "La mutua ha propuesto el alta al ICAM, el médico de familia ha discrepado pero el ICAM confirma el alta: ¿cómo puede reclamar el paciente?",
  "Recaida post-alta del ICAM: ¿cómo tramitar la nueva baja a través del formulario IS3 del eCap?",
  "IT y permiso parental (16 semanas): ¿qué pasa con la IT si la madre está de baja cuando llega el parto?",
];

export default function Chat() {
  const { t, language } = useT();

  useSEO({
    title: language === "ca"
      ? "Xat amb IA especialitzada en IT — Consultes IT"
      : "Chat con IA especializada en IT — Consultas IT",
    description: language === "ca"
      ? "Consulta dubtes sobre Incapacitat Temporal amb una IA especialitzada en normativa espanyola i catalana. Respostes precises amb citació de fonts."
      : "Consulta dudas sobre Incapacidad Temporal con una IA especializada en normativa española y catalana. Respuestas precisas con citación de fuentes.",
    canonicalPath: "/chat",
    noindex: true,
  });
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarInitialized, setSidebarInitialized] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const deleteConversation = trpc.chat.deleteConversation.useMutation();
  const exportPDF = trpc.chat.exportPDF.useMutation();

  const { data: messages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: currentConversationId! },
    { enabled: !!currentConversationId }
  );

  const { data: conversations, refetch: refetchConversations } = trpc.chat.getUserConversations.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Obrir el sidebar automàticament quan l'usuari té converses anteriors (només la primera vegada)
  useEffect(() => {
    if (!sidebarInitialized && conversations && conversations.length > 0) {
      setSidebarOpen(true);
      setSidebarInitialized(true);
    } else if (!sidebarInitialized && conversations && conversations.length === 0) {
      setSidebarInitialized(true);
    }
  }, [conversations, sidebarInitialized]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage?.content]);

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setStreamingMessage(null);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: number) => {
    setCurrentConversationId(id);
    setStreamingMessage(null);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;
    try {
      await deleteConversation.mutateAsync({ conversationId: conversationToDelete });
      if (currentConversationId === conversationToDelete) {
        setCurrentConversationId(null);
        setStreamingMessage(null);
      }
      refetchConversations();
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    } catch (error) {
      console.error("Error eliminant la conversa:", error);
    }
  };

  const handleExportPDF = async () => {
    if (!currentConversationId) return;
    try {
      const result = await exportPDF.mutateAsync({ conversationId: currentConversationId });
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
      console.error("Error exportant el PDF:", error);
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride ?? message).trim();
    if (!textToSend || !isAuthenticated || isStreaming) return;

    setMessage("");
    setIsStreaming(true);
    setStreamingMessage({ id: "streaming", role: "assistant", content: "" });

    // Cancel·lar qualsevol stream anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/stream/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          conversationId: currentConversationId ?? undefined,
          language: language,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} — torna-ho a intentar`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No s'ha pogut llegir el flux de dades");

      const decoder = new TextDecoder();
      let buffer = "";
      let streamedSources: Array<{ title: string; documentId?: number; caseId?: number }> = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const jsonStr = trimmed.slice(6);
          if (jsonStr === "[DONE]") continue;

          try {
            const event = JSON.parse(jsonStr) as {
              type: string;
              content?: string;
              conversationId?: number;
              sources?: typeof streamedSources;
              error?: string;
            };

            if (event.type === "conversationId" && event.conversationId) {
              setCurrentConversationId(event.conversationId);
            } else if (event.type === "sources" && event.sources) {
              streamedSources = event.sources;
              setStreamingMessage(prev =>
                prev ? { ...prev, sources: event.sources } : null
              );
            } else if (event.type === "chunk" && event.content) {
              setStreamingMessage(prev =>
                prev ? { ...prev, content: prev.content + event.content } : null
              );
            } else if (event.type === "done") {
              // Flux completat
            } else if (event.type === "error") {
              throw new Error(event.error || "Error intern del servidor");
            }
          } catch (parseError) {
            // Ignorar línies no JSON
          }
        }
      }

      // Refrescar dades un cop el flux ha acabat
      await refetchMessages();
      await refetchConversations();
      setStreamingMessage(null);

    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error en el flux de dades:", error);
        setStreamingMessage({
          id: "streaming",
          role: "assistant",
          content: language === "ca" ? "S'ha produït un error en generar la resposta. Torna-ho a intentar." : "Se ha producido un error al generar la respuesta. Vuelve a intentarlo.",
        });
        setTimeout(() => setStreamingMessage(null), 3000);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{language === "ca" ? "Inicia sessió per continuar" : "Inicia sesión para continuar"}</h2>
          <p className="text-muted-foreground mb-6">
            {language === "ca" ? "Necessites iniciar sessió per utilitzar el xat amb IA especialitzada en IT" : "Necesitas iniciar sesión para utilizar el chat con IA especializada en IT"}
          </p>
          <Button asChild className="w-full">
            <a href={getLoginUrl()}>{language === "ca" ? "Iniciar sessió" : "Iniciar sesión"}</a>
          </Button>
          <Link href="/">
            <Button variant="ghost" className="w-full mt-2">
              <Home className="h-4 w-4 mr-2" />
              {language === "ca" ? "Tornar a l'inici" : "Volver al inicio"}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Combinar missatges de la BD amb el missatge en streaming
  const allMessages: (Message | StreamingMessage)[] = [
    ...(messages || []),
    ...(streamingMessage ? [streamingMessage] : []),
  ];

  return (
    <div className="h-dvh bg-background flex relative overflow-hidden">
      {/* Overlay per a mòbil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Historial de converses */}
      <div
        className={`${
          sidebarOpen
            ? "fixed md:relative inset-y-0 left-0 w-72 md:w-80 z-30 md:z-auto"
            : "w-0"
        } transition-all duration-300 border-r bg-card flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">{language === "ca" ? "Historial" : "Historial"}</h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
            <Button onClick={handleNewConversation} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            {language === "ca" ? "Nova consulta" : "Nueva consulta"}
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations && conversations.length > 0 ? (
              conversations.map((conv: Conversation) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                    currentConversationId === conv.id
                      ? "bg-blue-100 text-blue-900"
                      : "hover:bg-muted"
                  }`}
                >
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => handleSelectConversation(conv.id)}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {conv.title || `Consulta ${conv.id}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conv.updatedAt).toLocaleDateString(language === "ca" ? "ca-ES" : "es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConversationToDelete(conv.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{language === "ca" ? "Encara no tens converses" : "Aún no tienes conversaciones"}</p>
                <p className="text-xs mt-1">{language === "ca" ? "Comença una nova consulta" : "Empieza una nueva consulta"}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Àrea principal del xat */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Capçalera */}
        <header className="border-b bg-background/90 dark:bg-card/90 backdrop-blur-sm sticky top-0 z-10 sticky-safe">
          <div className="px-3 sm:px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="h-8 w-8 shrink-0"
                  title={language === "ca" ? "Obrir historial" : "Abrir historial"}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <Link href="/">
                  <Button variant="ghost" size="sm" className="gap-1.5 px-2">
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">{language === "ca" ? "Inici" : "Inicio"}</span>
                  </Button>
                </Link>
                <Separator orientation="vertical" className="h-5 hidden sm:block" />
                <div className="flex items-center gap-1.5 min-w-0">
                  <MessageSquare className="h-5 w-5 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <h1 className="font-semibold text-sm sm:text-base truncate">{language === "ca" ? "Consulta IT" : "Consulta IT"}</h1>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600 hidden sm:inline">{language === "ca" ? "Respostes en temps real" : "Respuestas en tiempo real"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {currentConversationId && messages && messages.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    disabled={exportPDF.isPending || isStreaming}
                    className="gap-1.5 px-2 sm:px-3"
                    title={language === "ca" ? "Exportar conversa a PDF" : "Exportar conversación a PDF"}
                  >
                    {exportPDF.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                )}
                <ThemeSwitcher />
                <LanguageSwitcher />
                <div className="text-xs sm:text-sm text-gray-600 truncate max-w-[80px] sm:max-w-none hidden sm:block">
                  {user?.name?.split(" ")[0] || user?.email}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Àrea de missatges */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="container py-6 max-w-4xl">
            {allMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {language === "ca" ? "Xat especialitzat en IT" : "Chat especializado en IT"}
                </h2>
                <p className="text-muted-foreground mb-2">
                  {language === "ca" ? "Fes qualsevol consulta sobre normativa d'Incapacitat Temporal" : "Haz cualquier consulta sobre normativa de Incapacidad Temporal"}
                </p>
                <div className="flex items-center justify-center gap-1.5 mb-6">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">{language === "ca" ? "Respostes en temps real amb streaming" : "Respuestas en tiempo real con streaming"}</span>
                </div>

                {/* Suggeriments ràpids */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-foreground mb-3 flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    {language === "ca" ? "Suggeriments ràpids — clica per enviar" : "Sugerencias rápidas — haz clic para enviar"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto text-left">
                    {(language === "ca" ? QUICK_SUGGESTIONS_CA : QUICK_SUGGESTIONS_ES).map((suggestion: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(suggestion)}
                        disabled={isStreaming}
                        className="text-left text-sm px-4 py-2.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:border-blue-400 text-blue-800 dark:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">{language === "ca" ? "Fonts d'informació:" : "Fuentes de información:"}</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• {language === "ca" ? "Normativa estatal i autonòmica" : "Normativa estatal y autonómica"}</li>
                      <li>• {language === "ca" ? "Casos especials documentats" : "Casos especiales documentados"}</li>
                      <li>• {language === "ca" ? "Guies pràctiques del Departament de Salut" : "Guías prácticas del Departamento de Salud"}</li>
                      <li>• {language === "ca" ? "Jurisprudència del TS i TSJ" : "Jurisprudencia del TS y TSJ"}</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">{language === "ca" ? "Consells d'ús:" : "Consejos de uso:"}</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• {language === "ca" ? "Fes preguntes concretes i específiques" : "Haz preguntas concretas y específicas"}</li>
                      <li>• {language === "ca" ? "Indica el règim (RGSS, RETA, TRADE...)" : "Indica el régimen (RGSS, RETA, TRADE...)"}</li>
                      <li>• {language === "ca" ? "Menciona la durada de la baixa si és rellevant" : "Menciona la duración de la baja si es relevante"}</li>
                      <li>• {language === "ca" ? "Pots demanar exemples pràctics" : "Puedes pedir ejemplos prácticos"}</li>
                    </ul>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {allMessages.map((msg, idx) => (
                  <div
                    key={msg.id === "streaming" ? `streaming-${idx}` : msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <Card
                      className={`max-w-[85%] p-4 ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-card border-border dark:bg-card"
                      }`}
                    >
                      <div className="prose prose-sm max-w-none">
                        {msg.role === "assistant" ? (
                          <>
                            <Streamdown>{msg.content}</Streamdown>
                            {/* Cursor animat mentre s'escriu */}
                            {msg.id === "streaming" && msg.content && (
                              <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-0.5 align-text-bottom" />
                            )}
                            {/* Indicador de càrrega inicial */}
                            {msg.id === "streaming" && !msg.content && (
                              <div className="flex items-center gap-2 text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                <span className="text-sm">{language === "ca" ? "Consultant documentació..." : "Consultando documentación..."}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">
                            {language === "ca" ? "Fonts consultades:" : "Fuentes consultadas:"}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {msg.sources.map((source: any, sidx: number) => (
                              <span
                                key={sidx}
                                className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                              >
                                {source.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Àrea d'entrada */}
        <div className="border-t bg-background dark:bg-card p-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <div className="container max-w-4xl">
            <div className="flex gap-2">
              <Input
                placeholder={language === "ca" ? "Escriu la teva consulta sobre IT..." : "Escribe tu consulta sobre IT..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isStreaming}
                className="flex-1"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!message.trim() || isStreaming}
                className="gap-2 shrink-0"
              >
                {isStreaming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">{language === "ca" ? "Generant..." : "Generando..."}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">{language === "ca" ? "Enviar" : "Enviar"}</span>
                  </>
                )}
              </Button>
            </div>
            {isStreaming && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Zap className="h-3 w-3 text-green-500" />
                {language === "ca" ? "La IA està generant la resposta en temps real..." : "La IA está generando la respuesta en tiempo real..."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Diàleg de confirmació d'eliminació */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{language === "ca" ? "Eliminar conversa?" : "¿Eliminar conversación?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === "ca" ? "Aquesta acció no es pot desfer. La conversa i tots els seus missatges s'eliminaran permanentment." : "Esta acción no se puede deshacer. La conversación y todos sus mensajes se eliminarán permanentemente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === "ca" ? "Cancel·lar" : "Cancelar"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConversation}
              className="bg-red-600 hover:bg-red-700"
            >
              {language === "ca" ? "Eliminar" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
