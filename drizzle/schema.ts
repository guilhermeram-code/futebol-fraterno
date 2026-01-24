import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

// ========================================
// TABELAS MULTI-TENANT (PELADA PRO)
// ========================================

// Tabela de campanhas/campeonatos (multi-tenant)
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // Nome do campeonato
  slug: varchar("slug", { length: 100 }).notNull().unique(), // URL personalizada
  organizerName: varchar("organizerName", { length: 255 }), // Nome do organizador
  organizerEmail: varchar("organizerEmail", { length: 320 }).notNull(),
  organizerPhone: varchar("organizerPhone", { length: 20 }),
  logoUrl: text("logoUrl"),
  musicUrl: text("musicUrl"),
  backgroundUrl: text("backgroundUrl"),
  heroBackgroundUrl: text("heroBackgroundUrl"),
  subtitle: varchar("subtitle", { length: 255 }),
  tournamentType: mysqlEnum("tournamentType", ["groups_only", "knockout_only", "groups_and_knockout"]).default("groups_and_knockout"),
  teamsPerGroupAdvancing: int("teamsPerGroupAdvancing").default(2),
  knockoutSize: int("knockoutSize").default(4),
  isActive: boolean("isActive").default(true).notNull(),
  isDemo: boolean("isDemo").default(false).notNull(), // Campeonato demo
  purchaseId: int("purchaseId"), // Referência à compra (null para demo)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

// Tabela de compras/assinaturas
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }),
  campaignName: varchar("campaignName", { length: 255 }).notNull(),
  campaignSlug: varchar("campaignSlug", { length: 100 }).notNull().unique(),
  planType: mysqlEnum("planType", ["2_months", "3_months", "6_months", "1_year"]).notNull(),
  amountPaid: int("amountPaid").notNull(), // em centavos
  currency: varchar("currency", { length: 3 }).default("BRL"),
  couponCode: varchar("couponCode", { length: 50 }),
  discountAmount: int("discountAmount").default(0),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded", "expired"]).default("pending"),
  renewalEmailSent: boolean("renewalEmailSent").default(false),
  plainPassword: varchar("plainPassword", { length: 50 }), // Senha em texto plano para admin
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

// Tabela de slugs reservados
export const reservedSlugs = mysqlTable("reserved_slugs", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  purchaseId: int("purchaseId"),
  reason: mysqlEnum("reason", ["purchased", "reserved", "blocked"]).default("reserved"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReservedSlug = typeof reservedSlugs.$inferSelect;
export type InsertReservedSlug = typeof reservedSlugs.$inferInsert;

// ========================================
// TABELAS EXISTENTES (COM campaignId)
// ========================================

// Tabela de usuários (autenticação)
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 64 }), // SHA-256 hash
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
  campaignId: int("campaignId").notNull(), // Multi-tenant
  name: varchar("name", { length: 255 }).notNull(),
  lodge: varchar("lodge", { length: 255 }), // Nome da loja maçônica
  logoUrl: text("logoUrl"),
  groupId: int("groupId"),
  supportMessage: text("supportMessage"), // Mensagem de apoio ao time
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

// Tabela de grupos
export const groups = mysqlTable("groups", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(), // Multi-tenant
  name: varchar("name", { length: 50 }).notNull(), // Ex: "Grupo A", "Grupo B"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Group = typeof groups.$inferSelect;
export type InsertGroup = typeof groups.$inferInsert;

// Tabela de jogadores
export const players = mysqlTable("players", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(), // Multi-tenant
  name: varchar("name", { length: 255 }).notNull(),
  number: int("number"),
  position: varchar("position", { length: 50 }), // Goleiro, Defensor, Meio, Atacante
  teamId: int("teamId").notNull(),
  photoUrl: text("photoUrl"), // Foto do jogador
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

// Tabela de jogos/partidas
export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(), // Multi-tenant
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
  campaignId: int("campaignId").notNull(), // Multi-tenant
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
  campaignId: int("campaignId").notNull(), // Multi-tenant
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
  campaignId: int("campaignId").notNull(), // Multi-tenant
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
  campaignId: int("campaignId").notNull(), // Multi-tenant
  url: text("url").notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  caption: text("caption"),
  matchId: int("matchId"), // Foto de um jogo específico (opcional)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;

// Tabela de configurações do torneio (DEPRECATED - usar campaigns)
export const tournamentSettings = mysqlTable("tournament_settings", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId"), // Multi-tenant (opcional para retrocompatibilidade)
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TournamentSetting = typeof tournamentSettings.$inferSelect;
export type InsertTournamentSetting = typeof tournamentSettings.$inferInsert;

// Tabela de avisos importantes
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(), // Multi-tenant
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
  campaignId: int("campaignId").notNull(), // Multi-tenant
  email: varchar("email", { length: 320 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminEmail = typeof adminEmails.$inferSelect;
export type InsertAdminEmail = typeof adminEmails.$inferInsert;

// Tabela de usuários admin (login simplificado)
export const adminUsers = mysqlTable("admin_users", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(), // Multi-tenant
  username: varchar("username", { length: 255 }).notNull(), // Login (pode ser email ou username)
  password: varchar("password", { length: 255 }).notNull(), // Hash da senha
  name: varchar("name", { length: 255 }),
  isOwner: boolean("isOwner").default(false).notNull(), // Se é o dono (pode cadastrar outros admins)
  active: boolean("active").default(true).notNull(),
  needsPasswordChange: boolean("needsPasswordChange").default(false).notNull(), // Força troca de senha no próximo login
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastLogin: timestamp("lastLogin"),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;

// Tabela de tokens de recuperação de senha
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;


// Tabela de patrocinadores
export const sponsors = mysqlTable("sponsors", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(), // Multi-tenant
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


// Tabela de mensagens de apoio aos times (torcedores)
export const supportMessages = mysqlTable("support_messages", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(), // Multi-tenant
  teamId: int("teamId").notNull(),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorLodge: varchar("authorLodge", { length: 255 }), // Loja do autor
  message: text("message").notNull(),
  approved: boolean("approved").default(false).notNull(), // Precisa aprovação do admin
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SupportMessage = typeof supportMessages.$inferSelect;
export type InsertSupportMessage = typeof supportMessages.$inferInsert;

// Tabela de cupons de desconto
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountPercent: int("discountPercent").notNull(), // 0-100
  maxUses: int("maxUses"), // null = ilimitado
  usedCount: int("usedCount").default(0),
  active: boolean("active").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;
