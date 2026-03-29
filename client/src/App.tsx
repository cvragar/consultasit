import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { InstallBanner } from "./components/InstallBanner";
import { FeedbackModal, FeedbackButton } from "./components/FeedbackModal";
import { useState } from "react";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import CasosEspeciales from "./pages/CasosEspeciales";
import Documentos from "./pages/Documentos";
import Calculadora from "./pages/Calculadora";
import Admin from "./pages/Admin";
import Favorits from "./pages/Favorits";
import Novetats from "./pages/Novetats";
import Reclamacions from "./pages/Reclamacions";

function Router() {
  return (
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
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
