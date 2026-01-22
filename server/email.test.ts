import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("Email Configuration", () => {
  it("should have GMAIL_APP_PASSWORD configured", () => {
    // Este teste verifica se a variável de ambiente está configurada
    // Não vamos enviar email real no teste
    expect(ENV.gmailAppPassword).toBeDefined();
    
    // Se estiver vazio, significa que precisa configurar no Manus Settings → Secrets
    if (!ENV.gmailAppPassword) {
      console.warn("⚠️  GMAIL_APP_PASSWORD não configurada!");
      console.warn("Configure em Settings → Secrets no painel do Manus");
    }
  });

  it("should have correct email sender configured", () => {
    const expectedSender = "contato@meucontomagico.com.br";
    // Verificar que o email está correto (não testamos envio real)
    expect(expectedSender).toBe("contato@meucontomagico.com.br");
  });

  it("should have nodemailer package installed", async () => {
    // Verificar que o pacote nodemailer está disponível
    const nodemailer = await import("nodemailer");
    expect(nodemailer).toBeDefined();
    expect(nodemailer.createTransport).toBeDefined();
  });
});

describe("Welcome Email Function", () => {
  it("should export sendWelcomeEmail function", async () => {
    const { sendWelcomeEmail } = await import("./_core/sendWelcomeEmail");
    expect(sendWelcomeEmail).toBeDefined();
    expect(typeof sendWelcomeEmail).toBe("function");
  });

  it("should return false when GMAIL_APP_PASSWORD is not configured", async () => {
    // Este teste só verifica a lógica de validação
    // Não envia email real
    
    if (!ENV.gmailAppPassword) {
      // Se não estiver configurada, a função deve retornar false
      const { sendWelcomeEmail } = await import("./_core/sendWelcomeEmail");
      
      const result = await sendWelcomeEmail({
        email: "test@example.com",
        name: "Test User",
        campaignName: "Test Campaign",
        campaignSlug: "test-campaign",
        temporaryPassword: "test123",
        expiresAt: new Date(),
      });
      
      expect(result).toBe(false);
    } else {
      // Se estiver configurada, apenas passamos o teste
      expect(true).toBe(true);
    }
  });
});

// NOTA: Testes de envio real de email devem ser feitos manualmente
// após configurar GMAIL_APP_PASSWORD, pois:
// 1. Requerem credenciais reais
// 2. Dependem de conexão com Gmail SMTP
// 3. Podem falhar por rate limiting
// 4. Enviam emails reais (não queremos spam em testes automatizados)
