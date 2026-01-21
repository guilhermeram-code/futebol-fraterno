import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

// Tabela de usuários (autenticação)
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela de times
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  lodge: varchar("lodge", { length: 255 }), // Nome da loja maçônica
  logoUrl: text("logoUrl"),
  groupId: int("groupId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

// Tabela de grupos
export const groups = mysqlTable("groups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(), // Ex: "Grupo A", "Grupo B"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Group = typeof groups.$inferSelect;
export type InsertGroup = typeof groups.$inferInsert;

// Tabela de jogadores
export const players = mysqlTable("players", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  number: int("number"),
  position: varchar("position", { length: 50 }), // Goleiro, Defensor, Meio, Atacante
  teamId: int("teamId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

// Tabela de jogos/partidas
export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  homeTeamId: int("homeTeamId").notNull(),
  awayTeamId: int("awayTeamId").notNull(),
  homeScore: int("homeScore"),
  awayScore: int("awayScore"),
  phase: mysqlEnum("phase", ["groups", "round16", "quarters", "semis", "final"]).default("groups").notNull(),
  groupId: int("groupId"), // Apenas para fase de grupos
  round: int("round"), // Rodada (1, 2, 3, etc.)
  bracketSide: mysqlEnum("bracketSide", ["left", "right"]), // Lado da chave no mata-mata
  matchDate: timestamp("matchDate"),
  location: varchar("location", { length: 255 }),
  played: boolean("played").default(false).notNull(),
  penalties: boolean("penalties").default(false), // Se foi para pênaltis
  homePenalties: int("homePenalties"), // Placar nos pênaltis
  awayPenalties: int("awayPenalties"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

// Tabela de gols
export const goals = mysqlTable("goals", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  playerId: int("playerId").notNull(),
  teamId: int("teamId").notNull(),
  minute: int("minute"), // Minuto do gol (opcional)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;

// Tabela de cartões
export const cards = mysqlTable("cards", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  playerId: int("playerId").notNull(),
  teamId: int("teamId").notNull(),
  cardType: mysqlEnum("cardType", ["yellow", "red"]).notNull(),
  minute: int("minute"), // Minuto do cartão (opcional)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Card = typeof cards.$inferSelect;
export type InsertCard = typeof cards.$inferInsert;

// Tabela de comentários
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorLodge: varchar("authorLodge", { length: 255 }), // Loja do autor
  content: text("content").notNull(),
  matchId: int("matchId"), // Comentário sobre um jogo específico (opcional)
  teamId: int("teamId"), // Comentário sobre um time específico (opcional)
  approved: boolean("approved").default(false).notNull(), // Aprovado para exibição
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

// Tabela de fotos da galeria
export const photos = mysqlTable("photos", {
  id: int("id").autoincrement().primaryKey(),
  url: text("url").notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  caption: text("caption"),
  matchId: int("matchId"), // Foto de um jogo específico (opcional)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;

// Tabela de configurações do torneio
export const tournamentSettings = mysqlTable("tournament_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TournamentSetting = typeof tournamentSettings.$inferSelect;
export type InsertTournamentSetting = typeof tournamentSettings.$inferInsert;

// Tabela de avisos importantes
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

// Tabela de emails admin adicionais
export const adminEmails = mysqlTable("admin_emails", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminEmail = typeof adminEmails.$inferSelect;
export type InsertAdminEmail = typeof adminEmails.$inferInsert;

// Tabela de usuários admin (login simplificado)
export const adminUsers = mysqlTable("admin_users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(), // Login (pode ser email ou username)
  password: varchar("password", { length: 255 }).notNull(), // Hash da senha
  name: varchar("name", { length: 255 }),
  isOwner: boolean("isOwner").default(false).notNull(), // Se é o dono (pode cadastrar outros admins)
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastLogin: timestamp("lastLogin"),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;


// Tabela de patrocinadores
export const sponsors = mysqlTable("sponsors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  tier: mysqlEnum("tier", ["A", "B", "C"]).default("C").notNull(), // A = Principal, B = Patrocinador, C = Apoiador
  logoUrl: text("logoUrl"),
  fileKey: varchar("fileKey", { length: 255 }),
  link: varchar("link", { length: 500 }), // Link do patrocinador
  description: text("description"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sponsor = typeof sponsors.$inferSelect;
export type InsertSponsor = typeof sponsors.$inferInsert;
