import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/trpc";
import { getDb } from "./db";
import { adminUsers, campaigns } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";

describe("Admin - Recuperação de Senha", () => {
  let testAdminId: number;
  let testCampaignId: number;
  const testEmail = `test-forgot-${Date.now()}@example.com`;
  const testCampaignSlug = `test-campaign-${Date.now()}`;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Criar campanha de teste
    const [campaign] = await db
      .insert(campaigns)
      .values({
        name: "Test Campaign",
        slug: testCampaignSlug,
        organizerName: "Test Organizer",
        organizerEmail: "test@example.com",
        organizerPhone: "11999999999",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: "Test Location",
      })
      .$returningId();

    testCampaignId = campaign.id;

    // Criar admin user de teste
    const passwordHash = await bcrypt.hash("senha123", 10);
    const [admin] = await db
      .insert(adminUsers)
      .values({
        campaignId: testCampaignId,
        username: testEmail,
        password: passwordHash,
        name: "Test Admin",
        isOwner: 1,
        active: 1,
        needsPasswordChange: 0,
      })
      .$returningId();

    testAdminId = admin.id;

    console.log("[Teste] Admin user criado:", {
      id: testAdminId,
      email: testEmail,
      campaignId: testCampaignId,
    });
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Limpar dados de teste
    await db.delete(adminUsers).where(eq(adminUsers.id, testAdminId));
    await db.delete(campaigns).where(eq(campaigns.id, testCampaignId));

    console.log("[Teste] Dados de teste removidos");
  });

  it("deve gerar senha temporária com hash bcrypt", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);

    // Solicitar recuperação de senha
    const result = await caller.adminUsers.forgotPassword({
      email: testEmail,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("Senha temporária enviada");

    // Verificar se senha foi atualizada no banco
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const [adminUser] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, testAdminId));

    console.log("[Teste] Hash da senha temporária:", adminUser.password.substring(0, 20) + "...");
    console.log("[Teste] needsPasswordChange:", adminUser.needsPasswordChange);

    // Verificar se hash é bcrypt (começa com $2b$)
    expect(adminUser.password).toMatch(/^\$2b\$/);
    expect(adminUser.needsPasswordChange).toBe(true);
  });

  it("deve aceitar senha temporária no login", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Gerar senha temporária conhecida
    const tempPassword = "TEMP1234@ab";
    const tempPasswordHash = await bcrypt.hash(tempPassword, 10);

    // Atualizar admin user com senha temporária
    await db
      .update(adminUsers)
      .set({
        password: tempPasswordHash,
        needsPasswordChange: 1,
      })
      .where(eq(adminUsers.id, testAdminId));

    console.log("[Teste] Senha temporária definida:", tempPassword);

    // Tentar fazer login com senha temporária
    const caller = appRouter.createCaller({} as TrpcContext);
    const loginResult = await caller.adminUsers.login({
      username: testEmail,
      password: tempPassword,
      campaignId: testCampaignId,
    });

    console.log("[Teste] Login result:", {
      success: loginResult.success,
      hasToken: !!loginResult.token,
      username: loginResult.user?.username,
    });

    expect(loginResult.success).toBe(true);
    expect(loginResult.token).toBeDefined();
    expect(loginResult.user?.username).toBe(testEmail);
  });

  it("não deve revelar se email não existe", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);

    // Solicitar recuperação para email inexistente
    const result = await caller.adminUsers.forgotPassword({
      email: "naoexiste@example.com",
    });

    // Deve retornar sucesso mesmo que email não exista (segurança)
    expect(result.success).toBe(true);
    expect(result.message).toContain("Se o email estiver cadastrado");
  });
});
