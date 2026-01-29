import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useGamificationStore } from '../useGamificationStore';

// Mock dependencies
vi.mock('@/services/HapticFeedbackService', () => ({
    hapticFeedbackService: {
        levelUp: vi.fn(),
    },
}));

vi.mock('@/services/GamificationSoundService', () => ({
    gamificationSoundService: {
        playSound: vi.fn(),
    },
}));

describe('useGamificationStore', () => {
    beforeEach(() => {
        useGamificationStore.setState({
            xp: 0,
            level: 1,
            xpToNextLevel: 100, // Assuming calculateXPForLevel(1) is 100
            currentStreak: 0,
            maxStreak: 0,
            lastActivityDate: '',
            streakFreezes: 0,
            frozenStreak: false,
            dailyMissions: [
                { id: 'mission-1', title: 'Test Mission', description: 'Desc', target: 10, current: 0, xpReward: 50, completed: false }
            ],
            achievements: [
                { id: 'ach-1', title: 'Ach 1', description: 'Desc', icon: '', xpReward: 100, unlocked: false }
            ]
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with default state', () => {
        const state = useGamificationStore.getState();
        expect(state.xp).toBe(0);
        expect(state.level).toBe(1);
        expect(state.currentStreak).toBe(0);
    });

    it('should add XP and level up', () => {
        const store = useGamificationStore.getState();

        // Add 50 XP (no level up)
        store.addXP(50);
        expect(useGamificationStore.getState().xp).toBe(50);
        expect(useGamificationStore.getState().level).toBe(1);

        // Add 100 XP (level up: 50 + 100 = 150. Level 1 needs 100 total? Let's check logic)
        // Code: newXP = xp + amount. while (newXP >= xpForNext) { newXP -= xpForNext; level++; }
        // If xpToNextLevel starts at 100 for level 1.
        // 50 + 100 = 150. 150 >= 100 -> newXP = 50, level=2.
        // calculateXPForLevel(2) -> returns req for 2->3.
        useGamificationStore.getState().addXP(100);

        const newState = useGamificationStore.getState();
        expect(newState.level).toBe(2);
        expect(newState.xp).toBe(50); // Remainder
    });

    it('should update mission progress and reward XP on completion', () => {
        const store = useGamificationStore.getState();
        const missionId = 'mission-1';

        // Update progress (5/10)
        store.updateMissionProgress(missionId, 5);
        let mission = useGamificationStore.getState().dailyMissions.find(m => m.id === missionId);
        expect(mission?.current).toBe(5);
        expect(mission?.completed).toBe(false);
        expect(useGamificationStore.getState().xp).toBe(0);

        // Complete mission (10/10)
        store.updateMissionProgress(missionId, 5); // Add 5 more
        mission = useGamificationStore.getState().dailyMissions.find(m => m.id === missionId);
        expect(mission?.current).toBe(10);
        expect(mission?.completed).toBe(true);
        expect(useGamificationStore.getState().xp).toBe(50); // XP Reward
    });

    it('should unlock achievement and reward XP', () => {
        const store = useGamificationStore.getState();
        const achId = 'ach-1';

        store.unlockAchievement(achId);

        const achievement = useGamificationStore.getState().achievements.find(a => a.id === achId);
        expect(achievement?.unlocked).toBe(true);
        expect(useGamificationStore.getState().xp).toBe(100);
    });

    it('should update streak correctly', () => {
        const store = useGamificationStore.getState();

        // First update (today)
        store.updateStreak();
        expect(useGamificationStore.getState().currentStreak).toBe(1);
        expect(useGamificationStore.getState().lastActivityDate).toBe(new Date().toDateString());

        // Update again same day (should not increase)
        store.updateStreak();
        expect(useGamificationStore.getState().currentStreak).toBe(1);
    });

    it('should repair streak with sufficient XP', () => {
        useGamificationStore.setState({ xp: 600, maxStreak: 10, currentStreak: 0 });
        const store = useGamificationStore.getState();

        store.repairStreak();

        const newState = useGamificationStore.getState();
        expect(newState.currentStreak).toBe(10); // Restored to max
        expect(newState.xp).toBe(100); // 600 - 500 cost
    });

    it('should not repair streak without sufficient XP', () => {
        useGamificationStore.setState({ xp: 100, maxStreak: 10, currentStreak: 0 });
        const store = useGamificationStore.getState();

        store.repairStreak();

        const newState = useGamificationStore.getState();
        expect(newState.currentStreak).toBe(0);
        expect(newState.xp).toBe(100);
    });
});
