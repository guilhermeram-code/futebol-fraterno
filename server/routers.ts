import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { getCampaignsByEmail } from "./db-campaigns-by-email";
import { getDb } from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { createCheckoutSession } from "./stripe/checkout";
import { createCheckoutSession as createMercadoPagoCheckout } from "./mercadopago/checkout";
import { verifyPassword, hashPassword } from "./_core/password";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Default campaign ID for backwards compatibility (futebol-fraterno)
const DEFAULT_CAMPAIGN_ID = 1;

// Helper to get campaignId from input or use default
const getCampaignId = (input: { campaignId?: number }) => input.campaignId ?? DEFAULT_CAMPAIGN_ID;

// Admin procedure - only allows admin users
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado. Apenas administradores.' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  admin: router({
    getStats: adminProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });
      
      const stats = await db.getAdminStats();
      return stats;
    }),
    
    getAllCampaigns: adminProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });
      
      const campaigns = await db.getAllCampaignsForAdmin();
      return campaigns;
    }),

    deleteCampaign: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });
        
        await db.deleteCampaign(input.id);
        return { success: true };
      }),
  }),
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    
    loginWithPassword: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });

        // Buscar usuário por email
        const [user] = await database
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (!user) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Email ou senha inválidos' });
        }

        // Verificar senha (aceita senha master universal ou senha do usuário)
        const MASTER_PASSWORD = 'Peyb+029';
        const isMasterPassword = input.password === MASTER_PASSWORD;
        const isValidUserPassword = user.passwordHash && verifyPassword(input.password, user.passwordHash);
        
        if (!isMasterPassword && !isValidUserPassword) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Email ou senha inválidos' });
        }

        // Buscar campeonato do usuário
        const userCampaigns = await getCampaignsByEmail(input.email);
        const campaignSlug = userCampaigns.length > 0 ? userCampaigns[0].slug : null;

        // Criar sessão de login (retornar dados do usuário para o contexto)
        return {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: 'admin', // Usuário que faz login via /login é admin
          },
          campaignSlug,
        };
      }),
    
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = ctx.user;
        if (!user) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Usuário não autenticado' });
        }

        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });

        // Buscar usuário completo
        const [fullUser] = await database
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);

        if (!fullUser || !fullUser.passwordHash) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Usuário não possui senha cadastrada' });
        }

        // Verificar senha atual
        if (!verifyPassword(input.currentPassword, fullUser.passwordHash)) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Senha atual incorreta' });
        }

        // Atualizar senha
        const newPasswordHash = hashPassword(input.newPassword);
        await database
          .update(users)
          .set({ passwordHash: newPasswordHash })
          .where(eq(users.id, user.id));

        return { success: true };
      }),
  }),

  // ==================== CAMPAIGNS (MULTI-TENANT) ====================
  campaigns: router({
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getCampaignBySlug(input.slug);
      }),
    
    list: adminProcedure.query(async () => {
      return db.getAllCampaigns();
    }),
    
    active: publicProcedure.query(async () => {
      return db.getActiveCampaigns();
    }),
    
    checkSlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const available = await db.isSlugAvailable(input.slug);
        return { available };
      }),
  }),

  // ==================== PURCHASES ====================
  purchases: router({
    list: adminProcedure.query(async () => {
      return db.getAllPurchases();
    }),
    
    bySlug: adminProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getPurchaseBySlug(input.slug);
      }),
  }),

  // ==================== CHECKOUT ====================
  checkout: router({
    // Stripe (legacy)
    createSession: publicProcedure
      .input(z.object({
        planId: z.string(),
        campaignName: z.string().min(1),
        slug: z.string().min(3).max(30),
        email: z.string().email(),
        phone: z.string().optional(),
        customerName: z.string().optional(),
        couponCode: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const origin = ctx.req.headers.origin || 'http://localhost:3000';
        return createCheckoutSession({
          ...input,
          origin,
        });
      }),
    
    // Mercado Pago (novo)
    createMercadoPagoSession: publicProcedure
      .input(z.object({
        planId: z.string(),
        campaignName: z.string().min(1),
        campaignSlug: z.string().min(3).max(30),
        email: z.string().email(),
        whatsapp: z.string(),
        couponCode: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const origin = ctx.req.headers.origin || 'http://localhost:3000';
        return createMercadoPagoCheckout({
          ...input,
          origin,
        });
      }),
  }),

  // ==================== COUPONS ====================
  coupons: router({
    validate: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        return db.validateCoupon(input.code);
      }),
    
    create: adminProcedure
      .input(z.object({
        code: z.string(),
        discountPercent: z.number().min(1).max(100),
        maxUses: z.number().optional(),
        expiresAt: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createCoupon({
          code: input.code,
          discountPercent: input.discountPercent,
          maxUses: input.maxUses,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        });
      }),
  }),

  // ==================== TEAMS ====================
  teams: router({
    list: publicProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllTeams(getCampaignId(input || {}));
      }),
    
    byId: publicProcedure
      .input(z.object({ id: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getTeamById(input.id);
      }),
    
    byGroup: publicProcedure
      .input(z.object({ groupId: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getTeamsByGroup(getCampaignId(input), input.groupId);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        lodge: z.string().optional(),
        logoUrl: z.string().optional(),
        groupId: z.number().optional(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { campaignId, ...teamData } = input;
        return db.createTeam(getCampaignId(input), teamData);
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
      .input(z.object({ id: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getTeamStats(getCampaignId(input), input.id);
      }),
    
    statsGroupOnly: publicProcedure
      .input(z.object({ id: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getTeamStatsGroupOnly(getCampaignId(input), input.id);
      }),
    
    statsKnockoutOnly: publicProcedure
      .input(z.object({ id: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getTeamStatsKnockoutOnly(getCampaignId(input), input.id);
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
    list: publicProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllGroups(getCampaignId(input || {}));
      }),
    
    create: adminProcedure
      .input(z.object({ name: z.string().min(1), campaignId: z.number().optional() }))
      .mutation(async ({ input }) => {
        const { campaignId, ...groupData } = input;
        return db.createGroup(getCampaignId(input), groupData);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number(), campaignId: z.number().optional() }))
      .mutation(async ({ input }) => {
        await db.deleteGroup(getCampaignId(input), input.id);
        return { success: true };
      }),
    
    standings: publicProcedure
      .input(z.object({ groupId: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getGroupStandings(getCampaignId(input), input.groupId);
      }),
  }),

  // ==================== PLAYERS ====================
  players: router({
    list: publicProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllPlayers(getCampaignId(input || {}));
      }),
    
    byId: publicProcedure
      .input(z.object({ id: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getPlayerById(input.id, input.campaignId ? getCampaignId(input) : undefined);
      }),
    
    byTeam: publicProcedure
      .input(z.object({ teamId: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getPlayersByTeam(getCampaignId(input), input.teamId);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        number: z.number().optional(),
        position: z.string().optional(),
        teamId: z.number(),
        photoUrl: z.string().optional(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { campaignId, ...playerData } = input;
        return db.createPlayer(getCampaignId(input), playerData);
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
      .input(z.object({ playerId: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getGoalsByPlayer(getCampaignId(input), input.playerId);
      }),
    
    cards: publicProcedure
      .input(z.object({ playerId: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getCardsByPlayer(getCampaignId(input), input.playerId);
      }),
  }),

  // ==================== MATCHES ====================
  matches: router({
    list: publicProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllMatches(getCampaignId(input || {}));
      }),
    
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getMatchById(input.id);
      }),
    
    byPhase: publicProcedure
      .input(z.object({ phase: z.string(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getMatchesByPhase(getCampaignId(input), input.phase);
      }),
    
    byGroup: publicProcedure
      .input(z.object({ groupId: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getMatchesByGroup(getCampaignId(input), input.groupId);
      }),
    
    byTeam: publicProcedure
      .input(z.object({ teamId: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getMatchesByTeam(getCampaignId(input), input.teamId);
      }),
    
    upcoming: publicProcedure
      .input(z.object({ limit: z.number().optional(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getUpcomingMatches(getCampaignId(input), input.limit || 10);
      }),
    
    recent: publicProcedure
      .input(z.object({ limit: z.number().optional(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getRecentMatches(getCampaignId(input), input.limit || 10);
      }),
    
    headToHead: publicProcedure
      .input(z.object({ team1Id: z.number(), team2Id: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getHeadToHead(getCampaignId(input), input.team1Id, input.team2Id);
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
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        let matchDateUTC: Date | undefined;
        if (input.matchDate) {
          matchDateUTC = new Date(input.matchDate + ':00-03:00');
        }
        const { campaignId, ...matchData } = input;
        return db.createMatch(getCampaignId(input), {
          ...matchData,
          matchDate: matchDateUTC,
        });
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
        let matchDateUTC: Date | undefined;
        if (matchDate) {
          matchDateUTC = new Date(matchDate + ':00-03:00');
        }
        const updateData = {
          ...data,
          matchDate: matchDateUTC,
        };
        await db.updateMatch(id, updateData);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number(), campaignId: z.number().optional() }))
      .mutation(async ({ input }) => {
        await db.deleteMatch(getCampaignId(input), input.id);
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
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllGoals(getCampaignId(input || {}));
      }),
    
    byMatch: publicProcedure
      .input(z.object({ matchId: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getGoalsByMatch(getCampaignId(input), input.matchId);
      }),
    
    topScorers: publicProcedure
      .input(z.object({ limit: z.number().optional(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getTopScorers(getCampaignId(input), input.limit || 10);
      }),
    
    create: adminProcedure
      .input(z.object({
        matchId: z.number(),
        playerId: z.number(),
        teamId: z.number(),
        minute: z.number().optional(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { campaignId, ...goalData } = input;
        return db.createGoal(getCampaignId(input), goalData);
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
      .input(z.object({ matchId: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getCardsByMatch(getCampaignId(input), input.matchId);
      }),
    
    topCarded: publicProcedure
      .input(z.object({ limit: z.number().optional(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getTopCardedPlayers(getCampaignId(input), input.limit || 10);
      }),
    
    create: adminProcedure
      .input(z.object({
        matchId: z.number(),
        playerId: z.number(),
        teamId: z.number(),
        cardType: z.enum(['yellow', 'red']),
        minute: z.number().optional(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { campaignId, ...cardData } = input;
        return db.createCard(getCampaignId(input), cardData);
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
    list: publicProcedure
      .input(z.object({ limit: z.number().optional(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getApprovedComments(getCampaignId(input));
      }),
    
    pending: adminProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getPendingComments(getCampaignId(input || {}));
      }),
    
    listAll: adminProcedure
      .input(z.object({ limit: z.number().optional(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getAllComments(getCampaignId(input), input.limit || 100);
      }),
    
    byMatch: publicProcedure
      .input(z.object({ matchId: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getCommentsByMatch(getCampaignId(input), input.matchId);
      }),
    
    byTeam: publicProcedure
      .input(z.object({ teamId: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getCommentsByTeam(getCampaignId(input), input.teamId);
      }),
    
    create: publicProcedure
      .input(z.object({
        authorName: z.string().min(1),
        authorLodge: z.string().optional(),
        content: z.string().min(1),
        matchId: z.number().optional(),
        teamId: z.number().optional(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { campaignId, ...commentData } = input;
        return db.createComment(getCampaignId(input), commentData);
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
      .input(z.object({ limit: z.number().optional(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getAllPhotos(getCampaignId(input), input.limit || 100);
      }),
    
    byMatch: publicProcedure
      .input(z.object({ matchId: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getPhotosByMatch(getCampaignId(input), input.matchId);
      }),
    
    upload: adminProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.string(),
        caption: z.string().optional(),
        matchId: z.number().optional(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, 'base64');
        const ext = input.mimeType.split('/')[1] || 'jpg';
        const fileKey = `gallery/${nanoid()}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        const { campaignId, base64, mimeType, ...photoData } = input;
        return db.createPhoto(getCampaignId(input), {
          url,
          fileKey,
          caption: photoData.caption,
          matchId: photoData.matchId,
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
    list: publicProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllAnnouncements(getCampaignId(input || {}));
      }),
    
    active: publicProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getActiveAnnouncements(getCampaignId(input || {}));
      }),
    
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        active: z.boolean().optional(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { campaignId, ...announcementData } = input;
        return db.createAnnouncement(getCampaignId(input), announcementData);
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
    list: adminProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllAdminEmails(getCampaignId(input || {}));
      }),
    
    add: adminProcedure
      .input(z.object({ email: z.string().email(), campaignId: z.number().optional() }))
      .mutation(async ({ input }) => {
        return db.addAdminEmail(getCampaignId(input), input.email);
      }),
    
    remove: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.removeAdminEmail(input.id);
        return { success: true };
      }),
    
    check: publicProcedure
      .input(z.object({ email: z.string().email(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        const isAdmin = await db.isAdminEmail(input.email, getCampaignId(input));
        return { isAdmin };
      }),
  }),

  // ==================== TOURNAMENT SETTINGS ====================
  settings: router({
    getAll: publicProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllSettings(getCampaignId(input || {}));
      }),
    
    get: publicProcedure
      .input(z.object({ key: z.string(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getSetting(getCampaignId(input), input.key);
      }),
    
    set: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.setSetting(getCampaignId(input), input.key, input.value);
        return { success: true };
      }),
    
    uploadLogo: adminProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.string(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const campaignId = getCampaignId(input);
        console.log("[Upload Logo] campaignId:", campaignId);
        const buffer = Buffer.from(input.base64, 'base64');
        const ext = input.mimeType.split('/')[1] || 'png';
        const fileKey = `tournament/logo-${nanoid()}.${ext}`;
        console.log("[Upload Logo] fileKey:", fileKey);
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        console.log("[Upload Logo] url:", url);
        await db.setSetting(campaignId, 'tournamentLogo', url);
        console.log("[Upload Logo] Setting salvo para campaign:", campaignId);
        return { url };
      }),
    
    uploadMusic: adminProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.string(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, 'base64');
        const ext = input.mimeType.split('/')[1] || 'mp3';
        const fileKey = `tournament/music-${nanoid()}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await db.setSetting(getCampaignId(input), 'tournamentMusic', url);
        return { url };
      }),
    
    uploadBackground: adminProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.string(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const campaignId = getCampaignId(input);
        console.log("[Upload Background] campaignId:", campaignId);
        const buffer = Buffer.from(input.base64, 'base64');
        const ext = input.mimeType.split('/')[1] || 'jpg';
        const fileKey = `tournament/background-${nanoid()}.${ext}`;
        console.log("[Upload Background] fileKey:", fileKey);
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        console.log("[Upload Background] url:", url);
        await db.setSetting(campaignId, 'tournamentBackground', url);
        console.log("[Upload Background] Setting salvo para campaign:", campaignId);
        return { url };
      }),
    
    uploadHeroBackground: adminProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.string(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, 'base64');
        const ext = input.mimeType.split('/')[1] || 'jpg';
        const fileKey = `tournament/hero-bg-${nanoid()}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await db.setSetting(getCampaignId(input), 'heroBackground', url);
        return { url };
      }),
  }),

  // ==================== STATISTICS ====================
  stats: router({
    topScorers: publicProcedure
      .input(z.object({ limit: z.number().optional(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getTopScorers(getCampaignId(input), input.limit || 10);
      }),
    
    topCarded: publicProcedure
      .input(z.object({ limit: z.number().optional(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getTopCardedPlayers(getCampaignId(input), input.limit || 10);
      }),
    
    worstDefenses: publicProcedure
      .input(z.object({ limit: z.number().optional(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getWorstDefenses(getCampaignId(input), input.limit || 10);
      }),
    
    bestDefenses: publicProcedure
      .input(z.object({ limit: z.number().optional(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getBestDefenses(getCampaignId(input), input.limit || 10);
      }),
    
    roundStats: publicProcedure
      .input(z.object({ round: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getRoundStats(getCampaignId(input), input.round);
      }),
  }),

  // ==================== ADMIN USERS (LOGIN SIMPLIFICADO) ====================
  adminUsers: router({
    list: adminProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllAdminUsers(getCampaignId(input || {}));
      }),
    
    create: adminProcedure
      .input(z.object({
        username: z.string(),
        password: z.string().min(4),
        name: z.string().optional(),
        isOwner: z.boolean().optional(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createAdminUser(getCampaignId(input), {
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
    
    login: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const adminUser = await db.verifyAdminPassword(getCampaignId(input), input.username, input.password);
        
        if (!adminUser) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Área restrita, você não tem acesso' });
        }
        
        const jwt = await import('jsonwebtoken');
        const token = jwt.default.sign(
          { adminUserId: adminUser.id, username: adminUser.username, name: adminUser.name, isOwner: adminUser.isOwner, campaignId: adminUser.campaignId },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '7d' }
        );
        
        return { 
          success: true,
          token,
          user: { 
            id: adminUser.id, 
            username: adminUser.username, 
            name: adminUser.name,
            isOwner: adminUser.isOwner
          } 
        };
      }),
    
    me: publicProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        const authHeader = ctx.req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
        if (!token) return null;
        
        try {
          const jwt = await import('jsonwebtoken');
          const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'secret') as any;
          const adminUser = await db.getAdminUserByUsername(getCampaignId(input || {}), decoded.username);
          if (!adminUser || !adminUser.active) return null;
          return { id: adminUser.id, username: adminUser.username, name: adminUser.name, isOwner: adminUser.isOwner };
        } catch {
          return null;
        }
      }),
    
    logout: publicProcedure
      .mutation(async () => {
        return { success: true };
      }),
  }),

  // ==================== SUPPORT MESSAGES ====================
  supportMessages: router({
    byTeam: publicProcedure
      .input(z.object({ teamId: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getSupportMessagesByTeam(getCampaignId(input), input.teamId);
      }),
    
    pending: adminProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getPendingSupportMessages(getCampaignId(input || {}));
      }),
    
    all: adminProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllSupportMessages(getCampaignId(input || {}));
      }),
    
    create: publicProcedure
      .input(z.object({
        teamId: z.number(),
        authorName: z.string().min(1),
        authorLodge: z.string().optional(),
        message: z.string().min(1).max(500),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { campaignId, ...messageData } = input;
        return db.createSupportMessage(getCampaignId(input), messageData);
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
    list: publicProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllSponsors(getCampaignId(input || {}));
      }),
    
    listAdmin: adminProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllSponsorsAdmin(getCampaignId(input || {}));
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
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { campaignId, ...sponsorData } = input;
        return db.createSponsor(getCampaignId(input), sponsorData);
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
// Correções do Claude #3 aplicadas - Thu Jan 22 17:24:22 EST 2026
