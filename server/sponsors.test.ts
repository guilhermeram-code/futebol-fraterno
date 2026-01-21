import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as db from './db';

// Mock do banco de dados
vi.mock('./db', () => ({
  createSponsor: vi.fn(),
  updateSponsor: vi.fn(),
  deleteSponsor: vi.fn(),
  getAllSponsors: vi.fn(),
  getAllSponsorsAdmin: vi.fn(),
  getSponsorById: vi.fn(),
}));

describe('Sponsors Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSponsor', () => {
    it('should create a sponsor with required fields', async () => {
      const mockSponsor = {
        name: 'Patrocinador Teste',
        tier: 'A' as const,
        active: true,
      };
      
      (db.createSponsor as any).mockResolvedValue({ id: 1 });
      
      const result = await db.createSponsor(mockSponsor);
      
      expect(db.createSponsor).toHaveBeenCalledWith(mockSponsor);
      expect(result).toEqual({ id: 1 });
    });

    it('should create a sponsor with all fields', async () => {
      const mockSponsor = {
        name: 'Patrocinador Completo',
        tier: 'B' as const,
        logoUrl: 'https://example.com/logo.png',
        fileKey: 'sponsors/1/logo.png',
        link: 'https://patrocinador.com',
        description: 'Descrição do patrocinador',
        active: true,
      };
      
      (db.createSponsor as any).mockResolvedValue({ id: 2 });
      
      const result = await db.createSponsor(mockSponsor);
      
      expect(db.createSponsor).toHaveBeenCalledWith(mockSponsor);
      expect(result).toEqual({ id: 2 });
    });
  });

  describe('getAllSponsors', () => {
    it('should return only active sponsors', async () => {
      const mockSponsors = [
        { id: 1, name: 'Sponsor A', tier: 'A', active: true },
        { id: 2, name: 'Sponsor B', tier: 'B', active: true },
      ];
      
      (db.getAllSponsors as any).mockResolvedValue(mockSponsors);
      
      const result = await db.getAllSponsors();
      
      expect(result).toHaveLength(2);
      expect(result.every((s: any) => s.active)).toBe(true);
    });
  });

  describe('getAllSponsorsAdmin', () => {
    it('should return all sponsors including inactive', async () => {
      const mockSponsors = [
        { id: 1, name: 'Sponsor A', tier: 'A', active: true },
        { id: 2, name: 'Sponsor B', tier: 'B', active: false },
        { id: 3, name: 'Sponsor C', tier: 'C', active: true },
      ];
      
      (db.getAllSponsorsAdmin as any).mockResolvedValue(mockSponsors);
      
      const result = await db.getAllSponsorsAdmin();
      
      expect(result).toHaveLength(3);
    });
  });

  describe('updateSponsor', () => {
    it('should update sponsor tier', async () => {
      (db.updateSponsor as any).mockResolvedValue(undefined);
      
      await db.updateSponsor(1, { tier: 'A' });
      
      expect(db.updateSponsor).toHaveBeenCalledWith(1, { tier: 'A' });
    });

    it('should toggle sponsor active status', async () => {
      (db.updateSponsor as any).mockResolvedValue(undefined);
      
      await db.updateSponsor(1, { active: false });
      
      expect(db.updateSponsor).toHaveBeenCalledWith(1, { active: false });
    });
  });

  describe('deleteSponsor', () => {
    it('should delete a sponsor', async () => {
      (db.deleteSponsor as any).mockResolvedValue(undefined);
      
      await db.deleteSponsor(1);
      
      expect(db.deleteSponsor).toHaveBeenCalledWith(1);
    });
  });

  describe('Sponsor Tiers', () => {
    it('should support tier A (Principal)', async () => {
      const sponsor = { name: 'Principal', tier: 'A' as const, active: true };
      (db.createSponsor as any).mockResolvedValue({ id: 1 });
      
      await db.createSponsor(sponsor);
      
      expect(db.createSponsor).toHaveBeenCalledWith(expect.objectContaining({ tier: 'A' }));
    });

    it('should support tier B (Patrocinador)', async () => {
      const sponsor = { name: 'Patrocinador', tier: 'B' as const, active: true };
      (db.createSponsor as any).mockResolvedValue({ id: 2 });
      
      await db.createSponsor(sponsor);
      
      expect(db.createSponsor).toHaveBeenCalledWith(expect.objectContaining({ tier: 'B' }));
    });

    it('should support tier C (Apoiador)', async () => {
      const sponsor = { name: 'Apoiador', tier: 'C' as const, active: true };
      (db.createSponsor as any).mockResolvedValue({ id: 3 });
      
      await db.createSponsor(sponsor);
      
      expect(db.createSponsor).toHaveBeenCalledWith(expect.objectContaining({ tier: 'C' }));
    });
  });
});
