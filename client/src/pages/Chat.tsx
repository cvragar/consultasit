import { useState, useEffect, useRef, useCallback } from "react";
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

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      console.error("Error deleting conversation:", error);
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
      console.error("Error exporting PDF:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !isAuthenticated || isStreaming) return;

    const messageText = message.trim();
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
          message: messageText,
          conversationId: currentConversationId ?? undefined,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No s'ha pogut llegir el stream");

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
              // Stream completat
            } else if (event.type === "error") {
              throw new Error(event.error || "Error del servidor");
            }
          } catch (parseError) {
            // Ignorar línies no JSON
          }
        }
      }

      // Refrescar dades un cop el stream ha acabat
      await refetchMessages();
      await refetchConversations();
      setStreamingMessage(null);

    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error en streaming:", error);
        setStreamingMessage({
          id: "streaming",
          role: "assistant",
          content: "S'ha produït un error en generar la resposta. Torna-ho a intentar.",
        });
        setTimeout(() => setStreamingMessage(null), 3000);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Inicia sessió per continuar</h2>
          <p className="text-gray-600 mb-6">
            Necessites iniciar sessió per utilitzar el xat amb IA especialitzada en IT
          </p>
          <Button asChild className="w-full">
            <a href={getLoginUrl()}>Iniciar sessió</a>
          </Button>
          <Link href="/">
            <Button variant="ghost" className="w-full mt-2">
              <Home className="h-4 w-4 mr-2" />
              Tornar a l'inici
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex relative">
      {/* Overlay per a mòbil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Historial de conversaciones */}
      <div
        className={`${
          sidebarOpen
            ? "fixed md:relative inset-y-0 left-0 w-72 md:w-80 z-30 md:z-auto"
            : "w-0"
        } transition-all duration-300 border-r bg-white flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Historial</h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleNewConversation} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Nova consulta
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
                      : "hover:bg-gray-100"
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
                      {new Date(conv.updatedAt).toLocaleDateString("ca-ES", {
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
                <p>Encara no tens converses</p>
                <p className="text-xs mt-1">Comença una nova consulta</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-3 sm:px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="h-8 w-8 shrink-0"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <Link href="/">
                  <Button variant="ghost" size="sm" className="gap-1.5 px-2">
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">Inici</span>
                  </Button>
                </Link>
                <Separator orientation="vertical" className="h-5 hidden sm:block" />
                <div className="flex items-center gap-1.5 min-w-0">
                  <MessageSquare className="h-5 w-5 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <h1 className="font-semibold text-sm sm:text-base truncate">Consulta IT</h1>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600 hidden sm:inline">Respostes en temps real</span>
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
                  >
                    {exportPDF.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                )}
                <div className="text-xs sm:text-sm text-gray-600 truncate max-w-[80px] sm:max-w-none hidden sm:block">
                  {user?.name?.split(" ")[0] || user?.email}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container py-6 max-w-4xl">
            {allMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Xat especialitzat en IT
                </h2>
                <p className="text-gray-600 mb-2">
                  Fes qualsevol consulta sobre normativa d'Incapacitat Temporal
                </p>
                <div className="flex items-center justify-center gap-1.5 mb-6">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Respostes en temps real amb streaming</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Exemples de consultes:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Durada màxima d'una IT?</li>
                      <li>• Com gestionar una baixa retroactiva?</li>
                      <li>• Procediment per a menstruació incapacitant</li>
                      <li>• AT en treballador autònom (RETA)</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Fonts d'informació:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Normativa estatal i autonòmica</li>
                      <li>• Casos especials documentats</li>
                      <li>• Guies pràctiques del Departament de Salut</li>
                      <li>• Jurisprudència del TS i TSJ</li>
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
                          : "bg-white border-gray-200"
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
                                <span className="text-sm">Consultant documentació...</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-1">
                            Fonts consultades:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {msg.sources.map((source: any, sidx: number) => (
                              <span
                                key={sidx}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
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

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <div className="container max-w-4xl">
            <div className="flex gap-2">
              <Input
                placeholder="Escriu la teva consulta sobre IT..."
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
                onClick={handleSendMessage}
                disabled={!message.trim() || isStreaming}
                className="gap-2 shrink-0"
              >
                {isStreaming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Generant...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">Enviar</span>
                  </>
                )}
              </Button>
            </div>
            {isStreaming && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Zap className="h-3 w-3 text-green-500" />
                La IA està generant la resposta en temps real...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar conversa?</AlertDialogTitle>
            <AlertDialogDescription>
              Aquesta acció no es pot desfer. La conversa i tots els seus missatges
              s'eliminaran permanentment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConversation}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
