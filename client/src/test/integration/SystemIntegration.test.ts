import { describe, it, expect, beforeEach, vi } from 'vitest';
import { competenceSystem } from '@/services/CompetenceSystem';
import { recommendationEngine } from '@/services/RecommendationEngine';
import { chordMasterySystem } from '@/services/ChordMasterySystem';

describe('System Integration', () => {
  beforeEach(() => {
    // Reset all systems
    competenceSystem.resetCompetences();
    localStorage.clear();
  });





  describe('Progressive Learning Path', () => {
    it('should provide coherent learning progression', () => {
      // 1. Start with baseline assessment
      competenceSystem.recordEvent({
        competenceId: 'chord-formation',
        performance: 0.3, // Beginner level
        context: {
          difficulty: 2,
          exerciseType: 'assessment',
          duration: 300
        }
      });

      competenceSystem.recordEvent({
        competenceId: 'rhythmic-precision',
        performance: 0.4,
        context: {
          difficulty: 2,
          exerciseType: 'assessment',
          duration: 300
        }
      });

      // 2. Get initial recommendations
      const initialContext = {
        currentLevel: 1,
        availableTime: 15,
        preferredDifficulty: 'easy' as const,
        recentActivities: [],
        goals: ['learn_basics'],
        timeOfDay: 'morning' as const,
        dayOfWeek: 1
      };

      const initialRecommendation = recommendationEngine.getNextExerciseRecommendation(initialContext);
      expect(initialRecommendation).toBeDefined();
      expect(initialRecommendation!.difficulty).toBeLessThanOrEqual(3);

      // 3. Simulate progress
      competenceSystem.recordEvent({
        competenceId: 'chord-formation',
        performance: 0.7, // Improved
        context: {
          difficulty: 3,
          exerciseType: 'practice',
          duration: 300
        }
      });

      // 4. Get updated recommendations
      const progressContext = {
        ...initialContext,
        availableTime: 20,
        preferredDifficulty: 'medium' as const,
        recentActivities: [initialRecommendation!.id]
      };

      const progressRecommendation = recommendationEngine.getNextExerciseRecommendation(progressContext);
      expect(progressRecommendation).toBeDefined();

      // Should be different from initial or more challenging
      expect(progressRecommendation!.difficulty).toBeGreaterThanOrEqual(initialRecommendation!.difficulty);
    });

    it('should maintain learning streak and motivation', () => {
      // 1. Simulate consistent practice
      for (let i = 0; i < 5; i++) {
        competenceSystem.recordEvent({
          competenceId: 'chord-formation',
          performance: 0.6 + (i * 0.1), // Improving performance
          context: {
            difficulty: 3,
            exerciseType: 'daily_practice',
            duration: 300
          }
        });
      }

      // 2. Check if competence improved
      const stats = competenceSystem.getCompetenceStats('chord-formation');
      expect(stats!.currentProficiency).toBeGreaterThan(20);

      // 3. Verify no decay risk for recent practice
      expect(stats!.riskOfDecay).toBe(false);

      // 4. Get session recommendation for continued practice
      const sessionContext = {
        currentLevel: competenceSystem.getOverallLevel(),
        availableTime: 25,
        preferredDifficulty: 'medium' as const,
        recentActivities: [],
        goals: ['maintain_streak'],
        timeOfDay: 'evening' as const,
        dayOfWeek: 5
      };

      const session = recommendationEngine.getSessionRecommendation(sessionContext);
      expect(session.exercises.length).toBeGreaterThan(0);
      expect(session.totalDuration).toBeGreaterThan(0);
    });
  });

  describe('Cross-System Data Consistency', () => {
    it('should maintain consistent user level across systems', () => {
      // 1. Set competence data
      competenceSystem.recordEvent({
        competenceId: 'chord-formation',
        performance: 0.8,
        context: { difficulty: 3, exerciseType: 'practice', duration: 300 }
      });

      competenceSystem.recordEvent({
        competenceId: 'chord-transitions',
        performance: 0.7,
        context: { difficulty: 4, exerciseType: 'practice', duration: 300 }
      });

      const overallLevel = competenceSystem.getOverallLevel();

      // 2. Recommendations should consider this level
      const context = {
        currentLevel: overallLevel,
        availableTime: 20,
        preferredDifficulty: 'medium' as const,
        recentActivities: [],
        goals: [],
        timeOfDay: 'afternoon' as const,
        dayOfWeek: 2
      };

      const recommendation = recommendationEngine.getNextExerciseRecommendation(context);
      expect(recommendation).toBeDefined();

      // 3. Session should be appropriate for level
      const session = recommendationEngine.getSessionRecommendation(context);
      expect(session.estimatedDifficulty).toBeCloseTo(overallLevel, 1);
    });

    it('should handle data persistence across sessions', () => {
      // 1. Create some data
      competenceSystem.recordEvent({
        competenceId: 'chord-formation',
        performance: 0.75,
        context: { difficulty: 3, exerciseType: 'practice', duration: 300 }
      });

      chordMasterySystem.recordExerciseAttempt('C', 'identify_chord', {
        accuracy: 80,
        speed: 100,
        consistency: 90,
        duration: 5
      });

      // 2. Simulate app restart (data should persist)
      const savedCompetence = competenceSystem.getCompetenceStats('chord-formation');
      const savedChord = chordMasterySystem.getChordProgress('C');

      expect(savedCompetence).toBeDefined();
      expect(savedChord).toBeDefined();
      expect(savedCompetence!.currentProficiency).toBeGreaterThan(0);
      expect(savedChord!.overallProficiency).toBeGreaterThan(0);

      // 3. New recommendations should consider persisted data
      const context = {
        currentLevel: 2,
        availableTime: 15,
        preferredDifficulty: 'medium' as const,
        recentActivities: [],
        goals: ['continue_learning'],
        timeOfDay: 'morning' as const,
        dayOfWeek: 1
      };

      const recommendation = recommendationEngine.getNextExerciseRecommendation(context);
      expect(recommendation).toBeDefined();
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle missing data gracefully', () => {
      // Test with no competence data
      const context = {
        currentLevel: 1,
        availableTime: 15,
        preferredDifficulty: 'easy' as const,
        recentActivities: [],
        goals: [],
        timeOfDay: 'morning' as const,
        dayOfWeek: 1
      };

      const recommendation = recommendationEngine.getNextExerciseRecommendation(context);
      expect(recommendation).toBeDefined(); // Should still provide recommendation

      // Test with no chord data
      const chordsNeedingPractice = chordMasterySystem.getChordsNeedingPractice();
      expect(Array.isArray(chordsNeedingPractice)).toBe(true);
    });

    it('should recover from corrupted data', () => {
      // Simulate corrupted localStorage data
      (localStorage.getItem as any).mockReturnValueOnce('invalid json');

      // Systems should handle gracefully
      const stats = competenceSystem.getCompetenceStats('chord-formation');
      expect(stats).toBeNull();

      const progress = chordMasterySystem.getChordProgress('C');
      expect(progress).toBeNull();

      // Should still function
      competenceSystem.recordEvent({
        competenceId: 'chord-formation',
        performance: 0.5,
        context: { difficulty: 2, exerciseType: 'practice', duration: 300 }
      });

      const newStats = competenceSystem.getCompetenceStats('chord-formation');
      expect(newStats).toBeDefined();
    });

    it('should handle extreme performance values', () => {
      // Test perfect performance
      competenceSystem.recordEvent({
        competenceId: 'chord-formation',
        performance: 1.0,
        context: { difficulty: 5, exerciseType: 'practice', duration: 300 }
      });

      let stats = competenceSystem.getCompetenceStats('chord-formation');
      expect(stats!.currentProficiency).toBeLessThanOrEqual(100);

      // Test very poor performance
      competenceSystem.recordEvent({
        competenceId: 'chord-formation',
        performance: 0.0,
        context: { difficulty: 1, exerciseType: 'practice', duration: 300 }
      });

      stats = competenceSystem.getCompetenceStats('chord-formation');
      expect(stats!.currentProficiency).toBeGreaterThanOrEqual(0);

      // System should still function
      const recommendation = recommendationEngine.getNextExerciseRecommendation({
        currentLevel: 1,
        availableTime: 10,
        preferredDifficulty: 'easy' as const,
        recentActivities: [],
        goals: [],
        timeOfDay: 'morning' as const,
        dayOfWeek: 1
      });
      expect(recommendation).toBeDefined();
    });
  });
});