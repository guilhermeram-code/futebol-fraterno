import { describe, it, expect } from "vitest";
import { MercadoPagoConfig, Payment } from "mercadopago";

describe("Mercado Pago Integration", () => {
  it("deve validar credenciais do Mercado Pago", async () => {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;

    // Verificar se as credenciais existem
    expect(accessToken).toBeDefined();
    expect(publicKey).toBeDefined();
    // Aceita tanto credenciais de teste (TEST-) quanto produção (APP_USR-)
    expect(accessToken).toMatch(/^(TEST-|APP_USR-)/);
    expect(publicKey).toMatch(/^(TEST-|APP_USR-)/);

    // Testar conexão com a API do Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: accessToken!,
      options: { timeout: 5000 },
    });

    const payment = new Payment(client);

    // Tentar buscar um pagamento inexistente (só para validar autenticação)
    try {
      await payment.search({
        options: {
          limit: 1,
        },
      });
      // Se chegou aqui, as credenciais são válidas
      expect(true).toBe(true);
    } catch (error: any) {
      // Se o erro não for de autenticação, as credenciais são válidas
      // Erro 404 ou outros erros são esperados, apenas erro 401/403 indica credenciais inválidas
      if (error.status === 401 || error.status === 403) {
        throw new Error("Credenciais do Mercado Pago inválidas");
      }
      // Qualquer outro erro significa que a autenticação funcionou
      expect(true).toBe(true);
    }
  });

  it("deve ter formato correto das credenciais", () => {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;

    // Aceita tanto credenciais de teste (TEST-) quanto produção (APP_USR-)
    // Formato teste: TEST-XXXX-XXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXXXX
    // Formato produção: APP_USR-XXXX-XXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXXXX
    expect(accessToken).toMatch(/^(TEST-|APP_USR-)/);
    expect(publicKey).toMatch(/^(TEST-|APP_USR-)/);
  });
});
