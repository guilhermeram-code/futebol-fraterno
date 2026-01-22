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
  Loader2
} from "lucide-react";

// Planos disponíveis
const PLANS = [
  { id: "2months", name: "Iniciante", duration: "2 meses", price: 49.90, pricePerMonth: 24.95 },
  { id: "3months", name: "Popular", duration: "3 meses", price: 69.90, pricePerMonth: 23.30, popular: true },
  { id: "6months", name: "Semestral", duration: "6 meses", price: 119.90, pricePerMonth: 19.98 },
  { id: "12months", name: "Anual", duration: "12 meses", price: 199.90, pricePerMonth: 16.66, bestValue: true },
];

// Funcionalidades do produto
const FEATURES = [
  {
    icon: Trophy,
    title: "Gestão Completa",
    description: "Cadastre times, jogadores, grupos e gerencie todo o campeonato em um só lugar."
  },
  {
    icon: Calendar,
    title: "Calendário Automático",
    description: "Crie jogos, registre resultados e acompanhe a tabela de classificação em tempo real."
  },
  {
    icon: BarChart3,
    title: "Estatísticas Detalhadas",
    description: "Artilheiros, cartões, melhores defesas e muito mais. Tudo calculado automaticamente."
  },
  {
    icon: Camera,
    title: "Galeria de Fotos",
    description: "Compartilhe os melhores momentos do campeonato com uma galeria integrada."
  },
  {
    icon: Users,
    title: "Área do Torcedor",
    description: "Comentários, mensagens de apoio e interação com os times favoritos."
  },
  {
    icon: Shield,
    title: "Painel Administrativo",
    description: "Controle total com login seguro. Adicione outros administradores facilmente."
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

export default function LandingPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [formData, setFormData] = useState({
    campaignName: "",
    slug: "",
    email: "",
    phone: "",
    couponCode: "",
  });
  const [slugError, setSlugError] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ valid: boolean; discount: number } | null>(null);

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

  // Mutation para criar sessão de checkout
  const checkoutMutation = trpc.checkout.createSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        // Abrir checkout do Stripe em nova aba
        window.open(data.url, '_blank');
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
      slug: formData.slug,
      email: formData.email,
      phone: formData.phone || undefined,
      couponCode: formData.couponCode || undefined,
    });
  };

  const handleSlugChange = (value: string) => {
    // Limpar e formatar slug
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-emerald-800/30">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">Pelada<span className="text-emerald-400">Pro</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Funcionalidades</a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Preços</a>
            <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">Como Funciona</a>
          </nav>
          <Button 
            onClick={() => openCheckout(PLANS[1])} 
            className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
          >
            Começar Agora
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Novo: Chaves de mata-mata estilo Champions League
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Organize Seu Campeonato
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                Como um Profissional
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Crie seu site de campeonato em minutos. Tabelas, estatísticas, galeria de fotos 
              e muito mais. Tudo automatizado para você focar no que importa: o futebol!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => openCheckout(PLANS[1])}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-lg px-8"
              >
                Criar Meu Campeonato
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8"
                onClick={() => window.open("/futebol-fraterno", "_blank")}
              >
                Ver Demo
              </Button>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              ✓ Sem cartão de crédito para testar &nbsp; ✓ Configuração em 5 minutos &nbsp; ✓ Suporte via WhatsApp
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-slate-900/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tudo que Você Precisa
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Funcionalidades completas para gerenciar seu campeonato do início ao fim
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400">
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
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Escolha Seu Plano
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Preços acessíveis para campeonatos de todos os tamanhos
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {PLANS.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-all ${
                  plan.popular ? "ring-2 ring-emerald-500 scale-105" : ""
                } ${plan.bestValue ? "ring-2 ring-blue-500" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-500 text-white">Mais Popular</Badge>
                  </div>
                )}
                {plan.bestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Melhor Custo-Benefício</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-400">{plan.duration}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">R$ {plan.price.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-6">
                    R$ {plan.pricePerMonth.toFixed(2).replace(".", ",")}/mês
                  </p>
                  <ul className="text-left space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-slate-300 text-sm">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Site personalizado
                    </li>
                    <li className="flex items-center gap-2 text-slate-300 text-sm">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Times e jogadores ilimitados
                    </li>
                    <li className="flex items-center gap-2 text-slate-300 text-sm">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Estatísticas automáticas
                    </li>
                    <li className="flex items-center gap-2 text-slate-300 text-sm">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Galeria de fotos
                    </li>
                    <li className="flex items-center gap-2 text-slate-300 text-sm">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Suporte via WhatsApp
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600" 
                        : "bg-slate-700 hover:bg-slate-600"
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
      <section id="how-it-works" className="py-20 px-4 bg-slate-900/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Em apenas 3 passos simples, seu campeonato estará no ar
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {STEPS.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400">{step.description}</p>
                {index < STEPS.length - 1 && (
                  <ChevronRight className="w-8 h-8 text-slate-600 mx-auto mt-4 hidden md:block rotate-0 md:rotate-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-emerald-900/50 to-blue-900/50 rounded-2xl p-12 border border-emerald-500/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pronto para Começar?
            </h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Junte-se a dezenas de organizadores que já usam o Pelada Pro para gerenciar seus campeonatos.
            </p>
            <Button 
              size="lg" 
              onClick={() => openCheckout(PLANS[1])}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-lg px-8"
            >
              Criar Meu Campeonato Agora
              <Zap className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">Pelada<span className="text-emerald-400">Pro</span></span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2026 Pelada Pro. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-white text-sm">Termos de Uso</a>
              <a href="#" className="text-slate-400 hover:text-white text-sm">Privacidade</a>
              <a href="#" className="text-slate-400 hover:text-white text-sm">Contato</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Criar Seu Campeonato</DialogTitle>
            <DialogDescription className="text-slate-400">
              Preencha os dados abaixo para começar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Plano selecionado */}
            {selectedPlan && (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">{selectedPlan.name}</p>
                    <p className="text-slate-400 text-sm">{selectedPlan.duration}</p>
                  </div>
                  <div className="text-right">
                    {couponApplied?.valid && (
                      <p className="text-slate-500 line-through text-sm">
                        R$ {selectedPlan.price.toFixed(2).replace(".", ",")}
                      </p>
                    )}
                    <p className="text-emerald-400 font-bold text-lg">
                      R$ {calculateFinalPrice().toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Separator className="bg-slate-700" />

            {/* Nome do campeonato */}
            <div className="space-y-2">
              <Label htmlFor="campaignName" className="text-slate-300">Nome do Campeonato</Label>
              <Input
                id="campaignName"
                placeholder="Ex: Campeonato da Firma 2026"
                value={formData.campaignName}
                onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Slug (URL) */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-slate-300">URL do seu site</Label>
              <div className="flex items-center">
                <span className="text-slate-500 text-sm mr-1">peladapro.com.br/</span>
                <Input
                  id="slug"
                  placeholder="meu-campeonato"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white flex-1"
                />
              </div>
              {formData.slug.length >= 3 && (
                <div className="flex items-center gap-2 text-sm">
                  {checkingSlug ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  ) : slugCheck?.available ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">URL disponível!</span>
                    </>
                  ) : (
                    <>
                      <span className="text-red-400">URL já está em uso</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-300">WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Cupom */}
            <div className="space-y-2">
              <Label htmlFor="coupon" className="text-slate-300">Cupom de Desconto (opcional)</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  placeholder="CODIGO"
                  value={formData.couponCode}
                  onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <Button 
                  variant="outline" 
                  onClick={handleApplyCoupon}
                  className="border-slate-700 text-slate-300"
                >
                  Aplicar
                </Button>
              </div>
              {couponApplied && (
                <p className={couponApplied.valid ? "text-emerald-400 text-sm" : "text-red-400 text-sm"}>
                  {couponApplied.valid 
                    ? `Cupom aplicado! ${couponApplied.discount}% de desconto` 
                    : "Cupom inválido"}
                </p>
              )}
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
              disabled={!formData.campaignName || !formData.slug || !formData.email || !slugCheck?.available || isCreatingCheckout}
              onClick={handleCheckout}
            >
              {isCreatingCheckout ? (
                <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Processando...</>
              ) : (
                <>Continuar para Pagamento <ArrowRight className="ml-2 w-4 h-4" /></>
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              Pagamento seguro via Stripe. Você será redirecionado para finalizar.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
