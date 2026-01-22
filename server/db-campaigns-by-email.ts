import { getDb } from "./db";
import { campaigns } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Busca todos os campeonatos de um organizador pelo email
 */
export async function getCampaignsByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  return db
    .select()
    .from(campaigns)
    .where(eq(campaigns.organizerEmail, email));
}
