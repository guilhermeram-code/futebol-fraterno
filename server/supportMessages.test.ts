import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do módulo db
vi.mock('./db', () => ({
  createSupportMessage: vi.fn(),
  getSupportMessagesByTeam: vi.fn(),
  getAllSupportMessages: vi.fn(),
  getPendingSupportMessages: vi.fn(),
  approveSupportMessage: vi.fn(),
  deleteSupportMessage: vi.fn(),
}));

import * as db from './db';

describe('Support Messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSupportMessage', () => {
    it('should create a support message with required fields', async () => {
      const mockMessage = {
        teamId: 1,
        authorName: 'João Silva',
        message: 'Vamos time! Força e fé!',
      };
      
      vi.mocked(db.createSupportMessage).mockResolvedValue({ id: 1 });
      
      const result = await db.createSupportMessage(mockMessage);
      
      expect(db.createSupportMessage).toHaveBeenCalledWith(mockMessage);
      expect(result).toEqual({ id: 1 });
    });

    it('should create a support message with optional authorLodge', async () => {
      const mockMessage = {
        teamId: 1,
        authorName: 'João Silva',
        authorLodge: 'Loja União',
        message: 'Vamos time! Força e fé!',
      };
      
      vi.mocked(db.createSupportMessage).mockResolvedValue({ id: 2 });
      
      const result = await db.createSupportMessage(mockMessage);
      
      expect(db.createSupportMessage).toHaveBeenCalledWith(mockMessage);
      expect(result).toEqual({ id: 2 });
    });
  });

  describe('getSupportMessagesByTeam', () => {
    it('should return only approved messages for a team', async () => {
      const mockMessages = [
        { id: 1, teamId: 1, authorName: 'João', message: 'Força!', approved: true },
        { id: 2, teamId: 1, authorName: 'Maria', message: 'Vamos!', approved: true },
      ];
      
      vi.mocked(db.getSupportMessagesByTeam).mockResolvedValue(mockMessages as any);
      
      const result = await db.getSupportMessagesByTeam(1);
      
      expect(db.getSupportMessagesByTeam).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(2);
      expect(result.every((m: any) => m.approved)).toBe(true);
    });

    it('should return empty array if no approved messages', async () => {
      vi.mocked(db.getSupportMessagesByTeam).mockResolvedValue([]);
      
      const result = await db.getSupportMessagesByTeam(999);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('getPendingSupportMessages', () => {
    it('should return only pending messages', async () => {
      const mockMessages = [
        { id: 3, teamId: 1, authorName: 'Pedro', message: 'Pendente', approved: false },
      ];
      
      vi.mocked(db.getPendingSupportMessages).mockResolvedValue(mockMessages as any);
      
      const result = await db.getPendingSupportMessages();
      
      expect(db.getPendingSupportMessages).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].approved).toBe(false);
    });
  });

  describe('approveSupportMessage', () => {
    it('should approve a pending message', async () => {
      vi.mocked(db.approveSupportMessage).mockResolvedValue(undefined);
      
      await db.approveSupportMessage(1);
      
      expect(db.approveSupportMessage).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteSupportMessage', () => {
    it('should delete a message', async () => {
      vi.mocked(db.deleteSupportMessage).mockResolvedValue(undefined);
      
      await db.deleteSupportMessage(1);
      
      expect(db.deleteSupportMessage).toHaveBeenCalledWith(1);
    });
  });
});
