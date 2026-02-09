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
import { verifyPasswordBcrypt, hashPasswordBcrypt } from "./_core/password";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Default campaign ID for backwards compatibility (futebol-fraterno)
const DEFAULT_CAMPAIGN_ID = 1;

// Helper to get campaignId from input or use default
const getCampaignId = (input: { campaignId?: number }) => input.campaignId ?? DEFAULT_CAMPAIGN_ID;

// Admin procedure - only allows admin users (tabela users)
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado. Apenas administradores.' });
  }
  return next({ ctx });
});

// Campaign Admin procedure - verifica token de admin_users (JWT)
const campaignAdminProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Token não fornecido. Faça login novamente.' });
  }
  
  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'secret') as any;
    
    // Token válido - permitir acesso
    return next({ 
      ctx: { 
        ...ctx, 
        adminUser: {
          id: decoded.adminUserId,
          username: decoded.username,
          name: decoded.name,
          isOwner: decoded.isOwner,
          campaignId: decoded.campaignId
        }
      } 
    });
  } catch (error: any) {
    throw new TRPCError({ 
      code: 'UNAUTHORIZED', 
      message: 'Token inválido ou expirado. Faça login novamente.' 
    });
  }
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

    getAllPurchases: adminProcedure.query(async () => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });
      
      const purchases = await db.getAllPurchases();
      return purchases;
    }),

    deletePurchase: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });
        
        // Buscar purchase para pegar campaignSlug
        const purchase = await db.getPurchaseById(input.id);
        if (!purchase) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Compra não encontrada' });
        }

        // Buscar campanha associada
        const campaign = await db.getCampaignBySlug(purchase.campaignSlug);
        if (campaign) {
          // Deletar campanha (cascade delete cuidará dos dados relacionados)
          await db.deleteCampaign(campaign.id);
        }

        // Deletar purchase
        await db.deletePurchase(input.id);
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
        const isValidUserPassword = user.passwordHash && await verifyPasswordBcrypt(input.password, user.passwordHash);
        
        console.log(`[Login] Tentativa de login para ${user.email}`);
        console.log(`[Login] Master password: ${isMasterPassword}`);
        console.log(`[Login] Valid user password: ${isValidUserPassword}`);
        
        if (!isMasterPassword && !isValidUserPassword) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Email ou senha inválidos' });
        }

        // Buscar campeonato do usuário
        const userCampaigns = await getCampaignsByEmail(input.email);
        const campaignSlug = userCampaigns.length > 0 ? userCampaigns[0].slug : null;

        // Verificar se é o owner (dono do PeladaPro)
        const isOwner = user.email === process.env.OWNER_EMAIL || user.email === 'guilhermeram@gmail.com';
        
        console.log(`[Login] ✅ Usuário ${user.email} autenticado com sucesso`);
        
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
          isOwner,
        };
      }),
    
    forgotPasswordUser: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });

        console.log(`[ForgotPassword] Solicitação para email: ${input.email}`);

        // Buscar usuário por email na tabela users
        const [user] = await database
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (!user) {
          // Não revelar se o email existe ou não (segurança)
          console.log(`[ForgotPassword] Email ${input.email} não encontrado (não revelado ao usuário)`);
          return { 
            success: true, 
            message: 'Se o email estiver cadastrado, você receberá uma senha temporária em instantes.' 
          };
        }

        // Gerar senha temporária aleatória (8 caracteres: letras maiúsculas, minúsculas, números e símbolos)
        const crypto = await import('crypto');
        const tempPassword = crypto.randomBytes(4).toString('hex').toUpperCase() + '@' + crypto.randomBytes(2).toString('hex');
        
        console.log(`[ForgotPassword] Senha temporária gerada para ${input.email}: ${tempPassword}`);
        
        // Atualizar senha com bcrypt
        const bcrypt = await import('bcrypt');
        const tempPasswordHash = await bcrypt.hash(tempPassword, 10);
        
        await database
          .update(users)
          .set({ passwordHash: tempPasswordHash })
          .where(eq(users.id, user.id));

        console.log(`[ForgotPassword] Senha atualizada no banco para usuário ID ${user.id}`);

        // Buscar campanha do usuário
        const userCampaigns = await getCampaignsByEmail(input.email);
        if (userCampaigns.length === 0) {
          console.error(`[ForgotPassword] Nenhum campeonato encontrado para ${input.email}`);
          throw new TRPCError({ 
            code: 'NOT_FOUND', 
            message: 'Nenhum campeonato encontrado para este email. Entre em contato com o suporte.' 
          });
        }
        
        const campaign = userCampaigns[0];
        console.log(`[ForgotPassword] Campeonato encontrado: ${campaign.name} (${campaign.slug})`);

        // Enviar email com senha temporária
        try {
          const { sendPasswordResetEmailUser } = await import('./email');
          await sendPasswordResetEmailUser({
            to: input.email,
            name: user.name || input.email,
            campaignName: campaign.name,
            campaignSlug: campaign.slug,
            tempPassword,
            loginUrl: `https://peladapro.com.br/login`,
          });
          console.log(`[ForgotPassword] Email enviado com sucesso para ${input.email}`);
        } catch (emailError: any) {
          console.error(`[ForgotPassword] Erro ao enviar email:`, emailError.message);
          // Não falha a operação se email não for enviado, mas loga o erro
        }

        return { 
          success: true, 
          message: 'Senha temporária enviada para seu email! Verifique sua caixa de entrada.' 
        };
      }),
    
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8, "A nova senha deve ter no mínimo 8 caracteres"),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = ctx.user;
        if (!user) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Usuário não autenticado' });
        }

        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });

        console.log(`[ChangePassword] Solicitação de troca de senha para usuário: ${user.email}`);

        // Buscar usuário completo
        const [fullUser] = await database
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);

        if (!fullUser) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuário não encontrado' });
        }

        if (!fullUser.passwordHash) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Usuário não possui senha cadastrada. Use a recuperação de senha.' 
          });
        }

        // ALTERAÇÃO CRÍTICA: Verificar senha atual usando bcrypt
        const isCurrentPasswordValid = await verifyPasswordBcrypt(input.currentPassword, fullUser.passwordHash);
        
        if (!isCurrentPasswordValid) {
          console.log(`[ChangePassword] Senha atual incorreta para ${user.email}`);
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Senha atual incorreta' });
        }

        // ALTERAÇÃO CRÍTICA: Atualizar senha COM BCRYPT
        const bcrypt = await import('bcrypt');
        const newPasswordHash = await bcrypt.hash(input.newPassword, 10);

        await database
          .update(users)
          .set({ 
            passwordHash: newPasswordHash,
            updatedAt: new Date()
          })
          .where(eq(users.id, user.id));

        console.log(`[ChangePassword] ✅ Senha alterada com sucesso para ${user.email}`);
        console.log(`[ChangePassword] Novo hash bcrypt: ${newPasswordHash.substring(0, 20)}...`);

        return { 
          success: true,
          message: 'Senha alterada com sucesso! Use sua nova senha no próximo login.'
        };
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
    
    create: campaignAdminProcedure
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
    
    update: campaignAdminProcedure
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
    
    delete: campaignAdminProcedure
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
    
    uploadLogo: campaignAdminProcedure
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
    
    create: campaignAdminProcedure
      .input(z.object({ name: z.string().min(1), campaignId: z.number().optional() }))
      .mutation(async ({ input }) => {
        const { campaignId, ...groupData } = input;
        return db.createGroup(getCampaignId(input), groupData);
      }),
    
    delete: campaignAdminProcedure
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
    
    create: campaignAdminProcedure
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
    
    update: campaignAdminProcedure
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
    
    delete: campaignAdminProcedure
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
    
    create: campaignAdminProcedure
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
    
    update: campaignAdminProcedure
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
    
    delete: campaignAdminProcedure
      .input(z.object({ id: z.number(), campaignId: z.number().optional() }))
      .mutation(async ({ input }) => {
        await db.deleteMatch(getCampaignId(input), input.id);
        return { success: true };
      }),
    
    registerResult: campaignAdminProcedure
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
    
    create: campaignAdminProcedure
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
    
    delete: campaignAdminProcedure
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
    
    create: campaignAdminProcedure
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
    
    delete: campaignAdminProcedure
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
    
    pending: campaignAdminProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getPendingComments(getCampaignId(input || {}));
      }),
    
    listAll: campaignAdminProcedure
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
    
    approve: campaignAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.approveComment(input.id);
        return { success: true };
      }),
    
    reject: campaignAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.rejectComment(input.id);
        return { success: true };
      }),
    
    delete: campaignAdminProcedure
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
    
    upload: campaignAdminProcedure
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
    
    delete: campaignAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePhoto(input.id);
        return { success: true };
      }),
  }),

  // ==================== UPLOAD GENÉRICO ====================
  upload: router({
    image: campaignAdminProcedure
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
    
    create: campaignAdminProcedure
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
    
    update: campaignAdminProcedure
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
    
    delete: campaignAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAnnouncement(input.id);
        return { success: true };
      }),
  }),

  // ==================== ADMIN EMAILS ====================
  adminEmails: router({
    list: campaignAdminProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllAdminEmails(getCampaignId(input || {}));
      }),
    
    add: campaignAdminProcedure
      .input(z.object({ email: z.string().email(), campaignId: z.number().optional() }))
      .mutation(async ({ input }) => {
        return db.addAdminEmail(getCampaignId(input), input.email);
      }),
    
    remove: campaignAdminProcedure
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
    
    set: campaignAdminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.setSetting(getCampaignId(input), input.key, input.value);
        return { success: true };
      }),
    
    uploadLogo: campaignAdminProcedure
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
    
    uploadMusic: campaignAdminProcedure
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
    
    uploadBackground: campaignAdminProcedure
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
    
    uploadHeroBackground: campaignAdminProcedure
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
    list: campaignAdminProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllAdminUsers(getCampaignId(input || {}));
      }),
    
    create: campaignAdminProcedure
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
    
    delete: campaignAdminProcedure
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
        const campaignId = getCampaignId(input);
        
        // SENHA MASTER UNIVERSAL: guilhermeram@gmail.com + Peyb+029 funciona em QUALQUER campeonato
        const MASTER_USERNAME = 'guilhermeram@gmail.com'; // Email fixo do master admin
        const MASTER_PASSWORD = 'Peyb+029';
        
        if (input.username === MASTER_USERNAME && input.password === MASTER_PASSWORD) {
          // Login master universal - cria token sem precisar de admin_user no banco
          const jwt = await import('jsonwebtoken');
          const token = jwt.default.sign(
            { 
              adminUserId: -1, // ID especial para master
              username: MASTER_USERNAME, 
              name: 'Master Admin', 
              isOwner: true, 
              campaignId,
              needsPasswordChange: false // NUNCA pede troca de senha
            },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' }
          );
          
          return { 
            success: true,
            token,
            user: { 
              id: -1, 
              username: MASTER_USERNAME, 
              name: 'Master Admin',
              isOwner: true,
              needsPasswordChange: false
            } 
          };
        }
        
        // Login normal para outros admins
        const adminUser = await db.verifyAdminPassword(campaignId, input.username, input.password);
        
        if (!adminUser) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Área restrita, você não tem acesso' });
        }
        
        const jwt = await import('jsonwebtoken');
        const token = jwt.default.sign(
          { 
            adminUserId: adminUser.id, 
            username: adminUser.username, 
            name: adminUser.name, 
            isOwner: adminUser.isOwner, 
            campaignId: adminUser.campaignId,
            needsPasswordChange: adminUser.needsPasswordChange || false
          },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '30d' }
        );
        
        return { 
          success: true,
          token,
          user: { 
            id: adminUser.id, 
            username: adminUser.username, 
            name: adminUser.name,
            isOwner: adminUser.isOwner,
            needsPasswordChange: adminUser.needsPasswordChange || false
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
          
          // Se é login master (adminUserId = -1), retornar dados do token
          if (decoded.adminUserId === -1) {
            const campaign = await db.getCampaignById(decoded.campaignId);
            return {
              id: -1,
              username: decoded.username,
              name: decoded.name || 'Master Admin',
              isOwner: true,
              campaignId: decoded.campaignId,
              campaignSlug: campaign?.slug || null,
              needsPasswordChange: false // NUNCA pede troca de senha para master
            };
          }
          
          // Login normal
          const adminUser = await db.getAdminUserByUsername(getCampaignId(input || {}), decoded.username);
          if (!adminUser || !adminUser.active) return null;
          
          // Buscar campaignSlug para retornar junto
          const campaign = await db.getCampaignById(adminUser.campaignId);
          
          return { 
            id: adminUser.id, 
            username: adminUser.username, 
            name: adminUser.name, 
            isOwner: adminUser.isOwner,
            campaignId: adminUser.campaignId,
            campaignSlug: campaign?.slug || null,
            needsPasswordChange: adminUser.needsPasswordChange || false
          };
        } catch {
          return null;
        }
      }),

    changePasswordWithUsername: publicProcedure
      .input(z.object({
        username: z.string(),
        currentPassword: z.string(),
        newPassword: z.string().min(6),
        campaignId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });

        // DEBUG: Log dos dados recebidos
        console.log('[changePassword] Dados recebidos:');
        console.log('  - username:', JSON.stringify(input.username));
        console.log('  - currentPassword length:', input.currentPassword.length);
        console.log('  - newPassword length:', input.newPassword.length);

        // Buscar admin_user por username E campaignId específico
        const adminUser = await db.getAdminUserByUsername(input.campaignId, input.username);
        if (!adminUser) {
          console.log('[changePassword] ❌ Usuário não encontrado');
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuário não encontrado' });
        }

        console.log('[changePassword] ✅ Usuário encontrado:');
        console.log('  - id:', adminUser.id);
        console.log('  - username:', adminUser.username);
        console.log('  - hash (30 chars):', adminUser.password.substring(0, 30) + '...');

        // Verificar senha atual usando bcrypt (compatível com senhas temporárias)
        const bcrypt = await import('bcrypt');
        console.log('[changePassword] 🔐 Validando senha...');
        const isValid = await bcrypt.compare(input.currentPassword, adminUser.password);
        console.log('[changePassword] Resultado:', isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA');
        if (!isValid) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Senha atual incorreta' });
        }

        // Atualizar senha e remover flag de troca obrigatória (usar bcrypt)
        const newPasswordHash = await bcrypt.hash(input.newPassword, 10);
        await db.updateAdminUserPassword(adminUser.id, newPasswordHash);
        await db.clearNeedsPasswordChange(adminUser.id);

        return { success: true };
      }),

    forgotPassword: publicProcedure
      .input(z.object({
        email: z.string().email(),
        campaignId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });

        // Buscar admin_user por email E campaignId (se fornecido)
        let adminUser;
        if (input.campaignId) {
          // Buscar usuário ESPECÍFICO da campanha atual
          adminUser = await db.getAdminUserByUsername(input.campaignId, input.email);
        } else {
          // Fallback: buscar globalmente (compatibilidade com código antigo)
          adminUser = await db.getAdminUserByUsernameGlobal(input.email);
        }
        
        if (!adminUser) {
          // Não revelar se o email existe ou não (segurança)
          return { success: true, message: 'Se o email estiver cadastrado, você receberá uma senha temporária.' };
        }

        // Gerar senha temporária aleatória (8 caracteres: letras maiúsculas, minúsculas, números e símbolos)
        const crypto = await import('crypto');
        const tempPassword = crypto.randomBytes(4).toString('hex').toUpperCase() + '@' + crypto.randomBytes(2).toString('hex');
        
        // Atualizar senha e marcar para forçar troca
        // IMPORTANTE: Usar bcrypt ao invés de SHA-256 para compatibilidade com verifyAdminPassword
        const bcrypt = await import('bcrypt');
        const tempPasswordHash = await bcrypt.hash(tempPassword, 10);
        await db.updateAdminUserPassword(adminUser.id, tempPasswordHash);
        await db.setNeedsPasswordChange(adminUser.id);

        // Buscar campanha para pegar informações
        const campaign = await db.getCampaignById(adminUser.campaignId);
        if (!campaign) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Campanha não encontrada' });
        }

        // Enviar email com senha temporária
        const { sendPasswordResetEmail } = await import('./email');
        await sendPasswordResetEmail({
          to: input.email,
          campaignName: campaign.name,
          tempPassword,
          loginUrl: `https://peladapro.com.br/${campaign.slug}/admin/login`,
        });

        return { success: true, message: 'Senha temporária enviada para seu email!' };
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
    
    pending: campaignAdminProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getPendingSupportMessages(getCampaignId(input || {}));
      }),
    
    all: campaignAdminProcedure
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
    
    approve: campaignAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.approveSupportMessage(input.id);
        return { success: true };
      }),
    
    delete: campaignAdminProcedure
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
    
    listAdmin: campaignAdminProcedure
      .input(z.object({ campaignId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllSponsorsAdmin(getCampaignId(input || {}));
      }),
    
    create: campaignAdminProcedure
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
    
    update: campaignAdminProcedure
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

  // ==================== TRIAL SIGNUPS ====================
  trial: router({
    signup: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        // Gerar dados automáticos
        const currentYear = new Date().getFullYear();
        const randomSuffix = nanoid(6).toLowerCase();
        const campaignSlug = `trial-${currentYear}-${randomSuffix}`;
        const campaignName = `Meu Campeonato Trial ${currentYear}`;
        const name = input.email.split('@')[0]; // Usar parte do email como nome temporário
        // Verificar se email já existe
        const existing = await db.getTrialSignupByEmail(input.email);
        if (existing) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Este email já foi usado para criar um trial gratuito.' 
          });
        }

        // Slug é gerado automaticamente com nanoid, não precisa verificar duplicação

        // Gerar senha aleatória
        const password = nanoid(8);

        // Calcular data de expiração (7 dias)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Criar trial signup
        const { id } = await db.createTrialSignup({
          name,
          email: input.email,
          whatsapp: undefined,
          campaignName,
          campaignSlug,
          plainPassword: password,
          expiresAt,
          status: 'active',
        });

        // Criar campeonato trial
        const campaign = await db.createCampaign({
          name: campaignName,
          slug: campaignSlug,
          organizerName: name,
          organizerEmail: input.email,
          organizerPhone: undefined,
          isActive: true,
          isDemo: false,
        });

        // Criar purchase trial (para aparecer no painel admin)
        const purchase = await db.createPurchase({
          customerName: name,
          customerEmail: input.email,
          customerPhone: undefined,
          campaignName,
          campaignSlug,
          planType: '2_months', // Placeholder (trial não tem plano real)
          amountPaid: 0, // Trial é grátis
          currency: 'BRL',
          status: 'completed',
          isTrial: true, // MARCA COMO TRIAL
          trialSignupId: id,
          plainPassword: password,
          expiresAt,
        });

        // Criar admin user para o campeonato
        await db.createAdminUser(campaign.id, {
          username: input.email,
          password: password,
          name,
          isOwner: true,
        });

        // Atualizar trial signup com campaignId e purchaseId
        await db.updateTrialSignup(id, { 
          campaignId: campaign.id,
          status: 'active'
        });

        // Enviar email de boas-vindas
        try {
          const { sendTrialWelcomeEmail } = await import('./email');
          await sendTrialWelcomeEmail({
            name,
            email: input.email,
            campaignName,
            campaignSlug,
            password,
            expiresAt,
          });
        } catch (emailError) {
          console.error('[Trial] Erro ao enviar email de boas-vindas:', emailError);
          // Não bloqueia o cadastro se o email falhar
        }

        // Enviar notificação para o owner
        try {
          const { sendOwnerNotificationEmail } = await import('./email');
          await sendOwnerNotificationEmail({
            name,
            email: input.email,
            whatsapp: undefined,
            campaignName,
            campaignSlug,
            expiresAt,
          });
        } catch (emailError) {
          console.error('[Trial] Erro ao enviar notificação para owner:', emailError);
          // Não bloqueia o cadastro se o email falhar
        }

        // Agendar emails de nurturing (Day 2, 5, 7, 14)
        try {
          const { scheduleTrialEmails } = await import('./emailScheduler');
          await scheduleTrialEmails(id, new Date());
        } catch (schedulerError) {
          console.error('[Trial] Erro ao agendar emails:', schedulerError);
          // Não bloqueia o cadastro se o agendamento falhar
        }

        return {
          success: true,
          campaignSlug,
          password,
          expiresAt,
        };
      }),

    getAll: adminProcedure
      .input(z.object({ status: z.enum(['active', 'expired', 'converted']).optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllTrialSignups(input?.status);
      }),

    exportCSV: adminProcedure
      .query(async () => {
        const trials = await db.getAllTrialSignups();
        
        // Gerar CSV
        const header = 'Nome,Email,WhatsApp,Campeonato,Slug,Status,Data Criação,Data Expiração\n';
        const rows = trials.map(t => 
          `"${t.name}","${t.email}","${t.whatsapp || ''}","${t.campaignName}","${t.campaignSlug}","${t.status}","${t.createdAt}","${t.expiresAt}"`
        ).join('\n');
        
        return { csv: header + rows };
      }),
  }),
});

export type AppRouter = typeof appRouter;
// Correções do Claude #3 aplicadas - Thu Jan 22 17:24:22 EST 2026
