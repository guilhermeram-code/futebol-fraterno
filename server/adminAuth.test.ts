import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb, createAdminUser, getAdminUserByUsername, verifyAdminPassword, getAllAdminUsers, deleteAdminUser } from "./db";
import { adminUsers } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Admin Authentication System - Database Functions", () => {
  let testAdminId: number;

  beforeAll(async () => {
    // Limpar admins de teste anteriores
    const db = await getDb();
    if (db) {
      await db.delete(adminUsers).where(eq(adminUsers.username, "test-admin-db"));
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
    const result = await createAdminUser({
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
    const result = await getAdminUserByUsername("test-admin-db");

    expect(result).toBeDefined();
    expect(result?.username).toBe("test-admin-db");
    expect(result?.name).toBe("Admin Teste");
  });

  it("deve verificar senha correta com bcrypt", async () => {
    const result = await verifyAdminPassword("test-admin-db", "senha123");

    expect(result).toBeDefined();
    expect(result?.username).toBe("test-admin-db");
  });

  it("deve rejeitar senha incorreta", async () => {
    const result = await verifyAdminPassword("test-admin-db", "senha-errada");

    expect(result).toBeNull();
  });

  it("deve rejeitar username inexistente", async () => {
    const result = await verifyAdminPassword("usuario-inexistente", "senha123");

    expect(result).toBeNull();
  });

  it("deve listar todos os admins", async () => {
    const result = await getAllAdminUsers();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    const testAdmin = result.find(a => a.username === "test-admin-db");
    expect(testAdmin).toBeDefined();
  });

  it("deve deletar admin", async () => {
    if (testAdminId) {
      const result = await deleteAdminUser(testAdminId);
      expect(result).toBe(true);
      
      // Verificar que foi deletado
      const admin = await getAdminUserByUsername("test-admin-db");
      expect(admin).toBeNull();
    }
  });

  it("deve verificar que admin owner principal existe (guilhermeram@gmail.com)", async () => {
    const ownerAdmin = await getAdminUserByUsername("guilhermeram@gmail.com");

    expect(ownerAdmin).toBeDefined();
    expect(ownerAdmin?.isOwner).toBe(true);
    expect(ownerAdmin?.active).toBe(true);
  });

  it("deve fazer login com admin owner principal", async () => {
    const result = await verifyAdminPassword("guilhermeram@gmail.com", "1754gr");

    expect(result).toBeDefined();
    expect(result?.username).toBe("guilhermeram@gmail.com");
    expect(result?.isOwner).toBe(true);
  });
});
