export default function PrivacyPolicy() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Política de Privacidade</h1>
        <p className="text-sm text-gray-600 mb-8">Última atualização: 24 de janeiro de 2026</p>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Informações que Coletamos</h2>
            <p className="text-gray-700 mb-4">
              Coletamos as seguintes informações quando você usa nosso serviço:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Nome completo</strong> e <strong>email</strong> para criar sua conta</li>
              <li><strong>Dados de pagamento</strong> processados pelo Mercado Pago</li>
              <li><strong>Informações do campeonato</strong> (nome do torneio, times, jogadores)</li>
              <li><strong>Cookies e dados de navegação</strong> para melhorar a experiência</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Como Usamos Suas Informações</h2>
            <p className="text-gray-700 mb-4">
              Utilizamos seus dados para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Criar e gerenciar sua conta de organizador</li>
              <li>Processar pagamentos via Mercado Pago</li>
              <li>Enviar emails com credenciais de acesso e atualizações</li>
              <li>Melhorar nosso serviço e experiência do usuário</li>
              <li>Exibir anúncios relevantes via Google Ads</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Compartilhamento de Dados</h2>
            <p className="text-gray-700 mb-4">
              Compartilhamos seus dados apenas com:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Mercado Pago</strong> para processar pagamentos</li>
              <li><strong>Google Analytics</strong> para análise de tráfego</li>
              <li><strong>Serviço de email</strong> para envio de credenciais</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Não vendemos seus dados para terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies</h2>
            <p className="text-gray-700 mb-4">
              Utilizamos cookies para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Manter você logado no painel administrativo</li>
              <li>Analisar tráfego do site (Google Analytics)</li>
              <li>Melhorar anúncios (Google Ads)</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Você pode desativar cookies nas configurações do navegador.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Seus Direitos (LGPD)</h2>
            <p className="text-gray-700 mb-4">
              Você tem direito a:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Acessar</strong> seus dados pessoais</li>
              <li><strong>Corrigir</strong> informações incorretas</li>
              <li><strong>Deletar</strong> sua conta e dados</li>
              <li><strong>Solicitar portabilidade</strong> dos seus dados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Segurança</h2>
            <p className="text-gray-700 mb-4">
              Protegemos seus dados com:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Senhas criptografadas (bcrypt)</li>
              <li>Conexão HTTPS segura</li>
              <li>Tokens JWT com expiração de 30 dias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contato</h2>
            <p className="text-gray-700">
              Para dúvidas sobre privacidade, entre em contato:
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
