import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Copy, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Pegar session_id da URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("session_id");
    setSessionId(id);
  }, []);

  // Por enquanto, mostrar mensagem genérica
  // TODO: Buscar dados da compra via API
  const campaignSlug = "seu-campeonato"; // Será substituído pelos dados reais

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://peladapro.com.br/${campaignSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-slate-800/50 border-slate-700 text-white">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Pagamento Confirmado!
          </CardTitle>
          <CardDescription className="text-slate-400">
            Seu campeonato foi criado com sucesso
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Status</span>
              <span className="text-emerald-400 font-medium">Ativo</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">ID da Transação</span>
              <span className="text-slate-300 font-mono text-xs">
                {sessionId?.slice(0, 20)}...
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-white">Próximos Passos:</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">1.</span>
                <span>Acesse seu painel administrativo para configurar o campeonato</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">2.</span>
                <span>Cadastre os times e jogadores participantes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">3.</span>
                <span>Crie os grupos e defina o calendário de jogos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">4.</span>
                <span>Compartilhe o link do seu campeonato!</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 space-y-2">
              <p className="text-sm text-slate-300">
                📧 <strong>Enviamos um email para você!</strong>
              </p>
              <p className="text-sm text-slate-300">
                Nele você encontrará:
              </p>
              <ul className="text-sm text-slate-300 ml-4 space-y-1">
                <li>• Link de acesso ao seu campeonato</li>
                <li>• Login e senha para o painel administrativo</li>
                <li>• Primeiros passos para começar</li>
              </ul>
              <p className="text-sm text-amber-300 font-semibold mt-3">
                ⚠️ Não recebeu? Verifique sua caixa de <strong>SPAM</strong> ou <strong>lixo eletrônico</strong>.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                onClick={() => setLocation("/landing")}
              >
                Voltar ao Início
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
