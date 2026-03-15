import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

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


// ==================== EMAIL DE BOAS-VINDAS TRIAL ====================

interface TrialWelcomeEmailData {
  name: string;
  email: string;
  campaignName: string;
  campaignSlug: string;
  password: string;
  expiresAt: Date;
  campaignId?: number;
  adminUserId?: number;
}

/**
 * Envia email de boas-vindas para novo trial
 */
export async function sendTrialWelcomeEmail(data: TrialWelcomeEmailData): Promise<boolean> {
  try {
    const campaignUrl = `https://peladapro.com.br/${data.campaignSlug}`;
    const adminUrl = `https://peladapro.com.br/${data.campaignSlug}/admin`;
    const expirationDate = new Date(data.expiresAt).toLocaleDateString('pt-BR');

    // Gerar magic link JWT (válido por 30 dias)
    const magicToken = jwt.sign(
      {
        adminUserId: data.adminUserId ?? -99,
        username: data.email,
        name: data.name,
        isOwner: true,
        campaignId: data.campaignId ?? 0,
        needsPasswordChange: false,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );
    const magicLinkUrl = `${adminUrl}?token=${magicToken}`;

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

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao PeladaPro - Trial Gratuito</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 12px;">⚽</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: -0.5px;">Bem-vindo ao PeladaPro!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px;">Seu campeonato <strong>"${data.campaignName}"</strong> está pronto</p>
            </td>
          </tr>

          <!-- Botão Magic Link -->
          <tr>
            <td style="padding: 36px 30px 20px 30px; text-align: center;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Olá, <strong>${data.name}</strong>! 👋 Clique no botão abaixo para entrar direto no seu painel — <strong>sem precisar digitar senha</strong>:
              </p>

              <a href="${magicLinkUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 8px; font-size: 17px; font-weight: bold; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(16,185,129,0.4);">
                ▶ ACESSAR MEU PAINEL AGORA
              </a>

              <p style="color: #9ca3af; font-size: 12px; margin: 12px 0 0 0;">
                Link válido por 30 dias · Funciona em qualquer dispositivo
              </p>
            </td>
          </tr>

          <!-- Divisor -->
          <tr>
            <td style="padding: 0 30px;">
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">
            </td>
          </tr>

          <!-- Credenciais para outros dispositivos -->
          <tr>
            <td style="padding: 24px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <h3 style="color: #374151; margin: 0 0 14px 0; font-size: 15px;">🔑 Acesso por outros dispositivos</h3>
                    <p style="color: #6b7280; font-size: 13px; margin: 0 0 12px 0;">Se quiser entrar de outro celular ou computador, use:</p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 13px;">Site do painel:</span><br>
                          <a href="${adminUrl}" style="color: #10b981; font-size: 14px; text-decoration: none; font-weight: 500;">${adminUrl}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 13px;">Usuário:</span><br>
                          <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.email}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="color: #6b7280; font-size: 13px;">Senha:</span><br>
                          <span style="background-color: #ffffff; border: 1px solid #d1d5db; padding: 4px 10px; border-radius: 4px; font-family: monospace; font-size: 15px; color: #059669; font-weight: bold; display: inline-block; margin-top: 4px;">${data.password}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divisor -->
          <tr>
            <td style="padding: 0 30px;">
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">
            </td>
          </tr>

          <!-- Próximos Passos -->
          <tr>
            <td style="padding: 24px 30px;">
              <h3 style="color: #374151; margin: 0 0 16px 0; font-size: 15px;">📋 Por onde começar (3 passos):</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                    <span style="background: #10b981; color: white; border-radius: 50%; width: 22px; height: 22px; display: inline-block; text-align: center; line-height: 22px; font-size: 12px; font-weight: bold; margin-right: 10px;">1</span>
                    <span style="color: #374151; font-size: 14px;">Cadastre os times na aba <strong>"Times"</strong></span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                    <span style="background: #10b981; color: white; border-radius: 50%; width: 22px; height: 22px; display: inline-block; text-align: center; line-height: 22px; font-size: 12px; font-weight: bold; margin-right: 10px;">2</span>
                    <span style="color: #374151; font-size: 14px;">Adicione os jogadores de cada time</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="background: #10b981; color: white; border-radius: 50%; width: 22px; height: 22px; display: inline-block; text-align: center; line-height: 22px; font-size: 12px; font-weight: bold; margin-right: 10px;">3</span>
                    <span style="color: #374151; font-size: 14px;">Crie os jogos e registre os resultados</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info Trial -->
          <tr>
            <td style="padding: 0 30px 24px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 6px 6px 0;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <p style="color: #065f46; margin: 0; font-size: 13px; line-height: 1.7;">
                      ⏰ <strong>Trial expira em:</strong> ${expirationDate} &nbsp;·&nbsp; 💳 <strong>Sem cobranças automáticas</strong><br>
                      💚 Planos a partir de <strong>R$ 31,21/mês</strong> se quiser continuar
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0 0 6px 0;">
                Dúvidas? Responda este email ou WhatsApp: <strong style="color: #6b7280;">+55 11 5198-1694</strong>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2026 <a href="https://peladapro.com.br" style="color: #10b981; text-decoration: none;">PeladaPro</a> · Organize seu campeonato como um profissional
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

    await transporter.sendMail({
      from: '"PeladaPro" <contato@meucontomagico.com.br>',
      to: data.email,
      subject: `⚽ Seu campeonato "${data.campaignName}" está pronto — acesse agora em 1 clique`,
      html: htmlContent,
    });

    console.log(`[Email] ✅ Email de boas-vindas enviado para ${data.email}`);
    return true;
  } catch (error) {
    console.error('[Email] ❌ Erro ao enviar email de boas-vindas:', error);
    return false;
  }
}


