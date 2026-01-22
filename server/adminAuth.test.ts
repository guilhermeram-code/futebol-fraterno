import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb, createAdminUser, getAdminUserByUsername, verifyAdminPassword, deleteAdminUser } from "./db";
import { adminUsers } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Usar campaignId 1 (futebol-fraterno) para testes
const TEST_CAMPAIGN_ID = 1;

describe("Admin Authentication System - Database Functions", () => {
  let testAdminId: number;

  beforeAll(async () => {
    // Limpar admins de teste anteriores
    const db = await getDb();
    if (db) {
      await db.delete(adminUsers).where(
        and(
          eq(adminUsers.username, "test-admin-db"),
          eq(adminUsers.campaignId, TEST_CAMPAIGN_ID)
        )
      );
    }
  });

  afterAll(async () => {
    // Limpar admins de teste
    const db = await getDb();
    if (db) {
      if (testAdminId) {
        await db.delete(adminUsers).where(eq(adminUsers.id, testAdminId));
      }
    }
  });

  it("deve criar admin com senha criptografada (bcrypt)", async () => {
    // Assinatura: createAdminUser(campaignId, { username, password, name, isOwner })
    const result = await createAdminUser(TEST_CAMPAIGN_ID, {
      username: "test-admin-db",
      password: "senha123",
      name: "Admin Teste",
      isOwner: false,
    });

    expect(result).toBeDefined();
    expect(result?.username).toBe("test-admin-db");
    expect(result?.name).toBe("Admin Teste");
    expect(result?.isOwner).toBe(false);
    expect(result?.active).toBe(true);
    expect(result?.password).not.toBe("senha123"); // Senha deve estar hasheada
    expect(result?.password.length).toBeGreaterThan(20); // bcrypt hash é longo
    
    if (result) {
      testAdminId = result.id;
    }
  });

  it("deve buscar admin por username", async () => {
    const result = await getAdminUserByUsername(TEST_CAMPAIGN_ID, "test-admin-db");

    expect(result).toBeDefined();
    expect(result?.username).toBe("test-admin-db");
    expect(result?.name).toBe("Admin Teste");
  });

  it("deve verificar senha correta com bcrypt", async () => {
    const result = await verifyAdminPassword(TEST_CAMPAIGN_ID, "test-admin-db", "senha123");

    expect(result).toBeDefined();
    expect(result?.username).toBe("test-admin-db");
  });

  it("deve rejeitar senha incorreta", async () => {
    const result = await verifyAdminPassword(TEST_CAMPAIGN_ID, "test-admin-db", "senha-errada");

    expect(result).toBeNull();
  });

  it("deve rejeitar username inexistente", async () => {
    const result = await verifyAdminPassword(TEST_CAMPAIGN_ID, "usuario-inexistente", "senha123");

    expect(result).toBeNull();
  });

  it("deve deletar admin", async () => {
    if (testAdminId) {
      const result = await deleteAdminUser(testAdminId);
      expect(result).toBe(true);
      
      // Verificar que foi deletado
      const admin = await getAdminUserByUsername(TEST_CAMPAIGN_ID, "test-admin-db");
      expect(admin).toBeNull();
    }
  });
});
