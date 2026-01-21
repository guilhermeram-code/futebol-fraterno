import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// Admin procedure - only allows admin users
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado. Apenas administradores.' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== TEAMS ====================
  teams: router({
    list: publicProcedure.query(async () => {
      return db.getAllTeams();
    }),
    
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamById(input.id);
      }),
    
    byGroup: publicProcedure
      .input(z.object({ groupId: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamsByGroup(input.groupId);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        lodge: z.string().optional(),
        logoUrl: z.string().optional(),
        groupId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createTeam(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        lodge: z.string().optional(),
        logoUrl: z.string().optional(),
        groupId: z.number().nullable().optional(),
        supportMessage: z.string().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateTeam(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTeam(input.id);
        return { success: true };
      }),
    
    stats: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamStats(input.id);
      }),
    
    // Estatísticas apenas da fase de grupos
    statsGroupOnly: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamStatsGroupOnly(input.id);
      }),
    
    // Estatísticas apenas do mata-mata
    statsKnockoutOnly: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamStatsKnockoutOnly(input.id);
      }),
    
    uploadLogo: adminProcedure
      .input(z.object({
        teamId: z.number(),
        base64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, 'base64');
        const ext = input.mimeType.split('/')[1] || 'png';
        const fileKey = `teams/${input.teamId}/logo-${nanoid()}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await db.updateTeam(input.teamId, { logoUrl: url });
        return { url };
      }),
  }),

  // ==================== GROUPS ====================
  groups: router({
    list: publicProcedure.query(async () => {
      return db.getAllGroups();
    }),
    
    create: adminProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(async ({ input }) => {
        return db.createGroup(input);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteGroup(input.id);
        return { success: true };
      }),
    
    standings: publicProcedure
      .input(z.object({ groupId: z.number() }))
      .query(async ({ input }) => {
        return db.getGroupStandings(input.groupId);
      }),
  }),

  // ==================== PLAYERS ====================
  players: router({
    list: publicProcedure.query(async () => {
      return db.getAllPlayers();
    }),
    
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getPlayerById(input.id);
      }),
    
    byTeam: publicProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return db.getPlayersByTeam(input.teamId);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        number: z.number().optional(),
        position: z.string().optional(),
        teamId: z.number(),
        photoUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createPlayer(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        number: z.number().optional(),
        position: z.string().optional(),
        teamId: z.number().optional(),
        photoUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updatePlayer(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePlayer(input.id);
        return { success: true };
      }),
    
    goals: publicProcedure
      .input(z.object({ playerId: z.number() }))
      .query(async ({ input }) => {
        return db.getGoalsByPlayer(input.playerId);
      }),
    
    cards: publicProcedure
      .input(z.object({ playerId: z.number() }))
      .query(async ({ input }) => {
        return db.getCardsByPlayer(input.playerId);
      }),
  }),

  // ==================== MATCHES ====================
  matches: router({
    list: publicProcedure.query(async () => {
      return db.getAllMatches();
    }),
    
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getMatchById(input.id);
      }),
    
    byPhase: publicProcedure
      .input(z.object({ phase: z.string() }))
      .query(async ({ input }) => {
        return db.getMatchesByPhase(input.phase);
      }),
    
    byGroup: publicProcedure
      .input(z.object({ groupId: z.number() }))
      .query(async ({ input }) => {
        return db.getMatchesByGroup(input.groupId);
      }),
    
    byTeam: publicProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return db.getMatchesByTeam(input.teamId);
      }),
    
    upcoming: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getUpcomingMatches(input.limit || 10);
      }),
    
    recent: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getRecentMatches(input.limit || 10);
      }),
    
    headToHead: publicProcedure
      .input(z.object({ team1Id: z.number(), team2Id: z.number() }))
      .query(async ({ input }) => {
        return db.getHeadToHead(input.team1Id, input.team2Id);
      }),
    
    create: adminProcedure
      .input(z.object({
        homeTeamId: z.number(),
        awayTeamId: z.number(),
        phase: z.enum(['groups', 'round16', 'quarters', 'semis', 'final']),
        groupId: z.number().optional(),
        round: z.number().optional(),
        matchDate: z.string().optional(),
        location: z.string().optional(),
        bracketSide: z.enum(['left', 'right']).optional(),
      }))
      .mutation(async ({ input }) => {
        const matchData = {
          ...input,
          matchDate: input.matchDate ? new Date(input.matchDate) : undefined,
        };
        return db.createMatch(matchData);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        homeTeamId: z.number().optional(),
        awayTeamId: z.number().optional(),
        homeScore: z.number().optional(),
        awayScore: z.number().optional(),
        phase: z.enum(['groups', 'round16', 'quarters', 'semis', 'final']).optional(),
        groupId: z.number().nullable().optional(),
        round: z.number().optional(),
        matchDate: z.string().optional(),
        location: z.string().optional(),
        played: z.boolean().optional(),
        penalties: z.boolean().optional(),
        homePenalties: z.number().optional(),
        awayPenalties: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, matchDate, ...data } = input;
        const updateData = {
          ...data,
          matchDate: matchDate ? new Date(matchDate) : undefined,
        };
        await db.updateMatch(id, updateData);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteMatch(input.id);
        return { success: true };
      }),
    
    registerResult: adminProcedure
      .input(z.object({
        matchId: z.number(),
        homeScore: z.number(),
        awayScore: z.number(),
        penalties: z.boolean().optional(),
        homePenalties: z.number().optional(),
        awayPenalties: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateMatch(input.matchId, {
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          played: true,
          penalties: input.penalties,
          homePenalties: input.homePenalties,
          awayPenalties: input.awayPenalties,
        });
        return { success: true };
      }),
  }),

  // ==================== GOALS ====================
  goals: router({
    list: publicProcedure
      .query(async () => {
        return db.getAllGoals();
      }),
    
    byMatch: publicProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return db.getGoalsByMatch(input.matchId);
      }),
    
    topScorers: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getTopScorers(input.limit || 10);
      }),
    
    create: adminProcedure
      .input(z.object({
        matchId: z.number(),
        playerId: z.number(),
        teamId: z.number(),
        minute: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createGoal(input);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteGoal(input.id);
        return { success: true };
      }),
  }),

  // ==================== CARDS ====================
  cards: router({
    byMatch: publicProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return db.getCardsByMatch(input.matchId);
      }),
    
    topCarded: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getTopCardedPlayers(input.limit || 10);
      }),
    
    create: adminProcedure
      .input(z.object({
        matchId: z.number(),
        playerId: z.number(),
        teamId: z.number(),
        cardType: z.enum(['yellow', 'red']),
        minute: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createCard(input);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCard(input.id);
        return { success: true };
      }),
  }),

  // ==================== COMMENTS ====================
  comments: router({
    // Lista pública - apenas comentários aprovados
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getApprovedComments();
      }),
    
    // Lista admin - comentários pendentes de aprovação
    pending: adminProcedure
      .query(async () => {
        return db.getPendingComments();
      }),
    
    // Lista admin - todos os comentários (aprovados e pendentes)
    listAll: adminProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getAllComments(input.limit || 100);
      }),
    
    byMatch: publicProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return db.getCommentsByMatch(input.matchId);
      }),
    
    byTeam: publicProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return db.getCommentsByTeam(input.teamId);
      }),
    
    create: publicProcedure
      .input(z.object({
        authorName: z.string().min(1),
        authorLodge: z.string().optional(),
        content: z.string().min(1),
        matchId: z.number().optional(),
        teamId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        // Comentário criado com approved: false por padrão
        return db.createComment(input);
      }),
    
    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.approveComment(input.id);
        return { success: true };
      }),
    
    reject: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.rejectComment(input.id);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteComment(input.id);
        return { success: true };
      }),
  }),

  // ==================== PHOTOS ====================
  photos: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getAllPhotos(input.limit || 100);
      }),
    
    byMatch: publicProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return db.getPhotosByMatch(input.matchId);
      }),
    
    upload: adminProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.string(),
        caption: z.string().optional(),
        matchId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, 'base64');
        const ext = input.mimeType.split('/')[1] || 'jpg';
        const fileKey = `gallery/${nanoid()}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        return db.createPhoto({
          url,
          fileKey,
          caption: input.caption,
          matchId: input.matchId,
        });
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePhoto(input.id);
        return { success: true };
      }),
  }),

  // ==================== UPLOAD GENÉRICO ====================
  upload: router({
    image: adminProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.string(),
        folder: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, 'base64');
        const ext = input.mimeType.split('/')[1] || 'jpg';
        const folder = input.folder || 'uploads';
        const fileKey = `${folder}/${nanoid()}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        return { url, fileKey };
      }),
  }),

  // ==================== ANNOUNCEMENTS ====================
  announcements: router({
    list: publicProcedure.query(async () => {
      return db.getAllAnnouncements();
    }),
    
    active: publicProcedure.query(async () => {
      return db.getActiveAnnouncements();
    }),
    
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createAnnouncement(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAnnouncement(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAnnouncement(input.id);
        return { success: true };
      }),
  }),

  // ==================== ADMIN EMAILS ====================
  adminEmails: router({
    list: adminProcedure.query(async () => {
      return db.getAllAdminEmails();
    }),
    
    add: adminProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        return db.addAdminEmail(input.email);
      }),
    
    remove: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.removeAdminEmail(input.id);
        return { success: true };
      }),
    
    check: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const isAdmin = await db.isAdminEmail(input.email);
        return { isAdmin };
      }),
  }),

  // ==================== TOURNAMENT SETTINGS ====================
  settings: router({
    getAll: publicProcedure
      .query(async () => {
        return db.getAllSettings();
      }),
    
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return db.getSetting(input.key);
      }),
    
    set: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.setSetting(input.key, input.value);
        return { success: true };
      }),
    
    uploadLogo: adminProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, 'base64');
        const ext = input.mimeType.split('/')[1] || 'png';
        const fileKey = `tournament/logo-${nanoid()}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await db.setSetting('tournamentLogo', url);
        return { url };
      }),
    
    uploadMusic: adminProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, 'base64');
        const ext = input.mimeType.split('/')[1] || 'mp3';
        const fileKey = `tournament/music-${nanoid()}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await db.setSetting('tournamentMusic', url);
        return { url };
      }),
    
    uploadBackground: adminProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, 'base64');
        const ext = input.mimeType.split('/')[1] || 'jpg';
        const fileKey = `tournament/background-${nanoid()}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await db.setSetting('tournamentBackground', url);
        return { url };
      }),
    
    uploadHeroBackground: adminProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, 'base64');
        const ext = input.mimeType.split('/')[1] || 'jpg';
        const fileKey = `tournament/hero-bg-${nanoid()}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await db.setSetting('heroBackground', url);
        return { url };
      }),
  }),

  // ==================== STATISTICS ====================
  stats: router({
    topScorers: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getTopScorers(input.limit || 10);
      }),
    
    topCarded: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getTopCardedPlayers(input.limit || 10);
      }),
    
    worstDefenses: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getWorstDefenses(input.limit || 10);
      }),
    
    bestDefenses: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getBestDefenses(input.limit || 10);
      }),
    
    roundStats: publicProcedure
      .input(z.object({ round: z.number() }))
      .query(async ({ input }) => {
        return db.getRoundStats(input.round);
      }),
  }),

  // ==================== ADMIN USERS (LOGIN SIMPLIFICADO) ====================
  adminUsers: router({
    list: adminProcedure
      .query(async () => {
        return db.getAllAdminUsers();
      }),
    
    create: adminProcedure
      .input(z.object({
        username: z.string(),
        password: z.string().min(4),
        name: z.string().optional(),
        isOwner: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createAdminUser({
          username: input.username,
          password: input.password,
          name: input.name,
          isOwner: input.isOwner,
        });
      }),
    

    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAdminUser(input.id);
        return { success: true };
      }),
    
    // Login simplificado (público)
    login: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const adminUser = await db.verifyAdminPassword(input.username, input.password);
        
        if (!adminUser) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Área restrita, você não tem acesso' });
        }
        
        // Criar sessão (usar JWT simples)
        const jwt = await import('jsonwebtoken');
        const token = jwt.default.sign(
          { adminUserId: adminUser.id, username: adminUser.username, name: adminUser.name, isOwner: adminUser.isOwner },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '7d' }
        );
        
        // Retornar token para o frontend armazenar
        return { 
          success: true,
          token, // Frontend vai armazenar no localStorage
          user: { 
            id: adminUser.id, 
            username: adminUser.username, 
            name: adminUser.name,
            isOwner: adminUser.isOwner
          } 
        };
      }),
    
    // Verificar sessão admin
    me: publicProcedure
      .query(async ({ ctx }) => {
        // Ler token do header Authorization
        const authHeader = ctx.req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
        if (!token) return null;
        
        try {
          const jwt = await import('jsonwebtoken');
          const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'secret') as any;
          const adminUser = await db.getAdminUserByUsername(decoded.username);
          if (!adminUser || !adminUser.active) return null;
          return { id: adminUser.id, username: adminUser.username, name: adminUser.name, isOwner: adminUser.isOwner };
        } catch {
          return null;
        }
      }),
    
    // Logout admin (frontend limpa o localStorage)
    logout: publicProcedure
      .mutation(async () => {
        return { success: true };
      }),
  }),

  // ==================== SUPPORT MESSAGES ====================
  supportMessages: router({
    byTeam: publicProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return db.getSupportMessagesByTeam(input.teamId);
      }),
    
    pending: adminProcedure.query(async () => {
      return db.getPendingSupportMessages();
    }),
    
    all: adminProcedure.query(async () => {
      return db.getAllSupportMessages();
    }),
    
    create: publicProcedure
      .input(z.object({
        teamId: z.number(),
        authorName: z.string().min(1),
        authorLodge: z.string().optional(),
        message: z.string().min(1).max(500),
      }))
      .mutation(async ({ input }) => {
        return db.createSupportMessage(input);
      }),
    
    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.approveSupportMessage(input.id);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSupportMessage(input.id);
        return { success: true };
      }),
  }),

  // ==================== SPONSORS ====================
  sponsors: router({
    list: publicProcedure.query(async () => {
      return db.getAllSponsors();
    }),
    
    listAdmin: adminProcedure.query(async () => {
      return db.getAllSponsorsAdmin();
    }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        tier: z.enum(['A', 'B', 'C']),
        logoUrl: z.string().optional(),
        fileKey: z.string().optional(),
        link: z.string().optional(),
        description: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createSponsor(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        tier: z.enum(['A', 'B', 'C']).optional(),
        logoUrl: z.string().optional(),
        fileKey: z.string().optional(),
        link: z.string().optional(),
        description: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSponsor(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSponsor(input.id);
        return { success: true };
      }),
    
    uploadLogo: adminProcedure
      .input(z.object({
        sponsorId: z.number(),
        base64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, 'base64');
        const ext = input.mimeType.split('/')[1] || 'png';
        const fileKey = `sponsors/${input.sponsorId}/logo-${nanoid()}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await db.updateSponsor(input.sponsorId, { logoUrl: url, fileKey });
        return { url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
