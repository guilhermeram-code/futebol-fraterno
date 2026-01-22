import { eq, sql, desc, asc, and, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  teams, InsertTeam, Team,
  groups, InsertGroup, Group,
  players, InsertPlayer, Player,
  matches, InsertMatch, Match,
  goals, InsertGoal, Goal,
  cards, InsertCard, Card,
  comments, InsertComment, Comment,
  photos, InsertPhoto, Photo,
  tournamentSettings, InsertTournamentSetting,
  announcements, InsertAnnouncement, Announcement,
  adminEmails, InsertAdminEmail, AdminEmail,
  adminUsers, InsertAdminUser, AdminUser,
  sponsors, InsertSponsor, Sponsor,
  supportMessages, InsertSupportMessage, SupportMessage,
  campaigns, InsertCampaign, Campaign,
  purchases, InsertPurchase, Purchase,
  reservedSlugs, InsertReservedSlug, ReservedSlug,
  coupons, InsertCoupon, Coupon
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== CAMPAIGNS (MULTI-TENANT) ====================
export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  const db = await getDb();
  if (!db) return null;
  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.slug, slug));
  return campaign || null;
}

export async function getCampaignById(id: number): Promise<Campaign | null> {
  const db = await getDb();
  if (!db) return null;
  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
  return campaign || null;
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
}

export async function getActiveCampaigns(): Promise<Campaign[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).where(eq(campaigns.isActive, true)).orderBy(desc(campaigns.createdAt));
}

export async function createCampaign(campaign: InsertCampaign): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(campaigns).values(campaign);
  return { id: result[0].insertId };
}

export async function updateCampaign(id: number, data: Partial<InsertCampaign>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(campaigns).set(data).where(eq(campaigns.id, id));
}

// ==================== PURCHASES ====================
export async function createPurchase(purchase: InsertPurchase): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(purchases).values(purchase);
  return { id: result[0].insertId };
}

export async function getPurchaseBySlug(slug: string): Promise<Purchase | null> {
  const db = await getDb();
  if (!db) return null;
  const [purchase] = await db.select().from(purchases).where(eq(purchases.campaignSlug, slug));
  return purchase || null;
}

export async function getPurchaseByStripeSession(sessionId: string): Promise<Purchase | null> {
  const db = await getDb();
  if (!db) return null;
  const [purchase] = await db.select().from(purchases).where(eq(purchases.stripeSessionId, sessionId));
  return purchase || null;
}

export async function updatePurchase(id: number, data: Partial<InsertPurchase>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(purchases).set(data).where(eq(purchases.id, id));
}

export async function getAllPurchases(): Promise<Purchase[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(purchases).orderBy(desc(purchases.createdAt));
}

// ==================== RESERVED SLUGS ====================
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  // Check reserved slugs
  const [reserved] = await db.select().from(reservedSlugs).where(eq(reservedSlugs.slug, slug));
  if (reserved) return false;
  
  // Check existing campaigns
  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.slug, slug));
  if (campaign) return false;
  
  return true;
}

export async function reserveSlug(slug: string, purchaseId?: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(reservedSlugs).values({ 
    slug, 
    purchaseId, 
    reason: purchaseId ? 'purchased' : 'reserved' 
  });
}

// ==================== COUPONS ====================
export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const db = await getDb();
  if (!db) return null;
  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase()));
  return coupon || null;
}

export async function validateCoupon(code: string): Promise<{ valid: boolean; discount: number; message?: string }> {
  const coupon = await getCouponByCode(code);
  if (!coupon) return { valid: false, discount: 0, message: 'Cupom não encontrado' };
  if (!coupon.active) return { valid: false, discount: 0, message: 'Cupom inativo' };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, discount: 0, message: 'Cupom expirado' };
  }
  if (coupon.maxUses && (coupon.usedCount ?? 0) >= coupon.maxUses) {
    return { valid: false, discount: 0, message: 'Cupom esgotado' };
  }
  return { valid: true, discount: coupon.discountPercent };
}

