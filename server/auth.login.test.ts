import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/trpc";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./_core/password";

describe("Auth - Login com Email/Senha", () => {
  let testUserId: number;
  const testEmail = "test-login@example.com";
  const testPassword = "senha123";

  beforeAll(async () => {
    // Criar usuário de teste
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const passwordHash = hashPassword(testPassword);
    const [user] = await db
      .insert(users)
      .values({
        openId: `test-${Date.now()}`,
        email: testEmail,
        name: "Test User",
        passwordHash,
      })
      .$returningId();

    testUserId = user.id;
  });

  it("deve fazer login com credenciais corretas", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: null,
    } as TrpcContext);

    const result = await caller.auth.loginWithPassword({
      email: testEmail,
      password: testPassword,
    });

    expect(result.success).toBe(true);
    expect(result.user.email).toBe(testEmail);
    expect(result.user.name).toBe("Test User");
  });

  it("deve rejeitar login com senha incorreta", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: null,
    } as TrpcContext);

    await expect(
      caller.auth.loginWithPassword({
        email: testEmail,
        password: "senhaerrada",
      })
    ).rejects.toThrow("Email ou senha inválidos");
  });

  it("deve rejeitar login com email inexistente", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: null,
    } as TrpcContext);

    await expect(
      caller.auth.loginWithPassword({
        email: "naoexiste@example.com",
        password: testPassword,
      })
    ).rejects.toThrow("Email ou senha inválidos");
  });
});
