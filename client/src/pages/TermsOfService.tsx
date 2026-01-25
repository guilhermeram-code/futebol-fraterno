export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <img 
                src="/pelada-pro-logo.png" 
                alt="Pelada Pro" 
                className="w-10 h-10 object-contain"
              />
              <span className="font-bold text-xl">Pelada<span className="text-emerald-500">Pro</span></span>
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Termos de Uso</h1>
        <p className="text-sm text-gray-600 mb-8">Última atualização: 24 de janeiro de 2026</p>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
            <p className="text-gray-700">
              Ao usar o PeladaPro, você concorda com estes Termos de Uso. Se não concordar, não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descrição do Serviço</h2>
            <p className="text-gray-700 mb-4">
              O PeladaPro é uma plataforma para organizar campeonatos de futebol, oferecendo:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Site personalizado para seu torneio</li>
              <li>Tabelas de classificação automáticas</li>
              <li>Chaves de mata-mata estilo Champions League</li>
              <li>Ranking de artilheiros e estatísticas</li>
              <li>Galeria de fotos e comentários da torcida</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cadastro e Conta</h2>
            <p className="text-gray-700 mb-4">
              Para usar o serviço, você deve:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Fornecer informações verdadeiras e completas</li>
              <li>Manter sua senha segura e confidencial</li>
              <li>Ser responsável por todas as atividades em sua conta</li>
              <li>Ter no mínimo 18 anos de idade</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Pagamento e Assinatura</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>O pagamento é processado via <strong>Mercado Pago</strong></li>
              <li>Planos mensais com renovação automática</li>
              <li>Cupons de desconto podem ser aplicados no checkout</li>
              <li>Reembolsos seguem a política do Mercado Pago</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Uso Aceitável</h2>
            <p className="text-gray-700 mb-4">
              Você concorda em <strong>NÃO</strong>:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Usar o serviço para fins ilegais</li>
              <li>Publicar conteúdo ofensivo, difamatório ou ilegal</li>
              <li>Tentar hackear ou comprometer a segurança do sistema</li>
              <li>Revender ou redistribuir o serviço sem autorização</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Conteúdo do Usuário</h2>
            <p className="text-gray-700 mb-4">
              Você é responsável por:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Todo conteúdo que publicar (fotos, nomes, comentários)</li>
              <li>Garantir que tem direitos sobre fotos e imagens enviadas</li>
              <li>Não violar direitos autorais ou de imagem de terceiros</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cancelamento</h2>
            <p className="text-gray-700 mb-4">
              Você pode cancelar sua assinatura a qualquer momento:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Acesse o painel administrativo</li>
              <li>Entre em contato via email: contato@meucontatomagico.com.br</li>
              <li>O acesso permanece até o fim do período pago</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitação de Responsabilidade</h2>
            <p className="text-gray-700 mb-4">
              O PeladaPro não se responsabiliza por:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Perda de dados devido a falhas técnicas</li>
              <li>Disputas entre organizadores e participantes</li>
              <li>Uso indevido do serviço por terceiros</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modificações</h2>
            <p className="text-gray-700">
              Podemos atualizar estes Termos a qualquer momento. Mudanças significativas serão notificadas por email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contato</h2>
            <p className="text-gray-700">
              Para dúvidas sobre os Termos de Uso:
            </p>
            <p className="text-gray-700 mt-4">
              <strong>Email:</strong>{" "}
              <a href="mailto:contato@meucontatomagico.com.br" className="text-emerald-600 hover:text-emerald-700">
                contato@meucontatomagico.com.br
              </a>
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            <strong>PeladaPro</strong> - Organize seu campeonato de futebol com facilidade.
          </p>
        </div>
      </main>
    </div>
  );
}
