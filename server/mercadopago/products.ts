/**
 * Produtos e planos do Pelada Pro para Mercado Pago
 */

export const PLANS = {
  BASIC: {
    id: "basic",
    name: "Básico",
    description: "Acesso ao sistema por 2 meses",
    price: 129,
    originalPrice: 129,
    months: 2,
  },
  POPULAR: {
    id: "popular",
    name: "Popular",
    description: "Acesso ao sistema por 3 meses",
    price: 179,
    originalPrice: 179,
    months: 3,
  },
  EXTENDED: {
    id: "extended",
    name: "Estendido",
    description: "Acesso ao sistema por 6 meses",
    price: 299,
    originalPrice: 299,
    months: 6,
  },
  ANNUAL: {
    id: "annual",
    name: "Anual",
    description: "Acesso ao sistema por 12 meses",
    price: 499,
    originalPrice: 499,
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
  LANCAMENTO50: {
    code: "LANCAMENTO50",
    discount: 0.5, // 50%
    description: "🎉 PROMOÇÃO - 100 PRIMEIROS CLIENTES DO ANO",
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
