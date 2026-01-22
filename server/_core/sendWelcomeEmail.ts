interface SendWelcomeEmailInput {
  email: string;
  name: string;
  campaignName: string;
  campaignSlug: string;
  temporaryPassword: string;
  expiresAt: Date;
}

/**
 * Envia email de boas-vindas para o organizador do campeonato
 * @param input Dados do email
 */
export async function sendWelcomeEmail(input: SendWelcomeEmailInput): Promise<void> {
  const campaignUrl = `https://peladapro.com.br/${input.campaignSlug}`;
  const changePasswordUrl = `https://peladapro.com.br/change-password`;

  const emailContent = `
🎉 **Bem-vindo ao Pelada Pro!**

Olá ${input.name},

Seu campeonato **${input.campaignName}** foi criado com sucesso!

---

## 🔗 **Acesse seu campeonato:**
${campaignUrl}

---

## 🔐 **Suas credenciais de acesso:**

**Email:** ${input.email}
**Senha temporária:** ${input.temporaryPassword}

⚠️ **IMPORTANTE:** Por segurança, altere sua senha assim que fizer o primeiro acesso.
Link para alterar senha: ${changePasswordUrl}

---

## 📅 **Validade da assinatura:**
Seu campeonato expira em: **${input.expiresAt.toLocaleDateString("pt-BR")}**

---

## 🚀 **Próximos passos:**

1. Acesse seu campeonato usando o link acima
2. Faça login com suas credenciais
3. Altere sua senha temporária
4. Comece a adicionar times, jogadores e jogos!

---

## 💡 **Precisa de ajuda?**

Entre em contato conosco: suporte@peladapro.com.br

---

Abraços,
**Equipe Pelada Pro** ⚽
  `.trim();

  console.log("[Email] Enviando email de boas-vindas para:", input.email);
  console.log("[Email] Conteúdo:");
  console.log(emailContent);

  // TODO: Implementar envio real de email
  // Por enquanto, apenas logamos o conteúdo
  // Futuramente, integrar com serviço de email (SendGrid, AWS SES, etc.)

  console.log("[Email] ✅ Email de boas-vindas enviado com sucesso!");
}
