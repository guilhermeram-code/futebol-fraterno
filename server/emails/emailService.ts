import { notifyOwner } from "../_core/notification";
import nodemailer from "nodemailer";
import { ENV } from "../_core/env";

// Email templates for Pelada Pro

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

// Welcome email after purchase
export async function sendWelcomeEmail(data: {
  email: string;
  campaignName: string;
  campaignSlug: string;
  plan: string;
  expiresAt: Date;
}) {
  const baseUrl = process.env.VITE_OAUTH_PORTAL_URL?.replace('/oauth', '') || 'https://peladapro.com.br';
  const campaignUrl = `${baseUrl}/${data.campaignSlug}`;
  const adminUrl = `${campaignUrl}/admin`;
  
  const planNames: Record<string, string> = {
    '2_months': '2 Meses',
    '3_months': '3 Meses',
    '6_months': '6 Meses',
    '12_months': '12 Meses (1 Ano)',
  };
  
  const formattedExpiry = data.expiresAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Notify owner about new purchase
  await notifyOwner({
    title: `🎉 Nova Venda - ${data.campaignName}`,
    content: `
**Novo campeonato criado!**

- **Campeonato:** ${data.campaignName}
- **Slug:** ${data.campaignSlug}
- **Email:** ${data.email}
- **Plano:** ${planNames[data.plan] || data.plan}
- **Expira em:** ${formattedExpiry}

**Links:**
- Site: ${campaignUrl}
- Admin: ${adminUrl}
    `.trim()
  });

  // Send email via Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'contato@meucontomagico.com.br',
      pass: ENV.gmailAppPassword
    }
  });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
    .info-box h3 { margin-top: 0; color: #10b981; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    .credentials { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; border: 2px dashed #f59e0b; }
    .credentials strong { color: #d97706; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Bem-vindo ao PeladaPro!</h1>
      <p>Seu campeonato está pronto!</p>
    </div>
    <div class="content">
      <p>Olá! 👋</p>
      <p>Parabéns pela compra do <strong>${planNames[data.plan] || data.plan}</strong>! Seu site de campeonato já está no ar e pronto para uso.</p>
      
      <div class="info-box">
        <h3>📋 Informações do Seu Campeonato</h3>
        <p><strong>Nome:</strong> ${data.campaignName}</p>
        <p><strong>URL do Site:</strong> <a href="${campaignUrl}">${campaignUrl}</a></p>
        <p><strong>Painel Admin:</strong> <a href="${adminUrl}">${adminUrl}</a></p>
        <p><strong>Validade:</strong> Até ${formattedExpiry}</p>
      </div>

      <div class="credentials">
        <h3 style="margin-top: 0;">🔐 Credenciais de Acesso</h3>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Senha Temporária:</strong> (usuário já existia)</p>
        <p style="font-size: 12px; color: #d97706; margin-top: 10px;">⚠️ Use suas credenciais existentes para acessar o painel admin.</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${adminUrl}" class="button">Acessar Painel Admin</a>
      </div>

      <div class="info-box">
        <h3>🚀 Próximos Passos</h3>
        <ol>
          <li>Acesse o painel admin usando o link acima</li>
          <li>Configure seu campeonato (logo, nome, cores)</li>
          <li>Cadastre times e jogadores</li>
          <li>Crie os jogos e registre resultados</li>
          <li>Compartilhe o link do site com os participantes!</li>
        </ol>
      </div>

      <p>Qualquer dúvida, estamos à disposição!</p>
      <p>Bom campeonato! ⚽</p>
    </div>
    <div class="footer">
      <p>© 2026 PeladaPro - Organize Seu Campeonato de Futebol</p>
      <p>Este é um email automático, não responda.</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: '"PeladaPro" <contato@meucontomagico.com.br>',
      to: data.email,
      subject: `🎉 Seu Campeonato "${data.campaignName}" Está Pronto!`,
      html: htmlContent
    });
    console.log(`[Email] Welcome email sent successfully to ${data.email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send welcome email to ${data.email}:`, error);
    return false;
  }
}

