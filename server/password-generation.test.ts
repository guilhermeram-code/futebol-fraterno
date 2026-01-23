import { describe, it, expect } from "vitest";
import { generateTemporaryPassword, hashPassword, verifyPassword } from "./_core/password";

describe("Geração de Senha Temporária", () => {
  it("deve gerar senha com 8 caracteres", () => {
    const password = generateTemporaryPassword(8);
    
    console.log("[Teste] Senha gerada:", password);
    console.log("[Teste] Tamanho:", password.length);
    
    expect(password).toBeDefined();
    expect(password.length).toBe(8);
    expect(password).toMatch(/^[A-Za-z0-9]+$/); // Apenas letras e números
  });

  it("deve gerar senhas diferentes a cada chamada", () => {
    const password1 = generateTemporaryPassword(8);
    const password2 = generateTemporaryPassword(8);
    
    console.log("[Teste] Senha 1:", password1);
    console.log("[Teste] Senha 2:", password2);
    
    expect(password1).not.toBe(password2);
  });

  it("deve fazer hash da senha corretamente", () => {
    const password = "TesteSenha123";
    const hash = hashPassword(password);
    
    console.log("[Teste] Senha original:", password);
    console.log("[Teste] Hash SHA-256:", hash);
    console.log("[Teste] Tamanho do hash:", hash.length);
    
    expect(hash).toBeDefined();
    expect(hash.length).toBe(64); // SHA-256 = 64 caracteres hex
    expect(verifyPassword(password, hash)).toBe(true);
  });

  it("deve retornar senha em TEXTO PLANO (não hash)", () => {
    const password = generateTemporaryPassword(8);
    
    console.log("[Teste] Senha gerada:", password);
    console.log("[Teste] É texto plano?", password.length === 8 ? "✅ SIM" : "❌ NÃO");
    console.log("[Teste] Contém apenas letras/números?", /^[A-Za-z0-9]+$/.test(password) ? "✅ SIM" : "❌ NÃO");
    
    // Senha em texto plano deve ter 8 caracteres e não 64 (hash)
    expect(password.length).toBe(8);
    expect(password).not.toMatch(/^[a-f0-9]{64}$/); // Não é hash
  });
});
