// SOLUÇÃO 2: Adicionar função verifyPasswordBcrypt no password.ts
// Arquivo: server/_core/password.ts

import crypto from "crypto";
import bcrypt from "bcrypt"; // ADICIONADO

/**
 * Gera uma senha temporária aleatória
 * @param length Tamanho da senha (padrão: 8 caracteres)
 * @returns Senha aleatória com letras maiúsculas, minúsculas e números
 */
export function generateTemporaryPassword(length: number = 8): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

/**
 * Hash de senha usando SHA-256
 * @deprecated Use bcrypt para novas implementações
 * @param password Senha em texto plano
 * @returns Hash SHA-256 da senha
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Verifica se uma senha corresponde ao hash SHA-256
 * @deprecated Use verifyPasswordBcrypt para novas implementações
 * @param password Senha em texto plano
 * @param hash Hash armazenado
 * @returns true se a senha corresponde ao hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// ========== NOVAS FUNÇÕES BCRYPT ==========

/**
 * Verifica se uma senha corresponde ao hash bcrypt
 * @param password Senha em texto plano
 * @param hash Hash bcrypt armazenado
 * @returns Promise<boolean> true se a senha corresponde ao hash
 */
export async function verifyPasswordBcrypt(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("[Password] Erro ao verificar senha bcrypt:", error);
    return false;
  }
}

/**
 * Gera hash bcrypt de uma senha
 * @param password Senha em texto plano
 * @param rounds Número de rounds (padrão: 10)
 * @returns Promise<string> Hash bcrypt da senha
 */
export async function hashPasswordBcrypt(password: string, rounds: number = 10): Promise<string> {
  return await bcrypt.hash(password, rounds);
}
