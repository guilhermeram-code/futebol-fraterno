import nodemailer from 'nodemailer';

interface PasswordResetEmailParams {
  to: string;
  campaignName: string;
  tempPassword: string;
  loginUrl: string;
}

export async function sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<void> {
  const { to, campaignName, tempPassword, loginUrl } = params;

  // Configurar transporte Gmail SMTP
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'contato@meucontomagico.com.br',
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // HTML do email
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperação de Senha - ${campaignName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #c89b3c 0%, #f0e68c 100%); padding: 30px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #1a1a1a; font-size: 28px; font-weight: bold;">🔐 Recuperação de Senha</h1>
                  <p style="margin: 10px 0 0 0; color: #2c2c2c; font-size: 16px;">${campaignName}</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    Olá! 👋
                  </p>
                  
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    Recebemos uma solicitação de recuperação de senha para sua conta no <strong>${campaignName}</strong>.
                  </p>
                  
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    Sua <strong>senha temporária</strong> é:
                  </p>
                  
                  <!-- Senha Temporária -->
                  <div style="background-color: #f8f9fa; border: 2px dashed #c89b3c; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 30px 0;">
                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Senha Temporária</p>
                    <p style="margin: 0; color: #1a1a1a; font-size: 32px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 2px;">${tempPassword}</p>
                  </div>
                  
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    ⚠️ <strong>Importante:</strong> Por segurança, você será solicitado a alterar esta senha no primeiro login.
                  </p>
                  
                  <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    Esta senha temporária expira em <strong>24 horas</strong>.
                  </p>
                  
                  <!-- Botão de Login -->
                  <div style="text-align: center; margin: 0 0 30px 0;">
                    <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #c89b3c 0%, #f0e68c 100%); color: #1a1a1a; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                      Fazer Login Agora
                    </a>
                  </div>
                  
                  <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    Ou copie e cole este link no seu navegador:
                  </p>
                  <p style="margin: 0 0 20px 0; color: #c89b3c; font-size: 14px; word-break: break-all;">
                    ${loginUrl}
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                  
                  <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.6;">
                    Se você não solicitou esta recuperação de senha, ignore este email. Sua senha atual permanecerá inalterada.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                    <strong>PeladaPro</strong> - Sistema de Gerenciamento de Campeonatos
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    Este é um email automático, por favor não responda.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Enviar email
  await transporter.sendMail({
    from: '"PeladaPro" <contato@meucontomagico.com.br>',
    to,
    subject: `🔐 Recuperação de Senha - ${campaignName}`,
    html: htmlContent,
  });
}


// ==================== SOLUÇÃO 5: Email para Users (não AdminUsers) ====================

interface PasswordResetEmailUserParams {
  to: string;
  name: string;
  campaignName: string;
  campaignSlug: string;
  tempPassword: string;
  loginUrl: string;
}

/**
 * Envia email de recuperação de senha para usuários (tabela users)
 * Diferente de sendPasswordResetEmail que é para adminUsers
 */
export async function sendPasswordResetEmailUser(params: PasswordResetEmailUserParams): Promise<void> {
  const { to, name, campaignName, campaignSlug, tempPassword, loginUrl } = params;

  console.log(`[Email] Enviando email de recuperação para: ${to}`);
  console.log(`[Email] Campeonato: ${campaignName} (${campaignSlug})`);
  console.log(`[Email] Senha temporária: ${tempPassword}`);

  // Configurar transporte Gmail SMTP
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'contato@meucontomagico.com.br',
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // HTML do email
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperação de Senha - PeladaPro</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔐 Recuperação de Senha</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">PeladaPro</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    Olá <strong>${name}</strong>! 👋
                  </p>
                  
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    Recebemos uma solicitação de recuperação de senha para sua conta do campeonato <strong>${campaignName}</strong>.
                  </p>
                  
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    Sua <strong>senha temporária</strong> é:
                  </p>
                  
                  <!-- Senha Temporária -->
                  <div style="background-color: #f0fdf4; border: 2px dashed #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 30px 0;">
                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Senha Temporária</p>
                    <p style="margin: 0; color: #1a1a1a; font-size: 32px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 2px;">${tempPassword}</p>
                  </div>
                  
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    ⚠️ <strong>Importante:</strong> Por segurança, altere esta senha assim que fizer login no painel administrativo.
                  </p>
                  
                  <!-- Botão de Login -->
                  <div style="text-align: center; margin: 0 0 30px 0;">
                    <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                      Fazer Login Agora
                    </a>
                  </div>
                  
                  <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    Ou copie e cole este link no seu navegador:
                  </p>
                  <p style="margin: 0 0 20px 0; color: #10b981; font-size: 14px; word-break: break-all;">
                    ${loginUrl}
                  </p>
                  
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                      <strong>💡 Dica:</strong> Após fazer login, vá em "Configurações" → "Trocar Senha" para definir uma senha permanente de sua preferência.
                    </p>
                  </div>
                  
                  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                  
                  <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.6;">
                    Se você não solicitou esta recuperação de senha, ignore este email. Sua senha atual permanecerá inalterada.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                    <strong>PeladaPro</strong> - Sistema de Gerenciamento de Campeonatos
                  </p>
                  <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                    Este é um email automático, por favor não responda.
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    Precisa de ajuda? <a href="mailto:contato@meucontomagico.com.br" style="color: #10b981;">contato@meucontomagico.com.br</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `.trim();

  // Enviar email
  try {
    const info = await transporter.sendMail({
      from: '"PeladaPro" <contato@meucontomagico.com.br>',
      to,
      subject: `🔐 Recuperação de Senha - ${campaignName}`,
      html: htmlContent,
    });

    console.log(`[Email] ✅ Email enviado com sucesso para ${to}`);
    console.log(`[Email] Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`[Email] ❌ Erro ao enviar email para ${to}:`, error);
    throw error;
  }
}
