import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { 
  Trophy, 
  Users, 
  Calendar, 
  BarChart3, 
  Camera, 
  Shield, 
  Check, 
  Zap, 
  Star,
  ArrowRight,
  Sparkles,
  Target,
  Clock,
  ChevronRight,
  Loader2,
  Play,
  CheckCircle2
} from "lucide-react";

// Planos disponíveis (preços CHEIOS - use cupom LANCAMENTO40 para 40% OFF)
const PLANS = [
  { id: "basic", name: "Iniciante", duration: "2 meses", price: 195.00, originalPrice: 195.00, pricePerMonth: 97.50, pricePerMonthWithDiscount: 58.50 },
  { id: "popular", name: "Popular", duration: "3 meses", price: 268.00, originalPrice: 268.00, pricePerMonth: 89.33, pricePerMonthWithDiscount: 53.60, popular: true },
  { id: "extended", name: "Semestral", duration: "6 meses", price: 448.00, originalPrice: 448.00, pricePerMonth: 74.67, pricePerMonthWithDiscount: 44.80 },
  { id: "annual", name: "Anual", duration: "12 meses", price: 749.00, originalPrice: 749.00, pricePerMonth: 62.42, pricePerMonthWithDiscount: 37.45, bestValue: true },
];

// Funcionalidades do produto
const FEATURES = [
  {
    icon: Trophy,
    title: "Gestão Completa",
    description: "Cadastre times, jogadores, grupos e gerencie todo o campeonato em um só lugar.",
    screenshot: "/screenshots/gestao.webp"
  },
  {
    icon: Calendar,
    title: "Calendário Automático",
    description: "Crie jogos, registre resultados e acompanhe a tabela de classificação em tempo real.",
    screenshot: "/screenshots/jogos.webp"
  },
  {
    icon: BarChart3,
    title: "Estatísticas Detalhadas",
    description: "Artilheiros, cartões, melhores defesas e muito mais. Tudo calculado automaticamente.",
    screenshot: "/screenshots/estatisticas.webp"
  },
  {
    icon: Target,
    title: "Chaves Mata-Mata",
    description: "Sistema visual de chaves estilo Champions League. Quartas, semi e final.",
    screenshot: "/screenshots/mata-mata.webp"
  },
  {
    icon: Users,
    title: "Tabela de Classificação",
    description: "Grupos com pontuação automática. Vitórias, empates, saldo de gols calculados.",
    screenshot: "/screenshots/classificacao.webp"
  },
  {
    icon: Shield,
    title: "Painel Administrativo",
    description: "Controle total com login seguro. Adicione outros administradores facilmente.",
    screenshot: "/screenshots/admin.webp"
  },
];

// Passos de como funciona
const STEPS = [
  {
    number: "1",
    title: "Escolha seu plano",
    description: "Selecione o período que melhor se adapta ao seu campeonato."
  },
  {
    number: "2",
    title: "Personalize seu site",
    description: "Defina o nome, logo e cores do seu campeonato."
  },
  {
    number: "3",
    title: "Comece a usar!",
    description: "Cadastre times, jogadores e comece a registrar os jogos."
  },
];

// Benefícios
const BENEFITS = [
  "Site próprio com URL personalizada",
  "Tabelas de classificação automáticas",
  "Ranking de artilheiros e cartões",
  "Chaves de mata-mata visuais",
  "Galeria de fotos integrada",
  "Comentários da torcida",
  "Painel admin completo",
  "Suporte via e-mail"
];