export async function useCoupon(code: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(coupons)
    .set({ usedCount: sql`${coupons.usedCount} + 1` })
    .where(eq(coupons.code, code.toUpperCase()));
}

export async function createCoupon(coupon: InsertCoupon): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(coupons).values({ ...coupon, code: coupon.code.toUpperCase() });
  return { id: result[0].insertId };
}

// ==================== USERS ====================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    } else if (user.email) {
      // Verificar se o email está na lista de admin_emails (campaignId = 1 para compatibilidade)
      const isAdmin = await isAdminEmail(user.email, 1);
      if (isAdmin) {
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== TEAMS ====================
export async function createTeam(campaignId: number, team: Omit<InsertTeam, 'campaignId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(teams).values({ ...team, campaignId });
  return { id: result[0].insertId };
}

export async function updateTeam(id: number, team: Partial<InsertTeam>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(teams).set(team).where(eq(teams.id, id));
}

export async function deleteTeam(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(teams).where(eq(teams.id, id));
}

export async function getTeamById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  return result[0];
}

export async function getAllTeams(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(teams).where(eq(teams.campaignId, campaignId)).orderBy(asc(teams.name));
}

export async function getTeamsByGroup(campaignId: number, groupId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(teams).where(
    and(eq(teams.campaignId, campaignId), eq(teams.groupId, groupId))
  ).orderBy(asc(teams.name));
}

// ==================== GROUPS ====================
export async function createGroup(campaignId: number, group: Omit<InsertGroup, 'campaignId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(groups).values({ ...group, campaignId });
  return { id: result[0].insertId };
}

export async function deleteGroup(campaignId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Remove teams from group first
  await db.update(teams).set({ groupId: null }).where(
    and(eq(teams.campaignId, campaignId), eq(teams.groupId, id))
  );
  await db.delete(groups).where(eq(groups.id, id));
}

export async function getAllGroups(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(groups).where(eq(groups.campaignId, campaignId)).orderBy(asc(groups.name));
}

// ==================== PLAYERS ====================
export async function createPlayer(campaignId: number, player: Omit<InsertPlayer, 'campaignId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(players).values({ ...player, campaignId });
  return { id: result[0].insertId };
}

export async function updatePlayer(id: number, player: Partial<InsertPlayer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(players).set(player).where(eq(players.id, id));
}

export async function deletePlayer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(players).where(eq(players.id, id));
}

export async function getPlayersByTeam(campaignId: number, teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(players).where(
    and(eq(players.campaignId, campaignId), eq(players.teamId, teamId))
  ).orderBy(asc(players.number));
}

export async function getAllPlayers(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(players).where(eq(players.campaignId, campaignId)).orderBy(asc(players.name));
}

export async function getPlayerById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(players).where(eq(players.id, id));
  return result[0] || null;
}

// ==================== MATCHES ====================
export async function createMatch(campaignId: number, match: Omit<InsertMatch, 'campaignId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(matches).values({ ...match, campaignId });
  return { id: result[0].insertId };
}

export async function updateMatch(id: number, match: Partial<InsertMatch>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(matches).set(match).where(eq(matches.id, id));
}

export async function deleteMatch(campaignId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete related goals and cards first
  await db.delete(goals).where(and(eq(goals.campaignId, campaignId), eq(goals.matchId, id)));
  await db.delete(cards).where(and(eq(cards.campaignId, campaignId), eq(cards.matchId, id)));
  await db.delete(matches).where(eq(matches.id, id));
}

export async function getMatchById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(matches).where(eq(matches.id, id)).limit(1);
  return result[0];
}

export async function getAllMatches(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(matches).where(eq(matches.campaignId, campaignId)).orderBy(desc(matches.matchDate));
}

export async function getMatchesByPhase(campaignId: number, phase: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(matches).where(
    and(eq(matches.campaignId, campaignId), eq(matches.phase, phase as any))
  ).orderBy(asc(matches.matchDate));
}

