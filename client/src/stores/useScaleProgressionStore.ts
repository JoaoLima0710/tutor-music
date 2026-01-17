import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ScaleProgress {
  scaleId: string;
  unlocked: boolean;
  mastered: boolean;
  practiceCount: number;
  bestAccuracy: number;
  lastPracticed: string | null;
}

interface ScaleProgressionState {
  scaleProgress: Record<string, ScaleProgress>;
  
  // Verificar se uma escala está desbloqueada
  isScaleUnlocked: (scaleId: string) => boolean;
  
  // Verificar se uma escala foi dominada
  isScaleMastered: (scaleId: string) => boolean;
  
  // Desbloquear uma escala
  unlockScale: (scaleId: string) => void;
  
  // Marcar escala como dominada
  masterScale: (scaleId: string) => void;
  
  // Registrar prática de escala
  recordPractice: (scaleId: string, accuracy: number) => void;
  
  // Obter progresso de uma escala
  getScaleProgress: (scaleId: string) => ScaleProgress;
  
  // Obter estatísticas gerais
  getStats: () => {
    totalUnlocked: number;
    totalMastered: number;
    totalPracticed: number;
    averageAccuracy: number;
  };
}

// Escalas inicialmente desbloqueadas (iniciantes)
const INITIAL_UNLOCKED_SCALES = [
  'c-major',
  'a-minor',
  'g-major',
  'e-minor',
];

// Requisitos de desbloqueio (escala -> escalas necessárias)
const UNLOCK_REQUIREMENTS: Record<string, string[]> = {
  // Intermediárias desbloqueiam após dominar 2 básicas
  'c-pentatonic': ['c-major', 'a-minor'],
  'a-blues': ['a-minor', 'e-minor'],
  
  // Modos gregos desbloqueiam após dominar pentatônicas
  'd-dorian': ['c-pentatonic'],
  'e-phrygian': ['a-blues'],
  'f-lydian': ['c-pentatonic'],
  'g-mixolydian': ['c-pentatonic', 'a-blues'],
  'a-aeolian': ['a-minor'], // Já é menor natural, fácil
  'b-locrian': ['d-dorian', 'e-phrygian'],
  
  // Exóticas desbloqueiam após dominar modos gregos
  'a-harmonic-minor': ['a-aeolian', 'd-dorian'],
  'a-melodic-minor': ['a-harmonic-minor'],
  'c-gypsy': ['a-harmonic-minor', 'e-phrygian'],
  'e-phrygian-dominant': ['e-phrygian', 'a-harmonic-minor'],
};

export const useScaleProgressionStore = create<ScaleProgressionState>()(
  persist(
    (set, get) => ({
      scaleProgress: {},
      
      isScaleUnlocked: (scaleId: string) => {
        // Escalas iniciais sempre desbloqueadas
        if (INITIAL_UNLOCKED_SCALES.includes(scaleId)) {
          return true;
        }
        
        const progress = get().scaleProgress[scaleId];
        if (progress?.unlocked) {
          return true;
        }
        
        // Verificar requisitos
        const requirements = UNLOCK_REQUIREMENTS[scaleId];
        if (!requirements) {
          return false; // Escala não tem requisitos definidos
        }
        
        // Verificar se todas as escalas necessárias foram dominadas
        return requirements.every(reqId => get().isScaleMastered(reqId));
      },
      
      isScaleMastered: (scaleId: string) => {
        const progress = get().scaleProgress[scaleId];
        return progress?.mastered || false;
      },
      
      unlockScale: (scaleId: string) => {
        set((state) => ({
          scaleProgress: {
            ...state.scaleProgress,
            [scaleId]: {
              ...state.scaleProgress[scaleId],
              scaleId,
              unlocked: true,
              mastered: false,
              practiceCount: state.scaleProgress[scaleId]?.practiceCount || 0,
              bestAccuracy: state.scaleProgress[scaleId]?.bestAccuracy || 0,
              lastPracticed: state.scaleProgress[scaleId]?.lastPracticed || null,
            },
          },
        }));
      },
      
      masterScale: (scaleId: string) => {
        set((state) => ({
          scaleProgress: {
            ...state.scaleProgress,
            [scaleId]: {
              ...state.scaleProgress[scaleId],
              scaleId,
              unlocked: true,
              mastered: true,
              practiceCount: state.scaleProgress[scaleId]?.practiceCount || 0,
              bestAccuracy: state.scaleProgress[scaleId]?.bestAccuracy || 0,
              lastPracticed: state.scaleProgress[scaleId]?.lastPracticed || null,
            },
          },
        }));
        
        // Verificar e desbloquear próximas escalas
        Object.keys(UNLOCK_REQUIREMENTS).forEach(nextScaleId => {
          if (get().isScaleUnlocked(nextScaleId) && !get().scaleProgress[nextScaleId]?.unlocked) {
            get().unlockScale(nextScaleId);
          }
        });
      },
      
      recordPractice: (scaleId: string, accuracy: number) => {
        set((state) => {
          const current = state.scaleProgress[scaleId] || {
            scaleId,
            unlocked: true,
            mastered: false,
            practiceCount: 0,
            bestAccuracy: 0,
            lastPracticed: null,
          };
          
          const newBestAccuracy = Math.max(current.bestAccuracy, accuracy);
          const newMastered = current.mastered || (newBestAccuracy >= 90 && current.practiceCount + 1 >= 5);
          
          return {
            scaleProgress: {
              ...state.scaleProgress,
              [scaleId]: {
                ...current,
                practiceCount: current.practiceCount + 1,
                bestAccuracy: newBestAccuracy,
                lastPracticed: new Date().toISOString(),
                mastered: newMastered,
              },
            },
          };
        });
        
        // Se dominou, desbloquear próximas
        if (get().isScaleMastered(scaleId)) {
          Object.keys(UNLOCK_REQUIREMENTS).forEach(nextScaleId => {
            if (get().isScaleUnlocked(nextScaleId) && !get().scaleProgress[nextScaleId]?.unlocked) {
              get().unlockScale(nextScaleId);
            }
          });
        }
      },
      
      getScaleProgress: (scaleId: string) => {
        return get().scaleProgress[scaleId] || {
          scaleId,
          unlocked: INITIAL_UNLOCKED_SCALES.includes(scaleId),
          mastered: false,
          practiceCount: 0,
          bestAccuracy: 0,
          lastPracticed: null,
        };
      },
      
      getStats: () => {
        const allProgress = Object.values(get().scaleProgress);
        const totalUnlocked = allProgress.filter(p => p.unlocked).length + INITIAL_UNLOCKED_SCALES.length;
        const totalMastered = allProgress.filter(p => p.mastered).length;
        const totalPracticed = allProgress.reduce((sum, p) => sum + p.practiceCount, 0);
        const averageAccuracy = allProgress.length > 0
          ? allProgress.reduce((sum, p) => sum + p.bestAccuracy, 0) / allProgress.length
          : 0;
        
        return {
          totalUnlocked,
          totalMastered,
          totalPracticed,
          averageAccuracy: Math.round(averageAccuracy),
        };
      },
    }),
    {
      name: 'scale-progression-storage',
    }
  )
);