export default function LandingPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [formData, setFormData] = useState({
    campaignName: "",
    slug: "",
    email: "",
    emailConfirm: "",
    phone: "",
    couponCode: "",
  });
  const [slugError, setSlugError] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ valid: boolean; discount: number } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Trial modal state
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [trialFormData, setTrialFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    campaignName: "",
    campaignSlug: "",
  });
  const [trialSlugError, setTrialSlugError] = useState("");

  // Verificar disponibilidade do slug
  const { data: slugCheck, isLoading: checkingSlug } = trpc.campaigns.checkSlug.useQuery(
    { slug: formData.slug },
    { enabled: formData.slug.length >= 3 }
  );

  // Validar cupom
  const { data: couponCheck } = trpc.coupons.validate.useQuery(
    { code: formData.couponCode },
    { enabled: formData.couponCode.length >= 3 }
  );

  // Mutation para criar sessão de checkout (Mercado Pago)
  const checkoutMutation = trpc.checkout.createMercadoPagoSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const isCreatingCheckout = checkoutMutation.isPending;

  // Mutation para criar trial signup
  const trialSignupMutation = trpc.trial.signup.useMutation({
    onSuccess: (data) => {
      // Mostrar modal de sucesso com credenciais
      alert(`✅ Campeonato criado com sucesso!\n\nURL: peladapro.com.br/${data.campaignSlug}\nSenha: ${data.password}\n\nVerifique seu email para mais detalhes.`);
      setShowTrialModal(false);
      // Resetar formulário
      setTrialFormData({
        name: "",
        email: "",
        whatsapp: "",
        campaignName: "",
        campaignSlug: "",
      });
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const isCreatingTrial = trialSignupMutation.isPending;

  const handleTrialSignup = () => {
    trialSignupMutation.mutate({
      name: trialFormData.name,
      email: trialFormData.email,
      whatsapp: trialFormData.whatsapp || undefined,
      campaignName: trialFormData.campaignName,
      campaignSlug: trialFormData.campaignSlug,
    });
  };

  const handleCheckout = () => {
    if (!selectedPlan) return;
    
    checkoutMutation.mutate({
      planId: selectedPlan.id,
      campaignName: formData.campaignName,
      campaignSlug: formData.slug,
      email: formData.email,
      whatsapp: formData.phone || "",
      couponCode: formData.couponCode || undefined,
    });
  };

  const handleSlugChange = (value: string) => {
    const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);
    setFormData({ ...formData, slug: cleanSlug });
    setSlugError("");
  };

  const handleApplyCoupon = () => {
    if (couponCheck) {
      setCouponApplied(couponCheck);
    }
  };

  const calculateFinalPrice = () => {
    if (!selectedPlan) return 0;
    if (couponApplied?.valid) {
      return selectedPlan.price * (1 - couponApplied.discount / 100);
    }
    return selectedPlan.price;
  };

  const openCheckout = (plan: typeof PLANS[0]) => {
    // Disparar evento GA4: iniciar_checkout
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'iniciar_checkout', {
        plano: plan.name,
        valor: plan.price,
        duracao: plan.duration,
        event_category: 'ecommerce',
        event_label: `Plano ${plan.name} - ${plan.duration}`
      });
    }
    
    setSelectedPlan(plan);
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img 
              src="/pelada-pro-logo.png" 
              alt="Pelada Pro" 
              className="w-10 h-10 object-contain"
            />
            <span className="font-bold text-xl text-gray-800">Pelada<span className="text-emerald-600">Pro</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#trial" className="text-emerald-600 hover:text-emerald-700 transition-colors font-semibold">Experimente Grátis</a>
            <a href="#features" className="text-gray-600 hover:text-emerald-600 transition-colors font-medium">Funcionalidades</a>
            <a href="#pricing" className="text-gray-600 hover:text-emerald-600 transition-colors font-medium">Preços</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 transition-colors font-medium">Como Funciona</a>
            <a href="#contact" className="text-gray-600 hover:text-emerald-600 transition-colors font-medium">Contato</a>
          </nav>
          <Button 
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
          >
            Começar Agora
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text */}
            <div>
              <Badge className="mb-6 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                <Sparkles className="w-3 h-3 mr-1" />
                Novo: Chaves de mata-mata estilo Champions League
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Organize Seu
                <span className="block text-emerald-600">
                  Campeonato de Futebol
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Crie seu site de campeonato em minutos. Tabelas automáticas, estatísticas completas, 
                galeria de fotos e muito mais. Tudo que você precisa para gerenciar sua pelada como um profissional!
              </p>
              
              {/* Benefits list */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {BENEFITS.slice(0, 6).map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 shadow-lg shadow-emerald-200"
                >
                  Criar Meu Campeonato
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 text-lg px-8"
                  onClick={() => window.open("/futebol-fraterno", "_blank")}
                >
                  <Play className="mr-2 w-5 h-5" />
                  Ver Demo
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                <span className="font-semibold text-emerald-600">40% OFF</span> com cupom <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">LANCAMENTO40</span> • A partir de R$ 37,45/mês
              </p>
            </div>

            {/* Right side - Screenshot */}
            <div className="relative">
              {/* Badge animado */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                <Badge className="bg-emerald-500 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                  👆 CLIQUE PARA EXPLORAR
                </Badge>
              </div>
              
              {/* Mockup clicável */}
              <a 
                href="/futebol-fraterno" 
                target="_blank"
                rel="noopener noreferrer"
                className="block relative rounded-2xl overflow-hidden shadow-2xl shadow-emerald-200/50 border border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:shadow-emerald-300/50 cursor-pointer group"
              >
                <img 
                  src="/screenshots/home.webp" 
                  alt="Pelada Pro - Página inicial do campeonato"
                  className="w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/30" />
                
                {/* Overlay com texto ao hover */}
                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 px-6 py-3 rounded-lg shadow-xl">
                    <p className="text-emerald-600 font-semibold flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Ver campeonato demo ao vivo
                    </p>
                  </div>
                </div>
              </a>
              
              {/* Texto descritivo abaixo */}
              <p className="text-center text-sm text-gray-600 mt-4 font-medium">
                ✨ Campeonato real funcionando - Clique para explorar
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Screenshots */}
      <section id="features" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">
              Funcionalidades
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que Você Precisa em Um Só Lugar
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Sistema completo para gerenciar seu campeonato do início ao fim
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-white border-gray-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => setPreviewImage(feature.screenshot)}
              >
                {/* Screenshot preview */}
                <div className="relative h-40 overflow-hidden bg-gray-100">
                  <img 
                    src={feature.screenshot} 
                    alt={feature.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                      Clique para ampliar
                    </span>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <CardTitle className="text-gray-900 text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trial Section */}
      <section id="trial" className="py-20 px-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="border-4 border-emerald-500 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"></div>
              <CardHeader className="text-center pt-12 pb-8 bg-gradient-to-br from-emerald-50 to-teal-50">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mx-auto mb-6 shadow-lg">
                  <span className="text-4xl">🎁</span>
                </div>
                <CardTitle className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                  EXPERIMENTE GRÁTIS POR 7 DIAS
                </CardTitle>
                <CardDescription className="text-xl text-gray-700 font-medium">
                  Teste TODAS as funcionalidades antes de decidir qual plano é melhor para você
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="flex flex-col items-center text-center p-6 bg-emerald-50 rounded-xl">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-3" />
                    <h3 className="font-bold text-gray-900 mb-2">Sem Cartão</h3>
                    <p className="text-sm text-gray-600">Não pedimos cartão de crédito</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-6 bg-teal-50 rounded-xl">
                    <CheckCircle2 className="w-12 h-12 text-teal-600 mb-3" />
                    <h3 className="font-bold text-gray-900 mb-2">Sem Compromisso</h3>
                    <p className="text-sm text-gray-600">Cancele quando quiser</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-6 bg-cyan-50 rounded-xl">
                    <CheckCircle2 className="w-12 h-12 text-cyan-600 mb-3" />
                    <h3 className="font-bold text-gray-900 mb-2">Acesso Completo</h3>
                    <p className="text-sm text-gray-600">Todas as funcionalidades liberadas</p>
                  </div>
                </div>
                <div className="text-center">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-12 py-7 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105"
                    onClick={() => setShowTrialModal(true)}
                  >
                    <Play className="w-6 h-6 mr-3" />
                    COMEÇAR TESTE GRÁTIS AGORA
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
                  <p className="text-sm text-gray-500 mt-4">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Crie seu campeonato em menos de 2 minutos
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-100 text-amber-700 border-amber-200">
              Preços
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Escolha o Plano Ideal
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Preços acessíveis para campeonatos de todos os tamanhos. Sem taxas escondidas.
            </p>
            <div className="mt-6 inline-flex flex-col items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl animate-pulse">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                <span className="text-lg">🎉 100 PRIMEIROS CLIENTES - 40% OFF 🎉</span>
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-sm">USE O CUPOM:</span>
                <span className="text-2xl font-black tracking-wider bg-white text-red-600 px-4 py-1 rounded-lg shadow-lg">LANCAMENTO40</span>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {PLANS.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? "border-2 border-emerald-500 shadow-lg shadow-emerald-100 scale-105" 
                    : plan.bestValue 
                    ? "border-2 border-amber-500 shadow-lg shadow-amber-100"
                    : "border-gray-200 hover:border-emerald-300"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-center text-sm py-1 font-medium">
                    Mais Popular
                  </div>
                )}
                {plan.bestValue && (
                  <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white text-center text-sm py-1 font-medium">
                    Melhor Custo-Benefício
                  </div>
                )}
                <CardHeader className={plan.popular || plan.bestValue ? "pt-10" : ""}>
                  <CardTitle className="text-gray-900">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-500">{plan.duration}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className="mb-3 bg-blue-100 text-blue-700 border-blue-200">
                    💵 PAGAMENTO ÚNICO
                  </Badge>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-emerald-600">R$ {plan.price.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Equivale a <span className="font-semibold text-emerald-600">R$ {plan.pricePerMonth.toFixed(2).replace(".", ",")}/mês</span>
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Sem mensalidades recorrentes
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                    <p className="text-xs text-amber-800 flex items-start gap-2">
                      <span className="text-amber-600">⚠️</span>
                      <span>Após o período de {plan.duration}, o campeonato expira</span>
                    </p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-gray-700 text-sm">
                      <Check className="w-4 h-4 text-emerald-500" />
                      Todas as funcionalidades
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 text-sm">
                      <Check className="w-4 h-4 text-emerald-500" />
                      URL personalizada
                    </li>
                    <li className="flex items-center gap-2 text-gray-700 text-sm">
                      <Check className="w-4 h-4 text-emerald-500" />
                      Suporte via e-mail
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                        : plan.bestValue
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                    onClick={() => openCheckout(plan)}
                  >
                    Escolher Plano
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">
              Como Funciona
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comece em 3 Passos Simples
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Seu campeonato online em menos de 5 minutos
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {STEPS.map((step, index) => (
              <div key={index} className="text-center relative">
                {index < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-emerald-200" />
                )}
                <div className="w-16 h-16 rounded-full bg-emerald-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg shadow-emerald-200">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-3xl p-12 text-center shadow-2xl shadow-emerald-200">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pronto para Organizar Seu Campeonato?
            </h2>
            <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de organizadores que já usam o Pelada Pro para gerenciar seus campeonatos
            </p>
            <Button 
              size="lg" 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-emerald-700 hover:bg-emerald-50 text-lg px-10 shadow-lg"
            >
              Criar Meu Campeonato Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">
              Contato
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tire Suas Dúvidas
            </h2>
            <p className="text-gray-600 text-lg mb-10">
              Entre em contato para tirar dúvidas ou conhecer melhor o PeladaPro
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Email */}
              <a 
                href="mailto:contato@meucontomagico.com.br"
                className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-emerald-500 transition-all shadow-sm hover:shadow-md"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-sm text-emerald-600 font-medium">contato@meucontomagico.com.br</p>
                </div>
              </a>
              {/* WhatsApp */}
              <a 
                href="https://wa.me/551151981694?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20o%20PeladaPro"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-green-500 transition-all shadow-sm hover:shadow-md"
              >
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                  <p className="text-sm text-green-600 font-medium">+55 11 5198-1694</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="/pelada-pro-logo.png" 
                alt="Pelada Pro" 
                className="w-8 h-8 object-contain"
              />
              <span className="font-bold text-lg text-white">Pelada<span className="text-emerald-400">Pro</span></span>
            </div>
            <p className="text-sm">
              © 2026 Pelada Pro. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <a href="/termos" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="/privacidade" className="hover:text-white transition-colors">Privacidade</a>
              <a href="mailto:contato@meucontomagico.com.br" className="hover:text-white transition-colors">contato@meucontomagico.com.br</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] p-0 overflow-hidden border-none bg-black/95">
          <DialogHeader className="sr-only">
            <DialogTitle>Visualização de Imagem</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-auto h-auto max-w-full max-h-[98vh] object-contain mx-auto"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Criar Seu Campeonato</DialogTitle>
            <DialogDescription className="text-gray-500">
              Preencha os dados abaixo para começar
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="bg-emerald-50 rounded-lg p-4 mb-4 border border-emerald-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">{selectedPlan.name}</p>
                  <p className="text-sm text-gray-600">{selectedPlan.duration}</p>
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  R$ {calculateFinalPrice().toFixed(2).replace(".", ",")}
                </p>
              </div>
              {couponApplied?.valid && (
                <p className="text-sm text-emerald-600 mt-2">
                  ✓ Cupom aplicado: {couponApplied.discount}% de desconto
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="campaignName" className="text-gray-700">Nome do Campeonato</Label>
              <Input
                id="campaignName"
                placeholder="Ex: Campeonato da Firma 2026"
                value={formData.campaignName}
                onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <Label htmlFor="slug" className="text-gray-700">URL do seu site</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">peladapro.com.br/</span>
                <Input
                  id="slug"
                  placeholder="meu-campeonato"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              {formData.slug.length >= 3 && (
                <p className={`text-sm mt-1 ${slugCheck?.available ? "text-emerald-600" : "text-red-500"}`}>
                  {checkingSlug ? "Verificando..." : slugCheck?.available ? "✓ URL disponível!" : "✗ URL já está em uso"}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <Label htmlFor="emailConfirm" className="text-gray-700">Confirmar Email</Label>
              <Input
                id="emailConfirm"
                type="email"
                placeholder="seu@email.com"
                value={formData.emailConfirm}
                onChange={(e) => setFormData({ ...formData, emailConfirm: e.target.value })}
                className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
              {formData.emailConfirm && formData.email !== formData.emailConfirm && (
                <p className="text-sm text-red-500 mt-1">✗ Os emails não coincidem</p>
              )}
              {formData.emailConfirm && formData.email === formData.emailConfirm && (
                <p className="text-sm text-emerald-600 mt-1">✓ Emails coincidem</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-700">WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <Label htmlFor="coupon" className="text-gray-700">Cupom de Desconto (opcional)</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  placeholder="CODIGO"
                  value={formData.couponCode}
                  onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <Button 
                  variant="outline" 
                  onClick={handleApplyCoupon}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Aplicar
                </Button>
              </div>
            </div>

            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleCheckout}
              disabled={
                isCreatingCheckout ||
                !formData.campaignName || 
                !formData.slug || 
                !formData.email || 
                !formData.emailConfirm ||
                formData.email !== formData.emailConfirm ||
                !slugCheck?.available
              }
            >
              {isCreatingCheckout ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  Continuar para Pagamento
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              Pagamento seguro via Mercado Pago. Aceita PIX, cartão e boleto.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trial Modal */}
      <Dialog open={showTrialModal} onOpenChange={setShowTrialModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              🎁 Teste Grátis por 7 Dias
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Crie seu campeonato agora e teste TODAS as funcionalidades
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="trialName" className="text-gray-700">Seu Nome Completo</Label>
              <Input
                id="trialName"
                placeholder="Ex: João Silva"
                value={trialFormData.name}
                onChange={(e) => setTrialFormData({ ...trialFormData, name: e.target.value })}
                className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <Label htmlFor="trialEmail" className="text-gray-700">Email</Label>
              <Input
                id="trialEmail"
                type="email"
                placeholder="seu@email.com"
                value={trialFormData.email}
                onChange={(e) => setTrialFormData({ ...trialFormData, email: e.target.value })}
                className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <Label htmlFor="trialWhatsapp" className="text-gray-700">WhatsApp (opcional)</Label>
              <Input
                id="trialWhatsapp"
                type="tel"
                placeholder="(11) 99999-9999"
                value={trialFormData.whatsapp}
                onChange={(e) => setTrialFormData({ ...trialFormData, whatsapp: e.target.value })}
                className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <Label htmlFor="trialCampaignName" className="text-gray-700">Nome do Campeonato</Label>
              <Input
                id="trialCampaignName"
                placeholder="Ex: Campeonato da Firma 2026"
                value={trialFormData.campaignName}
                onChange={(e) => setTrialFormData({ ...trialFormData, campaignName: e.target.value })}
                className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <Label htmlFor="trialSlug" className="text-gray-700">URL do seu site</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">peladapro.com.br/</span>
                <Input
                  id="trialSlug"
                  placeholder="meu-campeonato"
                  value={trialFormData.campaignSlug}
                  onChange={(e) => {
                    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    setTrialFormData({ ...trialFormData, campaignSlug: slug });
                  }}
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm text-emerald-800 font-medium mb-2">✨ O que você vai receber:</p>
              <ul className="text-sm text-emerald-700 space-y-1">
                <li>✓ Acesso completo por 7 dias</li>
                <li>✓ Todas as funcionalidades liberadas</li>
                <li>✓ Senha de acesso enviada por email</li>
                <li>✓ Sem cartão de crédito</li>
              </ul>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              onClick={handleTrialSignup}
              disabled={
                isCreatingTrial ||
                !trialFormData.name || 
                !trialFormData.email || 
                !trialFormData.campaignName || 
                !trialFormData.campaignSlug ||
                trialFormData.campaignSlug.length < 3
              }
            >
              {isCreatingTrial ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Criar Campeonato Grátis
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              Após 7 dias, o campeonato expira. Sem cobranças automáticas.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
