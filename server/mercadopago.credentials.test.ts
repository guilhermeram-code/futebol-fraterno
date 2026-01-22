/**
 * Teste de validação das credenciais do Mercado Pago
 * 
 * Este teste verifica se as credenciais de produção estão configuradas corretamente
 * e se a API do Mercado Pago está acessível.
 */

import { describe, it, expect } from "vitest";
import { MercadoPagoConfig, Payment } from "mercadopago";

describe("Mercado Pago Credentials Validation", () => {
  it("should have valid production credentials configured", async () => {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;

    // Verificar se as credenciais estão configuradas
    expect(accessToken).toBeDefined();
    expect(publicKey).toBeDefined();
    expect(accessToken).not.toBe("");
    expect(publicKey).not.toBe("");

    // Verificar se não são credenciais de teste
    expect(accessToken).not.toContain("TEST-");
    expect(publicKey).not.toContain("TEST-");

    // Verificar formato correto (deve começar com APP_USR-)
    expect(accessToken).toMatch(/^APP_USR-/);
    expect(publicKey).toMatch(/^APP_USR-/);

    console.log("✅ Credenciais configuradas corretamente");
    console.log(`   Public Key: ${publicKey.substring(0, 20)}...`);
    console.log(`   Access Token: ${accessToken.substring(0, 20)}...`);
  });

  it("should be able to connect to Mercado Pago API", async () => {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
    }

    // Inicializar cliente do Mercado Pago
    const client = new MercadoPagoConfig({ 
      accessToken,
      options: { timeout: 5000 }
    });

    const payment = new Payment(client);

    // Tentar buscar um pagamento inexistente (apenas para testar conexão)
    // Se as credenciais estiverem corretas, a API vai responder com 404
    // Se as credenciais estiverem incorretas, vai dar erro de autenticação
    try {
      await payment.get({ id: "999999999999" });
      // Se chegou aqui, as credenciais estão corretas (mesmo que o pagamento não exista)
      console.log("✅ Conexão com API do Mercado Pago estabelecida com sucesso");
    } catch (error: any) {
      // Erro 404 significa que as credenciais estão corretas
      if (error.status === 404 || error.message?.includes("not found")) {
        console.log("✅ Conexão com API do Mercado Pago estabelecida com sucesso");
        console.log("   (Erro 404 esperado - credenciais válidas)");
        return; // Teste passou
      }

      // Erro 401 significa credenciais inválidas
      if (error.status === 401 || error.message?.includes("Unauthorized")) {
        throw new Error("❌ CREDENCIAIS INVÁLIDAS: Verifique se você copiou corretamente o Access Token de PRODUÇÃO");
      }

      // Qualquer outro erro
      throw new Error(`❌ Erro ao conectar com Mercado Pago: ${error.message}`);
    }
  }, 10000); // Timeout de 10 segundos
});
