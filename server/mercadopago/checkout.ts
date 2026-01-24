import { MercadoPagoConfig, Preference } from "mercadopago";
import { getDb } from "../db";
import { campaigns, purchases, reservedSlugs } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getPlanById, calculateExpirationDate } from "./products";
import { notifyOwner } from "../_core/notification";
import { createOrganizerUser } from "../_core/createOrganizerUser";
import { sendWelcomeEmail } from "../_core/sendWelcomeEmail";
import { sendOwnerSaleNotification } from "../emails/emailService";

// Inicializar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 },
});

const preference = new Preference(client);

interface CreateCheckoutInput {
  campaignName: string;
  campaignSlug: string;
  email: string;
  whatsapp: string;
  planId: string;
  couponCode?: string;
  origin: string;
}

export async function createCheckoutSession(input: CreateCheckoutInput) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const plan = getPlanById(input.planId);

  if (!plan) {
    throw new Error("Plano inválido");
  }

  // Verificar se slug está disponível
  const [existingCampaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.slug, input.campaignSlug))
    .limit(1);

  if (existingCampaign) {
    throw new Error("Slug já está em uso");
  }

  const [reservedSlug] = await db
    .select()
    .from(reservedSlugs)
    .where(eq(reservedSlugs.slug, input.campaignSlug))
    .limit(1);

  if (reservedSlug) {
    throw new Error("Slug reservado pelo sistema");
  }

  // Calcular preço (aplicar cupom se houver)
  let finalPrice = plan.price;
  let discount = 0;

  if (input.couponCode) {
    const couponCode = input.couponCode.toUpperCase();
    
    // Cupom de lançamento: 40% OFF para os 100 primeiros
    if (couponCode === "LANCAMENTO40") {
      discount = plan.price * 0.40; // 40% de desconto
      finalPrice = plan.price - discount;
    }
    // Cupom de teste para desenvolvimento
    else if (couponCode === "TEST90") {
      discount = plan.price * 0.90;
      finalPrice = plan.price - discount;
    }
  }

  // Criar preferência de pagamento
  const preferenceData = {
    items: [
      {
        id: plan.id,
        title: `Pelada Pro - ${plan.name}`,
        description: `${plan.description}. Campeonato: ${input.campaignName}`,
        quantity: 1,
        unit_price: finalPrice,
        currency_id: "BRL",
      },
    ],
    payer: {
      email: input.email,
      phone: {
        area_code: input.whatsapp.substring(0, 2),
        number: input.whatsapp.substring(2),
      },
    },
    back_urls: {
      success: `${input.origin}/checkout/success`,
      failure: `${input.origin}/landing`,
      pending: `${input.origin}/checkout/pending`,
    },
    external_reference: input.campaignSlug, // Usaremos para identificar o campeonato
    metadata: {
      campaign_name: input.campaignName,
      campaign_slug: input.campaignSlug,
      email: input.email,
      whatsapp: input.whatsapp,
      plan_id: plan.id,
      plan_months: plan.months,
      coupon_code: input.couponCode || "",
    },
    notification_url: `${input.origin}/api/mercadopago/webhook`,
    statement_descriptor: "PELADA PRO",
  };

  const response = await preference.create({ body: preferenceData });

  return {
    checkoutUrl: response.init_point!, // URL do checkout do Mercado Pago
    preferenceId: response.id!,
  };
}

