import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, Mail, MessageCircle, Sparkles } from "lucide-react";

export default function TesteGratisSucesso() {
  const [campaignSlug, setCampaignSlug] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Pegar parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    setCampaignSlug(params.get("slug") || "");
    setEmail(params.get("email") || "");
  }, []);

  const campaignUrl = campaignSlug ? `https://peladapro.com.br/${campaignSlug}` : "";
  const adminUrl = campaignSlug ? `https://peladapro.com.br/${campaignSlug}/admin` : "";

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
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Ícone de sucesso animado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🎉 Campeonato Criado<br />com Sucesso!
          </h1>
          <p className="text-xl text-gray-600">
            Seu teste grátis de 7 dias começou agora
          </p>
        </div>

        {/* Cards de informações */}
        <div className="space-y-4 mb-8">
          {/* Card: Seu Campeonato */}
          {campaignSlug && (
            <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-100 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">
                    Seu Campeonato Está no Ar!
                  </h2>
                  <p className="text-gray-600 mb-3">
                    Acesse seu site público:
                  </p>
                  <a
                    href={campaignUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold underline"
                  >
                    {campaignUrl}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Card: Email Enviado */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  📧 Credenciais Enviadas por Email
                </h2>
                <p className="text-gray-600 mb-2">
                  Enviamos suas credenciais de acesso para:
                </p>
                <p className="font-semibold text-gray-900 mb-3">
                  {email || "seu email"}
                </p>
                <p className="text-sm text-gray-500">
                  Verifique sua caixa de entrada (e spam) nos próximos minutos
                </p>
              </div>
            </div>
          </div>

          {/* Card: Painel Admin */}
          {adminUrl && (
            <div className="bg-white rounded-xl shadow-lg border-2 border-purple-100 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">
                    Acesse o Painel Administrativo
                  </h2>
                  <p className="text-gray-600 mb-3">
                    Comece a personalizar seu campeonato:
                  </p>
                  <a
                    href={adminUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold underline"
                  >
                    {adminUrl}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Próximos Passos */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl shadow-xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            🚀 Próximos Passos
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-white text-emerald-600 rounded-full flex items-center justify-center font-bold">
                1
              </span>
              <div>
                <p className="font-semibold mb-1">Verifique seu email</p>
                <p className="text-emerald-100 text-sm">
                  Pegue sua senha de acesso ao painel administrativo
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-white text-emerald-600 rounded-full flex items-center justify-center font-bold">
                2
              </span>
              <div>
                <p className="font-semibold mb-1">Personalize seu campeonato</p>
                <p className="text-emerald-100 text-sm">
                  Adicione logo, cores, times, jogadores e jogos
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-white text-emerald-600 rounded-full flex items-center justify-center font-bold">
                3
              </span>
              <div>
                <p className="font-semibold mb-1">Compartilhe com os participantes</p>
                <p className="text-emerald-100 text-sm">
                  Envie o link do seu campeonato para todos acompanharem
                </p>
              </div>
            </li>
          </ol>
        </div>

        {/* Suporte */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Precisa de Ajuda?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <a
              href="mailto:contato@meucontomagico.com.br"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <p className="text-sm text-gray-600">contato@meucontomagico.com.br</p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/551151981694?text=Ol%C3%A1%2C%20acabei%20de%20criar%20meu%20teste%20gr%C3%A1tis%20e%20preciso%20de%20ajuda"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">WhatsApp</p>
                <p className="text-sm text-gray-600">+55 11 5198-1694</p>
              </div>
            </a>
          </div>
        </div>

        {/* Botão voltar */}
        <div className="text-center">
          <Link href="/">
            <Button variant="outline" size="lg" className="text-gray-600">
              Voltar para a Página Inicial
            </Button>
          </Link>
        </div>

        {/* Lembrete */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            ⏰ Seu teste grátis expira automaticamente em 7 dias<br />
            Sem cobranças automáticas • Sem compromisso
          </p>
        </div>
      </div>
    </div>
  );
}
