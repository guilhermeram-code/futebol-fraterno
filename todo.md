# Futebol Fraterno 2026 - TODO

## Banco de Dados
- [x] Tabela de times (nome, logo, loja)
- [x] Tabela de jogadores (nome, número, posição, time)
- [x] Tabela de grupos
- [x] Tabela de jogos (fase de grupos e mata-mata)
- [x] Tabela de resultados e estatísticas
- [x] Tabela de cartões (amarelo/vermelho)
- [x] Tabela de gols (jogador, jogo)
- [x] Tabela de comentários públicos
- [x] Tabela de fotos (galeria)

## Painel Administrativo
- [x] Autenticação com senha (admin: guilhermeram@gmail.com)
- [x] Formulário cadastro de times
- [x] Formulário cadastro de jogadores
- [x] Formulário criação de grupos
- [x] Formulário cadastro de jogos/rodadas
- [x] Formulário registro de resultados
- [x] Formulário registro de gols por jogador
- [x] Formulário registro de cartões
- [x] Upload de fotos para galeria
- [x] Gerenciamento de comentários (deletar)
- [x] Calendário de jogos editável

## Página Pública
- [x] Design maçônico (dourado + preto + fundo claro)
- [x] Logo em destaque
- [x] Música de fundo com controle de volume/mute
- [x] Tabela de classificação por grupo
- [x] Ranking de artilheiros
- [x] Ranking de cartões (maior quebrador)
- [x] Pior goleiro (frangueiro)
- [x] Próximos jogos em destaque
- [x] Calendário de jogos
- [x] Histórico de confrontos entre times
- [x] Estatísticas por rodada
- [x] Página de cada time com histórico
- [x] Chaves de mata-mata estilo Champions League
- [x] Sistema de comentários públicos
- [x] Galeria de fotos
- [x] Certificados visuais (artilheiro, melhor defesa)

## Funcionalidades Automáticas
- [x] Cálculo automático de pontuação (3-1-0)
- [x] Atualização automática da tabela de classificação
- [x] Cálculo de saldo de gols
- [x] Identificação automática de classificados para mata-mata
- [x] Registro de pênaltis em mata-mata

## Responsividade
- [x] Layout responsivo para celular
- [x] Layout responsivo para desktop


## Correções
- [x] Menu hambúrguer mobile com todas as opções de navegação

## Melhorias Solicitadas
- [x] Música automática ao entrar no site
- [x] Música continua entre páginas (não para e recomeça)
- [x] Registro de gols mais intuitivo com campos obrigatórios
- [x] Sistema de avisos importantes na home
- [x] Artilheiros mostram time e loja
- [x] Controle de acesso admin melhorado
- [x] Cadastro de novos emails como admin
- [x] Visual do site melhorado (fundo com detalhes)
- [x] Logo centralizado no círculo
- [x] Configurações editáveis do campeonato (logo, nome, subtítulo, organizador, música)- [x] Galeria - Data sem sobrepor a foto- [x] Botão para baixar fotos da galeria


## Bugs Reportados (20/01/2026)
- [x] Registro de gols intuitivo - campos obrigatórios após salvar resultado
- [x] Música não toca - corrigir player de áudio
- [x] Configurações não refletem no site - usar dados dinâmicos do banco
- [x] Novo admin cadastrado não tem acesso ao painel
- [x] Adicionar upload de imagem de fundo nas configurações
- [x] Download de fotos abre aba ao invés de baixar direto
- [x] Traduzir fases do mata-mata para português (quarters → Quartas)
- [x] Critério Maior Quebrador: vermelho > amarelo, desempate por amarelo

## Novas Features (20/01/2026)
- [x] Upload de imagem de fundo para seção Hero (parte laranja)
- [x] Nome, subtítulo e organizador dinâmicos no Header e Footer
- [x] Adicionar campo "Lado da Chave" (esquerdo/direito) no cadastro de jogos do mata-mata

