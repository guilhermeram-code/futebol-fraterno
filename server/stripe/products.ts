// Produtos e preços do Pelada Pro
// Estes são os planos disponíveis para compra

export const PLANS = {
  "2months": {
    id: "2months",
    name: "Iniciante",
    duration: "2 meses",
    durationMonths: 2,
    price: 4990, // em centavos
    priceDisplay: "R$ 49,90",
    pricePerMonth: 2495,
    stripePriceId: null, // Será criado dinamicamente
  },
  "3months": {
    id: "3months",
    name: "Popular",
    duration: "3 meses",
    durationMonths: 3,
    price: 6990,
    priceDisplay: "R$ 69,90",
    pricePerMonth: 2330,
    popular: true,
    stripePriceId: null,
  },
  "6months": {
    id: "6months",
    name: "Semestral",
    duration: "6 meses",
    durationMonths: 6,
    price: 11990,
    priceDisplay: "R$ 119,90",
    pricePerMonth: 1998,
    stripePriceId: null,
  },
  "12months": {
    id: "12months",
    name: "Anual",
    duration: "12 meses",
    durationMonths: 12,
    price: 19990,
    priceDisplay: "R$ 199,90",
    pricePerMonth: 1666,
    bestValue: true,
    stripePriceId: null,
  },
};

export type PlanId = keyof typeof PLANS;

export function getPlan(planId: string) {
  return PLANS[planId as PlanId] || null;
}

export function calculateExpirationDate(planId: string): Date {
  const plan = getPlan(planId);
  if (!plan) throw new Error(`Plano inválido: ${planId}`);
  
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() + plan.durationMonths);
  return expirationDate;
}

export function applyDiscount(price: number, discountPercent: number): number {
  return Math.round(price * (1 - discountPercent / 100));
}
