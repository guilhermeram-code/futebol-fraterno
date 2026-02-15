/**
 * Produtos e planos do Pelada Pro para Mercado Pago
 */

export const PLANS = {
  TEST: {
    id: "test",
    name: "Teste",
    description: "Acesso ao sistema por 1 mês",
    price: 7,
    originalPrice: 7,
    months: 1,
  },
  BASIC: {
    id: "basic",
    name: "Iniciante",
    description: "Acesso ao sistema por 2 meses",
    price: 97.50, // Preço com 50% OFF permanente
    originalPrice: 97.50,
    months: 2,
  },
  POPULAR: {
    id: "popular",
    name: "Popular",
    description: "Acesso ao sistema por 3 meses",
    price: 134.00, // Preço com 50% OFF permanente
    originalPrice: 134.00,
    months: 3,
  },
  EXTENDED: {
    id: "extended",
    name: "Semestral",
    description: "Acesso ao sistema por 6 meses",
    price: 224.00, // Preço com 50% OFF permanente
    originalPrice: 224.00,
    months: 6,
  },
  ANNUAL: {
    id: "annual",
    name: "Anual",
    description: "Acesso ao sistema por 12 meses",
    price: 374.50, // Preço com 50% OFF permanente
    originalPrice: 374.50,
    months: 12,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlanById(planId: string) {
  return PLANS[planId.toUpperCase() as PlanId];
}

export function calculateExpirationDate(months: number): Date {
  const now = new Date();
  now.setMonth(now.getMonth() + months);
  return now;
}

// Cupom de desconto para promoção de lançamento
export const PROMO_COUPONS = {
  LANCAMENTO40: {
    code: "LANCAMENTO40",
    discount: 0.4, // 40%
    description: "🎉 PROMOÇÃO - 100 PRIMEIROS CLIENTES DO ANO - 40% OFF",
    validUntil: new Date("2026-12-31"),
    maxUses: 100,
  },
} as const;

export function applyCoupon(price: number, couponCode: string): { finalPrice: number; discount: number; valid: boolean } {
  const coupon = PROMO_COUPONS[couponCode as keyof typeof PROMO_COUPONS];
  
  if (!coupon) {
    return { finalPrice: price, discount: 0, valid: false };
  }
  
  // Verificar se o cupom ainda é válido
  if (new Date() > coupon.validUntil) {
    return { finalPrice: price, discount: 0, valid: false };
  }
  
  const discount = price * coupon.discount;
  const finalPrice = price - discount;
  
  return { finalPrice, discount, valid: true };
}
