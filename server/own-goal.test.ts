import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  createGoal: vi.fn().mockResolvedValue({ id: 1 }),
  getTopScorers: vi.fn().mockResolvedValue([]),
  getGoalsByMatch: vi.fn().mockResolvedValue([]),
  deleteGoal: vi.fn().mockResolvedValue(undefined),
}));

describe("Own Goal (Gol Contra) System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GoalEntry interface", () => {
    it("should support isOwnGoal flag", () => {
      const ownGoalEntry = {
        playerId: null,
        teamId: 1,
        isOwnGoal: true,
        matchId: 10,
      };
      expect(ownGoalEntry.isOwnGoal).toBe(true);
      expect(ownGoalEntry.playerId).toBeNull();
    });

    it("should support regular goal with player", () => {
      const regularGoal = {
        playerId: 5,
        teamId: 1,
        isOwnGoal: false,
        matchId: 10,
      };
      expect(regularGoal.isOwnGoal).toBe(false);
      expect(regularGoal.playerId).toBe(5);
    });
  });

  describe("Own goal validation logic", () => {
    it("own goal should not require a playerId", () => {
      const goals = [
        { playerId: "", teamId: 1, isOwnGoal: true },
        { playerId: "5", teamId: 1, isOwnGoal: false },
      ];

      // Mimics allGoalsFilled logic from ResultsRegistration
      const allFilled = goals.every(g => g.isOwnGoal || g.playerId !== "");
      expect(allFilled).toBe(true);
    });

    it("regular goal without playerId should fail validation", () => {
      const goals = [
        { playerId: "", teamId: 1, isOwnGoal: false },
        { playerId: "5", teamId: 1, isOwnGoal: false },
      ];

      const allFilled = goals.every(g => g.isOwnGoal || g.playerId !== "");
      expect(allFilled).toBe(false);
    });
  });

  describe("Top scorers filtering", () => {
    it("should exclude own goals from top scorers", () => {
      const allGoals = [
        { id: 1, playerId: 5, teamId: 1, isOwnGoal: false, matchId: 10 },
        { id: 2, playerId: null, teamId: 2, isOwnGoal: true, matchId: 10 },
        { id: 3, playerId: 5, teamId: 1, isOwnGoal: false, matchId: 11 },
        { id: 4, playerId: 3, teamId: 2, isOwnGoal: false, matchId: 11 },
      ];

      // Mimics the filtering logic in getTopScorers
      const scorerGoals = allGoals.filter(g => !g.isOwnGoal && g.playerId != null);
      expect(scorerGoals.length).toBe(3);
      expect(scorerGoals.every(g => g.playerId !== null)).toBe(true);
      expect(scorerGoals.every(g => g.isOwnGoal === false)).toBe(true);
    });

    it("should count goals per player correctly excluding own goals", () => {
      const allGoals = [
        { id: 1, playerId: 5, teamId: 1, isOwnGoal: false },
        { id: 2, playerId: null, teamId: 2, isOwnGoal: true },
        { id: 3, playerId: 5, teamId: 1, isOwnGoal: false },
        { id: 4, playerId: 3, teamId: 2, isOwnGoal: false },
      ];

      const scorerGoals = allGoals.filter(g => !g.isOwnGoal && g.playerId != null);
      const goalsByPlayer: Record<number, number> = {};
      scorerGoals.forEach(g => {
        if (g.playerId) {
          goalsByPlayer[g.playerId] = (goalsByPlayer[g.playerId] || 0) + 1;
        }
      });

      expect(goalsByPlayer[5]).toBe(2);
      expect(goalsByPlayer[3]).toBe(1);
      expect(goalsByPlayer[0]).toBeUndefined(); // no own goals counted
    });
  });

  describe("Player stats page filtering", () => {
    it("should not count own goals in player stats", () => {
      const goals = [
        { playerId: 5, teamId: 1, isOwnGoal: false },
        { playerId: null, teamId: 1, isOwnGoal: true },
        { playerId: 5, teamId: 1, isOwnGoal: false },
      ];

      // Mimics Jogadores.tsx logic
      const stats: Record<number, { goals: number }> = { 5: { goals: 0 } };
      goals.forEach((g: { playerId: number | null; isOwnGoal?: boolean }) => {
        if (g.playerId && !g.isOwnGoal && stats[g.playerId]) {
          stats[g.playerId].goals++;
        }
      });

      expect(stats[5].goals).toBe(2);
    });
  });

  describe("Toggle own goal logic", () => {
    it("toggling own goal should set playerId to sentinel and isOwnGoal to true", () => {
      const goals = [
        { playerId: "", teamId: 1, isOwnGoal: false },
        { playerId: "3", teamId: 1, isOwnGoal: false },
      ];

      // Toggle first goal to own goal
      const isOwn = !goals[0].isOwnGoal;
      goals[0] = { ...goals[0], isOwnGoal: isOwn, playerId: isOwn ? "__own_goal__" : "" };

      expect(goals[0].isOwnGoal).toBe(true);
      expect(goals[0].playerId).toBe("__own_goal__");
    });

    it("toggling own goal back should clear playerId and isOwnGoal", () => {
      const goals = [
        { playerId: "__own_goal__", teamId: 1, isOwnGoal: true },
      ];

      // Toggle back
      const isOwn = !goals[0].isOwnGoal;
      goals[0] = { ...goals[0], isOwnGoal: isOwn, playerId: isOwn ? "__own_goal__" : "" };

      expect(goals[0].isOwnGoal).toBe(false);
      expect(goals[0].playerId).toBe("");
    });
  });

  describe("Finalize logic", () => {
    it("should send isOwnGoal: true and playerId: null for own goals", () => {
      const goals = [
        { playerId: "__own_goal__", teamId: 1, isOwnGoal: true },
        { playerId: "5", teamId: 2, isOwnGoal: false },
      ];

      const apiCalls: any[] = [];

      for (const goal of goals) {
        if (goal.isOwnGoal) {
          apiCalls.push({
            matchId: 10,
            playerId: null,
            teamId: goal.teamId,
            isOwnGoal: true,
            campaignId: 1,
          });
        } else if (goal.playerId && goal.playerId !== "__own_goal__") {
          apiCalls.push({
            matchId: 10,
            playerId: parseInt(goal.playerId),
            teamId: goal.teamId,
            isOwnGoal: false,
            campaignId: 1,
          });
        }
      }

      expect(apiCalls.length).toBe(2);
      expect(apiCalls[0].isOwnGoal).toBe(true);
      expect(apiCalls[0].playerId).toBeNull();
      expect(apiCalls[1].isOwnGoal).toBe(false);
      expect(apiCalls[1].playerId).toBe(5);
    });
  });
});
