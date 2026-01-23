import { describe, it, expect } from "vitest";
import { sendWelcomeEmail } from "./_core/sendWelcomeEmail";

describe("Gmail SMTP - Teste de Envio de Email", () => {
  it("deve ter GMAIL_APP_PASSWORD configurada", () => {
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    
    console.log("[Teste] GMAIL_APP_PASSWORD configurada?", gmailPassword ? "✅ SIM" : "❌ NÃO");
    
    expect(gmailPassword).toBeDefined();
    expect(gmailPassword).not.toBe("");
  });

  it("deve enviar email de teste via Gmail SMTP", async () => {
    console.log("\n[Teste] Iniciando envio de email de teste...\n");
    
    const result = await sendWelcomeEmail({
      email: "guilhermeram@gmail.com", // Email do usuário para teste
      name: "Teste Sistema",
      campaignName: "Campeonato Teste Email",
      campaignSlug: "teste-email-sistema",
      temporaryPassword: "SenhaTeste123",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    });

    console.log("\n[Teste] Resultado do envio:", result ? "✅ SUCESSO" : "❌ FALHOU");
    
    expect(result).toBe(true);
  }, 30000); // Timeout de 30 segundos
});
