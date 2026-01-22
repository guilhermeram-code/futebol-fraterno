import crypto from "crypto";

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
 * @param password Senha em texto plano
 * @returns Hash SHA-256 da senha
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Verifica se uma senha corresponde ao hash
 * @param password Senha em texto plano
 * @param hash Hash armazenado
 * @returns true se a senha corresponde ao hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
