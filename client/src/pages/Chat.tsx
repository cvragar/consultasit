import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Send, Loader2, Home, FileText, BookOpen } from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { getLoginUrl } from "@/const";

export default function Chat() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(
    conversationId ? parseInt(conversationId) : null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createConversation = trpc.chat.createConversation.useMutation();
  const sendMessage = trpc.chat.sendMessage.useMutation();
  const { data: messages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: currentConversationId! },
    { enabled: !!currentConversationId }
  );
  const { data: conversations } = trpc.chat.getUserConversations.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !isAuthenticated) return;

    const messageText = message;
    setMessage("");

    try {
      // Crear conversación si no existe
      if (!currentConversationId) {
        const result = await createConversation.mutateAsync({});
        setCurrentConversationId(result.conversationId);
        
        // Enviar mensaje
        await sendMessage.mutateAsync({
          conversationId: result.conversationId,
          message: messageText,
        });
        
        refetchMessages();
      } else {
        await sendMessage.mutateAsync({
          conversationId: currentConversationId,
          message: messageText,
        });
        refetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
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
                <Shield className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Consulta amb IA</h1>
              </div>
            </div>
            <span className="text-sm text-gray-600">Hola, {user?.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container py-6 flex gap-6">
        {/* Sidebar - Conversations */}
        <aside className="w-64 flex-shrink-0 hidden md:block">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Converses</h3>
            <Button
              variant="outline"
              className="w-full mb-3"
              onClick={() => {
                setCurrentConversationId(null);
                setMessage("");
              }}
            >
              Nova conversa
            </Button>
            <div className="space-y-2">
              {conversations?.map((conv) => (
                <Link key={conv.id} href={`/chat/${conv.id}`}>
                  <Button
                    variant={currentConversationId === conv.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left truncate"
                    size="sm"
                  >
                    {conv.title || "Nova consulta"}
                  </Button>
                </Link>
              ))}
            </div>
          </Card>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {!messages || messages.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Benvingut al xat especialitzat en IT
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Pots fer qualsevol pregunta sobre normativa d'Incapacitat Temporal, casos especials,
                    procediments administratius o durada de processos
                  </p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setMessage("Quina és la durada màxima d'una IT?")}>
                      Durada màxima IT
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setMessage("Com funciona la menstruació incapacitant?")}>
                      Menstruació incapacitant
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setMessage("Què passa als 365 dies d'IT?")}>
                      Pròrroga als 365 dies
                    </Button>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none">
                          <Streamdown>{msg.content}</Streamdown>
                          {msg.sources && Array.isArray(msg.sources) && msg.sources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-300">
                              <p className="text-xs font-semibold text-gray-600 mb-2">
                                <FileText className="h-3 w-3 inline mr-1" />
                                Fonts consultades:
                              </p>
                              <ul className="text-xs space-y-1">
                                {msg.sources.map((source: any, idx: number) => (
                                  <li key={idx} className="text-gray-700">
                                    <BookOpen className="h-3 w-3 inline mr-1" />
                                    {source.title}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
              {sendMessage.isPending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Escriu la teva pregunta sobre IT..."
                  disabled={sendMessage.isPending}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessage.isPending}
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Les respostes es basen en normativa oficial. Consulta sempre amb professionals qualificats.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