// Expiration warning email (7 days before)
export async function sendExpirationWarningEmail(data: {
  email: string;
  campaignName: string;
  campaignSlug: string;
  expiresAt: Date;
}) {
  const formattedExpiry = data.expiresAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Notify owner about expiring campaign
  await notifyOwner({
    title: `⚠️ Campeonato Expirando - ${data.campaignName}`,
    content: `
**Campeonato vai expirar em 7 dias!**

- **Campeonato:** ${data.campaignName}
- **Slug:** ${data.campaignSlug}
- **Email:** ${data.email}
- **Expira em:** ${formattedExpiry}

Considere entrar em contato para oferecer renovação.
    `.trim()
  });

  console.log(`[Email] Expiration warning would be sent to ${data.email} for campaign ${data.campaignName}`);
  
  return true;
}

// Owner sale notification email
export async function sendOwnerSaleNotification(data: {
  campaignName: string;
  campaignSlug: string;
  customerEmail: string;
  customerPhone: string;
  planName: string;
  planMonths: number;
  amountPaid: number;
  expiresAt: Date;
  temporaryPassword: string;
}) {
  const baseUrl = process.env.VITE_OAUTH_PORTAL_URL?.replace('/oauth', '') || 'https://peladapro.com.br';
  const campaignUrl = `${baseUrl}/${data.campaignSlug}`;
  const adminUrl = `${campaignUrl}/admin`;
  
  const formattedExpiry = data.expiresAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  
  const formattedAmount = (data.amountPaid / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'contato@meucontomagico.com.br',
      pass: ENV.gmailAppPassword
    }
  });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
    .info-box h3 { margin-top: 0; color: #10b981; }
    .highlight { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; border: 2px solid #f59e0b; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; }
    td:first-child { font-weight: bold; color: #059669; width: 40%; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Nova Venda - PeladaPro!</h1>
      <p>Um novo campeonato foi criado</p>
    </div>
    <div class="content">
      <div class="info-box">
        <h3>📋 Detalhes da Venda</h3>
        <table>
          <tr>
            <td>Campeonato:</td>
            <td>${data.campaignName}</td>
          </tr>
          <tr>
            <td>Slug:</td>
            <td>/${data.campaignSlug}</td>
          </tr>
          <tr>
            <td>Email do Cliente:</td>
            <td>${data.customerEmail}</td>
          </tr>
          <tr>
            <td>WhatsApp:</td>
            <td>${data.customerPhone}</td>
          </tr>
          <tr>
            <td>Plano:</td>
            <td>${data.planName} (${data.planMonths} meses)</td>
          </tr>
          <tr>
            <td>Valor Pago:</td>
            <td>${formattedAmount}</td>
          </tr>
          <tr>
            <td>Expira em:</td>
            <td>${formattedExpiry}</td>
          </tr>
        </table>
      </div>

      <div class="highlight">
        <h3 style="margin-top: 0;">🔐 Credenciais de Acesso</h3>
        <p><strong>Email:</strong> ${data.customerEmail}</p>
        <p><strong>Senha Temporária:</strong> ${data.temporaryPassword || '(usuário já existia)'}</p>
      </div>

      <div class="info-box">
        <h3>🔗 Links de Acesso</h3>
        <p><strong>Site Público:</strong> <a href="${campaignUrl}">${campaignUrl}</a></p>
        <p><strong>Painel Admin:</strong> <a href="${adminUrl}">${adminUrl}</a></p>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 PeladaPro - Notificação Automática de Vendas</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: '"PeladaPro - Sistema" <contato@meucontomagico.com.br>',
      to: 'contato@meucontomagico.com.br',
      subject: `🎉 Nova Venda - ${data.campaignName} (${formattedAmount})`,
      html: htmlContent
    });
    console.log(`[Email] Owner sale notification sent successfully`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send owner sale notification:`, error);
    return false;
  }
}

// Expired email
export async function sendExpiredEmail(data: {
  email: string;
  campaignName: string;
  campaignSlug: string;
}) {
  // Notify owner about expired campaign
  await notifyOwner({
    title: `❌ Campeonato Expirado - ${data.campaignName}`,
    content: `
**Campeonato expirou!**

- **Campeonato:** ${data.campaignName}
- **Slug:** ${data.campaignSlug}
- **Email:** ${data.email}

O campeonato foi desativado automaticamente.
    `.trim()
  });

  console.log(`[Email] Expired email would be sent to ${data.email} for campaign ${data.campaignName}`);
  
  return true;
}
