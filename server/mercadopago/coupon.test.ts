import { describe, it, expect } from "vitest";
import { applyCoupon } from "./products";

describe("Cupons Promocionais - Mercado Pago", () => {
  const basePrice = 134.00; // Plano Popular

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

  it("deve retornar preço sem desconto para qualquer cupom (nenhum ativo)", () => {
    const cupons = ["LANCAMENTO40", "TRIAL20", "PROMO50", "DESCONTO10"];
    
    cupons.forEach(cupom => {
      const result = applyCoupon(basePrice, cupom);
      expect(result.valid).toBe(false);
      expect(result.discount).toBe(0);
      expect(result.finalPrice).toBe(basePrice);
    });
  });
});
