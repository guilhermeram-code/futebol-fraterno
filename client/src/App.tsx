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
import ForgotPassword from "./pages/ForgotPassword";
import Patrocinadores from "./pages/Patrocinadores";
import Jogadores from "./pages/Jogadores";
import LandingPage from "./pages/LandingPage";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import TesteGratis from "./pages/TesteGratis";
import TesteGratisSucesso from "./pages/TesteGratisSucesso";
import { createContext, useContext, useState, useEffect, useRef } from "react";
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
        <CampaignPasswordGuard slug={slug} campaign={campaign}>
          {children}
        </CampaignPasswordGuard>
      </TournamentProvider>
    </CampaignContext.Provider>
  );
}

// Componente separado para o guard de senha (evita violação de regras de hooks)
function CampaignPasswordGuard({ slug, campaign, children }: { slug: string; campaign: any; children: React.ReactNode }) {
  const sessionKey = `access_granted_${slug}`;
  const [accessGranted, setAccessGranted] = useState(() => {
    return sessionStorage.getItem(sessionKey) === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const verifyPassword = trpc.campaigns.verifyAccessPassword.useMutation({
    onSuccess: (data) => {
      if (data.valid) {
        sessionStorage.setItem(sessionKey, 'true');
        setAccessGranted(true);
        setPasswordError('');
      } else {
        setPasswordError('Senha incorreta. Tente novamente.');
      }
    },
    onError: () => setPasswordError('Erro ao verificar senha. Tente novamente.')
  });
  const [currentPath] = useLocation();
  const isAdminRoute = currentPath.includes('/admin');

  if (campaign.accessPassword && !accessGranted && !isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-slate-700">
          <div className="text-center mb-6">
            {campaign.logoUrl && (
              <img src={campaign.logoUrl} alt="Logo" className="h-16 w-16 object-contain mx-auto mb-4 rounded-full" />
            )}
            <h1 className="text-xl font-bold text-white">{campaign.name}</h1>
            <p className="text-slate-400 text-sm mt-1">Digite a senha para acessar</p>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(''); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && passwordInput) {
                    verifyPassword.mutate({ slug, password: passwordInput });
                  }
                }}
                placeholder="Senha de acesso"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 pr-12"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-400 text-sm text-center">{passwordError}</p>
            )}
            <button
              onClick={() => {
                if (passwordInput) verifyPassword.mutate({ slug, password: passwordInput });
              }}
              disabled={verifyPassword.isPending || !passwordInput}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {verifyPassword.isPending ? 'Verificando...' : 'Acessar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
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
        <Route path={`/${slug}/admin/forgot-password`} component={ForgotPassword} />
        <Route path={`/${slug}/admin/change-password`} component={ChangePassword} />
        <Route path={`/${slug}/admin`} component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </CampaignLoader>
  );
}

// Rotas legadas (para manter compatibilidade com futebol-fraterno)
// NOTA: /admin foi removido - agora cada campeonato tem seu admin em /{slug}/admin
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
    'admin', 'classificacao', 'jogos', 'times', 'estatisticas', 'jogadores',
    'mata-mata', 'galeria', 'patrocinadores', '404', 'landing', 'checkout', 'checkout-success', 'login', 'admin-dashboard', 'admin-users',
    'privacidade', 'termos', 'teste-gratis', 'teste-gratis-sucesso'
  ];
  
  // Verificar se é a landing page (raiz) - PRIORIDADE MÁXIMA
  const isLandingPage = location === '/' || location === '';
  
  // Se for landing page ou raiz, mostrar página de vendas ANTES de qualquer outra lógica
  if (location === '/landing' || isLandingPage) {
    return <LandingPage />;
  }
  
  // Painel admin principal (dashboard com autenticação)
  if (location === '/admin') {
    return <AdminDashboard />;
  }
  
  // Verificar se é uma rota legada (sem slug)
  const isLegacyRoute = reservedRoutes.includes(potentialSlug);
  
  // Página de login
  if (location === '/login') {
    return <Login />;
  }
  
  // Política de Privacidade
  if (location === '/privacidade') {
    return <PrivacyPolicy />;
  }
  
  // Termos de Uso
  if (location === '/termos') {
    return <TermsOfService />;
  }
  
  // Teste Grátis (landing page dedicada para Google Ads)
  if (location === '/teste-gratis') {
    return <TesteGratis />;
  }
  
  // Página de Sucesso do Teste Grátis
  if (location.startsWith('/teste-gratis-sucesso')) {
    return <TesteGratisSucesso />;
  }
  
  
  // Painel admin do dono do PeladaPro
  if (location === '/admin-dashboard') {
    return <AdminDashboard />;
  }

  // Gestão de usuários (owner apenas)
  if (location === '/admin-users') {
    return <AdminUsers />;
  }
  
  // Página de sucesso do checkout
  if (location.startsWith('/checkout/success') || location === '/checkout-success') {
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
// Correções do Claude #3 aplicadas - Thu Jan 22 17:24:14 EST 2026
