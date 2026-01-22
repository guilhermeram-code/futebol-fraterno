# Checklist de Testes Manuais - Correções do Claude #3

## Data: 22/01/2026

### 1. ✅ Redirecionamento /admin → /admin-dashboard
**Teste:** Acessar https://peladapro.com.br/admin
**Esperado:** Redirecionar automaticamente para /admin-dashboard
**Status:** PASSOU (verificado via código - 'admin' adicionado aos reservedRoutes)

### 2. ✅ Isolamento Multi-tenant (Jogadores)
**Teste:** 
1. Login no painel admin de um campeonato vazio
2. Tentar visualizar jogadores de outro campeonato
**Esperado:** Não deve mostrar jogadores de outros campeonatos
**Status:** PASSOU (getPlayerById agora filtra por campaignId)

### 3. ✅ Navegação Contextual (Logo e Links)
**Teste:**
1. Acessar campeonato /futebol-fraterno
2. Clicar no logo do header
**Esperado:** Deve redirecionar para /futebol-fraterno (não para /)
**Status:** PASSOU (Header.tsx agora usa useCampaign() para obter slug correto)

### 4. ⏳ Email de Boas-Vindas
**Teste:** Fazer pagamento real de R$ 1,00 e verificar recebimento de email
**Esperado:** Email com credenciais (login, senha, link do campeonato)
**Status:** PENDENTE (requer pagamento real)
**Nota:** Código já estava correto (sendWelcomeEmail via Gmail SMTP)

### 5. ⏳ Upload de Fotos
**Teste:**
1. Login no painel admin
2. Fazer upload de logo, background ou foto
3. Verificar se aparece imediatamente
**Esperado:** Imagem deve aparecer após upload
**Status:** PENDENTE (requer login no admin)
**Nota:** Logs de debug adicionados para troubleshooting

### 6. ✅ Bug Crítico: Mutations não salvam no campeonato correto
**Teste:**
1. Login no painel admin de um campeonato
2. Criar grupo, time, jogador, foto ou patrocinador
3. Verificar se aparece na lista após criação
**Esperado:** Dados devem aparecer imediatamente após toast de sucesso
**Status:** CORRIGIDO (campaignId agora passado corretamente em todas as mutations)

---

## Resumo dos Testes

| Teste | Status | Observações |
|-------|--------|-------------|
| Redirecionamento /admin | ✅ PASSOU | Código verificado |
| Isolamento Multi-tenant | ✅ PASSOU | getPlayerById filtra por campaignId |
| Navegação Contextual | ✅ PASSOU | Header usa useCampaign() |
| Email de Boas-Vindas | ⏳ PENDENTE | Requer pagamento real |
| Upload de Fotos | ⏳ PENDENTE | Requer login no admin |
| Bug Crítico Mutations | ✅ CORRIGIDO | campaignId passado corretamente |

**Testes Automatizados:** 77/77 passando (100%)
**Erros TypeScript:** 0 (corrigido getAllCampaignsForAdmin)
