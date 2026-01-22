import { notifyOwner } from "../_core/notification";

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

  console.log(`[Email] Welcome email would be sent to ${data.email} for campaign ${data.campaignName}`);
  
  return true;
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