export async function getMatchesByGroup(campaignId: number, groupId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(matches).where(
    and(eq(matches.campaignId, campaignId), eq(matches.groupId, groupId))
  ).orderBy(asc(matches.round), asc(matches.matchDate));
}

export async function getMatchesByTeam(campaignId: number, teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(matches).where(
    and(
      eq(matches.campaignId, campaignId),
      sql`${matches.homeTeamId} = ${teamId} OR ${matches.awayTeamId} = ${teamId}`
    )
  ).orderBy(desc(matches.matchDate));
}

export async function getUpcomingMatches(campaignId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(matches)
    .where(and(eq(matches.campaignId, campaignId), eq(matches.played, false)))
    .orderBy(asc(matches.matchDate))
    .limit(limit);
}

export async function getRecentMatches(campaignId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(matches)
    .where(and(eq(matches.campaignId, campaignId), eq(matches.played, true)))
    .orderBy(desc(matches.matchDate))
    .limit(limit);
}

export async function getHeadToHead(campaignId: number, team1Id: number, team2Id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(matches)
    .where(
      and(
        eq(matches.campaignId, campaignId),
        eq(matches.played, true),
        sql`(${matches.homeTeamId} = ${team1Id} AND ${matches.awayTeamId} = ${team2Id}) OR (${matches.homeTeamId} = ${team2Id} AND ${matches.awayTeamId} = ${team1Id})`
      )
    )
    .orderBy(desc(matches.matchDate));
}

// ==================== GOALS ====================
export async function createGoal(campaignId: number, goal: Omit<InsertGoal, 'campaignId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(goals).values({ ...goal, campaignId });
  return { id: result[0].insertId };
}

export async function deleteGoal(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(goals).where(eq(goals.id, id));
}

export async function getGoalsByMatch(campaignId: number, matchId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(goals).where(
    and(eq(goals.campaignId, campaignId), eq(goals.matchId, matchId))
  ).orderBy(asc(goals.minute));
}

export async function getTopScorers(campaignId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({
    playerId: goals.playerId,
    teamId: goals.teamId,
    goalCount: sql<number>`COUNT(*)`.as('goalCount')
  })
    .from(goals)
    .where(eq(goals.campaignId, campaignId))
    .groupBy(goals.playerId, goals.teamId)
    .orderBy(desc(sql`goalCount`))
    .limit(limit);
  return result;
}

export async function getGoalsByPlayer(campaignId: number, playerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(goals).where(
    and(eq(goals.campaignId, campaignId), eq(goals.playerId, playerId))
  );
}

export async function getAllGoals(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(goals).where(eq(goals.campaignId, campaignId));
}

// ==================== CARDS ====================
export async function createCard(campaignId: number, card: Omit<InsertCard, 'campaignId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(cards).values({ ...card, campaignId });
  return { id: result[0].insertId };
}

export async function deleteCard(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cards).where(eq(cards.id, id));
}

export async function getCardsByMatch(campaignId: number, matchId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(cards).where(
    and(eq(cards.campaignId, campaignId), eq(cards.matchId, matchId))
  ).orderBy(asc(cards.minute));
}

export async function getTopCardedPlayers(campaignId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({
    playerId: cards.playerId,
    teamId: cards.teamId,
    yellowCards: sql<number>`SUM(CASE WHEN ${cards.cardType} = 'yellow' THEN 1 ELSE 0 END)`.as('yellowCards'),
    redCards: sql<number>`SUM(CASE WHEN ${cards.cardType} = 'red' THEN 1 ELSE 0 END)`.as('redCards'),
    totalCards: sql<number>`COUNT(*)`.as('totalCards')
  })
    .from(cards)
    .where(eq(cards.campaignId, campaignId))
    .groupBy(cards.playerId, cards.teamId)
    .orderBy(
      desc(sql`SUM(CASE WHEN ${cards.cardType} = 'red' THEN 1 ELSE 0 END)`),
      desc(sql`SUM(CASE WHEN ${cards.cardType} = 'yellow' THEN 1 ELSE 0 END)`)
    )
    .limit(limit);
  return result;
}

