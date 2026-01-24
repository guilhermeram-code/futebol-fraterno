// SOLUÇÃO 1: Corrigir createOrganizerUser.ts para usar BCRYPT
// Arquivo: server/_core/createOrganizerUser.ts

import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { generateTemporaryPassword } from "./password"; // REMOVIDO: hashPassword
import { nanoid } from "nanoid";
import bcrypt from "bcrypt"; // ADICIONADO

interface CreateOrganizerUserInput {
  email: string;
  name: string;
}

interface CreateOrganizerUserResult {
  userId: number;
  email: string;
  temporaryPassword: string;
}

/**
 * Cria uma conta de usuário para o organizador do campeonato
 * @param input Dados do organizador
 * @returns ID do usuário criado e senha temporária
 */
export async function createOrganizerUser(
  input: CreateOrganizerUserInput
): Promise<CreateOrganizerUserResult> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Verificar se usuário já existe
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existingUser) {
    throw new Error(`Usuário com email ${input.email} já existe`);
  }

  // Gerar senha temporária
  const temporaryPassword = generateTemporaryPassword(8);
  
  // ALTERAÇÃO CRÍTICA: Usar bcrypt ao invés de SHA-256
  const passwordHash = await bcrypt.hash(temporaryPassword, 10);

  // Criar openId único (usado pelo sistema de autenticação Manus)
  const openId = `organizer_${nanoid(16)}`;

  // Criar usuário
  const [newUser] = await db
    .insert(users)
    .values({
      openId,
      name: input.name,
      email: input.email,
      passwordHash,
      loginMethod: "password",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    })
    .$returningId();

  console.log(`[CreateUser] Usuário criado: ${input.email} (ID: ${newUser.id})`);
  console.log(`[CreateUser] Hash bcrypt gerado (primeiros 20 chars): ${passwordHash.substring(0, 20)}...`);

  return {
    userId: newUser.id,
    email: input.email,
    temporaryPassword,
  };
}
