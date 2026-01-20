# Solicitações de Alteração - Documento arrumar.docx

## 1. Login Simplificado
- Criar sistema de login com email/senha (sem OAuth)
- Admin cadastra login e senha para outros usuários
- Já deixar cadastrado: guilhermeram@gmail.com / 1754gr
- Tela de login simples (sem opção de cadastro público)

## 2. Ordem das Abas no Painel Admin
- Nova ordem: Grupos → Times → Jogadores → (resto igual)
- Atual: Times → Jogadores → Grupos → Jogos...

## 3. Organização dos Jogadores por Grupo/Loja
- Agrupar jogadores por GRUPO > LOJA
- Permitir expandir/minimizar cada seção
- Exemplo:
  - GRUPO A
    - LOJA X
      - Jogador 01
      - Jogador 02

## 4. Página do Time - Cabeçalho
- Ao clicar em um time, mostrar no topo em destaque:
  - Nome do Time
  - Nome da Loja
- Para identificar claramente que está na página daquele time

## 5. Cadastro de Resultado - Seleção de Jogo
- Formato atual: "1 vs 27" (só números)
- Formato desejado: "Nome Time (Loja) vs Nome Time (Loja) Rodada - DATA"
- Status do jogo com cores:
  - VERMELHO: "Realizado - Faltando Resultado" (passou data sem resultado)
  - AMARELO/DESTAQUE: "Jogo em Andamento" (dia do jogo)
  - VERDE: "Jogo Próximo" (1 dia antes ou mais)

## 6. Ranking Artilheiro - Mostrar Loja
- Atual: Nome do jogador + Nome do time
- Desejado: Nome do jogador + Nome do time + LOJA

## 7. Maior Quebrador - Inverter Ordem Visual
- Atual: Amarelo primeiro, Vermelho depois
- Desejado: VERMELHO primeiro, Amarelo depois
- (Lógica de ordenação já está correta, só inverter visual)

## 8. Comentários - Sistema de Aprovação
- Qualquer pessoa envia comentário
- Mensagem: "Seu comentário foi enviado para aprovação"
- No painel admin: lista de comentários pendentes para aprovar/rejeitar
- Só aparece público após aprovação

## 9. Final - Remover Campo "Lado da Chave"
- Quando fase = Final, não mostrar campo "Lado da Chave"
- Só existe uma final, não precisa escolher lado

## 10. Bug Mobile - Painel Admin
- Textos sobrepondo no celular
- No computador funciona perfeitamente
- Corrigir responsividade do painel admin

## 11. Música - Autoplay
- Atual: precisa clicar para tocar
- Desejado: música começa automaticamente ao entrar no site
- Usuário pode pausar/baixar volume se quiser