export async function getCardsByPlayer(campaignId: number, playerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(cards).where(
    and(eq(cards.campaignId, campaignId), eq(cards.playerId, playerId))
  );
}

// ==================== COMMENTS ====================
export async function createComment(campaignId: number, comment: Omit<InsertComment, 'campaignId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(comments).values({ ...comment, campaignId });
  const insertId = result[0].insertId;
  const created = await db.select().from(comments).where(eq(comments.id, insertId)).limit(1);
  return created[0] || { id: insertId, ...comment };
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(comments).where(eq(comments.id, id));
}

export async function getAllComments(campaignId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(comments).where(eq(comments.campaignId, campaignId)).orderBy(desc(comments.createdAt)).limit(limit);
}

export async function getCommentsByMatch(campaignId: number, matchId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(comments).where(
    and(eq(comments.campaignId, campaignId), eq(comments.matchId, matchId))
  ).orderBy(desc(comments.createdAt));
}

export async function getCommentsByTeam(campaignId: number, teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(comments).where(
    and(eq(comments.campaignId, campaignId), eq(comments.teamId, teamId))
  ).orderBy(desc(comments.createdAt));
}

// ==================== PHOTOS ====================
export async function createPhoto(campaignId: number, photo: Omit<InsertPhoto, 'campaignId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(photos).values({ ...photo, campaignId });
  return { id: result[0].insertId };
}

export async function deletePhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(photos).where(eq(photos.id, id));
}

export async function getAllPhotos(campaignId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(photos).where(eq(photos.campaignId, campaignId)).orderBy(desc(photos.createdAt)).limit(limit);
}

export async function getPhotosByMatch(campaignId: number, matchId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(photos).where(
    and(eq(photos.campaignId, campaignId), eq(photos.matchId, matchId))
  ).orderBy(desc(photos.createdAt));
}

// ==================== TOURNAMENT SETTINGS ====================
export async function getSetting(campaignId: number, key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(tournamentSettings).where(
    and(eq(tournamentSettings.campaignId, campaignId), eq(tournamentSettings.key, key))
  ).limit(1);
  return result[0]?.value ?? "";
}

export async function getAllSettings(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(tournamentSettings).where(eq(tournamentSettings.campaignId, campaignId));
  const settings: Record<string, string> = {};
  result.forEach(row => {
    if (row.key && row.value) {
      settings[row.key] = row.value;
    }
  });
  return settings;
}

export async function setSetting(campaignId: number, key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // First try to update existing
  const existing = await db.select().from(tournamentSettings).where(
    and(eq(tournamentSettings.campaignId, campaignId), eq(tournamentSettings.key, key))
  ).limit(1);
  
  if (existing.length > 0) {
    await db.update(tournamentSettings).set({ value }).where(eq(tournamentSettings.id, existing[0].id));
  } else {
    await db.insert(tournamentSettings).values({ campaignId, key, value });
  }
}

// ==================== STATISTICS ====================
export async function getGroupStandings(campaignId: number, groupId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const teamsInGroup = await getTeamsByGroup(campaignId, groupId);
  const matchesInGroup = await db.select().from(matches)
    .where(and(
      eq(matches.campaignId, campaignId),
      eq(matches.groupId, groupId), 
      eq(matches.played, true)
    ));
  
  const standings = teamsInGroup.map(team => {
    const teamMatches = matchesInGroup.filter(
      m => m.homeTeamId === team.id || m.awayTeamId === team.id
    );
    
    let points = 0, wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
    
    teamMatches.forEach(match => {
      if (match.homeScore === null || match.awayScore === null) return;
      
      const isHome = match.homeTeamId === team.id;
      const teamScore = isHome ? match.homeScore! : match.awayScore!;
      const opponentScore = isHome ? match.awayScore! : match.homeScore!;
      
      goalsFor += teamScore;
      goalsAgainst += opponentScore;
      
      if (teamScore > opponentScore) {
        wins++;
        points += 3;
      } else if (teamScore === opponentScore) {
        draws++;
        points += 1;
      } else {
        losses++;
      }
    });
    
    return {
      team,
      played: teamMatches.length,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      points
    };
  });
  
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
  
  return standings;
}

