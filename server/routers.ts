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
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getAllComments(input.limit || 50);
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
        return db.createComment(input);
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
});

export type AppRouter = typeof appRouter;
