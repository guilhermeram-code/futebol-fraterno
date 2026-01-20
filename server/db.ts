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
  adminUsers, InsertAdminUser, AdminUser
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
      // Verificar se o email está na lista de admin_emails
      const isAdmin = await isAdminEmail(user.email);
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
export async function createTeam(team: InsertTeam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(teams).values(team);
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

export async function getAllTeams() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(teams).orderBy(asc(teams.name));
}

export async function getTeamsByGroup(groupId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(teams).where(eq(teams.groupId, groupId)).orderBy(asc(teams.name));
}

// ==================== GROUPS ====================
export async function createGroup(group: InsertGroup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(groups).values(group);
  return { id: result[0].insertId };
}

export async function deleteGroup(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Remove teams from group first
  await db.update(teams).set({ groupId: null }).where(eq(teams.groupId, id));
  await db.delete(groups).where(eq(groups.id, id));
}

export async function getAllGroups() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(groups).orderBy(asc(groups.name));
}

// ==================== PLAYERS ====================
export async function createPlayer(player: InsertPlayer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(players).values(player);
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

export async function getPlayersByTeam(teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(players).where(eq(players.teamId, teamId)).orderBy(asc(players.number));
}

export async function getAllPlayers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(players).orderBy(asc(players.name));
}

// ==================== MATCHES ====================
export async function createMatch(match: InsertMatch) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(matches).values(match);
  return { id: result[0].insertId };
}

export async function updateMatch(id: number, match: Partial<InsertMatch>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(matches).set(match).where(eq(matches.id, id));
}

export async function deleteMatch(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete related goals and cards first
  await db.delete(goals).where(eq(goals.matchId, id));
  await db.delete(cards).where(eq(cards.matchId, id));
  await db.delete(matches).where(eq(matches.id, id));
}

export async function getMatchById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(matches).where(eq(matches.id, id)).limit(1);
  return result[0];
}

export async function getAllMatches() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(matches).orderBy(desc(matches.matchDate));
}

export async function getMatchesByPhase(phase: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(matches).where(eq(matches.phase, phase as any)).orderBy(asc(matches.matchDate));
}

export async function getMatchesByGroup(groupId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(matches).where(eq(matches.groupId, groupId)).orderBy(asc(matches.round), asc(matches.matchDate));
}

export async function getMatchesByTeam(teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(matches).where(
    sql`${matches.homeTeamId} = ${teamId} OR ${matches.awayTeamId} = ${teamId}`
  ).orderBy(desc(matches.matchDate));
}

export async function getUpcomingMatches(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(matches)
    .where(eq(matches.played, false))
    .orderBy(asc(matches.matchDate))
    .limit(limit);
}

export async function getRecentMatches(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(matches)
    .where(eq(matches.played, true))
    .orderBy(desc(matches.matchDate))
    .limit(limit);
}

export async function getHeadToHead(team1Id: number, team2Id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(matches)
    .where(
      and(
        eq(matches.played, true),
        sql`(${matches.homeTeamId} = ${team1Id} AND ${matches.awayTeamId} = ${team2Id}) OR (${matches.homeTeamId} = ${team2Id} AND ${matches.awayTeamId} = ${team1Id})`
      )
    )
    .orderBy(desc(matches.matchDate));
}

// ==================== GOALS ====================
export async function createGoal(goal: InsertGoal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(goals).values(goal);
  return { id: result[0].insertId };
}

export async function deleteGoal(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(goals).where(eq(goals.id, id));
}

export async function getGoalsByMatch(matchId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(goals).where(eq(goals.matchId, matchId)).orderBy(asc(goals.minute));
}

export async function getTopScorers(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({
    playerId: goals.playerId,
    teamId: goals.teamId,
    goalCount: sql<number>`COUNT(*)`.as('goalCount')
  })
    .from(goals)
    .groupBy(goals.playerId, goals.teamId)
    .orderBy(desc(sql`goalCount`))
    .limit(limit);
  return result;
}

export async function getGoalsByPlayer(playerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(goals).where(eq(goals.playerId, playerId));
}

// ==================== CARDS ====================
export async function createCard(card: InsertCard) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(cards).values(card);
  return { id: result[0].insertId };
}

export async function deleteCard(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cards).where(eq(cards.id, id));
}