export async function getTeamStats(campaignId: number, teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const teamMatches = await db.select().from(matches)
    .where(
      and(
        eq(matches.campaignId, campaignId),
        eq(matches.played, true),
        sql`${matches.homeTeamId} = ${teamId} OR ${matches.awayTeamId} = ${teamId}`
      )
    );
  
  let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
  let validMatches = 0;
  
  teamMatches.forEach(match => {
    if (match.homeScore === null || match.awayScore === null) return;
    
    validMatches++;
    const isHome = match.homeTeamId === teamId;
    const teamScore = isHome ? match.homeScore : match.awayScore;
    const opponentScore = isHome ? match.awayScore : match.homeScore;
    
    goalsFor += teamScore;
    goalsAgainst += opponentScore;
    
    if (teamScore > opponentScore) wins++;
    else if (teamScore === opponentScore) draws++;
    else losses++;
  });
  
  return {
    played: validMatches,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: wins * 3 + draws
  };
}

export async function getTeamStatsGroupOnly(campaignId: number, teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const teamMatches = await db.select().from(matches)
    .where(
      and(
        eq(matches.campaignId, campaignId),
        eq(matches.played, true),
        eq(matches.phase, 'groups'),
        sql`${matches.homeTeamId} = ${teamId} OR ${matches.awayTeamId} = ${teamId}`
      )
    );
  
  let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
  let validMatches = 0;
  
  teamMatches.forEach(match => {
    if (match.homeScore === null || match.awayScore === null) return;
    
    validMatches++;
    const isHome = match.homeTeamId === teamId;
    const teamScore = isHome ? match.homeScore : match.awayScore;
    const opponentScore = isHome ? match.awayScore : match.homeScore;
    
    goalsFor += teamScore;
    goalsAgainst += opponentScore;
    
    if (teamScore > opponentScore) wins++;
    else if (teamScore === opponentScore) draws++;
    else losses++;
  });
  
  return {
    played: validMatches,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: wins * 3 + draws
  };
}

export async function getTeamStatsKnockoutOnly(campaignId: number, teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allTeamMatches = await db.select().from(matches)
    .where(
      and(
        eq(matches.campaignId, campaignId),
        eq(matches.played, true),
        sql`${matches.homeTeamId} = ${teamId} OR ${matches.awayTeamId} = ${teamId}`
      )
    );
  
  const teamMatches = allTeamMatches.filter(m => m.phase !== 'groups');
  
  let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
  let validMatches = 0;
  
  teamMatches.forEach(match => {
    if (match.homeScore === null || match.awayScore === null) return;
    
    validMatches++;
    const isHome = match.homeTeamId === teamId;
    const teamScore = isHome ? match.homeScore : match.awayScore;
    const opponentScore = isHome ? match.awayScore : match.homeScore;
    
    goalsFor += teamScore;
    goalsAgainst += opponentScore;
    
    if (teamScore > opponentScore) wins++;
    else if (teamScore === opponentScore) draws++;
    else losses++;
  });
  
  return {
    played: validMatches,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: 0
  };
}

export async function getWorstDefenses(campaignId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allTeams = await getAllTeams(campaignId);
  const teamsWithStats = await Promise.all(
    allTeams.map(async team => {
      const stats = await getTeamStats(campaignId, team.id);
      return { team, ...stats };
    })
  );
  
  return teamsWithStats
    .filter(t => t.played > 0)
    .sort((a, b) => b.goalsAgainst - a.goalsAgainst)
    .slice(0, limit);
}

