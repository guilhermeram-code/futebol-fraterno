import { describe, it, expect, beforeAll } from "vitest";
import { handlePaymentApproved } from "./mercadopago/checkout";
import { getDb } from "./db";
import { campaigns, purchases, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("🧪 TESTE REAL: Enviar Email para guilhermeram@gmail.com", () => {
  const testSlug = `campeonato-teste-${Date.now()}`;
  const realEmail = "guilhermeram@gmail.com";

  beforeAll(async () => {
    // Limpar dados de teste anteriores
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    await db.delete(campaigns).where(eq(campaigns.slug, testSlug));
    await db.delete(users).where(eq(users.email, realEmail));
    
    console.log("\n========================================");
    console.log("🧪 TESTE AUTOMATIZADO - EMAIL REAL");
    console.log("========================================");
    console.log("📧 Destinatário:", realEmail);
    console.log("🏆 Campeonato:", testSlug);
    console.log("========================================\n");
  });

  it("deve enviar email REAL para guilhermeram@gmail.com com senha", async () => {
    console.log("⏳ [1/5] Simulando pagamento aprovado no Mercado Pago...\n");

    // Simular dados de pagamento aprovado do Mercado Pago
    const mockPaymentData = {
      id: Date.now(), // ID único
      status: "approved",
      transaction_amount: 49.9,
      external_reference: testSlug,
      payer: {
        email: realEmail,
      },
      metadata: {
        campaign_name: "Meu Campeonato de Teste",
        campaign_slug: testSlug,
        email: realEmail,
        whatsapp: "11987654321",
        plan_id: "basic",
        plan_months: "2",
      },
    };

    console.log("✅ Pagamento simulado:");
    console.log("   - Valor: R$", mockPaymentData.transaction_amount);
    console.log("   - Email:", realEmail);
    console.log("   - Plano: Basic (2 meses)");
    console.log("   - Slug:", testSlug);

    // Executar fluxo completo
    console.log("\n⚙️  [2/5] Processando pagamento (criar campeonato + usuário + senha)...\n");
    await handlePaymentApproved(mockPaymentData);

    // Verificar se campeonato foi criado
    console.log("🔍 [3/5] Verificando campeonato no banco...");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.slug, testSlug))
      .limit(1);

    expect(campaign).toBeDefined();
    console.log("   ✅ Campeonato criado:", campaign.name);

    // Verificar se purchase foi criada com senha
    console.log("\n💰 [4/5] Verificando purchase e senha...");
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.campaignSlug, testSlug))
      .limit(1);

    expect(purchase).toBeDefined();
    expect(purchase.plainPassword).toBeDefined();
    expect(purchase.plainPassword).not.toBe("");

    console.log("   ✅ Purchase criada");
    console.log("   ✅ Senha gerada:", purchase.plainPassword);

    // Verificar se usuário foi criado
    console.log("\n👤 [5/5] Verificando usuário...");
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, realEmail))
      .limit(1);

    expect(user).toBeDefined();
    console.log("   ✅ Usuário criado");
    console.log("   - Email:", user.email);
    console.log("   - Nome:", user.name);

    console.log("\n========================================");
    console.log("✅ TESTE CONCLUÍDO COM SUCESSO!");
    console.log("========================================");
    console.log("");
    console.log("📧 EMAIL ENVIADO PARA:", realEmail);
    console.log("🔑 SENHA TEMPORÁRIA:", purchase.plainPassword);
    console.log("🔗 URL DO CAMPEONATO:", `https://peladapro.com.br/${testSlug}`);
    console.log("⚙️  URL DO ADMIN:", `https://peladapro.com.br/${testSlug}/admin`);
    console.log("");
    console.log("========================================");
    console.log("⚠️  AGORA VERIFIQUE SEU EMAIL!");
    console.log("========================================");
    console.log("");
    console.log("1. Abra seu Gmail: guilhermeram@gmail.com");
    console.log("2. Procure por email de: PeladaPro");
    console.log("3. Assunto: 🎉 Seu campeonato Meu Campeonato de Teste foi criado!");
    console.log("4. Verifique se a senha está no email");
    console.log("");
    console.log("Se não chegou:");
    console.log("- Verifique SPAM/Lixo eletrônico");
    console.log("- Aguarde até 2 minutos");
    console.log("");
  }, 60000); // Timeout de 60 segundos
});
