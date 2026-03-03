import { describe, it, expect } from "vitest";
import { applyCoupon } from "./products";

describe("Cupons Promocionais - Mercado Pago", () => {
  const basePrice = 134.00; // Plano Popular

  // ============================================================
  // Testes da função applyCoupon (hardcoded - sempre inválido)
  // O sistema real agora usa banco de dados (checkout.ts)
  // ============================================================

  it("deve retornar preço sem desconto quando cupom LANCAMENTO40 é usado (desativado)", () => {
    const result = applyCoupon(basePrice, "LANCAMENTO40");
    
    expect(result.valid).toBe(false);
    expect(result.discount).toBe(0);
    expect(result.finalPrice).toBe(basePrice);
  });

  it("deve retornar preço sem desconto quando cupom inválido é usado", () => {
    const result = applyCoupon(basePrice, "CUPOMINVALIDO");
    
    expect(result.valid).toBe(false);
    expect(result.discount).toBe(0);
    expect(result.finalPrice).toBe(basePrice);
  });

  it("deve retornar preço sem desconto quando cupom vazio é usado", () => {
    const result = applyCoupon(basePrice, "");
    
    expect(result.valid).toBe(false);
    expect(result.discount).toBe(0);
    expect(result.finalPrice).toBe(basePrice);
  });

  it("deve retornar preço sem desconto para qualquer cupom (função hardcoded desativada)", () => {
    const cupons = ["LANCAMENTO40", "TRIAL20", "PROMO50", "DESCONTO10", "OWNER95"];
    
    cupons.forEach(cupom => {
      const result = applyCoupon(basePrice, cupom);
      expect(result.valid).toBe(false);
      expect(result.discount).toBe(0);
      expect(result.finalPrice).toBe(basePrice);
    });
  });

  // ============================================================
  // Testes de lógica de validação de cupons (simulando banco)
  // ============================================================

  describe("Lógica de validação de cupons do banco de dados", () => {
    // Simula a lógica do checkout.ts sem precisar do banco
    function validateCouponLogic(coupon: {
      active: boolean;
      discountPercent: number;
      maxUses: number | null;
      usedCount: number;
      expiresAt: Date | null;
    }, price: number) {
      if (!coupon.active) return { valid: false, finalPrice: price, discount: 0 };
      
      const now = new Date();
      const isExpired = coupon.expiresAt && coupon.expiresAt < now;
      const isExhausted = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;
      
      if (isExpired || isExhausted) return { valid: false, finalPrice: price, discount: 0 };
      
      const discount = price * (coupon.discountPercent / 100);
      const finalPrice = Math.max(0.01, price - discount);
      return { valid: true, finalPrice, discount };
    }

    it("OWNER95 deve aplicar 95% de desconto quando válido e não usado", () => {
      const coupon = {
        active: true,
        discountPercent: 95,
        maxUses: 1,
        usedCount: 0,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano no futuro
      };
      
      const result = validateCouponLogic(coupon, basePrice);
      
      expect(result.valid).toBe(true);
      expect(result.discount).toBeCloseTo(basePrice * 0.95, 2);
      expect(result.finalPrice).toBeCloseTo(basePrice * 0.05, 2);
    });

    it("OWNER95 deve ser inválido após 1 uso (uso único)", () => {
      const coupon = {
        active: true,
        discountPercent: 95,
        maxUses: 1,
        usedCount: 1, // já foi usado
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      };
      
      const result = validateCouponLogic(coupon, basePrice);
      
      expect(result.valid).toBe(false);
      expect(result.discount).toBe(0);
      expect(result.finalPrice).toBe(basePrice);
    });

    it("cupom expirado deve ser inválido", () => {
      const coupon = {
        active: true,
        discountPercent: 95,
        maxUses: 1,
        usedCount: 0,
        expiresAt: new Date(Date.now() - 1000), // expirado há 1 segundo
      };
      
      const result = validateCouponLogic(coupon, basePrice);
      
      expect(result.valid).toBe(false);
    });

    it("cupom inativo deve ser inválido", () => {
      const coupon = {
        active: false,
        discountPercent: 95,
        maxUses: 1,
        usedCount: 0,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      };
      
      const result = validateCouponLogic(coupon, basePrice);
      
      expect(result.valid).toBe(false);
    });

    it("finalPrice nunca deve ser menor que R$ 0,01", () => {
      const coupon = {
        active: true,
        discountPercent: 100,
        maxUses: null,
        usedCount: 0,
        expiresAt: null,
      };
      
      const result = validateCouponLogic(coupon, 0.01);
      
      expect(result.finalPrice).toBeGreaterThanOrEqual(0.01);
    });
  });
});
