/**
 * Produtos e planos do Pelada Pro para Mercado Pago
 */

export const PLANS = {
  BASIC: {
    id: "basic",
    name: "Básico",
    description: "Acesso ao sistema por 2 meses",
    price: 49.90,
    months: 2,
  },
  POPULAR: {
    id: "popular",
    name: "Popular",
    description: "Acesso ao sistema por 3 meses",
    price: 69.90,
    months: 3,
  },
  EXTENDED: {
    id: "extended",
    name: "Estendido",
    description: "Acesso ao sistema por 6 meses",
    price: 119.90,
    months: 6,
  },
  ANNUAL: {
    id: "annual",
    name: "Anual",
    description: "Acesso ao sistema por 12 meses",
    price: 199.90,
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