## Solicitações arrumar.docx (20/01/2026)
- [x] 1. Login simplificado com email/senha (cadastrar guilhermeram@gmail.com / 1754gr)
- [x] 2. Reordenar abas: Grupos → Times → Jogadores → resto
- [x] 3. Organizar jogadores por Grupo/Loja com expand/collapse
- [x] 4. Cabeçalho na página do time com nome e loja em destaque
- [x] 5. Melhorar seleção de jogo: "Time (Loja) vs Time (Loja) Rodada - Data" + status colorido
- [x] 6. Mostrar loja no ranking de artilheiros
- [x] 7. Inverter ordem visual do Maior Quebrador (vermelho primeiro)
- [x] 8. Sistema de aprovação de comentários
- [x] 9. Remover campo "Lado da Chave" para Final
- [x] 10. Corrigir responsividade mobile do painel admin
- [x] 11. Autoplay da música ao entrar no site

## Ajustes Finais (20/01/2026)
- [x] Sistema de login com username/senha (sem email)
- [x] Controle de permissões: só admin principal cadastra novos admins
- [x] Botão de logout no painel admin
- [x] Nome da loja na classificação
- [x] Nome da loja em próximos jogos e resultados
- [x] Vermelho antes do amarelo na página inicial (Maior Quebrador)
- [x] Testes automatizados do sistema de autenticação (9 testes passando)

## Bug Reportado (20/01/2026 - 15:30)
- [x] Login funciona mas não redireciona para painel admin - página Admin.tsx ainda verifica autenticação OAuth antiga
  - Solução: Migrado de cookies HTTP-only para localStorage + Authorization header
  - Sistema de autenticação agora usa JWT armazenado no localStorage
  - Token enviado via header Authorization: Bearer <token>
  - Fluxo completo testado: login → acesso ao painel → logout → bloqueio de acesso

## Bugs Reportados (20/01/2026 - 15:50)
- [x] Últimos Resultados (Home) - falta nome da loja junto aos times
- [x] Frangueiro (Pior Defesa) - falta nome da loja junto aos times
- [x] Melhor Defesa - falta nome da loja junto aos times
- [x] Próximo Jogo (Home) - mostra "Rodada null" ao invés da rodada correta (corrigido para mostrar "Fase de Grupos - Grupo A/B")
- [x] Mata-mata - falta nome da loja em todos os jogos (semifinais, final, etc)
- [x] Troféu "Final" - texto e ícone estão sobrepostos ao card do jogo (troféu agora aparece acima do título)


## MEGA ATUALIZAÇÃO - 26 MELHORIAS PARA MONETIZAÇÃO

### Bloco 1: Fundação (Crítico)
- [x] Popup confirmação deletar (grupo, time, jogador, jogo) - JÁ IMPLEMENTADO
- [x] Corrigir pontos fase grupos vs mata-mata (página do time) - JÁ IMPLEMENTADO (statsGroupOnly e statsKnockoutOnly separados)
- [x] Nome da loja nos grupos (admin)

### Bloco 2: Visual e UX
- [x] Comentários com scroll (max 400px, scroll interno) - JÁ IMPLEMENTADO
- [x] Melhorias visuais gerais (fonte esportiva Oswald, sombras, hover, zebra)
- [x] Explicar "@" nos jogos (casa/fora) - 🏠 para casa, ✈️ para fora com tooltip
- [x] Informações no card do time (aproveitamento %, sequência de resultados com emojis)
- [x] Estatísticas do time menos poluídas (layout compacto com abreviações)
- [x] Mensagens comemorativas/brincalhonas - JÁ IMPLEMENTADO (artilheiro, quebrador, frangueiro, melhor defesa)

### Bloco 3: Busca e Organização
- [x] Busca de times (campo inteligente) - JÁ IMPLEMENTADO na página Times
- [x] Organizar times por grupos (accordion)
- [ ] Busca de jogadores (nova página/seção)
- [ ] Organizar resultados por grupos (abas/accordion)
- [ ] Organizar próximos jogos por grupos
- [ ] Minimizar/maximizar jogos no admin

### Bloco 4: Páginas e Funcionalidades
- [ ] Página individual do jogador
- [ ] Foto de jogador (opcional)
- [ ] Botão + adicionar jogador no time
- [ ] Mensagem de apoio ao time

