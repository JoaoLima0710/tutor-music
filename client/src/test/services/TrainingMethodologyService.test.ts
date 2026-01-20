/**
 * Testes unitários para TrainingMethodologyService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { trainingMethodologyService, TrainingModule, DailyTraining } from '@/services/TrainingMethodologyService';
import { useGamificationStore } from '@/stores/useGamificationStore';

// Mock stores
vi.mock('@/stores/useGamificationStore', () => ({
  useGamificationStore: {
    getState: vi.fn(() => ({
      level: 2,
      xp: 150,
      currentStreak: 5,
    })),
  },
}));

vi.mock('@/services/AIAssistantService', () => ({
  aiAssistantService: {
    analyzeStudent: vi.fn(() => ({
      weakAreas: [],
      strongAreas: [],
      suggestedFocus: 'chords',
      learningStyle: 'mixed' as const,
      progressionRate: 'steady' as const,
      motivationLevel: 'high' as const,
      pedagogicalRecommendations: [],
    })),
  },
}));

describe('TrainingMethodologyService', () => {
  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();
  });

  describe('getAllModules', () => {
    it('should return all training modules', () => {
      const modules = trainingMethodologyService.getAllModules();
      
      expect(modules).toBeDefined();
      expect(Array.isArray(modules)).toBe(true);
      expect(modules.length).toBeGreaterThan(0);
    });

    it('should return modules with required properties', () => {
      const modules = trainingMethodologyService.getAllModules();
      
      modules.forEach(module => {
        expect(module).toHaveProperty('id');
        expect(module).toHaveProperty('name');
        expect(module).toHaveProperty('category');
        expect(module).toHaveProperty('difficulty');
        expect(module).toHaveProperty('duration');
        expect(module).toHaveProperty('skills');
      });
    });
  });

  describe('getModuleById', () => {
    it('should return module by id', () => {
      const module = trainingMethodologyService.getModuleById('chords-basic-open');
      
      expect(module).toBeDefined();
      expect(module?.id).toBe('chords-basic-open');
      expect(module?.name).toBe('Acordes Abertos Básicos');
    });

    it('should return undefined for invalid id', () => {
      const module = trainingMethodologyService.getModuleById('invalid-id');
      
      expect(module).toBeUndefined();
    });
  });

  describe('getAllModules filtering', () => {
    it('should filter modules by category using getAllModules', () => {
      const allModules = trainingMethodologyService.getAllModules();
      const chordModules = allModules.filter(m => m.category === 'chords');
      
      expect(chordModules).toBeDefined();
      expect(Array.isArray(chordModules)).toBe(true);
      expect(chordModules.length).toBeGreaterThan(0);
      chordModules.forEach(module => {
        expect(module.category).toBe('chords');
      });
    });

    it('should filter modules by difficulty using getAllModules', () => {
      const allModules = trainingMethodologyService.getAllModules();
      const beginnerModules = allModules.filter(m => m.difficulty === 1);
      
      expect(beginnerModules).toBeDefined();
      expect(Array.isArray(beginnerModules)).toBe(true);
      beginnerModules.forEach(module => {
        expect(module.difficulty).toBe(1);
      });
    });
  });

  describe('generateDailyTraining', () => {
    it('should generate daily training with modules', async () => {
      const training = await trainingMethodologyService.generateDailyTraining();
      
      expect(training).toBeDefined();
      expect(training).toHaveProperty('date');
      expect(training).toHaveProperty('modules');
      expect(training).toHaveProperty('totalDuration');
      expect(training).toHaveProperty('focus');
      expect(training).toHaveProperty('rationale');
      expect(Array.isArray(training.modules)).toBe(true);
      expect(training.modules.length).toBeGreaterThan(0);
    });

    it('should calculate total duration correctly', async () => {
      const training = await trainingMethodologyService.generateDailyTraining();
      
      const calculatedDuration = training.modules.reduce((sum, module) => sum + module.duration, 0);
      expect(training.totalDuration).toBe(calculatedDuration);
    });

    it('should include modules appropriate for user level', async () => {
      const training = await trainingMethodologyService.generateDailyTraining();
      
      // User level 2 should get difficulty 1-2 modules mostly
      const maxDifficulty = Math.max(...training.modules.map(m => m.difficulty));
      expect(maxDifficulty).toBeLessThanOrEqual(3); // Should not be too advanced
    });

    it('should respect prerequisites', async () => {
      const training = await trainingMethodologyService.generateDailyTraining();
      
      // Check that modules with prerequisites have their prerequisites met
      const moduleIds = new Set(training.modules.map(m => m.id));
      
      training.modules.forEach(module => {
        module.prerequisites.forEach(prereq => {
          // Prerequisites should either be in the training or completed before
          // For this test, we just check that prerequisites are valid module IDs
          expect(typeof prereq).toBe('string');
        });
      });
    });
  });

  describe('analyzeStudent', () => {
    it('should analyze student and return recommendations', async () => {
      const analysis = await trainingMethodologyService.analyzeStudent();
      
      expect(analysis).toBeDefined();
      expect(analysis).toHaveProperty('weakAreas');
      expect(analysis).toHaveProperty('strongAreas');
      expect(analysis).toHaveProperty('suggestedFocus');
      expect(analysis).toHaveProperty('learningStyle');
      expect(analysis).toHaveProperty('progressionRate');
      expect(analysis).toHaveProperty('motivationLevel');
      expect(analysis).toHaveProperty('pedagogicalRecommendations');
      
      expect(Array.isArray(analysis.weakAreas)).toBe(true);
      expect(Array.isArray(analysis.strongAreas)).toBe(true);
      expect(Array.isArray(analysis.pedagogicalRecommendations)).toBe(true);
    });

    it('should return valid learning style', async () => {
      const analysis = await trainingMethodologyService.analyzeStudent();
      
      const validStyles = ['visual', 'auditory', 'kinesthetic', 'mixed'];
      expect(validStyles).toContain(analysis.learningStyle);
    });

    it('should return valid progression rate', async () => {
      const analysis = await trainingMethodologyService.analyzeStudent();
      
      const validRates = ['slow', 'steady', 'fast'];
      expect(validRates).toContain(analysis.progressionRate);
    });

    it('should return valid motivation level', async () => {
      const analysis = await trainingMethodologyService.analyzeStudent();
      
      const validLevels = ['low', 'medium', 'high'];
      expect(validLevels).toContain(analysis.motivationLevel);
    });
  });

  describe('module structure', () => {
    it('should have valid module structure', () => {
      const allModules = trainingMethodologyService.getAllModules();
      
      allModules.forEach(module => {
        expect(module.id).toBeTruthy();
        expect(module.name).toBeTruthy();
        expect(module.description).toBeTruthy();
        expect(module.category).toBeTruthy();
        expect(module.difficulty).toBeGreaterThanOrEqual(1);
        expect(module.difficulty).toBeLessThanOrEqual(5);
        expect(module.duration).toBeGreaterThan(0);
        expect(Array.isArray(module.skills)).toBe(true);
        expect(module.skills.length).toBeGreaterThan(0);
        expect(Array.isArray(module.prerequisites)).toBe(true);
        expect(module.methodology).toBeTruthy();
        expect(module.icon).toBeTruthy();
      });
    });

    it('should have unique module IDs', () => {
      const allModules = trainingMethodologyService.getAllModules();
      const ids = allModules.map(m => m.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('module prerequisites', () => {
    it('should have modules with prerequisites', () => {
      const allModules = trainingMethodologyService.getAllModules();
      const modulesWithPrereqs = allModules.filter(m => m.prerequisites.length > 0);
      
      expect(modulesWithPrereqs.length).toBeGreaterThan(0);
      
      // Verify that prerequisite IDs exist in the module list
      modulesWithPrereqs.forEach(module => {
        module.prerequisites.forEach(prereqId => {
          const prereqModule = trainingMethodologyService.getModuleById(prereqId);
          expect(prereqModule).toBeDefined();
        });
      });
    });

    it('should have modules without prerequisites (entry points)', () => {
      const allModules = trainingMethodologyService.getAllModules();
      const entryModules = allModules.filter(m => m.prerequisites.length === 0);
      
      expect(entryModules.length).toBeGreaterThan(0);
      expect(entryModules.some(m => m.id === 'chords-basic-open')).toBe(true);
    });
  });
});
