import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Zap, Shield, Clock } from "lucide-react";
// Toast será implementado via alert simples

export default function TesteGratis() {
  const [, setLocation] = useLocation();
  
  const showToast = (title: string, description: string) => {
    alert(`${title}\n\n${description}`);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    campaignName: "",
    campaignSlug: "",
  });

  const createTrialMutation = trpc.trial.signup.useMutation({
    onSuccess: (data) => {
      setIsSubmitting(false);
      // Redirecionar para página de sucesso com dados do campeonato
      setLocation(`/teste-gratis-sucesso?slug=${data.campaignSlug}&email=${formData.email}`);
    },
    onError: (error) => {
      setIsSubmitting(false);
      showToast("Erro ao criar campeonato", error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.name || !formData.email || !formData.campaignName || !formData.campaignSlug) {
      showToast("Campos obrigatórios", "Preencha todos os campos obrigatórios");
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("Email inválido", "Digite um email válido");
      return;
    }

    // Validar slug (apenas letras minúsculas, números e hífen)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(formData.campaignSlug)) {
      showToast("URL inválida", "Use apenas letras minúsculas, números e hífen");
      return;
    }

    setIsSubmitting(true);
    createTrialMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Logo no topo */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg">
            <img 
              src="/peladapro-logo.svg" 
              alt="PeladaPro" 
              className="w-8 h-8 object-cover"
            />
          </div>
          <span className="text-2xl font-bold">
            Pelada<span className="text-emerald-600">Pro</span>
          </span>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Headline */}
        <div className="text-center mb-8">
          <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            🎁 TESTE GRÁTIS POR 7 DIAS
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Organize Seu Campeonato<br />
            <span className="text-emerald-600">em Menos de 2 Minutos</span>
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Teste grátis por 7 dias – sem cartão de crédito
          </p>
          <p className="text-gray-500">
            Acesso completo a todas as funcionalidades
          </p>
        </div>

        {/* Benefícios rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-emerald-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Sem Cartão</p>
              <p className="text-xs text-gray-500">Não pedimos pagamento</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-emerald-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">7 Dias Grátis</p>
              <p className="text-xs text-gray-500">Expira automaticamente</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-emerald-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Acesso Total</p>
              <p className="text-xs text-gray-500">Todas as funcionalidades</p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Crie Seu Campeonato Grátis
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome Completo */}
            <div>
              <Label htmlFor="name" className="text-gray-700 font-semibold">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: João Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1.5 h-12 text-base"
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-gray-700 font-semibold">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1.5 h-12 text-base"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enviaremos suas credenciais de acesso
              </p>
            </div>

            {/* WhatsApp */}
            <div>
              <Label htmlFor="whatsapp" className="text-gray-700 font-semibold">
                WhatsApp (opcional)
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="(11) 98765-4321"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="mt-1.5 h-12 text-base"
              />
            </div>

            {/* Nome do Campeonato */}
            <div>
              <Label htmlFor="campaignName" className="text-gray-700 font-semibold">
                Nome do Campeonato <span className="text-red-500">*</span>
              </Label>
              <Input
                id="campaignName"
                type="text"
                placeholder="Ex: Copa Amigos 2026"
                value={formData.campaignName}
                onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                className="mt-1.5 h-12 text-base"
                required
              />
            </div>

            {/* URL do Site */}
            <div>
              <Label htmlFor="campaignSlug" className="text-gray-700 font-semibold">
                URL do Seu Site <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center mt-1.5">
                <span className="bg-gray-100 text-gray-600 px-4 h-12 flex items-center rounded-l-md border border-r-0 border-gray-300 text-sm">
                  peladapro.com.br/
                </span>
                <Input
                  id="campaignSlug"
                  type="text"
                  placeholder="meu-campeonato"
                  value={formData.campaignSlug}
                  onChange={(e) => setFormData({ ...formData, campaignSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="rounded-l-none h-12 text-base"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use apenas letras minúsculas, números e hífen
              </p>
            </div>

            {/* Box informativo */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
              <h3 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                O que você vai receber:
              </h3>
              <ul className="space-y-2 text-sm text-emerald-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Acesso completo por 7 dias a todas as funcionalidades</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Senha de acesso enviada por email em segundos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Sem cartão de crédito, sem cobranças automáticas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Suporte via WhatsApp durante todo o teste</span>
                </li>
              </ul>
            </div>

            {/* Botão de envio */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
            >
              {isSubmitting ? (
                "Criando seu campeonato..."
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  CRIAR CAMPEONATO GRÁTIS
                </>
              )}
            </Button>

            {/* Aviso transparente */}
            <p className="text-center text-xs text-gray-500 mt-4">
              Após 7 dias, o campeonato expira automaticamente.<br />
              Sem cobranças automáticas. Sem compromisso.
            </p>
          </form>
        </div>

        {/* Garantia adicional */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            🔒 Seus dados estão seguros. Não compartilhamos com terceiros.
          </p>
        </div>
      </div>
    </div>
  );
}
