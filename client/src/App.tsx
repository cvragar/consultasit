import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { InstallBanner } from "./components/InstallBanner";
import { FeedbackModal, FeedbackButton } from "./components/FeedbackModal";
import { useState, lazy, Suspense } from "react";

// Eager load: Home (landing page, critical for FCP)
import Home from "./pages/Home";

// Lazy load: secondary pages (code splitting per reduir bundle inicial)
const Chat = lazy(() => import("./pages/Chat"));
const CasosEspeciales = lazy(() => import("./pages/CasosEspeciales"));
const Documentos = lazy(() => import("./pages/Documentos"));
const Calculadora = lazy(() => import("./pages/Calculadora"));
const Admin = lazy(() => import("./pages/Admin"));
const Favorits = lazy(() => import("./pages/Favorits"));
const Novetats = lazy(() => import("./pages/Novetats"));
const Reclamacions = lazy(() => import("./pages/Reclamacions"));
const GuiaIT = lazy(() => import("./pages/GuiaIT"));
const FAQ = lazy(() => import("./pages/FAQ"));

/** Spinner de càrrega mínim per a les pàgines lazy */
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Carregant...</span>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/chat"} component={Chat} />
        <Route path={"/chat/:conversationId"} component={Chat} />
        <Route path={"/casos-especiales"} component={CasosEspeciales} />
        <Route path={"/casos-especials"} component={CasosEspeciales} />
        <Route path={"/documentos"} component={Documentos} />
        <Route path={"/documents"} component={Documentos} />
        <Route path={"/calculadora"} component={Calculadora} />
        <Route path={"/admin"} component={Admin} />
        <Route path={"/favorits"} component={Favorits} />
        <Route path={"/novetats"} component={Novetats} />
        <Route path={"/reclamacions"} component={Reclamacions} />
        <Route path={"/guia-it"} component={GuiaIT} />
        <Route path={"/faq"} component={FAQ} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <InstallBanner />
            <FeedbackButton onClick={() => setFeedbackOpen(true)} />
            <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
