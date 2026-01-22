import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";
import * as db from "./db";

describe("Admin Router", () => {
  let adminContext: Context;
  let userContext: Context;

  beforeAll(async () => {
    // Mock context para admin (dono do PeladaPro)
    adminContext = {
      user: {
        id: 1,
        email: "guilhermeram@gmail.com",
        name: "Admin",
        role: "admin",
        openId: "admin-open-id",
        createdAt: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };

    // Mock context para usuário comum
    userContext = {
      user: {
        id: 2,
        email: "user@example.com",
        name: "User",
        role: "user",
        openId: "user-open-id",
        createdAt: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };
  });

  describe("getStats", () => {
    it("deve retornar estatísticas para o admin", async () => {
      const caller = appRouter.createCaller(adminContext);
      const stats = await caller.admin.getStats();

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty("totalRevenue");
      expect(stats).toHaveProperty("activeCampaigns");
      expect(stats).toHaveProperty("totalCampaigns");
      expect(stats).toHaveProperty("totalUsers");
      expect(typeof stats.totalRevenue).toBe("number");
      expect(typeof stats.activeCampaigns).toBe("number");
      expect(typeof stats.totalCampaigns).toBe("number");
      expect(typeof stats.totalUsers).toBe("number");
    });

    it("deve rejeitar acesso de usuário não-admin", async () => {
      const caller = appRouter.createCaller(userContext);
      
      await expect(caller.admin.getStats()).rejects.toThrow();
    });
  });

  describe("getAllCampaigns", () => {
    it("deve retornar lista de campeonatos para o admin", async () => {
      const caller = appRouter.createCaller(adminContext);
      const campaigns = await caller.admin.getAllCampaigns();

      expect(Array.isArray(campaigns)).toBe(true);
      
      // Se houver campeonatos, verificar estrutura
      if (campaigns.length > 0) {
        const campaign = campaigns[0];
        expect(campaign).toHaveProperty("id");
        expect(campaign).toHaveProperty("slug");
        expect(campaign).toHaveProperty("name");
        expect(campaign).toHaveProperty("organizerEmail");
        expect(campaign).toHaveProperty("isActive");
        expect(campaign).toHaveProperty("createdAt");
      }
    });

    it("deve rejeitar acesso de usuário não-admin", async () => {
      const caller = appRouter.createCaller(userContext);
      
      await expect(caller.admin.getAllCampaigns()).rejects.toThrow();
    });
  });

  describe("Funções de banco de dados", () => {
    it("getAdminStats deve retornar estatísticas válidas", async () => {
      const stats = await db.getAdminStats();

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty("totalRevenue");
      expect(stats).toHaveProperty("activeCampaigns");
      expect(stats).toHaveProperty("totalCampaigns");
      expect(stats).toHaveProperty("totalUsers");
    });

    it("getAllCampaignsForAdmin deve retornar array de campeonatos", async () => {
      const campaigns = await db.getAllCampaignsForAdmin();

      expect(Array.isArray(campaigns)).toBe(true);
    });
  });
});
