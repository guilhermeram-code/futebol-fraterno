# 🎯 Configuração do Google Ads para Página /teste-gratis

## ✅ O QUE FOI CRIADO

### Página Dedicada: `/teste-gratis`
- **URL completa:** `https://peladapro.com.br/teste-gratis`
- **Objetivo:** Conversão direta (cadastro de teste grátis)
- **Design:** Mobile-first, formulário visível, zero distrações
- **CTA único:** "CRIAR CAMPEONATO GRÁTIS"

### Página de Sucesso: `/teste-gratis-sucesso`
- **URL completa:** `https://peladapro.com.br/teste-gratis-sucesso`
- **Objetivo:** Confirmação + próximos passos
- **Conteúdo:** Credenciais, links de acesso, suporte

---

## 🚀 COMO CONFIGURAR NO GOOGLE ADS

### 1️⃣ Atualizar URL de Destino da Campanha

**Antes:**
```
https://peladapro.com.br/
```

**Depois:**
```
https://peladapro.com.br/teste-gratis
```

**Onde alterar:**
1. Acesse Google Ads → Campanhas
2. Selecione sua campanha ativa
3. Vá em "Anúncios e recursos"
4. Edite cada anúncio
5. Altere "URL final" para `https://peladapro.com.br/teste-gratis`
6. Salve as alterações

---

### 2️⃣ Configurar Conversão no Google Ads

**Evento de conversão:** Cadastro de teste grátis

**Como configurar:**

1. **Acesse:** Google Ads → Ferramentas → Conversões
2. **Clique em:** "Nova conversão"
3. **Escolha:** Website
4. **Configure:**
   - Nome: `Cadastro Teste Grátis`
   - Categoria: `Lead`
   - Valor: `1` (ou valor estimado do lead)
   - Contagem: `Uma conversão`
   - Janela de conversão: `30 dias`
   - Modelo de atribuição: `Baseado em dados` ou `Último clique`

5. **Tag de conversão:**
   - Escolha: `Usar Google Tag Manager` ou `Adicionar tag manualmente`
   - **URL de conversão:** `https://peladapro.com.br/teste-gratis-sucesso`

6. **Código da tag:**
```html
<!-- Google Ads Conversion Tag -->
<script>
  gtag('event', 'conversion', {
    'send_to': 'AW-XXXXXXXXX/YYYYYYYYY',
    'value': 1.0,
    'currency': 'BRL'
  });
</script>
```

7. **Onde adicionar o código:**
   - Arquivo: `client/src/pages/TesteGratisSucesso.tsx`
   - Localização: Dentro do `useEffect` (já existe no arquivo)

---

### 3️⃣ Atualizar Texto dos Anúncios (Opcional)

**Sugestões de headlines:**
- "Teste Grátis por 7 Dias"
- "Organize Seu Campeonato Agora"
- "Sem Cartão de Crédito"
- "Acesso Completo em 2 Minutos"

**Sugestões de descrições:**
- "Crie seu campeonato de futebol profissional. Teste grátis por 7 dias, sem cartão."
- "Classificação, artilheiros, jogos e muito mais. Comece agora gratuitamente."

**URL de visualização:**
```
peladapro.com.br/teste-gratis
```

---

## 📊 MÉTRICAS ESPERADAS

### Antes (Landing Page Genérica)
- **Cliques:** 31
- **Conversões:** 0
- **Taxa de conversão:** 0%
- **CPA:** Infinito

### Depois (Página Dedicada)
- **Cliques:** 31
- **Conversões esperadas:** 5-8 (15-25%)
- **Taxa de conversão esperada:** 15-25%
- **CPA esperado:** R$ 1,63 - R$ 2,60

---

## 🎯 POR QUE ISSO FUNCIONA

### Problema da Landing Page Genérica:
1. **Muitos passos:** Home → Scroll → Modal → Formulário
2. **Distrações:** Menu, links, seções de funcionalidades
3. **Mobile:** Modal pode não abrir corretamente
4. **Fricção:** Usuário pode fechar modal sem querer

### Solução da Página Dedicada:
1. **1 passo a menos:** Google Ads → Formulário direto
2. **Zero distrações:** Sem menu, sem links externos
3. **Mobile-first:** Formulário grande e visível
4. **Foco 100%:** Único objetivo = conversão

---

## 🧪 TESTES RECOMENDADOS

### Teste A/B (Futuro)
- **Variante A:** Headline atual
- **Variante B:** "Crie Seu Campeonato em 2 Minutos"
- **Variante C:** "Teste Grátis - Sem Cartão"

### Monitorar:
- Taxa de conversão por dispositivo (mobile vs desktop)
- Taxa de abandono do formulário
- Tempo médio na página
- Bounce rate

---

## 📞 SUPORTE

**Dúvidas sobre configuração do Google Ads:**
- Email: contato@meucontomagico.com.br
- WhatsApp: +55 11 5198-1694

**Documentação oficial:**
- [Google Ads - Conversões](https://support.google.com/google-ads/answer/6095821)
- [Google Tag Manager](https://tagmanager.google.com/)

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Atualizar URL de destino no Google Ads
- [ ] Configurar conversão no Google Ads
- [ ] Adicionar tag de conversão em TesteGratisSucesso.tsx
- [ ] Testar fluxo completo (anúncio → cadastro → sucesso)
- [ ] Verificar conversão no Google Ads (pode levar 24-48h)
- [ ] Monitorar métricas por 7 dias
- [ ] Ajustar lances se necessário
- [ ] Criar variantes para teste A/B (opcional)

---

**Data de criação:** 06/02/2026
**Última atualização:** 06/02/2026
