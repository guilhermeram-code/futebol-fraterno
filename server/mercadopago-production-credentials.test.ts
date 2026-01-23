import { describe, it, expect } from "vitest";
import { MercadoPagoConfig, Payment } from "mercadopago";

describe("Mercado Pago - Validar Credenciais de PRODUÇÃO", () => {
  it("deve validar que credenciais de PRODUÇÃO estão configuradas", () => {
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    console.log("✅ Public Key:", publicKey?.substring(0, 20) + "...");
    console.log("✅ Access Token:", accessToken?.substring(0, 20) + "...");

    expect(publicKey).toBeDefined();
    expect(accessToken).toBeDefined();
    expect(publicKey).toContain("APP_USR-");
    expect(accessToken).toContain("APP_USR-");
    expect(publicKey).not.toContain("TEST-");
    expect(accessToken).not.toContain("TEST-");
  });

  it("deve conectar com API do Mercado Pago usando credenciais de PRODUÇÃO", async () => {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    expect(accessToken).toBeDefined();

    const client = new MercadoPagoConfig({
      accessToken: accessToken!,
      options: { timeout: 5000 },
    });

    const payment = new Payment(client);

    // Tentar buscar um pagamento inexistente (esperamos erro 404, mas isso confirma que a API está acessível)
    try {
      await payment.get({ id: "999999999" });
    } catch (error: any) {
      // Erro 404 é esperado e significa que as credenciais estão válidas
      expect(error.status).toBe(404);
      console.log("✅ Conexão com API do Mercado Pago estabelecida (credenciais de PRODUÇÃO válidas)");
    }
  });
});
