# 🚀 Como Habilitar Mercado Pago em Produção

Este guia explica como migrar do ambiente de **teste (sandbox)** para o ambiente de **produção** do Mercado Pago, permitindo que você aceite pagamentos reais de clientes.

---

## 📋 **Pré-requisitos**

1. ✅ Conta no Mercado Pago criada
2. ✅ Documentos validados (CPF/CNPJ)
3. ✅ Conta bancária vinculada para receber pagamentos

---

## 🔑 **Passo 1: Obter Credenciais de Produção**

### **1.1 Acessar o Painel do Mercado Pago**
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Faça login com sua conta Mercado Pago

### **1.2 Ativar Modo Produção**
1. No painel, clique em **"Suas integrações"**
2. Selecione sua aplicação (ou crie uma nova)
3. No menu lateral, clique em **"Credenciais"**
4. Alterne para a aba **"Credenciais de produção"**

### **1.3 Copiar as Credenciais**
Você verá duas credenciais importantes:

- **Access Token (Produção)**: `APP_USR-xxxxxxxxx-xxxxxx-xxxxxxxxx-xxxxxxxxx`
- **Public Key (Produção)**: `APP_USR-xxxxxxxxx-xxxxxx-xxxxxxxxx-xxxxxxxxx`

⚠️ **IMPORTANTE:** Guarde essas credenciais em local seguro. Elas dão acesso total à sua conta!

---

## ⚙️ **Passo 2: Configurar Credenciais no Manus**

### **2.1 Acessar Configurações de Secrets**
1. No Manus, clique em **"Configurações"** (⚙️)
2. No menu lateral, clique em **"Secrets"**

### **2.2 Atualizar as Credenciais**
Localize e edite as seguintes variáveis de ambiente:

| Variável | Valor Atual (Teste) | Novo Valor (Produção) |
|----------|---------------------|----------------------|
| `MERCADOPAGO_ACCESS_TOKEN` | `TEST-c7547283-...` | `APP_USR-xxxxxxxxx-...` |
| `MERCADOPAGO_PUBLIC_KEY` | `TEST-5176713152...` | `APP_USR-xxxxxxxxx-...` |

**Clique em "Salvar" após cada alteração.**

---

## 🔗 **Passo 3: Configurar Webhook de Produção**

O webhook é essencial para receber notificações de pagamentos aprovados.

### **3.1 URL do Webhook**
Sua URL de webhook é:
```
https://peladapro.com.br/api/mercadopago/webhook
```

### **3.2 Configurar no Mercado Pago**
1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. No menu lateral, clique em **"Webhooks"**
4. Clique em **"Configurar notificações"**
5. Preencha:
   - **URL de produção**: `https://peladapro.com.br/api/mercadopago/webhook`
   - **Eventos**: Marque **"Pagamentos"** (payment)
6. Clique em **"Salvar"**

### **3.3 Testar Webhook**
O Mercado Pago permite testar o webhook antes de ativar:
1. Clique em **"Simular notificação"**
2. Verifique se o status retorna **200 OK**

---

## ✅ **Passo 4: Testar Pagamento Real**

### **4.1 Fazer uma Compra Teste**
1. Acesse: https://peladapro.com.br
2. Clique em **"Escolher Plano"** no plano **Teste (R$ 1,00)**
3. Preencha os dados do campeonato
4. Clique em **"Continuar para Pagamento"**
5. Complete o pagamento com PIX, cartão ou boleto

### **4.2 Verificar Criação do Campeonato**
Após o pagamento ser aprovado (geralmente instantâneo com PIX):
1. Você receberá um email de confirmação
2. O campeonato será criado automaticamente
3. Acesse: `https://peladapro.com.br/seu-slug`
4. Faça login no painel admin

---

## 🔐 **Segurança**

### **Boas Práticas:**
- ✅ **NUNCA** compartilhe suas credenciais de produção
- ✅ **NUNCA** commite credenciais no Git/GitHub
- ✅ Use apenas as variáveis de ambiente do Manus
- ✅ Monitore transações suspeitas no painel do Mercado Pago
- ✅ Ative notificações de pagamento no app do Mercado Pago

---

## 📊 **Monitoramento**

### **Painel do Mercado Pago**
Acesse: https://www.mercadopago.com.br/activities

Você pode:
- ✅ Ver todas as transações em tempo real
- ✅ Verificar status de pagamentos (aprovado, pendente, recusado)
- ✅ Emitir reembolsos
- ✅ Baixar relatórios financeiros

### **Banco de Dados do Pelada Pro**
No Manus, acesse **"Database"** para ver:
- Tabela `purchases`: Todos os pagamentos registrados
- Tabela `campaigns`: Campeonatos criados após pagamento

---

## 🆘 **Problemas Comuns**

### **1. Pagamento aprovado mas campeonato não foi criado**
**Causa:** Webhook não está configurado ou não está funcionando

**Solução:**
1. Verifique a URL do webhook no painel do Mercado Pago
2. Teste o webhook com "Simular notificação"
3. Verifique logs do servidor no Manus

### **2. Erro "Credenciais inválidas"**
**Causa:** Credenciais de teste ainda configuradas

**Solução:**
1. Verifique se você copiou as credenciais de **PRODUÇÃO** (não teste)
2. Certifique-se de que não há espaços em branco nas credenciais
3. Salve e reinicie o servidor

### **3. Cliente não recebe email após pagamento**
**Causa:** Sistema de emails pode estar com delay

**Solução:**
1. Verifique a tabela `purchases` no banco de dados
2. O campeonato é criado mesmo sem email
3. Envie as credenciais manualmente se necessário

---

## 📞 **Suporte**

### **Mercado Pago:**
- Documentação: https://www.mercadopago.com.br/developers/pt/docs
- Suporte: https://www.mercadopago.com.br/ajuda

### **Pelada Pro:**
- Email: suporte@peladapro.com.br
- WhatsApp: (11) 99999-9999

---

## ✨ **Pronto!**

Seu sistema Pelada Pro agora está configurado para aceitar pagamentos reais via Mercado Pago! 🎉

**Próximos passos:**
1. Divulgue seu site nas redes sociais
2. Ofereça o plano teste (R$ 1,00) para primeiros clientes
3. Monitore os pagamentos no painel do Mercado Pago
4. Colete feedback dos clientes

**Boa sorte com suas vendas!** 🚀⚽
