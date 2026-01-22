import { Resend } from "resend";
import { ENV } from "./env";

const resend = new Resend(ENV.resendApiKey);

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
export async function sendWelcomeEmail(input: SendWelcomeEmailInput): Promise<boolean> {
  const campaignUrl = `https://peladapro.com.br/${input.campaignSlug}`;
  const changePasswordUrl = `https://peladapro.com.br/change-password`;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #10b981;
    }
    .header h1 {
      color: #10b981;
      margin: 0;
      font-size: 28px;
    }
    .content {
      margin: 20px 0;
    }
    .info-box {
      background-color: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .credentials {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .credentials strong {
      color: #92400e;
    }
    .button {
      display: inline-block;
      background-color: #10b981;
      color: white !important;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 10px 0;
    }
    .button:hover {
      background-color: #059669;
    }
    .steps {
      margin: 20px 0;
    }
    .steps ol {
      padding-left: 20px;
    }
    .steps li {
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
    .warning {
      color: #dc2626;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Bem-vindo ao PeladaPro!</h1>
    </div>
    
    <div class="content">
      <p>Olá <strong>${input.name}</strong>,</p>
      
      <p>Seu campeonato <strong>${input.campaignName}</strong> foi criado com sucesso! 🏆</p>
      
      <div class="info-box">
        <p><strong>🔗 Acesse seu campeonato:</strong></p>
        <p><a href="${campaignUrl}" class="button">Acessar Campeonato</a></p>
        <p style="font-size: 12px; color: #6b7280;">${campaignUrl}</p>
      </div>
      
      <div class="credentials">
        <p><strong>🔐 Suas credenciais de acesso:</strong></p>
        <p><strong>Email:</strong> ${input.email}</p>
        <p><strong>Senha temporária:</strong> ${input.temporaryPassword}</p>
        <p class="warning">⚠️ IMPORTANTE: Por segurança, altere sua senha assim que fizer o primeiro acesso.</p>
        <p><a href="${changePasswordUrl}">Alterar senha agora</a></p>
      </div>
      
      <div class="info-box">
        <p><strong>📅 Validade da assinatura:</strong></p>
        <p>Seu campeonato expira em: <strong>${input.expiresAt.toLocaleDateString("pt-BR")}</strong></p>
      </div>
      
      <div class="steps">
        <p><strong>🚀 Próximos passos:</strong></p>
        <ol>
          <li>Acesse seu campeonato usando o link acima</li>
          <li>Faça login com suas credenciais</li>
          <li>Altere sua senha temporária</li>
          <li>Comece a adicionar times, jogadores e jogos!</li>
        </ol>
      </div>
      
      <p><strong>💡 Precisa de ajuda?</strong></p>
      <p>Entre em contato conosco: <a href="mailto:contato@meucontomagico.com.br">contato@meucontomagico.com.br</a></p>
    </div>
    
    <div class="footer">
      <p>Abraços,<br><strong>Equipe PeladaPro</strong> ⚽</p>
      <p style="font-size: 12px; margin-top: 20px;">
        Este é um email automático, por favor não responda diretamente.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    console.log("[Email] Enviando email de boas-vindas para:", input.email);
    
    const { data, error } = await resend.emails.send({
      from: "PeladaPro <onboarding@resend.dev>", // Usando email de teste do Resend
      to: [input.email],
      subject: `🎉 Seu campeonato ${input.campaignName} foi criado!`,
      html: emailHtml,
    });

    if (error) {
      console.error("[Email] Erro ao enviar email:", error);
      return false;
    }

    console.log("[Email] ✅ Email enviado com sucesso! ID:", data?.id);
    return true;
  } catch (error) {
    console.error("[Email] Exceção ao enviar email:", error);
    return false;
  }
}
