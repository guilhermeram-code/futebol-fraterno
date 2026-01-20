import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Helper to create admin context
function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Helper to create public context (no user)
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Helper to create regular user context
function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Tournament API - Public Access", () => {
  it("should allow public access to list teams", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    // Should not throw - public access allowed
    const teams = await caller.teams.list();
    expect(Array.isArray(teams)).toBe(true);
  });

  it("should allow public access to list groups", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const groups = await caller.groups.list();
    expect(Array.isArray(groups)).toBe(true);
  });

  it("should allow public access to list players", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const players = await caller.players.list();
    expect(Array.isArray(players)).toBe(true);
  });

  it("should allow public access to list matches", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const matches = await caller.matches.list();
    expect(Array.isArray(matches)).toBe(true);
  });

  it("should allow public access to top scorers", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const scorers = await caller.stats.topScorers({ limit: 10 });
    expect(Array.isArray(scorers)).toBe(true);
  });

  it("should allow public access to comments list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const comments = await caller.comments.list({ limit: 10 });
    expect(Array.isArray(comments)).toBe(true);
  });

  it("should allow public access to photos list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const photos = await caller.photos.list({ limit: 10 });
    expect(Array.isArray(photos)).toBe(true);
  });
});

describe("Tournament API - Admin Access Control", () => {
  it("should deny regular user from creating teams", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.teams.create({ name: "Test Team" })
    ).rejects.toThrow("Acesso negado");
  });

  it("should deny regular user from creating groups", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.groups.create({ name: "Grupo A" })
    ).rejects.toThrow("Acesso negado");
  });

  it("should deny regular user from creating players", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.players.create({ name: "Test Player", teamId: 1 })
    ).rejects.toThrow("Acesso negado");
  });

  it("should deny regular user from creating matches", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.matches.create({ homeTeamId: 1, awayTeamId: 2, phase: "groups" })
    ).rejects.toThrow("Acesso negado");
  });

  it("should deny regular user from deleting comments", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.comments.delete({ id: 1 })
    ).rejects.toThrow("Acesso negado");
  });
});

describe("Tournament API - Public Comment Creation", () => {
  it("should allow public users to create comments", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    // This should not throw - comments are public
    const comment = await caller.comments.create({
      authorName: "João Silva",
      authorLodge: "Loja Teste",
      content: "Ótimo jogo!",
    });
    
    expect(comment).toBeDefined();
    expect(comment.authorName).toBe("João Silva");
  });
});

describe("Tournament API - Statistics", () => {
  it("should return best defenses", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const defenses = await caller.stats.bestDefenses({ limit: 5 });
    expect(Array.isArray(defenses)).toBe(true);
  });

  it("should return worst defenses (frangueiros)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const defenses = await caller.stats.worstDefenses({ limit: 5 });
    expect(Array.isArray(defenses)).toBe(true);
  });

  it("should return top carded players", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const carded = await caller.stats.topCarded({ limit: 10 });
    expect(Array.isArray(carded)).toBe(true);
  });
});

describe("Tournament API - Match Phases", () => {
  it("should filter matches by phase", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const groupMatches = await caller.matches.byPhase({ phase: "groups" });
    expect(Array.isArray(groupMatches)).toBe(true);
    
    const quarterMatches = await caller.matches.byPhase({ phase: "quarters" });
    expect(Array.isArray(quarterMatches)).toBe(true);
    
    const finalMatches = await caller.matches.byPhase({ phase: "final" });
    expect(Array.isArray(finalMatches)).toBe(true);
  });
});

describe("Tournament API - Auth", () => {
  it("should return user info for authenticated user", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    const user = await caller.auth.me();
    expect(user).toBeDefined();
    expect(user?.role).toBe("admin");
  });

  it("should return null for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });

  it("should handle logout", async () => {
    const clearedCookies: string[] = [];
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "test-user",
        email: "test@example.com",
        name: "Test User",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: (name: string) => {
          clearedCookies.push(name);
        },
      } as TrpcContext["res"],
    };
    
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    
    expect(result.success).toBe(true);
    expect(clearedCookies.length).toBeGreaterThan(0);
  });
});
