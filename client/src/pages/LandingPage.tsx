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

// Planos disponíveis (com 30% de desconto)
const PLANS = [
  { id: "test", name: "Teste", duration: "1 mês", price: 1.00, originalPrice: 1.00, pricePerMonth: 1.00, isTest: true },
  { id: "basic", name: "Iniciante", duration: "2 meses", price: 90.30, originalPrice: 129, pricePerMonth: 45.15 },
  { id: "popular", name: "Popular", duration: "3 meses", price: 125.30, originalPrice: 179, pricePerMonth: 41.77 },
  { id: "extended", name: "Semestral", duration: "6 meses", price: 209.30, originalPrice: 299, pricePerMonth: 34.88, popular: true },
  { id: "annual", name: "Anual", duration: "12 meses", price: 349.30, originalPrice: 499, pricePerMonth: 29.11, bestValue: true },
];

// Funcionalidades do produto
const FEATURES = [
  {
    icon: Trophy,
    title: "Gestão Completa",
    description: "Cadastre times, jogadores, grupos e gerencie todo o campeonato em um só lugar.",
    screenshot: "/screenshots/home.webp"
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
        window.open(data.checkoutUrl, '_blank');
      }
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const isCreatingCheckout = checkoutMutation.isPending;

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
            <a href="#features" className="text-gray-600 hover:text-emerald-600 transition-colors font-medium">Funcionalidades</a>
            <a href="#pricing" className="text-gray-600 hover:text-emerald-600 transition-colors font-medium">Preços</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 transition-colors font-medium">Como Funciona</a>
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
                A partir de <span className="font-semibold text-emerald-600">R$ 29,11/mês</span> • Configuração em 5 minutos
              </p>
            </div>

            {/* Right side - Screenshot */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-emerald-200/50 border border-gray-200">
                <img 
                  src="/screenshots/home.webp" 
                  alt="Pelada Pro - Página inicial do campeonato"
                  className="w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">+500 campeonatos</p>
                    <p className="text-sm text-gray-500">criados na plataforma</p>
                  </div>
                </div>
              </div>
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
            <div className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg animate-pulse">
              <Sparkles className="w-5 h-5" />
              🎉 PROMOÇÃO - 100 PRIMEIROS CLIENTES DO ANO - 30% OFF
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {PLANS.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.isTest
                    ? "border-2 border-blue-500 shadow-lg shadow-blue-100"
                    : plan.popular 
                    ? "border-2 border-emerald-500 shadow-lg shadow-emerald-100 scale-105" 
                    : plan.bestValue 
                    ? "border-2 border-amber-500 shadow-lg shadow-amber-100"
                    : "border-gray-200 hover:border-emerald-300"
                }`}
              >
                {plan.isTest && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center text-sm py-1 font-medium">
                    Plano Teste
                  </div>
                )}
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
                <CardHeader className={plan.isTest || plan.popular || plan.bestValue ? "pt-10" : ""}>
                  <CardTitle className="text-gray-900">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-500">{plan.duration}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg text-gray-400 line-through">R$ {plan.originalPrice.toFixed(2).replace(".", ",")}</span>
                      <Badge className="bg-red-500 text-white text-xs">-30%</Badge>
                    </div>
                    <span className="text-4xl font-bold text-emerald-600">R$ {plan.price.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    Equivale a <span className="font-semibold text-emerald-600">R$ {plan.pricePerMonth.toFixed(2).replace(".", ",")}/mês</span>
                  </p>
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
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="mailto:contato@meucontomagico.com.br" className="hover:text-white transition-colors">contato@meucontomagico.com.br</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="w-[98vw] h-[98vh] p-0 overflow-hidden border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Visualização de Imagem</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-full h-full object-contain"
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
    </div>
  );
}