export async function getBestDefenses(campaignId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allTeams = await getAllTeams(campaignId);
  const teamsWithStats = await Promise.all(
    allTeams.map(async team => {
      const stats = await getTeamStats(campaignId, team.id);
      return { team, ...stats };
    })
  );
  
  return teamsWithStats
    .filter(t => t.played > 0)
    .sort((a, b) => a.goalsAgainst - b.goalsAgainst)
    .slice(0, limit);
}

export async function getRoundStats(campaignId: number, round: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const roundMatches = await db.select().from(matches)
    .where(and(
      eq(matches.campaignId, campaignId),
      eq(matches.round, round), 
      eq(matches.played, true)
    ));
  
  const matchIds = roundMatches.map(m => m.id);
  
  if (matchIds.length === 0) return { topScorer: null, mostCarded: null };
  
  const roundGoals = await db.select({
    playerId: goals.playerId,
    teamId: goals.teamId,
    goalCount: sql<number>`COUNT(*)`.as('goalCount')
  })
    .from(goals)
    .where(and(eq(goals.campaignId, campaignId), inArray(goals.matchId, matchIds)))
    .groupBy(goals.playerId, goals.teamId)
    .orderBy(desc(sql`goalCount`))
    .limit(1);
  
  const roundCards = await db.select({
    playerId: cards.playerId,
    teamId: cards.teamId,
    cardCount: sql<number>`COUNT(*)`.as('cardCount')
  })
    .from(cards)
    .where(and(eq(cards.campaignId, campaignId), inArray(cards.matchId, matchIds)))
    .groupBy(cards.playerId, cards.teamId)
    .orderBy(desc(sql`cardCount`))
    .limit(1);
  
  return {
    topScorer: roundGoals[0] || null,
    mostCarded: roundCards[0] || null
  };
}

// ==================== ANNOUNCEMENTS ====================
export async function createAnnouncement(campaignId: number, announcement: Omit<InsertAnnouncement, 'campaignId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(announcements).values({ ...announcement, campaignId });
  return { id: result[0].insertId };
}

export async function updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(announcements).set(announcement).where(eq(announcements.id, id));
}

export async function deleteAnnouncement(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(announcements).where(eq(announcements.id, id));
}

export async function getAllAnnouncements(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(announcements).where(eq(announcements.campaignId, campaignId)).orderBy(desc(announcements.createdAt));
}

export async function getActiveAnnouncements(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(announcements)
    .where(and(eq(announcements.campaignId, campaignId), eq(announcements.active, true)))
    .orderBy(desc(announcements.createdAt));
}

// ==================== ADMIN EMAILS ====================
export async function addAdminEmail(campaignId: number, email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(adminEmails).values({ campaignId, email });
  return { id: result[0].insertId };
}

export async function removeAdminEmail(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(adminEmails).where(eq(adminEmails.id, id));
}

export async function getAllAdminEmails(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(adminEmails).where(eq(adminEmails.campaignId, campaignId)).orderBy(asc(adminEmails.email));
}

export async function isAdminEmail(email: string, campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(adminEmails).where(
    and(eq(adminEmails.campaignId, campaignId), eq(adminEmails.email, email))
  ).limit(1);
  return result.length > 0;
}

// ==================== COMMENTS (COM APROVAÇÃO) ====================
export async function getApprovedComments(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(comments)
    .where(and(eq(comments.campaignId, campaignId), eq(comments.approved, true)))
    .orderBy(desc(comments.createdAt));
}

export async function getPendingComments(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(comments)
    .where(and(eq(comments.campaignId, campaignId), eq(comments.approved, false)))
    .orderBy(desc(comments.createdAt));
}

export async function approveComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(comments).set({ approved: true }).where(eq(comments.id, id));
}