export async function getCardsByMatch(matchId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(cards).where(eq(cards.matchId, matchId)).orderBy(asc(cards.minute));
}

export async function getTopCardedPlayers(limit: number = 10) {
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
    .groupBy(cards.playerId, cards.teamId)
    // Ordenar por: 1º vermelhos (desc), 2º amarelos (desc)
    .orderBy(
      desc(sql`SUM(CASE WHEN ${cards.cardType} = 'red' THEN 1 ELSE 0 END)`),
      desc(sql`SUM(CASE WHEN ${cards.cardType} = 'yellow' THEN 1 ELSE 0 END)`)
    )
    .limit(limit);
  return result;
}

export async function getCardsByPlayer(playerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(cards).where(eq(cards.playerId, playerId));
}

// ==================== COMMENTS ====================
export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(comments).values(comment);
  const insertId = result[0].insertId;
  // Return the created comment with all fields
  const created = await db.select().from(comments).where(eq(comments.id, insertId)).limit(1);
  return created[0] || { id: insertId, ...comment };
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(comments).where(eq(comments.id, id));
}

export async function getAllComments(limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(comments).orderBy(desc(comments.createdAt)).limit(limit);
}

export async function getCommentsByMatch(matchId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(comments).where(eq(comments.matchId, matchId)).orderBy(desc(comments.createdAt));
}

export async function getCommentsByTeam(teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(comments).where(eq(comments.teamId, teamId)).orderBy(desc(comments.createdAt));
}

// ==================== PHOTOS ====================
export async function createPhoto(photo: InsertPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(photos).values(photo);
  return { id: result[0].insertId };
}

export async function deletePhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(photos).where(eq(photos.id, id));
}

export async function getAllPhotos(limit: number = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(photos).orderBy(desc(photos.createdAt)).limit(limit);
}

export async function getPhotosByMatch(matchId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(photos).where(eq(photos.matchId, matchId)).orderBy(desc(photos.createdAt));
}

// ==================== TOURNAMENT SETTINGS ====================
export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(tournamentSettings).where(eq(tournamentSettings.key, key)).limit(1);
  return result[0]?.value;
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(tournamentSettings);
  const settings: Record<string, string> = {};
  result.forEach(row => {
    if (row.key && row.value) {
      settings[row.key] = row.value;
    }
  });
  return settings;
}

export async function setSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(tournamentSettings).values({ key, value }).onDuplicateKeyUpdate({ set: { value } });
}

