import { MercadoPagoConfig, Preference } from "mercadopago";
import { getDb } from "../db";
import { campaigns, purchases, reservedSlugs } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getPlanById, calculateExpirationDate } from "./products";
import { notifyOwner } from "../_core/notification";

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
    // TODO: Implementar lógica de cupons
    // Por enquanto, cupom "TEST99" dá 99% de desconto
    if (input.couponCode.toUpperCase() === "TEST99") {
      discount = plan.price * 0.99;
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
    // Extrair dados do pagamento
    const metadata = paymentData.metadata || {};
    const campaignSlug = paymentData.external_reference || metadata.campaign_slug;
    const campaignName = metadata.campaign_name;
    const email = metadata.email;
    const whatsapp = metadata.whatsapp;
    const planId = metadata.plan_id;
    const planMonths = parseInt(metadata.plan_months || "3");

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

    // Registrar compra
    await db.insert(purchases).values({
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

    // Notificar owner
    await notifyOwner({
      title: "🎉 Nova Venda - Pelada Pro!",
      content: `Campeonato: ${campaignName}\nSlug: /${campaignSlug}\nEmail: ${email}\nPlano: ${planId} (${planMonths} meses)\nExpira em: ${expiresAt.toLocaleDateString("pt-BR")}`,
    });

    console.log(`[MercadoPago] Campeonato ${campaignSlug} criado com sucesso!`);
  } catch (error) {
    console.error("[MercadoPago] Erro ao processar pagamento:", error);
    throw error;
  }
}
