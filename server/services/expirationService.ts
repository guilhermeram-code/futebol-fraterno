import { getDb } from "../db";
import { campaigns, purchases } from "../../drizzle/schema";
import { eq, and, lt, gte } from "drizzle-orm";
import { sendExpirationWarningEmail, sendExpiredEmail } from "../emails/emailService";

// Check for campaigns expiring in 7 days and send warning emails
export async function checkExpiringCampaigns() {
  const db = await getDb();
  if (!db) {
    console.error("[Expiration] Database not available");
    return 0;
  }

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const sixDaysFromNow = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);

  console.log("[Expiration] Checking for campaigns expiring in 7 days...");

  // Find campaigns with purchases expiring between 6-7 days from now
  const expiringPurchases = await db
    .select()
    .from(purchases)
    .innerJoin(campaigns, eq(purchases.id, campaigns.purchaseId))
    .where(
      and(
        eq(purchases.status, "completed"),
        gte(purchases.expiresAt, sixDaysFromNow),
        lt(purchases.expiresAt, sevenDaysFromNow),
        eq(campaigns.isActive, true)
      )
    );

  for (const row of expiringPurchases) {
    const purchase = row.purchases;
    const campaign = row.campaigns;
    try {
      await sendExpirationWarningEmail({
        email: purchase.customerEmail,
        campaignName: campaign.name,
        campaignSlug: campaign.slug,
        expiresAt: purchase.expiresAt!,
      });
      console.log(`[Expiration] Warning sent for campaign: ${campaign.slug}`);
    } catch (error) {
      console.error(`[Expiration] Failed to send warning for ${campaign.slug}:`, error);
    }
  }

  return expiringPurchases.length;
}

// Check for expired campaigns and deactivate them
export async function checkExpiredCampaigns() {
  const db = await getDb();
  if (!db) {
    console.error("[Expiration] Database not available");
    return 0;
  }

  const now = new Date();

  console.log("[Expiration] Checking for expired campaigns...");

  // Find active campaigns with expired purchases
  const expiredPurchases = await db
    .select()
    .from(purchases)
    .innerJoin(campaigns, eq(purchases.id, campaigns.purchaseId))
    .where(
      and(
        eq(purchases.status, "completed"),
        lt(purchases.expiresAt, now),
        eq(campaigns.isActive, true)
      )
    );

  for (const row of expiredPurchases) {
    const purchase = row.purchases;
    const campaign = row.campaigns;
    try {
      // Deactivate campaign
      await db
        .update(campaigns)
        .set({ isActive: false })
        .where(eq(campaigns.id, campaign.id));

      // Update purchase status
      await db
        .update(purchases)
        .set({ status: "expired" })
        .where(eq(purchases.id, purchase.id));

      // Send expired email
      await sendExpiredEmail({
        email: purchase.customerEmail,
        campaignName: campaign.name,
        campaignSlug: campaign.slug,
      });

      console.log(`[Expiration] Campaign expired and deactivated: ${campaign.slug}`);
    } catch (error) {
      console.error(`[Expiration] Failed to expire ${campaign.slug}:`, error);
    }
  }

  return expiredPurchases.length;
}

// Run all expiration checks
export async function runExpirationChecks() {
  console.log("[Expiration] Running expiration checks...");
  
  const warningsSent = await checkExpiringCampaigns();
  const expired = await checkExpiredCampaigns();
  
  console.log(`[Expiration] Complete. Warnings: ${warningsSent}, Expired: ${expired}`);
  
  return { warningsSent, expired };
}
