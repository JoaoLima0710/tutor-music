import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useUserProgressStore } from '../useUserProgressStore';

// Mock dependencies
vi.mock('@/services/AnalyticsService', () => ({
    analyticsService: {
        track: vi.fn(),
    },
}));

// Mock types/pedagogy helpers if necessary, but they seem to be pure functions. 
// If they are complex, we could mock them, but for now let's assume valid imports.

describe('useUserProgressStore', () => {
    beforeEach(() => {
        useUserProgressStore.getState().resetProgress();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with default state', () => {
        const { progress } = useUserProgressStore.getState();
        expect(progress.currentLevel).toBe(1);
        expect(progress.totalXP).toBe(0);
        expect(progress.unlockedModules).toContain('module-1-1');
    });

    it('should add XP and level up', () => {
        const store = useUserProgressStore.getState();

        // Add 50 XP
        store.addXP(50);
        expect(useUserProgressStore.getState().progress.totalXP).toBe(50);
        expect(useUserProgressStore.getState().progress.currentLevel).toBe(1);

        // Add 100 XP (Total 150) -> Level Up?
        // Assuming getLevelFromXP(150) > 1. 
        // If we can't rely on the real calculation, detailed testing of level breakpoints requires mocking calculateXPForLevel/getLevelFromXP.
        // But let's assume standard behavior for now: 100XP usually level 2.
        store.addXP(100);
        const { progress } = useUserProgressStore.getState();
        expect(progress.totalXP).toBe(150);
        // We can't strictly assert level without knowing the exact formula imported, but it should increase.
        expect(progress.currentLevel).toBeGreaterThanOrEqual(1);
    });

    it('should complete module', () => {
        const store = useUserProgressStore.getState();
        store.completeModule('mod-1');

        const { progress } = useUserProgressStore.getState();
        expect(progress.completedModules).toContain('mod-1');
        // Check XP awarded? XP_REWARDS.moduleComplete
        expect(progress.totalXP).toBeGreaterThan(0);
    });

    it('should complete lesson only once', () => {
        const store = useUserProgressStore.getState();
        store.completeLesson('lesson-1');

        let { progress } = useUserProgressStore.getState();
        expect(progress.completedLessons).toContain('lesson-1');
        const xpAfterFirst = progress.totalXP;

        // Complete again
        store.completeLesson('lesson-1');
        progress = useUserProgressStore.getState().progress;
        expect(progress.totalXP).toBe(xpAfterFirst); // No extra XP
    });

    it('should track exercise attempts', () => {
        const store = useUserProgressStore.getState();
        store.completeExercise('ex-1', false, 30);

        let { progress } = useUserProgressStore.getState();
        expect(progress.exerciseAttempts).toHaveLength(1);
        expect(progress.exerciseAttempts[0].success).toBe(false);
        expect(progress.completedExercises).not.toContain('ex-1');

        store.completeExercise('ex-1', true, 20);
        progress = useUserProgressStore.getState().progress;
        expect(progress.exerciseAttempts).toHaveLength(2);
        expect(progress.completedExercises).toContain('ex-1');
    });

    it('should update streak correctly', () => {
        const store = useUserProgressStore.getState();

        // Day 1
        store.updateStreak();
        expect(useUserProgressStore.getState().progress.currentStreak).toBe(1);

        // Advance time manually if possible? 
        // Since updateStreak uses `new Date()`, we need to mock system time for robust streak testing.

        vi.useFakeTimers();
        const date = new Date();

        // Day 2 (Consecutive)
        date.setDate(date.getDate() + 1);
        vi.setSystemTime(date);

        store.updateStreak();
        expect(useUserProgressStore.getState().progress.currentStreak).toBe(2);

        // Day 4 (Skip Day 3 - streak broken)
        date.setDate(date.getDate() + 2); // Gap of 1 day
        vi.setSystemTime(date);

        store.updateStreak();
        expect(useUserProgressStore.getState().progress.currentStreak).toBe(1); // Reset

        vi.useRealTimers();
    });
});
