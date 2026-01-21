import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Classificacao from "./pages/Classificacao";
import Jogos from "./pages/Jogos";
import Times from "./pages/Times";
import TimeDetail from "./pages/TimeDetail";
import Estatisticas from "./pages/Estatisticas";
import MataMata from "./pages/MataMata";
import Galeria from "./pages/Galeria";
import JogadorDetail from "./pages/JogadorDetail";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/classificacao" component={Classificacao} />
      <Route path="/jogos" component={Jogos} />
      <Route path="/times" component={Times} />
      <Route path="/times/:id" component={TimeDetail} />
      <Route path="/estatisticas" component={Estatisticas} />
      <Route path="/jogadores/:id" component={JogadorDetail} />
      <Route path="/mata-mata" component={MataMata} />
      <Route path="/galeria" component={Galeria} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
