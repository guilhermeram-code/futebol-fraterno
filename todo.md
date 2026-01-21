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
- [ ] Organizar times por grupos (accordion)
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
- [ ] Relatório PDF visual (para WhatsApp)
- [ ] Relatório PDF completo (gerencial)
- [ ] Relatório Excel/CSV

## BUGS CRÍTICOS (Reportados pelo usuário 20/01/2026)
- [x] BUG: Query sponsorMessage retornando undefined (causando 62+ erros em cascata) - CORRIGIDO
- [x] BUG: Link do patrocinador redirecionando para URL interna - CORRIGIDO (adiciona https:// se faltar)
- [x] BUG: Pontuação errada no header do time - CORRIGIDO (agora usa apenas pontos da fase de grupos)

## FUNCIONALIDADES FALTANTES (Reportadas pelo usuário)
- [ ] Mensagem de apoio ao selecionar time na aba Times
- [x] Mensagens prontas para goleador/pior defesa na aba times
- [x] Campo atalho para adicionar jogador dentro do time (admin) - JÁ EXISTE (botão UserPlus)
- [x] Upload de foto do jogador ao cadastrar
- [x] Página individual do jogador com estatísticas pessoais - JÁ EXISTE (/jogadores/:id)
- [x] Campo de busca de jogador no header principal
- [ ] Relatórios PDF visual (para WhatsApp)
- [ ] Relatórios PDF completo (gerencial)
- [ ] Relatórios Excel/CSV
