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
    email: "",
    emailConfirm: "",
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
    if (!formData.email) {
      showToast("Campo obrigatório", "Preencha seu email");
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("Email inválido", "Digite um email válido");
      return;
    }

    // Validar confirmação de email
    if (formData.email !== formData.emailConfirm) {
      showToast("Emails não coincidem", "Os emails digitados não são iguais. Verifique e tente novamente.");
      return;
    }

    setIsSubmitting(true);
    createTrialMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Logo no topo - Clicável */}
      <div className="container mx-auto px-4 py-4">
        <a href="/landing" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
          <img 
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663182032912/NEjcHqnGfkYSxBSn.png" 
            alt="PeladaPro" 
            className="w-10 h-10 rounded-full object-cover shadow-lg"
          />
          <span className="text-xl font-bold">
            Pelada<span className="text-emerald-600">Pro</span>
          </span>
        </a>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-2 max-w-md">
        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
            Crie Seu Campeonato Grátis
          </h2>
          
          <p className="text-center text-sm text-gray-600 mb-4">
            Teste grátis por 7 dias – sem cartão de crédito
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 h-11 text-base"
                required
              />
            </div>

            {/* Confirmar Email */}
            <div>
              <Label htmlFor="emailConfirm" className="text-gray-700 font-medium text-sm">
                Confirme seu Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="emailConfirm"
                type="email"
                placeholder="Digite o email novamente"
                value={formData.emailConfirm}
                onChange={(e) => setFormData({ ...formData, emailConfirm: e.target.value })}
                className="mt-1 h-11 text-base"
                required
              />
              {formData.emailConfirm && formData.email !== formData.emailConfirm && (
                <p className="text-xs text-red-500 mt-0.5">
                  ⚠️ Os emails não coincidem
                </p>
              )}
              {formData.emailConfirm && formData.email === formData.emailConfirm && (
                <p className="text-xs text-emerald-600 mt-0.5">
                  ✅ Emails coincidem
                </p>
              )}
            </div>

            {/* Botão de envio */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg mt-4"
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

          </form>
          
          {/* Texto explicativo curto */}
          <p className="text-center text-xs text-gray-600 mt-3 mb-4">
            Você receberá um campeonato demo por 7 dias com login e senha por email
          </p>
          
          {/* Box informativo - Abaixo do botão */}
          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-5">
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
          
          {/* Aviso transparente */}
          <p className="text-center text-xs text-gray-500 mt-4">
            Licença de teste válida por 7 dias.<br />
            Sem cobranças automáticas. Sem compromisso.
          </p>
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
