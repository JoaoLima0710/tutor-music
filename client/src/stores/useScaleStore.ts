/**
 * 🎼 Scale Store
 * 
 * Gerenciamento de estado global para treino de escalas
 * Integrado com sistema de gamificação
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MusicalScale, FretboardPosition, ScalePattern } from '../data/scales';

// ===== INTERFACES =====

export interface ScaleProgress {
  scaleId: string;
  completedAt: number;
  bestAccuracy: number;
  bestBPM: number;
  timesCompleted: number;
  totalTimeSpent: number; // em segundos
}

export interface ScalePracticeSession {
  scaleId: string;
  patternId?: string;
  accuracy: number;
  bpm: number;
  xp: number;
  timestamp: number;
  duration: number; // em segundos
}

interface ScaleStore {
  // Estado de seleção
  selectedScale: MusicalScale | null;
  selectedPosition: FretboardPosition | null;
  selectedPattern: ScalePattern | null;
  practiceMode: 'listen' | 'play' | 'pattern';
  isPlaying: boolean;
  bpm: number;
  currentNote: string | null;
  
  // Progresso do usuário
  completedScales: string[];
  scaleProgress: Record<string, ScaleProgress>;
  practiceHistory: ScalePracticeSession[];
  
  // Estatísticas
  totalScalesPracticed: number;
  totalScaleTime: number;
  maxBPM: number;
  maxBPMScaleId: string;
  averageAccuracy: number;
  perfectScales: string[];
  
  // Streak
  currentStreak: number;
  maxStreak: number;
  lastPracticeDate: string;
  
  // XP
  totalScaleXP: number;
  
  // Ações de seleção
  selectScale: (scale: MusicalScale | null) => void;
  selectPosition: (position: FretboardPosition | null) => void;
  selectPattern: (pattern: ScalePattern | null) => void;
  setPracticeMode: (mode: 'listen' | 'play' | 'pattern') => void;
  togglePlayback: () => void;
  setBPM: (bpm: number) => void;
  setCurrentNote: (note: string | null) => void;
  
  // Ações de progresso
  completeScale: (scaleId: string, accuracy: number, bpm: number, duration: number) => void;
  addPracticeSession: (session: ScalePracticeSession) => void;
  updateStats: (stats: Partial<ScaleStore>) => void;
  
  // Ações de streak
  updateStreak: () => void;
  resetStreak: () => void;
  
  // Reset
  reset: () => void;
}

// ===== ESTADO INICIAL =====

const initialState = {
  selectedScale: null,
  selectedPosition: null,
  selectedPattern: null,
  practiceMode: 'listen' as const,
  isPlaying: false,
  bpm: 60,
  currentNote: null,
  completedScales: [],
  scaleProgress: {},
  practiceHistory: [],
  totalScalesPracticed: 0,
  totalScaleTime: 0,
  maxBPM: 0,
  maxBPMScaleId: '',
  averageAccuracy: 0,
  perfectScales: [],
  currentStreak: 0,
  maxStreak: 0,
  lastPracticeDate: '',
  totalScaleXP: 0,
};

// ===== STORE =====

export const useScaleStore = create<ScaleStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Ações de seleção
      selectScale: (scale) => set({ selectedScale: scale }),
      
      selectPosition: (position) => set({ selectedPosition: position }),
      
      selectPattern: (pattern) => set({ selectedPattern: pattern }),
      
      setPracticeMode: (mode) => set({ practiceMode: mode }),
      
      togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
      
      setBPM: (bpm) => set({ bpm: Math.max(40, Math.min(200, bpm)) }),
      
      setCurrentNote: (note) => set({ currentNote: note }),
      
      // Ações de progresso
      completeScale: (scaleId, accuracy, bpm, duration) => {
        const state = get();
        const isFirstTime = !state.completedScales.includes(scaleId);
        const isPerfect = accuracy === 100;
        
        // Atualizar progresso da escala
        const currentProgress = state.scaleProgress[scaleId] || {
          scaleId,
          completedAt: Date.now(),
          bestAccuracy: 0,
          bestBPM: 0,
          timesCompleted: 0,
          totalTimeSpent: 0,
        };
        
        const updatedProgress: ScaleProgress = {
          ...currentProgress,
          completedAt: Date.now(),
          bestAccuracy: Math.max(currentProgress.bestAccuracy, accuracy),
          bestBPM: Math.max(currentProgress.bestBPM, bpm),
          timesCompleted: currentProgress.timesCompleted + 1,
          totalTimeSpent: currentProgress.totalTimeSpent + duration,
        };
        
        // Atualizar escalas completadas
        const completedScales = isFirstTime
          ? [...state.completedScales, scaleId]
          : state.completedScales;
        
        // Atualizar escalas perfeitas
        const perfectScales = isPerfect && !state.perfectScales.includes(scaleId)
          ? [...state.perfectScales, scaleId]
          : state.perfectScales;
        
        // Atualizar BPM máximo
        const maxBPM = Math.max(state.maxBPM, bpm);
        const maxBPMScaleId = bpm > state.maxBPM ? scaleId : state.maxBPMScaleId;
        
        // Calcular acurácia média
        const totalSessions = state.practiceHistory.length + 1;
        const totalAccuracy = state.practiceHistory.reduce((sum, s) => sum + s.accuracy, 0) + accuracy;
        const averageAccuracy = Math.round(totalAccuracy / totalSessions);
        
        set({
          completedScales,
          scaleProgress: {
            ...state.scaleProgress,
            [scaleId]: updatedProgress,
          },
          perfectScales,
          totalScalesPracticed: state.totalScalesPracticed + 1,
          totalScaleTime: state.totalScaleTime + duration,
          maxBPM,
          maxBPMScaleId,
          averageAccuracy,
        });
        
        // Atualizar streak
        get().updateStreak();
        
        // Registrar para dificuldade adaptativa
        if (typeof window !== 'undefined') {
          import('@/stores/useAdaptiveDifficultyStore').then(({ useAdaptiveDifficultyStore }) => {
            const adaptiveStore = useAdaptiveDifficultyStore.getState();
            // Estimar dificuldade baseado no BPM (mais BPM = mais difícil)
            const difficulty = bpm < 60 ? 2 : bpm < 100 ? 3 : bpm < 140 ? 4 : 5;
            adaptiveStore.recordAttempt(scaleId, 'scale', difficulty as any, accuracy, duration);
          });
          
          // Verificar se escala foi dominada e adicionar à revisão espaçada
          if (updatedProgress.bestAccuracy >= 90 && updatedProgress.timesCompleted >= 5) {
            import('@/stores/useSpacedRepetitionStore').then(({ useSpacedRepetitionStore }) => {
              import('@/data/scales').then(({ findScaleById }) => {
                const spacedStore = useSpacedRepetitionStore.getState();
                if (!spacedStore.isInQueue(scaleId, 'scale')) {
                  // Obter nome da escala
                  const scale = findScaleById(scaleId);
                  const scaleName = scale?.name || scaleId;
                  spacedStore.addItem(scaleId, 'scale', scaleName);
                }
              });
            });
          }
        }
      },
      
      addPracticeSession: (session) => {
        set((state) => ({
          practiceHistory: [session, ...state.practiceHistory].slice(0, 100), // Manter últimas 100
          totalScaleXP: state.totalScaleXP + session.xp,
        }));
      },
      
      updateStats: (stats) => set(stats),
      
      // Ações de streak
      updateStreak: () => {
        const state = get();
        const today = new Date().toDateString();
        const lastPractice = state.lastPracticeDate;
        
        if (lastPractice === today) {
          // Já praticou hoje
          return;
        }
        
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (lastPractice === yesterday) {
          // Mantém streak
          const newStreak = state.currentStreak + 1;
          set({
            currentStreak: newStreak,
            maxStreak: Math.max(state.maxStreak, newStreak),
            lastPracticeDate: today,
          });
        } else {
          // Perdeu o streak
          set({
            currentStreak: 1,
            lastPracticeDate: today,
          });
        }
      },
      
      resetStreak: () => {
        set({
          currentStreak: 0,
          lastPracticeDate: '',
        });
      },
      
      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'scale-store',
      version: 1,
    }
  )
);

// ===== SELETORES =====

export const useSelectedScale = () => useScaleStore((state) => state.selectedScale);
export const useSelectedPosition = () => useScaleStore((state) => state.selectedPosition);
export const useSelectedPattern = () => useScaleStore((state) => state.selectedPattern);
export const usePracticeMode = () => useScaleStore((state) => state.practiceMode);
export const useIsPlaying = () => useScaleStore((state) => state.isPlaying);
export const useBPM = () => useScaleStore((state) => state.bpm);
export const useCompletedScales = () => useScaleStore((state) => state.completedScales);
export const useScaleProgress = (scaleId: string) => 
  useScaleStore((state) => state.scaleProgress[scaleId]);
export const useScaleStats = () => useScaleStore((state) => ({
  totalScalesPracticed: state.totalScalesPracticed,
  totalScaleTime: state.totalScaleTime,
  maxBPM: state.maxBPM,
  maxBPMScaleId: state.maxBPMScaleId,
  averageAccuracy: state.averageAccuracy,
  perfectScales: state.perfectScales,
  completedScales: state.completedScales,
  currentStreak: state.currentStreak,
  maxStreak: state.maxStreak,
  totalScaleXP: state.totalScaleXP,
}));

export default useScaleStore;
