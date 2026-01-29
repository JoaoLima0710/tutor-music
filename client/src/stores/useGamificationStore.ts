import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateXPForLevel } from '@/types/pedagogy';

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
  streakFreezes: number; // Freezes disponíveis
  frozenStreak: boolean; // Se o streak está congelado

  // Missões
  dailyMissions: Mission[];

  // Conquistas
  achievements: Achievement[];

  // Ações
  addXP: (amount: number) => void;
  updateMissionProgress: (missionId: string, progress: number) => void;
  unlockAchievement: (achievementId: string) => void;
  updateStreak: () => void;
  freezeStreak: () => void;
  repairStreak: () => void; // Reparar streak usando XP
  buyFreeze: () => void; // Comprar freeze usando XP
  resetDailyMissions: () => void;
}

const MISSION_POOL: Mission[] = [
  { id: 'chords-5', title: 'Praticar 5 Acordes', description: 'Toque 5 acordes diferentes', target: 5, current: 0, xpReward: 50, completed: false },
  { id: 'scales-3', title: 'Praticar 3 Escalas', description: 'Toque 3 escalas diferentes', target: 3, current: 0, xpReward: 50, completed: false },
  { id: 'time-15', title: '15 Minutos de Foco', description: 'Pratique por 15 minutos', target: 900, current: 0, xpReward: 100, completed: false },
  { id: 'perfect-quiz', title: 'Gênio do Quiz', description: 'Acerte 100% em um quiz', target: 1, current: 0, xpReward: 75, completed: false },
  { id: 'tune-guitar', title: 'Afinação Perfeita', description: 'Afine seu instrumento', target: 1, current: 0, xpReward: 25, completed: false },
  { id: 'lesson-1', title: 'Estudioso', description: 'Complete 1 lição', target: 1, current: 0, xpReward: 50, completed: false },
  { id: 'strumming-1', title: 'Mestre do Ritmo', description: 'Pratique ritmo por 5 minutos', target: 300, current: 0, xpReward: 50, completed: false },
  { id: 'ear-training-10', title: 'Ouvido Atento', description: 'Acerte 10 exercícios de ouvido', target: 10, current: 0, xpReward: 60, completed: false },
];

