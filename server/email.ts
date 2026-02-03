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


// ==================== EMAIL DE BOAS-VINDAS TRIAL ====================

interface TrialWelcomeEmailData {
  name: string;
  email: string;
  campaignName: string;
  campaignSlug: string;
  password: string;
  expiresAt: Date;
}

/**
 * Envia email de boas-vindas para novo trial
 */
export async function sendTrialWelcomeEmail(data: TrialWelcomeEmailData): Promise<boolean> {
  try {
    const campaignUrl = `https://peladapro.com.br/${data.campaignSlug}`;
    const adminUrl = `https://peladapro.com.br/${data.campaignSlug}/admin`;
    const expirationDate = new Date(data.expiresAt).toLocaleDateString('pt-BR');

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
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🎉 Bem-vindo ao PeladaPro!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Seu campeonato está pronto para começar</p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${data.name}</strong>,
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Seu campeonato <strong>"${data.campaignName}"</strong> foi criado com sucesso! 🎊
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Você tem <strong>7 dias de acesso gratuito</strong> a todas as funcionalidades da plataforma. Aproveite para testar tudo!
              </p>

              <!-- Box de Credenciais -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">🔑 Suas Credenciais de Acesso</h2>
                    
                    <p style="color: #333333; margin: 0 0 10px 0; font-size: 14px;">
                      <strong>Site do Campeonato:</strong><br>
                      <a href="${campaignUrl}" style="color: #10b981; text-decoration: none; font-size: 16px;">${campaignUrl}</a>
                    </p>

                    <p style="color: #333333; margin: 0 0 10px 0; font-size: 14px;">
                      <strong>Painel Administrativo:</strong><br>
                      <a href="${adminUrl}" style="color: #10b981; text-decoration: none; font-size: 16px;">${adminUrl}</a>
                    </p>

                    <p style="color: #333333; margin: 0 0 10px 0; font-size: 14px;">
                      <strong>Usuário:</strong> ${data.email}
                    </p>

                    <p style="color: #333333; margin: 0; font-size: 14px;">
                      <strong>Senha:</strong> <span style="background-color: #ffffff; padding: 5px 10px; border-radius: 4px; font-family: monospace; font-size: 16px; color: #059669; font-weight: bold;">${data.password}</span>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Botão CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                      Acessar Painel Admin
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Informações do Trial -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                      ⏰ <strong>Seu trial expira em:</strong> ${expirationDate}<br>
                      💳 <strong>Sem cobranças automáticas</strong> - você decide se quer continuar<br>
                      🎁 <strong>Cupom especial:</strong> Use <strong>LANCAMENTO40</strong> para 40% OFF em qualquer plano
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Próximos Passos -->
              <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">📋 Próximos Passos:</h3>
              <ol style="color: #333333; font-size: 14px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                <li>Acesse o painel administrativo com suas credenciais</li>
                <li>Personalize o logo e cores do seu campeonato</li>
                <li>Cadastre os times e jogadores</li>
                <li>Comece a registrar os jogos e resultados</li>
                <li>Compartilhe o link do campeonato com os participantes</li>
              </ol>

              <!-- Suporte -->
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0;">
                Precisa de ajuda? Responda este email ou entre em contato pelo WhatsApp: <strong>+55 11 5198-1694</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
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
      subject: `🎉 Bem-vindo ao PeladaPro - Seu campeonato "${data.campaignName}" está pronto!`,
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
}

/**
 * Day 2: Email de engajamento - "Como está indo?"
 */
export async function sendTrialDay2Email(data: TrialNurturingEmailData): Promise<boolean> {
  try {
    const campaignUrl = `https://peladapro.com.br/${data.campaignSlug}`;
    const adminUrl = `https://peladapro.com.br/${data.campaignSlug}/admin`;
    const expirationDate = new Date(data.expiresAt).toLocaleDateString('pt-BR');

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

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                      Continuar Testando
                    </a>
                  </td>
                </tr>
              </table>

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
                <strong>Lembre-se:</strong> Seu trial expira em ${expirationDate}. Use o cupom <strong>LANCAMENTO40</strong> para 40% OFF em qualquer plano!
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
    const checkoutUrl = `https://peladapro.com.br/checkout?slug=${data.campaignSlug}`;

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
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Não perca acesso ao seu campeonato</p>
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

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <h2 style="color: #92400e; margin: 0 0 15px 0; font-size: 24px;">🎁 OFERTA ESPECIAL</h2>
                    <p style="color: #92400e; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
                      40% OFF em qualquer plano
                    </p>
                    <p style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">
                      Use o cupom: <span style="background-color: #ffffff; padding: 8px 16px; border-radius: 4px; font-family: monospace; font-size: 20px; font-weight: bold; color: #d97706;">LANCAMENTO40</span>
                    </p>
                    <p style="color: #92400e; margin: 0; font-size: 14px;">
                      Válido para planos de 2 meses, 6 meses ou 1 ano
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="https://peladapro.com.br/checkout" style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 6px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
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
                      📅 <strong>2 meses:</strong> R$ 37,45/mês (com desconto)<br>
                      📅 <strong>6 meses:</strong> R$ 29,96/mês (com desconto) - <strong>20% OFF</strong><br>
                      📅 <strong>1 ano:</strong> R$ 24,97/mês (com desconto) - <strong>33% OFF</strong>
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
      subject: `⏰ Seu trial expira em 2 dias - 40% OFF para continuar!`,
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
    const checkoutUrl = `https://peladapro.com.br/checkout?slug=${data.campaignSlug}`;

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
                Gostou da plataforma? Crie seu campeonato oficial agora com <strong>40% OFF</strong> e organize sua pelada de forma profissional!
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <h2 style="color: #92400e; margin: 0 0 15px 0; font-size: 24px;">🎁 ÚLTIMA CHANCE</h2>
                    <p style="color: #92400e; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
                      40% OFF ainda disponível!
                    </p>
                    <p style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">
                      Use o cupom: <span style="background-color: #ffffff; padding: 8px 16px; border-radius: 4px; font-family: monospace; font-size: 20px; font-weight: bold; color: #d97706;">LANCAMENTO40</span>
                    </p>
                    <p style="color: #92400e; margin: 0; font-size: 14px;">
                      Oferta válida por tempo limitado
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="https://peladapro.com.br/checkout" style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 6px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
                      Criar Campeonato Oficial
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

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Precisa de ajuda?</strong> Entre em contato pelo WhatsApp <strong>+55 11 5198-1694</strong> ou responda este email.
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
      subject: `😢 Seu trial expirou - Reative com 40% OFF!`,
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
    const checkoutUrl = `https://peladapro.com.br/checkout?slug=${data.campaignSlug}`;

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

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <h2 style="color: #92400e; margin: 0 0 15px 0; font-size: 24px;">🎁 OFERTA FINAL</h2>
                    <p style="color: #92400e; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
                      40% OFF + Bônus Exclusivo
                    </p>
                    <p style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">
                      Cupom: <span style="background-color: #ffffff; padding: 8px 16px; border-radius: 4px; font-family: monospace; font-size: 20px; font-weight: bold; color: #d97706;">LANCAMENTO40</span>
                    </p>
                    <p style="color: #92400e; margin: 0; font-size: 14px;">
                      + Suporte prioritário por 30 dias
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="https://peladapro.com.br/checkout" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 6px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
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
      subject: `🔔 Última chance - 40% OFF + Bônus Exclusivo`,
      html: htmlContent,
    });

    console.log(`[Email] ✅ Email Day 14 enviado para ${data.email}`);
    return true;
  } catch (error) {
    console.error('[Email] ❌ Erro ao enviar email Day 14:', error);
    return false;
  }
}