export async function rejectComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(comments).where(eq(comments.id, id));
}

// ==================== ADMIN USERS ====================
export async function createAdminUser(campaignId: number, data: { username: string; password: string; name?: string; isOwner?: boolean }): Promise<AdminUser | null> {
  const db = await getDb();
  if (!db) return null;

  const bcrypt = await import('bcrypt');
  const hashedPassword = await bcrypt.hash(data.password, 10);

  await db.insert(adminUsers).values({
    campaignId,
    username: data.username,
    password: hashedPassword,
    name: data.name,
    isOwner: data.isOwner || false,
    active: true,
  });

  const [newUser] = await db.select().from(adminUsers).where(
    and(eq(adminUsers.campaignId, campaignId), eq(adminUsers.username, data.username))
  );
  return newUser || null;
}

export async function getAdminUserByUsername(campaignId: number, username: string): Promise<AdminUser | null> {
  const db = await getDb();
  if (!db) return null;

  const [user] = await db.select().from(adminUsers).where(
    and(eq(adminUsers.campaignId, campaignId), eq(adminUsers.username, username))
  );
  return user || null;
}

export async function verifyAdminPassword(campaignId: number, username: string, password: string): Promise<AdminUser | null> {
  const user = await getAdminUserByUsername(campaignId, username);
  if (!user || !user.active) return null;

  const bcrypt = await import('bcrypt');
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  const db = await getDb();
  if (db) {
    await db.update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, user.id));
  }

  return user;
}

export async function getAllAdminUsers(campaignId: number): Promise<AdminUser[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(adminUsers).where(eq(adminUsers.campaignId, campaignId)).orderBy(adminUsers.createdAt);
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.delete(adminUsers).where(eq(adminUsers.id, id));
  return true;
}

// ==================== SPONSORS ====================
export async function createSponsor(campaignId: number, sponsor: Omit<InsertSponsor, 'campaignId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sponsors).values({ ...sponsor, campaignId });
  return { id: result[0].insertId };
}

export async function updateSponsor(id: number, sponsor: Partial<InsertSponsor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sponsors).set(sponsor).where(eq(sponsors.id, id));
}

export async function deleteSponsor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(sponsors).where(eq(sponsors.id, id));
}

export async function getAllSponsors(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(sponsors)
    .where(and(eq(sponsors.campaignId, campaignId), eq(sponsors.active, true)))
    .orderBy(asc(sponsors.tier), asc(sponsors.name));
}

export async function getAllSponsorsAdmin(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(sponsors)
    .where(eq(sponsors.campaignId, campaignId))
    .orderBy(asc(sponsors.tier), asc(sponsors.name));
}

export async function getSponsorById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(sponsors).where(eq(sponsors.id, id)).limit(1);
  return result[0];
}

// ==================== SUPPORT MESSAGES ====================
export async function createSupportMessage(campaignId: number, message: Omit<InsertSupportMessage, 'campaignId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(supportMessages).values({ ...message, campaignId });
  return { id: result[0].insertId };
}

export async function getSupportMessagesByTeam(campaignId: number, teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(supportMessages)
    .where(and(
      eq(supportMessages.campaignId, campaignId),
      eq(supportMessages.teamId, teamId),
      eq(supportMessages.approved, true)
    ))
    .orderBy(desc(supportMessages.createdAt));
}

export async function getAllSupportMessages(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(supportMessages)
    .where(eq(supportMessages.campaignId, campaignId))
    .orderBy(desc(supportMessages.createdAt));
}

export async function getPendingSupportMessages(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(supportMessages)
    .where(and(eq(supportMessages.campaignId, campaignId), eq(supportMessages.approved, false)))
    .orderBy(desc(supportMessages.createdAt));
}

export async function approveSupportMessage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(supportMessages).set({ approved: true }).where(eq(supportMessages.id, id));
}

export async function deleteSupportMessage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(supportMessages).where(eq(supportMessages.id, id));
}
