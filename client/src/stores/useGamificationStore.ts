import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: number;
}

interface GamificationStore {
  // XP e Nível
  xp: number;
  level: number;
  xpToNextLevel: number;
  
  // Streak
  currentStreak: number;
  maxStreak: number;
  lastActivityDate: string;
  
  // Missões
  dailyMissions: Mission[];
  
  // Conquistas
  achievements: Achievement[];
  
  // Ações
  addXP: (amount: number) => void;
  updateMissionProgress: (missionId: string, progress: number) => void;
  unlockAchievement: (achievementId: string) => void;
  updateStreak: () => void;
  resetDailyMissions: () => void;
}

const calculateXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

const initialMissions: Mission[] = [
  {
    id: 'daily-chord-practice',
    title: 'Praticar 5 Acordes',
    description: 'Complete 5 acordes diferentes hoje',
    target: 5,
    current: 0,
    xpReward: 50,
    completed: false,
  },
  {
    id: 'daily-scale-practice',
    title: 'Praticar 3 Escalas',
    description: 'Complete 3 escalas diferentes hoje',
    target: 3,
    current: 0,
    xpReward: 50,
    completed: false,
  },
  {
    id: 'practice-time',
    title: '30 Minutos de Prática',
    description: 'Pratique por pelo menos 30 minutos',
    target: 1800,
    current: 0,
    xpReward: 100,
    completed: false,
  },
];

const initialAchievements: Achievement[] = [
  {
    id: 'first-chord',
    title: 'Primeira Nota',
    description: 'Complete seu primeiro acorde',
    icon: '🎵',
    xpReward: 50,
    unlocked: false,
  },
  {
    id: 'first-scale',
    title: 'Primeira Escala',
    description: 'Complete sua primeira escala',
    icon: '⭐',
    xpReward: 50,
    unlocked: false,
  },
  {
    id: 'chord-collector',
    title: 'Colecionador de Acordes',
    description: 'Complete 10 acordes diferentes',
    icon: '🎸',
    xpReward: 150,
    unlocked: false,
  },
  {
    id: 'scale-collector',
    title: 'Colecionador de Escalas',
    description: 'Complete 10 escalas diferentes',
    icon: '📚',
    xpReward: 150,
    unlocked: false,
  },
  {
    id: 'week-streak',
    title: 'Dedicado',
    description: 'Pratique 7 dias seguidos',
    icon: '🔥',
    xpReward: 100,
    unlocked: false,
  },
];

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      xpToNextLevel: 100,
      currentStreak: 0,
      maxStreak: 0,
      lastActivityDate: '',
      dailyMissions: initialMissions,
      achievements: initialAchievements,
      
      addXP: (amount) => {
        const state = get();
        let newXP = state.xp + amount;
        let newLevel = state.level;
        let xpForNext = state.xpToNextLevel;
        
        // Check level up
        while (newXP >= xpForNext) {
          newXP -= xpForNext;
          newLevel++;
          xpForNext = calculateXPForLevel(newLevel);
        }
        
        set({
          xp: newXP,
          level: newLevel,
          xpToNextLevel: xpForNext,
        });
      },
      
      updateMissionProgress: (missionId, progress) => {
        set((state) => ({
          dailyMissions: state.dailyMissions.map((mission) => {
            if (mission.id === missionId && !mission.completed) {
              const newCurrent = Math.min(mission.current + progress, mission.target);
              const completed = newCurrent >= mission.target;
              
              if (completed && !mission.completed) {
                // Award XP
                get().addXP(mission.xpReward);
              }
              
              return {
                ...mission,
                current: newCurrent,
                completed,
              };
            }
            return mission;
          }),
        }));
      },
      
      unlockAchievement: (achievementId) => {
        set((state) => {
          const achievement = state.achievements.find((a) => a.id === achievementId);
          if (!achievement || achievement.unlocked) return state;
          
          // Award XP
          get().addXP(achievement.xpReward);
          
          return {
            achievements: state.achievements.map((a) =>
              a.id === achievementId
                ? { ...a, unlocked: true, unlockedAt: Date.now() }
                : a
            ),
          };
        });
      },
      
      updateStreak: () => {
        const state = get();
        const today = new Date().toDateString();
        const lastActivity = state.lastActivityDate;
        
        if (lastActivity === today) {
          return;
        }
        
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (lastActivity === yesterday) {
          const newStreak = state.currentStreak + 1;
          set({
            currentStreak: newStreak,
            maxStreak: Math.max(state.maxStreak, newStreak),
            lastActivityDate: today,
          });
          
          // Check streak achievements
          if (newStreak === 7) {
            get().unlockAchievement('week-streak');
          }
        } else {
          set({
            currentStreak: 1,
            lastActivityDate: today,
          });
        }
      },
      
      resetDailyMissions: () => {
        set({
          dailyMissions: initialMissions.map((m) => ({ ...m, current: 0, completed: false })),
        });
      },
    }),
    {
      name: 'gamification-store',
      version: 1,
    }
  )
);
