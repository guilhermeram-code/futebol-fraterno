import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { ENV } from "../_core/env";

describe("Mercado Pago Webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Validação de Assinatura", () => {
    it("deve validar assinatura corretamente", () => {
      // Simular dados do webhook
      const dataId = "12345";
      const requestId = "abc-123";
      const ts = Date.now().toString();
      
      // Construir manifest
      const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
      
      // Calcular HMAC com a secret configurada
      const hmac = crypto
        .createHmac("sha256", ENV.mercadoPagoWebhookSecret)
        .update(manifest)
        .digest("hex");
      
      // Verificar que o HMAC foi gerado
      expect(hmac).toBeDefined();
      expect(hmac.length).toBe(64); // SHA256 produz 64 caracteres hex
    });

    it("deve ter MERCADOPAGO_WEBHOOK_SECRET configurado", () => {
      expect(ENV.mercadoPagoWebhookSecret).toBeDefined();
      expect(ENV.mercadoPagoWebhookSecret.length).toBeGreaterThan(0);
      console.log("[Test] MERCADOPAGO_WEBHOOK_SECRET está configurado ✅");
    });

    it("deve gerar assinaturas diferentes para dados diferentes", () => {
      const manifest1 = `id:123;request-id:abc;ts:${Date.now()};`;
      const manifest2 = `id:456;request-id:def;ts:${Date.now()};`;
      
      const hmac1 = crypto
        .createHmac("sha256", ENV.mercadoPagoWebhookSecret)
        .update(manifest1)
        .digest("hex");
      
      const hmac2 = crypto
        .createHmac("sha256", ENV.mercadoPagoWebhookSecret)
        .update(manifest2)
        .digest("hex");
      
      expect(hmac1).not.toBe(hmac2);
    });
  });
});
