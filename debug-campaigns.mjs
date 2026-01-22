import { drizzle } from "drizzle-orm/mysql2";
import { campaigns, purchases } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

console.log("=== CAMPANHAS ===");
const allCampaigns = await db.select().from(campaigns);
console.log(JSON.stringify(allCampaigns, null, 2));

console.log("\n=== COMPRAS ===");
const allPurchases = await db.select().from(purchases);
console.log(JSON.stringify(allPurchases, null, 2));

console.log("\n=== BUSCAR amigos2026 ===");
const campaign = await db.select().from(campaigns).where(eq(campaigns.slug, "amigos2026"));
console.log(JSON.stringify(campaign, null, 2));

process.exit(0);