export async function handlePaymentApproved(paymentData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  try {
    console.log("[MercadoPago] Processando pagamento aprovado...");
    console.log("[MercadoPago] external_reference:", paymentData.external_reference);
    console.log("[MercadoPago] metadata:", JSON.stringify(paymentData.metadata, null, 2));
    
    // Extrair dados do pagamento
    const metadata = paymentData.metadata || {};
    const campaignSlug = paymentData.external_reference || metadata.campaign_slug;
    const campaignName = metadata.campaign_name || "Campeonato";
    const email = metadata.email || paymentData.payer?.email;
    const whatsapp = metadata.whatsapp || "";
    const planId = metadata.plan_id || "test";
    const planMonths = parseInt(metadata.plan_months || "1");
    
    // Validar dados essenciais
    if (!campaignSlug) {
      console.error("[MercadoPago] ERRO: campaignSlug não encontrado!");
      throw new Error("campaignSlug não encontrado no pagamento");
    }
    
    if (!email) {
      console.error("[MercadoPago] ERRO: email não encontrado!");
      throw new Error("email não encontrado no pagamento");
    }
    
    console.log("[MercadoPago] Dados extraídos:", { campaignSlug, campaignName, email, whatsapp, planId, planMonths });

    // Verificar se campeonato já existe
    const [existingCampaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.slug, campaignSlug))
      .limit(1);

    if (existingCampaign) {
      console.log(`[MercadoPago] Campeonato ${campaignSlug} já existe, pulando criação`);
      return;
    }

    // Calcular data de expiração
    const expiresAt = calculateExpirationDate(planMonths);

    // Criar campeonato
    const [newCampaign] = await db
      .insert(campaigns)
      .values({
        slug: campaignSlug,
        name: campaignName,
        subtitle: "2026 - respeito e união",
        organizerName: campaignName,
        organizerEmail: email,
        organizerPhone: whatsapp,
        isActive: true,
        isDemo: false,
        createdAt: new Date(),
      })
      .$returningId();

     // Criar purchase (senha será adicionada depois)
    const purchaseResult = await db.insert(purchases).values({
      customerName: campaignName,
      customerEmail: email,
      customerPhone: whatsapp,
      campaignName,
      campaignSlug,
      planType: planId === "basic" ? "2_months" : planId === "popular" ? "3_months" : planId === "extended" ? "6_months" : "1_year",
      amountPaid: Math.round(paymentData.transaction_amount * 100), // converter para centavos
      currency: "BRL",
      couponCode: metadata.coupon_code || null,
      discountAmount: 0,
      stripeSessionId: null,
      stripePaymentIntentId: paymentData.id?.toString(),
      status: "completed",
      expiresAt,
      createdAt: new Date(),
    });
    const purchaseId = purchaseResult[0].insertId;

    // Criar conta de usuário para o organizador
    let temporaryPassword = "";
    try {
      const userResult = await createOrganizerUser({
        email,
        name: campaignName,
      });
      temporaryPassword = userResult.temporaryPassword;
      console.log(`[MercadoPago] Usuário criado para ${email}`);
    } catch (error: any) {
      console.error(`[MercadoPago] Erro ao criar usuário:`, error.message);
      // Se usuário já existe, continua sem criar
    }

    // Salvar senha em texto plano no purchase
    if (temporaryPassword && purchaseId) {
      await db.update(purchases)
        .set({ plainPassword: temporaryPassword })
        .where(eq(purchases.id, purchaseId));
      console.log(`[MercadoPago] Senha salva no purchase ${purchaseId}`);
    }

    // Enviar email de boas-vindas (sempre, mesmo se usuário já existe)
    try {
      await sendWelcomeEmail({
        email,
        name: campaignName,
        campaignName,
        campaignSlug,
        temporaryPassword: temporaryPassword || null, // null se usuário já existe
        expiresAt,
      });
      console.log(`[MercadoPago] Email de boas-vindas enviado para ${email}`);
    } catch (error: any) {
      console.error(`[MercadoPago] Erro ao enviar email:`, error.message);
      // Não falha se email não for enviado
    }

    // Notificar owner via notificação Manus
    await notifyOwner({
      title: "🎉 Nova Venda - Pelada Pro!",
      content: `Campeonato: ${campaignName}\nSlug: /${campaignSlug}\nEmail: ${email}\nPlano: ${planId} (${planMonths} meses)\nExpira em: ${expiresAt.toLocaleDateString("pt-BR")}\nSenha temporária: ${temporaryPassword || "(usuário já existia)"}`,
    });

    // Enviar email para o owner
    try {
      const plan = getPlanById(planId);
      await sendOwnerSaleNotification({
        campaignName,
        campaignSlug,
        customerEmail: email,
        customerPhone: whatsapp,
        planName: plan?.name || planId,
        planMonths,
        amountPaid: Math.round(paymentData.transaction_amount * 100),
        expiresAt,
        temporaryPassword: temporaryPassword || "(usuário já existia)",
      });
      console.log(`[MercadoPago] Email de notificação enviado para owner`);
    } catch (error: any) {
      console.error(`[MercadoPago] Erro ao enviar email para owner:`, error.message);
      // Não falha se email não for enviado
    }

    console.log(`[MercadoPago] Campeonato ${campaignSlug} criado com sucesso!`);
  } catch (error) {
    console.error("[MercadoPago] Erro ao processar pagamento:", error);
    throw error;
  }
}
