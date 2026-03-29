import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import {
  Users, MessageSquare, FileText, AlertCircle, TrendingUp,
  BarChart3, Activity, Loader2, Calendar
} from "lucide-react";
import { useT } from "@/contexts/LanguageContext";

/** Mini bar chart component (pure CSS, no dependencies) */
function MiniBarChart({ data, color = "bg-primary" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-[2px] h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${d.label}: ${d.value}`}>
          <div
            className={`w-full rounded-t-sm ${color} opacity-80 hover:opacity-100 transition-opacity min-h-[2px]`}
            style={{ height: `${Math.max((d.value / max) * 100, 3)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

/** Fill missing days in a date-count array */
function fillDays(data: { date: string; count: number }[], days: number = 30) {
  const map = new Map(data.map(d => [d.date, Number(d.count)]));
  const result: { label: string; value: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    result.push({ label: key, value: map.get(key) || 0 });
  }
  return result;
}

export default function AdminStats() {
  const { language } = useT();
  const { data: stats, isLoading, error } = trpc.admin.getStats.useQuery(undefined, {
    refetchInterval: 60_000, // refresh every minute
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            {language === "ca" ? "Carregant estadístiques..." : "Cargando estadísticas..."}
          </span>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-6 text-center text-red-600">
          {language === "ca" ? "Error carregant les estadístiques" : "Error cargando las estadísticas"}
        </CardContent>
      </Card>
    );
  }

  const t = stats.totals;
  const msgChartData = fillDays(stats.messagesPerDay);
  const convChartData = fillDays(stats.conversationsPerDay);
  const userChartData = fillDays(stats.usersPerDay);

  const totalMsgs30d = msgChartData.reduce((s, d) => s + d.value, 0);
  const totalConvs30d = convChartData.reduce((s, d) => s + d.value, 0);
  const totalUsers30d = userChartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
            <BarChart3 className="h-5 w-5" />
            {language === "ca" ? "Estadístiques d'ús" : "Estadísticas de uso"}
          </CardTitle>
          <CardDescription>
            {language === "ca"
              ? "Dades dels últims 30 dies. S'actualitzen cada minut."
              : "Datos de los últimos 30 días. Se actualizan cada minuto."}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Totals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label={language === "ca" ? "Documents" : "Documentos"}
          value={t.documents}
          color="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={<AlertCircle className="h-4 w-4" />}
          label={language === "ca" ? "Casos" : "Casos"}
          value={t.specialCases}
          color="text-orange-600 dark:text-orange-400"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label={language === "ca" ? "Usuaris" : "Usuarios"}
          value={t.users}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={<MessageSquare className="h-4 w-4" />}
          label={language === "ca" ? "Converses" : "Conversaciones"}
          value={t.conversations}
          color="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label={language === "ca" ? "Missatges" : "Mensajes"}
          value={t.messages}
          color="text-pink-600 dark:text-pink-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {language === "ca" ? "Missatges (30d)" : "Mensajes (30d)"}
              </CardTitle>
              <Badge variant="outline" className="text-xs">{totalMsgs30d}</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <MiniBarChart data={msgChartData} color="bg-pink-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {language === "ca" ? "Converses (30d)" : "Conversaciones (30d)"}
              </CardTitle>
              <Badge variant="outline" className="text-xs">{totalConvs30d}</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <MiniBarChart data={convChartData} color="bg-purple-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {language === "ca" ? "Nous usuaris (30d)" : "Nuevos usuarios (30d)"}
              </CardTitle>
              <Badge variant="outline" className="text-xs">{totalUsers30d}</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <MiniBarChart data={userChartData} color="bg-green-500" />
          </CardContent>
        </Card>
      </div>

      {/* Top Users & Recent Conversations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Users */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-green-600" />
              {language === "ca" ? "Usuaris més actius" : "Usuarios más activos"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {stats.topUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {language === "ca" ? "Encara no hi ha dades" : "Aún no hay datos"}
              </p>
            ) : (
              <div className="space-y-2">
                {stats.topUsers.map((u, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}.</span>
                      <span className="font-medium truncate max-w-[150px]">{u.userName || "Anònim"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {Number(u.messageCount)} {language === "ca" ? "msg" : "msg"}
                      </Badge>
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        {Number(u.conversationCount)} {language === "ca" ? "conv" : "conv"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-purple-600" />
              {language === "ca" ? "Converses recents" : "Conversaciones recientes"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {stats.recentConversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {language === "ca" ? "Encara no hi ha converses" : "Aún no hay conversaciones"}
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {stats.recentConversations.map((c) => (
                  <div key={c.id} className="flex items-start justify-between text-sm border-b border-border/50 pb-1.5 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-xs">{c.title || (language === "ca" ? "Sense títol" : "Sin título")}</p>
                      <p className="text-xs text-muted-foreground">{c.userName || "Anònim"}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {new Date(c.createdAt).toLocaleDateString(language === "ca" ? "ca-ES" : "es-ES", {
                        day: "numeric", month: "short"
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className={color}>{icon}</span>
        </div>
        <div className={`text-xl font-bold ${color}`}>{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}