const getRandomMissions = (count: number): Mission[] => {
  // Simple shuffle
  const shuffled = [...MISSION_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(m => ({ ...m, current: 0, completed: false }));
};

const initialAchievements: Achievement[] = [
  // TÉCNICA - Iniciante
  {
    id: 'first-chord',
    title: 'Primeira Nota',
    description: 'Toque seu primeiro acorde corretamente',
    icon: '🎵',
    xpReward: 50,
    unlocked: false,
  },
  {
    id: 'basic-8-chords',
    title: 'Fundação Sólida',
    description: 'Domine os 8 acordes básicos (Em, Am, E, A, Dm, D, C, G)',
    icon: '🎸',
    xpReward: 200,
    unlocked: false,
  },
  {
    id: 'chord-changes-60',
    title: 'Dedos de Aço',
    description: 'Faça 60 trocas de acordes em 1 minuto',
    icon: '⚡',
    xpReward: 150,
    unlocked: false,
  },
  {
    id: 'first-barre',
    title: 'Pestana Perfeita',
    description: 'Toque o acorde F com pestana por 30 segundos sem zumbido',
    icon: '💪',
    xpReward: 250,
    unlocked: false,
  },
  {
    id: 'rhythm-master',
    title: 'Metrônomo Humano',
    description: 'Mantenha ritmo constante por 3 minutos sem erros',
    icon: '🥁',
    xpReward: 150,
    unlocked: false,
  },

  // TEORIA
  {
    id: 'theory-basics',
    title: 'Teórico Iniciante',
    description: 'Complete todas as lições de teoria básica',
    icon: '📖',
    xpReward: 100,
    unlocked: false,
  },
  {
    id: 'harmonic-field',
    title: 'Harmonia Desvendada',
    description: 'Entenda o campo harmônico de C maior',
    icon: '🔮',
    xpReward: 200,
    unlocked: false,
  },

  // PERCEPÇÃO AUDITIVA
  {
    id: 'ear-major-minor',
    title: 'Ouvido Iniciante',
    description: 'Identifique 20 acordes maiores/menores consecutivos',
    icon: '👂',
    xpReward: 150,
    unlocked: false,
  },
  {
    id: 'ear-intervals',
    title: 'Ouvido de Ouro',
    description: 'Identifique 50 intervalos corretamente',
    icon: '🏆',
    xpReward: 250,
    unlocked: false,
  },

  // REPERTÓRIO
  {
    id: 'first-song',
    title: 'Estreia Musical',
    description: 'Toque sua primeira música do início ao fim',
    icon: '🎤',
    xpReward: 200,
    unlocked: false,
  },
  {
    id: 'three-songs',
    title: 'Repertório Bronze',
    description: 'Domine 3 músicas completas',
    icon: '🥉',
    xpReward: 300,
    unlocked: false,
  },
  {
    id: 'ten-songs',
    title: 'Repertório Prata',
    description: 'Domine 10 músicas de memória',
    icon: '🥈',
    xpReward: 500,
    unlocked: false,
  },

  // ESCALAS
  {
    id: 'first-scale',
    title: 'Primeira Escala',
    description: 'Toque a escala pentatônica menor completa',
    icon: '⭐',
    xpReward: 100,
    unlocked: false,
  },
  {
    id: 'scale-speed',
    title: 'Velocista',
    description: 'Toque escala cromática a 120 BPM',
    icon: '🚀',
    xpReward: 200,
    unlocked: false,
  },

  // CONSISTÊNCIA
  {
    id: 'week-streak',
    title: 'Uma Semana de Foco',
    description: 'Pratique 7 dias seguidos',
    icon: '🔥',
    xpReward: 100,
    unlocked: false,
  },
  {
    id: 'month-streak',
    title: 'Mês Dedicado',
    description: 'Pratique 30 dias seguidos',
    icon: '🌟',
    xpReward: 500,
    unlocked: false,
  },
  {
    id: 'century-streak',
    title: 'Centenário',
    description: 'Pratique 100 dias seguidos',
    icon: '👑',
    xpReward: 1000,
    unlocked: false,
  },
  // NOVOS ACHIEVEMENTS SOCIAIS QUE FALTAVAM
  {
    id: 'early-bird',
    title: 'Madrugador',
    description: 'Pratique antes das 8h por 7 dias',
    icon: '🌅',
    xpReward: 100,
    unlocked: false,
  },
  {
    id: 'night-owl',
    title: 'Coruja',
    description: 'Pratique após 22h por 7 dias',
    icon: '🦉',
    xpReward: 100,
    unlocked: false,
  },
  {
    id: 'first-recording',
    title: 'Primeira Gravação',
    description: 'Grave sua primeira performance',
    icon: '🎙️',
    xpReward: 100,
    unlocked: false,
  },
  {
    id: 'level-intermediate',
    title: 'Intermediário',
    description: 'Alcance o nível intermediário',
    icon: '📈',
    xpReward: 500,
    unlocked: false,
  },
  {
    id: 'level-advanced',
    title: 'Avançado',
    description: 'Alcance o nível avançado',
    icon: '🎓',
    xpReward: 1000,
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
      streakFreezes: 3, // Iniciantes começam com 3
      frozenStreak: false,
      dailyMissions: getRandomMissions(3),
      achievements: initialAchievements,

      addXP: (amount) => {
        const state = get();
        let newXP = state.xp + amount;
        let newLevel = state.level;
        let xpForNext = state.xpToNextLevel;
        let leveledUp = false;

        // Verifica level up com a nova fórmula importada
        // ATENÇÃO: Se calculateXPForLevel mudou, precisamos recalcular
        // Se o usuário tinha 100 XP e era L1 (Next=150), agora com fórmula linear (Next=200).
        // A transição é suave.

        while (newXP >= xpForNext) {
          newXP -= xpForNext;
          newLevel++;
          xpForNext = calculateXPForLevel(newLevel);
          leveledUp = true;
        }

        set({
          xp: newXP,
          level: newLevel,
          xpToNextLevel: xpForNext,
        });

        // Feedback
        if (leveledUp) {
          import('@/services/HapticFeedbackService').then(({ hapticFeedbackService }) => {
            hapticFeedbackService.levelUp();
          });
          import('@/services/GamificationSoundService').then(({ gamificationSoundService }) => {
            gamificationSoundService.playSound('level_up', 0.15);
          });
        }
      },

      updateMissionProgress: (missionId, progress) => {
        set((state) => ({
          dailyMissions: state.dailyMissions.map((mission) => {
            if (mission.id === missionId && !mission.completed) {
              const newCurrent = Math.min(mission.current + progress, mission.target);
              const completed = newCurrent >= mission.target;

              if (completed && !mission.completed) {
                get().addXP(mission.xpReward);
                import('@/services/GamificationSoundService').then(({ gamificationSoundService }) => {
                  gamificationSoundService.playSound('mission_complete', 0.12);
                });
              }

              return { ...mission, current: newCurrent, completed };
            }
            return mission;
          }),
        }));
      },

      unlockAchievement: (achievementId) => {
        set((state) => {
          const achievement = state.achievements.find((a) => a.id === achievementId);
          if (!achievement || achievement.unlocked) return state;

          get().addXP(achievement.xpReward);

          import('@/services/GamificationSoundService').then(({ gamificationSoundService }) => {
            gamificationSoundService.playSound('achievement', 0.15);
          });

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

        if (lastActivity === today) return;

        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const daysSinceLastActivity = Math.floor(
          (Date.now() - new Date(lastActivity || yesterday).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (state.frozenStreak) {
          set({ frozenStreak: false });
        }

        if (lastActivity === yesterday || !lastActivity) {
          // Streak continua
          const newStreak = state.currentStreak + 1;
          set({
            currentStreak: newStreak,
            maxStreak: Math.max(state.maxStreak, newStreak),
            lastActivityDate: today,
          });

          if (newStreak === 7) get().unlockAchievement('week-streak');

        } else if (daysSinceLastActivity <= 2) {
          // "Decadência" para TODOS (Perdoa 1 dia de falta ao custo de -1 streak)
          // Isso é mais amigável que resetar tudo
          const newStreak = Math.max(0, state.currentStreak - 1);
          set({
            currentStreak: newStreak,
            lastActivityDate: today,
          });
        } else if (state.streakFreezes > 0) {
          // Usa Freeze automaticamente se tiver
          set({
            streakFreezes: state.streakFreezes - 1,
            frozenStreak: true, // Marca que usou freeze (visual feedback?)
            // Não atualiza data para hoje ainda, ou atualiza?
            // Se usou freeze, o streak é salvo do RESET. 
            // Mas o usuário entrou HOJE. Então o streak deve ser mantido ou incrementado?
            // Geralmente freeze impede reset. Se ele entrou hoje, ele MANTÉM o streak.
            lastActivityDate: today,
            // Não incrementa, mas não reseta?
            // Se ele entrou, ele praticou. Então ele deveria MANTER.
            // O freeze serve para cobrir os dias que faltaram?
            // Simplificação: Se tem freeze, gasta 1 e mantém o streak atual.
          });
        } else {
          // Reset
          set({
            currentStreak: 1,
            lastActivityDate: today,
          });
        }
      },

      freezeStreak: () => {
        const state = get();
        if (state.streakFreezes > 0) {
          set({
            streakFreezes: state.streakFreezes - 1,
            frozenStreak: true,
          });
        }
      },

      buyFreeze: () => {
        const state = get();
        const COST = 300;
        if (state.xp >= COST) {
          set({
            xp: state.xp - COST,
            streakFreezes: state.streakFreezes + 1
          });
        }
      },

      repairStreak: () => {
        const state = get();
        // Custo alto para reparar um streak perdido
        const COST = 500;

        // Só permite reparar se tiver XP suficiente
        if (state.xp >= COST) {
          // Lógica: Restaura o maxStreak como current? 
          // Ou restaura o streak anterior?
          // Como não guardamos o "streak antes de perder" no estado persistido (apenas maxStreak),
          // podemos restaurar o maxStreak se for razoável, ou apenas dar um boost.
          // Vamos assumir que ele quer recuperar o que tinha.
          // Para simplificar: Current = Max.
          set({
            xp: state.xp - COST,
            currentStreak: state.maxStreak,
            lastActivityDate: new Date().toDateString()
          });
        }
      },

      resetDailyMissions: () => {
        set({
          dailyMissions: getRandomMissions(3)
        });
      },
    }),
    {
      name: 'gamification-store',
      version: 2, // Bump version to force potential migration if needed, strictly creates new state structure usually
      // Zustand persist defaults to simple storage. Version migration needs 'migrate' function if drastic.
      // Since we just added fields/methods, it should be fine.
    }
  )
);