// ==================== EMAILS DE NURTURING (DAY 2, 5, 7, 14) ====================

interface TrialNurturingEmailData {
  name: string;
  email: string;
  campaignName: string;
  campaignSlug: string;
  expiresAt: Date;
  campaignId?: number;
  adminUserId?: number;
}

/**
 * Day 2: Email de engajamento - "Como está indo?"
 */
export async function sendTrialDay2Email(data: TrialNurturingEmailData): Promise<boolean> {
  try {
    const campaignUrl = `https://peladapro.com.br/${data.campaignSlug}`;
    const adminUrl = `https://peladapro.com.br/${data.campaignSlug}/admin`;
    const expirationDate = new Date(data.expiresAt).toLocaleDateString('pt-BR');

    // Gerar magic link JWT (válido por 30 dias)
    const magicToken = jwt.sign(
      {
        adminUserId: data.adminUserId ?? -99,
        username: data.email,
        name: data.name,
        isOwner: true,
        campaignId: data.campaignId ?? 0,
        needsPasswordChange: false,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );
    const magicLinkUrl = `${adminUrl}?token=${magicToken}`;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'contato@meucontomagico.com.br',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Como está indo seu campeonato?</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">👋 Como está indo?</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Já testou todas as funcionalidades?</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${data.name}</strong>,
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Notamos que você criou o campeonato <strong>"${data.campaignName}"</strong> há 2 dias. Como está sendo a experiência? 🤔
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Ainda tem <strong>5 dias de trial gratuito</strong> para explorar todas as funcionalidades!
              </p>

              <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">⚡ Já testou essas funcionalidades?</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px; background-color: #f0fdf4; border-left: 4px solid #10b981; margin-bottom: 10px;">
                    <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                      ✅ <strong>Tabelas automáticas:</strong> Cadastre os jogos e a classificação se atualiza sozinha<br>
                      ✅ <strong>Estatísticas completas:</strong> Artilheiros, cartões, assistências e muito mais<br>
                      ✅ <strong>Galeria de fotos:</strong> Compartilhe os melhores momentos do campeonato<br>
                      ✅ <strong>Chaves de mata-mata:</strong> Visualização profissional das fases eliminatórias<br>
                      ✅ <strong>Patrocinadores:</strong> Divulgue seus apoiadores com destaque
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 8px;">
                <tr>
                  <td align="center">
                    <a href="${magicLinkUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 8px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 12px rgba(16,185,129,0.4);">
                      ▶ ACESSAR MEU PAINEL AGORA
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0 0 30px 0;">1 clique — sem precisar digitar senha</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                      💡 <strong>Dica:</strong> Precisa de ajuda? Responda este email ou entre em contato pelo WhatsApp <strong>+55 11 5198-1694</strong>. Estamos aqui para te ajudar!
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Lembre-se:</strong> Seu trial expira em ${expirationDate}. Aproveite nossos preços especiais para continuar organizando seu campeonato!
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                © 2026 PeladaPro - Organize seu campeonato como um profissional
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                <a href="https://peladapro.com.br" style="color: #10b981; text-decoration: none;">peladapro.com.br</a>
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

    await transporter.sendMail({
      from: '"PeladaPro" <contato@meucontomagico.com.br>',
      to: data.email,
      subject: `👋 Como está indo seu campeonato "${data.campaignName}"?`,
      html: htmlContent,
    });

    console.log(`[Email] ✅ Email Day 2 enviado para ${data.email}`);
    return true;
  } catch (error) {
    console.error('[Email] ❌ Erro ao enviar email Day 2:', error);
    return false;
  }
}

/**
 * Day 5: Email de urgência - "Expira em 2 dias!"
 */
export async function sendTrialDay5Email(data: TrialNurturingEmailData): Promise<boolean> {
  try {
    const campaignUrl = `https://peladapro.com.br/${data.campaignSlug}`;
    const adminUrl = `https://peladapro.com.br/${data.campaignSlug}/admin`;

    // Gerar magic link JWT (válido por 30 dias)
    const magicToken = jwt.sign(
      {
        adminUserId: data.adminUserId ?? -99,
        username: data.email,
        name: data.name,
        isOwner: true,
        campaignId: data.campaignId ?? 0,
        needsPasswordChange: false,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );
    const magicLinkUrl = `${adminUrl}?token=${magicToken}`;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'contato@meucontomagico.com.br',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu trial expira em 2 dias!</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">⏰ Seu trial expira em 2 dias!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Continue organizando seu campeonato como um profissional</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${data.name}</strong>,
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Seu trial gratuito do campeonato <strong>"${data.campaignName}"</strong> expira em apenas <strong>2 dias</strong>! ⚠️
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Gostou da experiência? Crie seu campeonato oficial agora e organize sua pelada como um profissional!
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #d1fae5; border: 2px solid #10b981; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <h2 style="color: #065f46; margin: 0 0 15px 0; font-size: 24px;">💚 PREÇOS ESPECIAIS</h2>
                    <p style="color: #065f46; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">
                      Planos a partir de R$ 31,21/mês
                    </p>
                    <p style="color: #065f46; margin: 0; font-size: 14px;">
                      Sem cupons, sem truques. Preços justos e transparentes.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Botão 1: Voltar ao painel (magic link) -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 8px;">
                <tr>
                  <td align="center">
                    <a href="${magicLinkUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 12px rgba(16,185,129,0.4);">
                      ▶ Voltar ao Meu Painel Agora
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0 0 16px 0;">1 clique — sem precisar digitar senha</p>

              <!-- Botão 2: Criar campeonato oficial (compra) -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="https://peladapro.com.br" style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 6px; font-size: 15px; font-weight: bold; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                      Criar Meu Campeonato Oficial
                    </a>
                  </td>
                </tr>
              </table>

              <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">💰 Planos Disponíveis:</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px; background-color: #f0fdf4; border-left: 4px solid #10b981; margin-bottom: 10px;">
                    <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                      📅 <strong>2 meses:</strong> R$ 97,50 total (R$ 48,75/mês)<br>
                      📅 <strong>3 meses:</strong> R$ 134,00 total (R$ 44,67/mês) - <strong>Mais Popular</strong><br>
                      📅 <strong>6 meses:</strong> R$ 224,00 total (R$ 37,33/mês) - <strong>Economia de 23%</strong><br>
                      📅 <strong>1 ano:</strong> R$ 374,50 total (R$ 31,21/mês) - <strong>Melhor Custo-Benefício</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Dúvidas?</strong> Entre em contato pelo WhatsApp <strong>+55 11 5198-1694</strong> ou responda este email.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                © 2026 PeladaPro - Organize seu campeonato como um profissional
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                <a href="https://peladapro.com.br" style="color: #10b981; text-decoration: none;">peladapro.com.br</a>
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

    await transporter.sendMail({
      from: '"PeladaPro" <contato@meucontomagico.com.br>',
      to: data.email,
      subject: `⏰ Seu trial expira em 2 dias - Continue organizando seu campeonato!`,
      html: htmlContent,
    });

    console.log(`[Email] ✅ Email Day 5 enviado para ${data.email}`);
    return true;
  } catch (error) {
    console.error('[Email] ❌ Erro ao enviar email Day 5:', error);
    return false;
  }
}

/**
 * Day 7: Email de expiração - "Trial expirado"
 */
export async function sendTrialDay7Email(data: TrialNurturingEmailData): Promise<boolean> {
  try {
    // Montar URL do WhatsApp com mensagem pré-preenchida
    const whatsappMsg = encodeURIComponent(`Olá! Fiz o trial do campeonato "${data.campaignName}" e quero continuar. Pode me ajudar?`);
    const whatsappUrl = `https://wa.me/551151981694?text=${whatsappMsg}`;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'contato@meucontomagico.com.br',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0;">
  <title>Seu trial expirou - Reative agora!</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">😢 Seu trial expirou</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Mas você pode criar seu campeonato oficial!</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${data.name}</strong>,
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Seu trial gratuito do campeonato <strong>"${data.campaignName}"</strong> expirou hoje. 😢
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Gostou da plataforma? Crie seu campeonato oficial agora com nossos <strong>preços especiais</strong> e organize sua pelada de forma profissional!
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #d1fae5; border: 2px solid #10b981; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <h2 style="color: #065f46; margin: 0 0 15px 0; font-size: 24px;">💚 PREÇOS ESPECIAIS</h2>
                    <p style="color: #065f46; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">
                      A partir de R$ 31,21/mês
                    </p>
                    <p style="color: #065f46; margin: 0; font-size: 14px;">
                      Planos de 2, 3, 6 ou 12 meses disponíveis
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Botão principal: WhatsApp com mensagem pré-preenchida -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 8px;">
                <tr>
                  <td align="center">
                    <a href="${whatsappUrl}" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 8px; font-size: 17px; font-weight: bold; box-shadow: 0 4px 12px rgba(37,211,102,0.4);">
                      💬 Quero Continuar com Meu Campeonato
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0 0 24px 0;">Clique para abrir o WhatsApp — a mensagem já vem preenchida</p>

              <!-- Botão secundário: site -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="https://peladapro.com.br" style="display: inline-block; background-color: #f3f4f6; color: #374151; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-size: 14px; font-weight: bold; border: 1px solid #d1d5db;">
                      Ver Planos no Site
                    </a>
                  </td>
                </tr>
              </table>

              <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">✨ O que você ganha com o campeonato oficial:</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px; background-color: #f0fdf4; border-left: 4px solid #10b981;">
                    <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                      ✅ Campeonato profissional sem limite de tempo<br>
                      ✅ Acesso completo ao painel administrativo<br>
                      ✅ Atualizações automáticas de classificação<br>
                      ✅ Estatísticas completas e profissionais<br>
                      ✅ Suporte prioritário via WhatsApp
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                © 2026 PeladaPro - Organize seu campeonato como um profissional
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                <a href="https://peladapro.com.br" style="color: #10b981; text-decoration: none;">peladapro.com.br</a>
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

    await transporter.sendMail({
      from: '"PeladaPro" <contato@meucontomagico.com.br>',
      to: data.email,
      subject: `😢 Seu trial expirou - Reative seu campeonato agora!`,
      html: htmlContent,
    });

    console.log(`[Email] ✅ Email Day 7 enviado para ${data.email}`);
    return true;
  } catch (error) {
    console.error('[Email] ❌ Erro ao enviar email Day 7:', error);
    return false;
  }
}

/**
 * Day 14: Email final - "Última chance"
 */
export async function sendTrialDay14Email(data: TrialNurturingEmailData): Promise<boolean> {
  try {

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'contato@meucontomagico.com.br',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Última chance de reativar</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔔 Última Chance!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Sentimos sua falta</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${data.name}</strong>,
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Faz uma semana que seu trial do campeonato <strong>"${data.campaignName}"</strong> expirou.
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Este é nosso último email. Se você gostou da experiência e quer criar seu campeonato oficial, esta é sua última chance de aproveitar nossa oferta especial! 🎁
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #d1fae5; border: 2px solid #10b981; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <h2 style="color: #065f46; margin: 0 0 15px 0; font-size: 24px;">💚 ORGANIZE SEU CAMPEONATO</h2>
                    <p style="color: #065f46; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">
                      Planos a partir de R$ 31,21/mês
                    </p>
                    <p style="color: #065f46; margin: 0; font-size: 14px;">
                      Preços transparentes + Suporte via WhatsApp
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="https://peladapro.com.br" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 6px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                      Criar Campeonato Oficial
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Se você não estiver interessado, tudo bem! Agradecemos por ter testado o PeladaPro. 🙏
              </p>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Alguma dúvida ou feedback?</strong> Responda este email, adoraríamos ouvir sua opinião!
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                © 2026 PeladaPro - Organize seu campeonato como um profissional
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                <a href="https://peladapro.com.br" style="color: #10b981; text-decoration: none;">peladapro.com.br</a>
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

    await transporter.sendMail({
      from: '"PeladaPro" <contato@meucontomagico.com.br>',
      to: data.email,
      subject: `🔔 Sentiremos sua falta - Organize seu campeonato com o PeladaPro`,
      html: htmlContent,
    });

    console.log(`[Email] ✅ Email Day 14 enviado para ${data.email}`);
    return true;
  } catch (error) {
    console.error('[Email] ❌ Erro ao enviar email Day 14:', error);
    return false;
  }
}


// ==================== NOTIFICAÇÃO PARA OWNER ====================

interface OwnerNotificationEmailData {
  name: string;
  email: string;
  whatsapp?: string;
  campaignName: string;
  campaignSlug: string;
  expiresAt: Date;
}

/**
 * Envia email de notificação para o owner quando alguém cria um trial
 */
export async function sendOwnerNotificationEmail(data: OwnerNotificationEmailData): Promise<boolean> {
  try {
    const campaignUrl = `https://peladapro.com.br/${data.campaignSlug}`;
    const adminUrl = `https://peladapro.com.br/${data.campaignSlug}/admin`;
    const expirationDate = new Date(data.expiresAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

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

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Trial Criado - PeladaPro</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🎉 Novo Trial Criado!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Alguém acabou de criar um teste grátis</p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Um novo usuário criou um teste grátis de 7 dias no PeladaPro! 🚀
              </p>

              <h3 style="color: #2563eb; margin: 0 0 20px 0; font-size: 18px;">📋 Informações do Cadastro:</h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #64748b; font-size: 14px; font-weight: bold; width: 140px;">👤 Nome:</td>
                        <td style="color: #1e293b; font-size: 14px;">${data.name}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; font-weight: bold;">📧 Email:</td>
                        <td style="color: #1e293b; font-size: 14px;"><a href="mailto:${data.email}" style="color: #3b82f6; text-decoration: none;">${data.email}</a></td>
                      </tr>
                      ${data.whatsapp ? `
                      <tr>
                        <td style="color: #64748b; font-size: 14px; font-weight: bold;">📱 WhatsApp:</td>
                        <td style="color: #1e293b; font-size: 14px;"><a href="https://wa.me/${data.whatsapp.replace(/\D/g, '')}" style="color: #3b82f6; text-decoration: none;">${data.whatsapp}</a></td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="color: #64748b; font-size: 14px; font-weight: bold;">🏆 Campeonato:</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: bold;">${data.campaignName}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; font-weight: bold;">🔗 URL:</td>
                        <td style="color: #1e293b; font-size: 14px;"><a href="${campaignUrl}" style="color: #3b82f6; text-decoration: none;">${campaignUrl}</a></td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; font-weight: bold;">⏰ Expira em:</td>
                        <td style="color: #dc2626; font-size: 14px; font-weight: bold;">${expirationDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; margin-right: 10px;">
                      Ver Painel Admin
                    </a>
                    <a href="${campaignUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                      Ver Campeonato
                    </a>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                      💡 <strong>Próximos passos:</strong> O usuário receberá emails automáticos nos dias 2, 5 e 7 do trial para engajamento e conversão.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0;">
                Este é um email automático de notificação. Você pode acompanhar todos os trials criados no painel administrativo.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                © 2026 PeladaPro - Sistema de Gerenciamento de Campeonatos
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                <a href="https://peladapro.com.br" style="color: #3b82f6; text-decoration: none;">peladapro.com.br</a>
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

    await transporter.sendMail({
      from: '"PeladaPro - Notificações" <contato@meucontomagico.com.br>',
      to: 'contato@meucontomagico.com.br',
      subject: `🎉 Novo Trial Criado: ${data.campaignName} (${data.name})`,
      html: htmlContent,
    });

    console.log(`[Email] ✅ Notificação de trial enviada para owner`);
    return true;
  } catch (error) {
    console.error('[Email] ❌ Erro ao enviar notificação para owner:', error);
    return false;
  }
}
