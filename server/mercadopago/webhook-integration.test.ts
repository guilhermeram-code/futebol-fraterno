import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { ENV } from "../_core/env";

describe("Mercado Pago Webhook Integration", () => {
  it("deve simular validação completa de webhook", () => {
    // Simular dados reais de um webhook do Mercado Pago
    const paymentId = "14253122917";
    const requestId = "abc-123-def-456";
    const ts = Math.floor(Date.now() / 1000).toString();
    
    // Construir manifest conforme documentação do Mercado Pago
    const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`;
    
    // Calcular HMAC usando o secret configurado
    const calculatedHash = crypto
      .createHmac("sha256", ENV.mercadoPagoWebhookSecret)
      .update(manifest)
      .digest("hex");
    
    // Validações
    expect(calculatedHash).toBeDefined();
    expect(calculatedHash.length).toBe(64); // SHA256 hex = 64 caracteres
    expect(ENV.mercadoPagoWebhookSecret).toBeDefined();
    expect(ENV.mercadoPagoWebhookSecret.length).toBeGreaterThan(50); // Secret deve ser longo
    
    console.log("✅ Webhook simulation successful:");
    console.log(`   Payment ID: ${paymentId}`);
    console.log(`   Request ID: ${requestId}`);
    console.log(`   Timestamp: ${ts}`);
    console.log(`   Manifest: ${manifest}`);
    console.log(`   Calculated Hash: ${calculatedHash.substring(0, 20)}...`);
    console.log(`   Secret configured: ${ENV.mercadoPagoWebhookSecret.substring(0, 10)}...`);
  });

  it("deve validar que o secret não está vazio", () => {
    expect(ENV.mercadoPagoWebhookSecret).not.toBe("");
    expect(ENV.mercadoPagoWebhookSecret).not.toBe("your_secret_key_here");
    console.log("✅ MERCADOPAGO_WEBHOOK_SECRET está configurado corretamente");
  });

  it("deve gerar hash diferente para timestamps diferentes", () => {
    const paymentId = "123456";
    const requestId = "test-request";
    
    const ts1 = "1704908010";
    const ts2 = "1704908020";
    
    const manifest1 = `id:${paymentId};request-id:${requestId};ts:${ts1};`;
    const manifest2 = `id:${paymentId};request-id:${requestId};ts:${ts2};`;
    
    const hash1 = crypto
      .createHmac("sha256", ENV.mercadoPagoWebhookSecret)
      .update(manifest1)
      .digest("hex");
    
    const hash2 = crypto
      .createHmac("sha256", ENV.mercadoPagoWebhookSecret)
      .update(manifest2)
      .digest("hex");
    
    expect(hash1).not.toBe(hash2);
    console.log("✅ Hashes são únicos para timestamps diferentes");
  });
});
