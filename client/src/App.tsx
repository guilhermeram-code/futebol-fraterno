import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TournamentProvider } from "./contexts/TournamentContext";
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
import Patrocinadores from "./pages/Patrocinadores";
import Jogadores from "./pages/Jogadores";
import LandingPage from "./pages/LandingPage";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import AdminDashboard from "./pages/AdminDashboard";
import { createContext, useContext, useState, useEffect } from "react";
import { trpc } from "./lib/trpc";

// Context para o slug do campeonato atual
interface CampaignContextType {
  slug: string | null;
  campaignId: number;
  isLandingPage: boolean;
  campaign: any | null;
  isLoading: boolean;
}

const CampaignContext = createContext<CampaignContextType>({
  slug: null,
  campaignId: 1,
  isLandingPage: false,
  campaign: null,
  isLoading: true,
});

export const useCampaign = () => useContext(CampaignContext);

// Componente que carrega dados do campeonato e renderiza as rotas
function CampaignLoader({ slug, children }: { slug: string; children: React.ReactNode }) {
  const { data: campaign, isLoading, error } = trpc.campaigns.bySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p>Carregando campeonato...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Campeonato não encontrado</h1>
          <p className="text-slate-400 mb-6">O campeonato "{slug}" não existe ou foi desativado.</p>
          <a href="/landing" className="text-emerald-500 hover:underline">
            Voltar para a página inicial
          </a>
        </div>
      </div>
    );
  }

  if (!campaign.isActive) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Campeonato Expirado</h1>
          <p className="text-slate-400 mb-6">O período de acesso a este campeonato expirou.</p>
          <a href="/landing" className="text-emerald-500 hover:underline">
            Renovar assinatura
          </a>
        </div>
      </div>
    );
  }

  return (
    <CampaignContext.Provider value={{ 
      slug, 
      campaignId: campaign.id, 
      isLandingPage: false,
      campaign,
      isLoading: false,
    }}>
      <TournamentProvider campaignId={campaign.id}>
        {children}
      </TournamentProvider>
    </CampaignContext.Provider>
  );
}

// Rotas do campeonato (quando acessado via /{slug}/...)
function CampaignRouter({ slug }: { slug: string }) {
  return (
    <CampaignLoader slug={slug}>
      <Switch>
        <Route path={`/${slug}`} component={Home} />
        <Route path={`/${slug}/classificacao`} component={Classificacao} />
        <Route path={`/${slug}/jogos`} component={Jogos} />
        <Route path={`/${slug}/times`} component={Times} />
        <Route path={`/${slug}/times/:id`} component={TimeDetail} />
        <Route path={`/${slug}/estatisticas`} component={Estatisticas} />
        <Route path={`/${slug}/jogadores`} component={Jogadores} />
        <Route path={`/${slug}/jogadores/:id`} component={JogadorDetail} />
        <Route path={`/${slug}/mata-mata`} component={MataMata} />
        <Route path={`/${slug}/galeria`} component={Galeria} />
        <Route path={`/${slug}/patrocinadores`} component={Patrocinadores} />
        <Route path={`/${slug}/admin/login`} component={AdminLogin} />
        <Route path={`/${slug}/admin`} component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </CampaignLoader>
  );
}

// Rotas legadas (para manter compatibilidade com futebol-fraterno)
function LegacyRouter() {
  return (
    <CampaignLoader slug="futebol-fraterno">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/classificacao" component={Classificacao} />
        <Route path="/jogos" component={Jogos} />
        <Route path="/times" component={Times} />
        <Route path="/times/:id" component={TimeDetail} />
        <Route path="/estatisticas" component={Estatisticas} />
        <Route path="/jogadores" component={Jogadores} />
        <Route path="/jogadores/:id" component={JogadorDetail} />
        <Route path="/mata-mata" component={MataMata} />
        <Route path="/galeria" component={Galeria} />
        <Route path="/patrocinadores" component={Patrocinadores} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={Admin} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </CampaignLoader>
  );
}

// Router principal que decide entre landing page, campeonato ou rotas legadas
function MainRouter() {
  const [location] = useLocation();
  
  // Extrair slug da URL
  const pathParts = location.split('/').filter(Boolean);
  const potentialSlug = pathParts[0];
  
  // Lista de rotas que NÃO são slugs de campeonato
  const reservedRoutes = [
    'classificacao', 'jogos', 'times', 'estatisticas', 'jogadores',
    'mata-mata', 'galeria', 'patrocinadores', 'admin', '404', 'landing', 'checkout', 'login', 'change-password', 'admin-dashboard'
  ];
  
  // Verificar se é a landing page (raiz)
  const isLandingPage = location === '/' || location === '';
  
  // Verificar se é uma rota legada (sem slug)
  const isLegacyRoute = reservedRoutes.includes(potentialSlug);
  
  // Se for landing page ou raiz, mostrar página de vendas
  if (location === '/landing' || isLandingPage) {
    return <LandingPage />;
  }
  
  // Página de login
  if (location === '/login') {
    return <Login />;
  }
  
  // Página de alteração de senha
  if (location === '/change-password') {
    return <ChangePassword />;
  }
  
  // Painel admin do dono do PeladaPro
  if (location === '/admin-dashboard') {
    return <AdminDashboard />;
  }
  
  // Página de sucesso do checkout
  if (location.startsWith('/checkout/success')) {
    return <CheckoutSuccess />;
  }
  
  // Se for rota legada (sem slug), usar router legado (futebol-fraterno)
  // Isso mantém compatibilidade com o site existente
  if (isLegacyRoute) {
    return <LegacyRouter />;
  }
  
  // Se tiver um slug, usar router de campeonato
  // O CampaignLoader vai buscar o campaignId do banco
  return <CampaignRouter slug={potentialSlug} />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <MainRouter />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
