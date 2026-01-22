import Stripe from "stripe";
import { getPlan, calculateExpirationDate } from "./products";
import * as db from "../db";
import { sendWelcomeEmail } from "../emails/emailService";

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

// Mapear planId para planType do schema
const planTypeMap: Record<string, "2_months" | "3_months" | "6_months" | "1_year"> = {
  "2months": "2_months",
  "3months": "3_months",
  "6months": "6_months",
  "12months": "1_year",
};

export interface CreateCheckoutParams {
  planId: string;
  campaignName: string;
  slug: string;
  email: string;
  phone?: string;
  customerName?: string;
  couponCode?: string;
  origin: string;
}

export async function createCheckoutSession(params: CreateCheckoutParams) {
  const { planId, campaignName, slug, email, phone, customerName, couponCode, origin } = params;

  // Validar plano
  const plan = getPlan(planId);
  if (!plan) {
    throw new Error("Plano inválido");
  }

  // Verificar se slug está disponível
  const slugAvailable = await db.isSlugAvailable(slug);
  if (!slugAvailable) {
    throw new Error("URL já está em uso");
  }

  // Calcular preço final com desconto
  let finalPrice = plan.price;
  let discountPercent = 0;

  if (couponCode) {
    const couponResult = await db.validateCoupon(couponCode);
    if (couponResult.valid) {
      discountPercent = couponResult.discount;
      finalPrice = Math.round(plan.price * (1 - discountPercent / 100));
    }
  }

  // Garantir preço mínimo do Stripe (50 centavos = R$ 0,50)
  if (finalPrice < 50) {
    finalPrice = 50;
  }

  // Criar sessão de checkout do Stripe
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: email,
    allow_promotion_codes: true,
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: `Pelada Pro - ${plan.name}`,
            description: `Acesso ao sistema por ${plan.duration}. Campeonato: ${campaignName}`,
          },
          unit_amount: finalPrice,
        },
        quantity: 1,
      },
    ],
    metadata: {
      plan_id: planId,
      campaign_name: campaignName,
      slug: slug,
      customer_email: email,
      customer_name: customerName || "",
      customer_phone: phone || "",
      coupon_code: couponCode || "",
      discount_percent: discountPercent.toString(),
      original_price: plan.price.toString(),
      final_price: finalPrice.toString(),
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/landing?canceled=true`,
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata) {
    console.error("[Stripe] Checkout completed sem metadata");
    return;
  }

  const {
    plan_id,
    campaign_name,
    slug,
    customer_email,
    customer_name,
    customer_phone,
    coupon_code,
    discount_percent,
    original_price,
    final_price,
  } = metadata;

  // Calcular data de expiração
  const expiresAt = calculateExpirationDate(plan_id);

  // Mapear planId para planType
  const planType = planTypeMap[plan_id];
  if (!planType) {
    console.error(`[Stripe] Plano inválido: ${plan_id}`);
    return;
  }

  // Calcular desconto
  const discountAmount = parseInt(original_price) - parseInt(final_price);

  // Criar registro de compra
  const purchase = await db.createPurchase({
    customerName: customer_name || customer_email.split("@")[0],
    customerEmail: customer_email,
    customerPhone: customer_phone || undefined,
    campaignName: campaign_name,
    campaignSlug: slug,
    planType: planType,
    amountPaid: session.amount_total || parseInt(final_price),
    currency: "BRL",
    couponCode: coupon_code || undefined,
    discountAmount: discountAmount > 0 ? discountAmount : 0,
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent as string || undefined,
    status: "completed",
    expiresAt,
  });

  // Criar campeonato
  const campaign = await db.createCampaign({
    slug,
    name: campaign_name,
    organizerName: customer_name || undefined,
    organizerEmail: customer_email,
    organizerPhone: customer_phone || undefined,
    purchaseId: purchase.id,
    isActive: true,
    isDemo: false,
  });

  // Usar cupom se aplicável
  if (coupon_code) {
    await db.useCoupon(coupon_code);
  }

  console.log(`[Stripe] Campeonato criado: ${slug} (ID: ${campaign.id})`);

  // Enviar email de boas-vindas
  await sendWelcomeEmail({
    email: customer_email,
    campaignName: campaign_name,
    campaignSlug: slug,
    plan: plan_id,
    expiresAt,
  });

  return { purchase, campaign };
}

export { stripe };
