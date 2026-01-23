import { describe, it, expect, beforeAll } from "vitest";
import { handlePaymentApproved } from "./mercadopago/checkout";
import { getDb } from "./db";
import { campaigns, purchases, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Fluxo Completo de Pagamento → Email", () => {
  const testSlug = `teste-flow-${Date.now()}`;
  const testEmail = "teste-flow@example.com";

  beforeAll(async () => {
    // Limpar dados de teste anteriores
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    await db.delete(campaigns).where(eq(campaigns.slug, testSlug));
    await db.delete(users).where(eq(users.email, testEmail));
    
    console.log("[Teste] Dados de teste anteriores limpos");
  });

  it("deve executar fluxo completo: pagamento → campeonato → senha → email", async () => {
    console.log("\n========================================");
    console.log("🧪 TESTE DE FLUXO COMPLETO");
    console.log("========================================\n");

    // Simular dados de pagamento aprovado do Mercado Pago
    const mockPaymentData = {
      id: 123456789,
      status: "approved",
      transaction_amount: 49.9,
      external_reference: testSlug,
      payer: {
        email: testEmail,
      },
      metadata: {
        campaign_name: "Campeonato Teste Flow",
        campaign_slug: testSlug,
        email: testEmail,
        whatsapp: "11999999999",
        plan_id: "basic",
        plan_months: "2",
      },
    };

    console.log("📦 [1/5] Simulando pagamento aprovado...");
    console.log("   - Slug:", testSlug);
    console.log("   - Email:", testEmail);
    console.log("   - Valor: R$", mockPaymentData.transaction_amount);

    // Executar fluxo completo
    console.log("\n⚙️  [2/5] Processando handlePaymentApproved...");
    await handlePaymentApproved(mockPaymentData);

    // Verificar se campeonato foi criado
    console.log("\n🔍 [3/5] Verificando se campeonato foi criado...");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.slug, testSlug))
      .limit(1);

    expect(campaign).toBeDefined();
    console.log("   ✅ Campeonato criado:", campaign.name);

    // Verificar se purchase foi criada
    console.log("\n💰 [4/5] Verificando se purchase foi criada...");
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.campaignSlug, testSlug))
      .limit(1);

    expect(purchase).toBeDefined();
    console.log("   ✅ Purchase criada");
    console.log("   - ID:", purchase.id);
    console.log("   - Email:", purchase.customerEmail);
    console.log("   - Plano:", purchase.planType);
    console.log("   - Senha salva?", purchase.plainPassword ? "✅ SIM" : "❌ NÃO");
    
    if (purchase.plainPassword) {
      console.log("   - Senha:", purchase.plainPassword);
    } else {
      console.log("   ⚠️  PROBLEMA: Senha não foi salva no purchase!");
    }

    // Verificar se usuário foi criado
    console.log("\n👤 [5/5] Verificando se usuário foi criado...");
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, testEmail))
      .limit(1);

    expect(user).toBeDefined();
    console.log("   ✅ Usuário criado");
    console.log("   - ID:", user.id);
    console.log("   - Email:", user.email);
    console.log("   - Nome:", user.name);
    console.log("   - Tem senha hash?", user.passwordHash ? "✅ SIM" : "❌ NÃO");

    // Verificar se senha foi salva no purchase
    expect(purchase.plainPassword).toBeDefined();
    expect(purchase.plainPassword).not.toBe("");
    expect(purchase.plainPassword?.length).toBeGreaterThan(0);

    console.log("\n========================================");
    console.log("✅ FLUXO COMPLETO EXECUTADO COM SUCESSO!");
    console.log("========================================\n");

    console.log("📧 Email deveria ter sido enviado para:", testEmail);
    console.log("🔑 Com a senha:", purchase.plainPassword);
    console.log("\n⚠️  IMPORTANTE: Verifique se o email chegou na caixa de entrada!");
  }, 60000); // Timeout de 60 segundos
});