// ==================== STATISTICS ====================
export async function getGroupStandings(groupId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const teamsInGroup = await getTeamsByGroup(groupId);
  const matchesInGroup = await db.select().from(matches)
    .where(and(eq(matches.groupId, groupId), eq(matches.played, true)));
  
  const standings = teamsInGroup.map(team => {
    const teamMatches = matchesInGroup.filter(
      m => m.homeTeamId === team.id || m.awayTeamId === team.id
    );
    
    let points = 0, wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
    
    teamMatches.forEach(match => {
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
  
  // Sort by points, then goal difference, then goals scored
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
  
  return standings;
}

export async function getTeamStats(teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const teamMatches = await db.select().from(matches)
    .where(
      and(
        eq(matches.played, true),
        sql`${matches.homeTeamId} = ${teamId} OR ${matches.awayTeamId} = ${teamId}`
      )
    );
  
  let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
  
  teamMatches.forEach(match => {
    const isHome = match.homeTeamId === teamId;
    const teamScore = isHome ? match.homeScore! : match.awayScore!;
    const opponentScore = isHome ? match.awayScore! : match.homeScore!;
    
    goalsFor += teamScore;
    goalsAgainst += opponentScore;
    
    if (teamScore > opponentScore) wins++;
    else if (teamScore === opponentScore) draws++;
    else losses++;
  });
  
  return {
    played: teamMatches.length,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: wins * 3 + draws
  };
}

export async function getWorstDefenses(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allTeams = await getAllTeams();
  const teamsWithStats = await Promise.all(
    allTeams.map(async team => {
      const stats = await getTeamStats(team.id);
      return { team, ...stats };
    })
  );
  
  // Sort by goals against (descending) - worst defenses first
  return teamsWithStats
    .filter(t => t.played > 0)
    .sort((a, b) => b.goalsAgainst - a.goalsAgainst)
    .slice(0, limit);
}

export async function getBestDefenses(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allTeams = await getAllTeams();
  const teamsWithStats = await Promise.all(
    allTeams.map(async team => {
      const stats = await getTeamStats(team.id);
      return { team, ...stats };
    })
  );
  
  // Sort by goals against (ascending) - best defenses first
  return teamsWithStats
    .filter(t => t.played > 0)
    .sort((a, b) => a.goalsAgainst - b.goalsAgainst)
    .slice(0, limit);
}

export async function getRoundStats(round: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const roundMatches = await db.select().from(matches)
    .where(and(eq(matches.round, round), eq(matches.played, true)));
  
  const matchIds = roundMatches.map(m => m.id);
  
  if (matchIds.length === 0) return { topScorer: null, mostCarded: null };
  
  // Get goals in this round
  const roundGoals = await db.select({
    playerId: goals.playerId,
    teamId: goals.teamId,
    goalCount: sql<number>`COUNT(*)`.as('goalCount')
  })
    .from(goals)
    .where(inArray(goals.matchId, matchIds))
    .groupBy(goals.playerId, goals.teamId)
    .orderBy(desc(sql`goalCount`))
    .limit(1);
  
  // Get cards in this round
  const roundCards = await db.select({
    playerId: cards.playerId,
    teamId: cards.teamId,
    cardCount: sql<number>`COUNT(*)`.as('cardCount')
  })
    .from(cards)
    .where(inArray(cards.matchId, matchIds))
    .groupBy(cards.playerId, cards.teamId)
    .orderBy(desc(sql`cardCount`))
    .limit(1);
  
  return {
    topScorer: roundGoals[0] || null,
    mostCarded: roundCards[0] || null
  };
}

// ==================== ANNOUNCEMENTS ====================
export async function createAnnouncement(announcement: InsertAnnouncement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(announcements).values(announcement);
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

export async function getAllAnnouncements() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(announcements).orderBy(desc(announcements.createdAt));
}

export async function getActiveAnnouncements() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(announcements)
    .where(eq(announcements.active, true))
    .orderBy(desc(announcements.createdAt));
}

// ==================== ADMIN EMAILS ====================
export async function addAdminEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(adminEmails).values({ email });
  return { id: result[0].insertId };
}

export async function removeAdminEmail(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(adminEmails).where(eq(adminEmails.id, id));
}

export async function getAllAdminEmails() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(adminEmails).orderBy(asc(adminEmails.email));
}

export async function isAdminEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(adminEmails).where(eq(adminEmails.email, email)).limit(1);
  return result.length > 0;
}




// ==================== COMMENTS (COM APROVAÇÃO) ====================
export async function getApprovedComments() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(comments)
    .where(eq(comments.approved, true))
    .orderBy(desc(comments.createdAt));
}

export async function getPendingComments() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(comments)
    .where(eq(comments.approved, false))
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
export async function createAdminUser(data: { username: string; password: string; name?: string; isOwner?: boolean }): Promise<AdminUser | null> {
  const db = await getDb();
  if (!db) return null;

  const bcrypt = await import('bcrypt');
  const hashedPassword = await bcrypt.hash(data.password, 10);

  await db.insert(adminUsers).values({
    username: data.username,
    password: hashedPassword,
    name: data.name,
    isOwner: data.isOwner || false,
    active: true,
  });

  // Buscar o usuário recém-criado por username
  const [newUser] = await db.select().from(adminUsers).where(eq(adminUsers.username, data.username));
  return newUser || null;
}

export async function getAdminUserByUsername(username: string): Promise<AdminUser | null> {
  const db = await getDb();
  if (!db) return null;

  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
  return user || null;
}

export async function verifyAdminPassword(username: string, password: string): Promise<AdminUser | null> {
  const user = await getAdminUserByUsername(username);
  if (!user || !user.active) return null;

  const bcrypt = await import('bcrypt');
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  // Atualizar lastLogin
  const db = await getDb();
  if (db) {
    await db.update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, user.id));
  }

  return user;
}

export async function getAllAdminUsers(): Promise<AdminUser[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(adminUsers).orderBy(adminUsers.createdAt);
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.delete(adminUsers).where(eq(adminUsers.id, id));
  return true;
}
