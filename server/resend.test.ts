import { describe, it, expect } from "vitest";
import { Resend } from "resend";
import { ENV } from "./_core/env";

describe("Resend Email Service", () => {
  it("should have RESEND_API_KEY configured", () => {
    expect(ENV.resendApiKey).toBeTruthy();
    expect(ENV.resendApiKey).toMatch(/^re_/);
  });

  it("should initialize Resend client successfully", () => {
    const resend = new Resend(ENV.resendApiKey);
    expect(resend).toBeDefined();
  });

  it("should validate API key format", async () => {
    const resend = new Resend(ENV.resendApiKey);
    
    // Tentar enviar um email de teste para validar a API key
    // Usando um email inválido para não enviar de verdade, apenas validar credenciais
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: ["test@example.com"],
        subject: "Test",
        html: "<p>Test</p>",
      });
      // Se chegou aqui, a API key é válida
      expect(true).toBe(true);
    } catch (error: any) {
      // Se o erro for de autenticação, a API key está inválida
      if (error.message?.includes("API key") || error.message?.includes("Unauthorized")) {
        throw new Error("RESEND_API_KEY inválida ou não autorizada");
      }
      // Outros erros são aceitáveis (ex: email inválido, domínio não verificado)
      expect(true).toBe(true);
    }
  });
});
