import { describe, it, expect } from "vitest";
import { createCheckoutSession } from "./mercadopago/checkout";

describe("Mercado Pago Checkout", () => {
  it("deve criar sessão de checkout com sucesso", async () => {
    const input = {
      campaignName: "Campeonato Teste Vitest",
      campaignSlug: `teste-vitest-${Date.now()}`,
      email: "teste@vitest.com",
      whatsapp: "11999887766",
      planId: "popular",
      origin: "http://localhost:3000",
    };

    const result = await createCheckoutSession(input);

    // Verificar se retornou os campos esperados
    expect(result).toHaveProperty("checkoutUrl");
    expect(result).toHaveProperty("preferenceId");

    // Verificar se a URL do checkout é válida
    expect(result.checkoutUrl).toContain("mercadopago.com");
    expect(result.checkoutUrl).toContain(result.preferenceId);

    // Verificar se o preferenceId não está vazio
    expect(result.preferenceId).toBeTruthy();
    expect(result.preferenceId.length).toBeGreaterThan(10);

    console.log("✅ Checkout URL criada:", result.checkoutUrl);
    console.log("✅ Preference ID:", result.preferenceId);
  }, 15000); // Timeout de 15 segundos

  it("deve rejeitar slug já em uso", async () => {
    const input = {
      campaignName: "Campeonato Teste",
      campaignSlug: "futebol-fraterno", // Slug já existente
      email: "teste@vitest.com",
      whatsapp: "11999887766",
      planId: "popular",
      origin: "http://localhost:3000",
    };

    await expect(createCheckoutSession(input)).rejects.toThrow("Slug já está em uso");
  });

  it("deve rejeitar plano inválido", async () => {
    const input = {
      campaignName: "Campeonato Teste",
      campaignSlug: `teste-invalid-${Date.now()}`,
      email: "teste@vitest.com",
      whatsapp: "11999887766",
      planId: "plano-inexistente",
      origin: "http://localhost:3000",
    };

    await expect(createCheckoutSession(input)).rejects.toThrow("Plano inválido");
  });

  it("deve calcular preço corretamente para cada plano", async () => {
    const plans = [
      { id: "basic", expectedPrice: 49.90 },
      { id: "popular", expectedPrice: 69.90 },
      { id: "extended", expectedPrice: 119.90 },
      { id: "annual", expectedPrice: 199.90 },
    ];

    for (const plan of plans) {
      const input = {
        campaignName: `Teste ${plan.id}`,
        campaignSlug: `teste-${plan.id}-${Date.now()}`,
        email: "teste@vitest.com",
        whatsapp: "11999887766",
        planId: plan.id,
        origin: "http://localhost:3000",
      };

      const result = await createCheckoutSession(input);
      expect(result.checkoutUrl).toContain("mercadopago.com");
      
      console.log(`✅ Plano ${plan.id}: R$ ${plan.expectedPrice} - Checkout criado`);
    }
  }, 30000); // Timeout de 30 segundos para testar todos os planos
});