### Bloco 5: Flexibilidade
- [x] Configurar quantos times classificam por grupo
- [x] Mata-mata flexível (4, 8, 16, 32 times)
- [x] Campeonato só mata-mata (sem grupos)

### Bloco 6: Premium (Patrocinadores e Relatórios)
- [x] Seção de patrocinadores (níveis A, B, C)
- [x] Relatório PDF visual (para WhatsApp)
- [x] Relatório PDF completo (gerencial)
- [x] Relatório Excel/CSV (classificação, artilharia, jogos)

## BUGS CRÍTICOS (Reportados pelo usuário 20/01/2026)
- [x] BUG: Query sponsorMessage retornando undefined (causando 62+ erros em cascata) - CORRIGIDO
- [x] BUG: Link do patrocinador redirecionando para URL interna - CORRIGIDO (adiciona https:// se faltar)
- [x] BUG: Pontuação errada no header do time - CORRIGIDO (agora usa apenas pontos da fase de grupos)

## FUNCIONALIDADES FALTANTES (Reportadas pelo usuário)
- [x] Mensagem de apoio ao selecionar time na aba Times
- [x] Mensagens prontas para goleador/pior defesa na aba times
- [x] Campo atalho para adicionar jogador dentro do time (admin) - JÁ EXISTE (botão UserPlus)
- [x] Upload de foto do jogador ao cadastrar
- [x] Página individual do jogador com estatísticas pessoais - JÁ EXISTE (/jogadores/:id)
- [x] Campo de busca de jogador no header principal
- [ ] Relatórios PDF visual (para WhatsApp)
- [ ] Relatórios PDF completo (gerencial)
- [ ] Relatórios Excel/CSV

## BUGS E FUNCIONALIDADES - Reportados 21/01/2026

- [x] BUG: Erro ao subir foto do jogador - CORRIGIDO (usando tRPC)
- [x] BUG: Horário do jogo - agora exibe corretamente no formato local
- [x] Mostrar horário do jogo no admin (aba Jogos e Resultados)
- [x] Mostrar descrição do patrocinador na tela principal
- [x] DELETAR página de Relatórios
- [x] Criar página de Patrocinadores (no lugar de Relatórios)
- [x] Criar página de Jogadores (entre Jogos e Times) com busca por nome
- [x] Mostrar artilheiro/melhor defesa dentro da página do time com msg comemorativa
- [x] Sistema de mensagens de apoio ao time (torcedor envia, admin aprova)


## BUGS E FUNCIONALIDADES - Reportados 21/01/2026 (Segunda Rodada)

- [x] Limpar jogadores órfãos (sem time válido) do banco de dados
- [x] Adicionar botão de editar jogador no admin (ao lado da lixeira)
- [x] BUG CRÍTICO: Horário do jogo salvo errado (10h → 7h = 3 horas de diferença timezone)
- [x] BUG: Jogo sem resultado não pode contabilizar pontos na página do time


## MELHORIAS DE UX - 21/01/2026

- [x] Reordenar abas do painel admin: Configurações primeiro
- [x] Reordenar abas do painel admin: Admins último
- [x] Corrigir flash de conteúdo antigo ao carregar página (cache busting)


## BUG CRÍTICO - Flash de Dados Antigos (21/01/2026)

- [x] Eliminar flash de dados hardcoded antigos ao recarregar página
- [x] Implementar loading skeleton enquanto dados do banco carregam
- [x] Remover valores padrão hardcoded (Campeonato Fraterno, Loja José Moreira)


## PELADA PRO - Transformação Multi-tenant SaaS (21/01/2026)

### FASE 1: Estrutura Base do Banco
- [x] Criar tabela purchases (compras/assinaturas)
- [x] Criar tabela reservedSlugs (URLs reservadas)
- [x] Criar tabela campaigns (campeonatos)
- [x] Criar tabela coupons (cupons de desconto)
- [x] Adicionar campaignId em todas as tabelas existentes
- [x] Rodar migrations (pnpm db:push)
- [x] Adaptar db.ts com campaignId em todas funções
- [x] Adaptar routers.ts com campaignId em todos procedures

### FASE 2: Landing Page de Vendas
- [x] Hero section com título e CTAs
- [x] Seção de funcionalidades (6 cards)
- [x] Seção de preços (4 planos)
- [x] Seção "Como Funciona"
- [x] Footer

### FASE 3: Checkout + Stripe
- [x] Modal de checkout com campos
- [x] Validação de slug em tempo real
- [x] Integração Stripe Checkout
- [x] Webhook para confirmar pagamento
- [x] Criar campeonato após pagamento

### FASE 4: Multi-tenant
- [x] Hook useCampaign() para pegar slug da URL
- [x] Atualizar todas queries para filtrar por campaignId
- [x] Sistema de roteamento (/, /{slug}, /{slug}/admin)
- [x] Verificação de propriedade no admin

### FASE 5: Expiração + Emails
- [x] Calcular expiresAt baseado no plano
- [x] Sistema de desativação automática
- [x] Email de boas-vindas (notificação ao owner)
- [x] Email de aviso 7 dias antes
- [x] Serviço de verificação de expiração

### FASE 6: Demo + Testes
- [x] Criar campeonato demo (futebol-fraterno)
- [x] Testar fluxo completo (landing → checkout → Stripe)
- [x] Testar acesso via slug (/futebol-fraterno)

### FASE 7: Publicar
- [ ] Configurar Stripe produção
- [ ] Conectar peladapro.com.br


## MELHORIAS LANDING PAGE DE VENDAS (22/01/2026)

### Design e Identidade Visual
- [x] Criar logo/símbolo do Pelada Pro (identidade visual) - bola verde com coroa dourada
- [x] Redesenhar com cores mais suaves e agradáveis (verde menta, branco, dourado)
- [x] Remover fundo escuro - usar fundo claro/branco
- [x] Melhorar tipografia e espaçamentos

### Screenshots e Demonstração
- [x] Capturar screenshots das funcionalidades do Futebol Fraterno (6 screenshots)
- [x] Criar seção de galeria de funcionalidades com imagens reais
- [x] Mostrar: classificação, artilheiros, jogos, painel admin, mata-mata
- [x] Adicionar descrições das funcionalidades nas imagens
- [x] Modal de preview para ampliar screenshots

### Apresentação Profissional
- [x] Melhorar textos e copywriting
- [x] Adicionar social proof (+500 campeonatos criados)
- [x] Melhorar seção de preços (destaque Popular e Melhor Custo-Benefício)
- [x] Seção "Como Funciona" em 3 passos


## INTEGRAÇÃO MERCADO PAGO (22/01/2026)

### Substituir Stripe por Mercado Pago
- [x] Instalar SDK do Mercado Pago (mercadopago)
- [x] Configurar credenciais de teste no .env (MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_PUBLIC_KEY)
- [x] Criar serviço de checkout do Mercado Pago (server/mercadopago/checkout.ts)
- [x] Criar webhook do Mercado Pago (server/mercadopago/webhook.ts)
- [x] Atualizar landing page para usar Mercado Pago (LandingPage.tsx)
- [x] Criar produtos/planos (server/mercadopago/products.ts)
- [x] Criar rota tRPC createMercadoPagoSession
- [x] Testes automatizados (4 testes passando - validação de credenciais, checkout, slugs, planos)
- [x] Corrigir bug do auto_return (removido para evitar erro)
- [ ] Testar pagamento completo com PIX (aguardando usuário)
- [ ] Testar pagamento completo com cartão de crédito (aguardando usuário)
- [ ] Testar pagamento completo com boleto (aguardando usuário)
- [ ] Remover código do Stripe (opcional - manter como fallback)


## BUGS REPORTADOS - Checkout Mercado Pago (22/01/2026)

- [x] BUG CRÍTICO: Erro "Plano inválido" ao tentar finalizar checkout - CORRIGIDO (IDs alinhados: basic, popular, extended, annual)
- [x] BUG: Texto ainda menciona "Stripe" ao invés de "Mercado Pago" - CORRIGIDO (texto atualizado para "Pagamento seguro via Mercado Pago. Aceita PIX, cartão e boleto.")
- [x] Investigar mapeamento de IDs dos planos (2months, 3months vs basic, popular) - CORRIGIDO
