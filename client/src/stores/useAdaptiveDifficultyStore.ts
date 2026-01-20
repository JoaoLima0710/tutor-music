/**
 * Store para gerenciar dificuldade adaptativa
 * Ajusta dificuldade baseado em performance do usuário
 * - Sugere revisão se falha repetidamente
 * - Sugere avançar se acerta facilmente
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
export type ContentType = 'theory' | 'chord' | 'scale' | 'song' | 'exercise';

interface PerformanceRecord {
  contentId: string;
  contentType: ContentType;
  difficulty: DifficultyLevel;
  accuracy: number; // 0-100
  timestamp: number;
  duration?: number; // segundos
}

interface ContentPerformance {
  contentId: string;
  contentType: ContentType;
  currentDifficulty: DifficultyLevel;
  attempts: number;
  recentAttempts: PerformanceRecord[]; // Últimas 10 tentativas
  averageAccuracy: number;
  consecutiveFailures: number; // Falhas consecutivas (< 70%)
  consecutiveSuccesses: number; // Sucessos consecutivos (>= 85%)
  lastAttempt?: number;
  suggestedDifficulty?: DifficultyLevel;
  needsReview: boolean; // Flag para revisão
  readyToAdvance: boolean; // Flag para avançar
}

interface AdaptiveDifficultyState {
  performanceHistory: PerformanceRecord[];
  contentPerformance: Record<string, ContentPerformance>;
  
  // Registrar tentativa
  recordAttempt: (
    contentId: string,
    contentType: ContentType,
    difficulty: DifficultyLevel,
    accuracy: number,
    duration?: number
  ) => void;
  
  // Obter dificuldade sugerida
  getSuggestedDifficulty: (contentId: string, contentType: ContentType) => DifficultyLevel;
  
  // Verificar se precisa revisão
  needsReview: (contentId: string, contentType: ContentType) => boolean;
  
  // Verificar se pode avançar
  canAdvance: (contentId: string, contentType: ContentType) => boolean;
  
  // Obter recomendações
  getRecommendations: () => {
    review: Array<{ contentId: string; contentType: ContentType; reason: string }>;
    advance: Array<{ contentId: string; contentType: ContentType; reason: string }>;
  };
  
  // Resetar dificuldade para um conteúdo
  resetDifficulty: (contentId: string, contentType: ContentType) => void;
}

// Limites para decisões adaptativas
const MIN_ACCURACY_FOR_SUCCESS = 85; // Acertos acima disso são considerados sucesso
const MAX_ACCURACY_FOR_FAILURE = 70; // Acertos abaixo disso são considerados falha
const CONSECUTIVE_FAILURES_THRESHOLD = 3; // 3 falhas consecutivas = precisa revisão
const CONSECUTIVE_SUCCESSES_THRESHOLD = 3; // 3 sucessos consecutivos = pode avançar
const MIN_ATTEMPTS_FOR_ADJUSTMENT = 3; // Mínimo de tentativas antes de ajustar

export const useAdaptiveDifficultyStore = create<AdaptiveDifficultyState>()(
  persist(
    (set, get) => ({
      performanceHistory: [],
      contentPerformance: {},
      
      recordAttempt: (
        contentId: string,
        contentType: ContentType,
        difficulty: DifficultyLevel,
        accuracy: number,
        duration?: number
      ) => {
        const state = get();
        const key = `${contentType}:${contentId}`;
        
        // Criar registro de performance
        const record: PerformanceRecord = {
          contentId,
          contentType,
          difficulty,
          accuracy,
          timestamp: Date.now(),
          duration,
        };
        
        // Adicionar ao histórico
        const newHistory = [...state.performanceHistory, record].slice(-100); // Manter últimas 100
        
        // Atualizar performance do conteúdo
        const current = state.contentPerformance[key] || {
          contentId,
          contentType,
          currentDifficulty: difficulty,
          attempts: 0,
          recentAttempts: [],
          averageAccuracy: 0,
          consecutiveFailures: 0,
          consecutiveSuccesses: 0,
          needsReview: false,
          readyToAdvance: false,
        };
        
        // Adicionar tentativa recente
        const newRecentAttempts = [...current.recentAttempts, record].slice(-10);
        
        // Calcular média de precisão
        const totalAccuracy = newRecentAttempts.reduce((sum, r) => sum + r.accuracy, 0);
        const newAverageAccuracy = totalAccuracy / newRecentAttempts.length;
        
        // Atualizar contadores consecutivos
        let newConsecutiveFailures = current.consecutiveFailures;
        let newConsecutiveSuccesses = current.consecutiveSuccesses;
        
        if (accuracy < MAX_ACCURACY_FOR_FAILURE) {
          newConsecutiveFailures = current.consecutiveFailures + 1;
          newConsecutiveSuccesses = 0;
        } else if (accuracy >= MIN_ACCURACY_FOR_SUCCESS) {
          newConsecutiveSuccesses = current.consecutiveSuccesses + 1;
          newConsecutiveFailures = 0;
        } else {
          // Resetar ambos se está no meio termo
          newConsecutiveFailures = 0;
          newConsecutiveSuccesses = 0;
        }
        
        // Calcular dificuldade sugerida
        let suggestedDifficulty: DifficultyLevel = current.currentDifficulty;
        
        if (newRecentAttempts.length >= MIN_ATTEMPTS_FOR_ADJUSTMENT) {
          if (newConsecutiveFailures >= CONSECUTIVE_FAILURES_THRESHOLD) {
            // Falhou repetidamente - sugerir dificuldade menor
            suggestedDifficulty = Math.max(1, (current.currentDifficulty - 1) as DifficultyLevel);
          } else if (newConsecutiveSuccesses >= CONSECUTIVE_SUCCESSES_THRESHOLD && newAverageAccuracy >= MIN_ACCURACY_FOR_SUCCESS) {
            // Acertou repetidamente - sugerir dificuldade maior
            suggestedDifficulty = Math.min(5, (current.currentDifficulty + 1) as DifficultyLevel);
          }
        }
        
        // Atualizar flags
        const needsReview = newConsecutiveFailures >= CONSECUTIVE_FAILURES_THRESHOLD;
        const readyToAdvance = newConsecutiveSuccesses >= CONSECUTIVE_SUCCESSES_THRESHOLD && newAverageAccuracy >= MIN_ACCURACY_FOR_SUCCESS;
        
        // Atualizar estado
        set({
          performanceHistory: newHistory,
          contentPerformance: {
            ...state.contentPerformance,
            [key]: {
              ...current,
              currentDifficulty: difficulty,
              attempts: current.attempts + 1,
              recentAttempts: newRecentAttempts,
              averageAccuracy: newAverageAccuracy,
              consecutiveFailures: newConsecutiveFailures,
              consecutiveSuccesses: newConsecutiveSuccesses,
              lastAttempt: Date.now(),
              suggestedDifficulty,
              needsReview,
              readyToAdvance,
            },
          },
        });
      },
      
      getSuggestedDifficulty: (contentId: string, contentType: ContentType) => {
        const state = get();
        const key = `${contentType}:${contentId}`;
        const performance = state.contentPerformance[key];
        
        if (!performance) {
          // Primeira tentativa - começar com dificuldade 2 (iniciante)
          return 2;
        }
        
        return performance.suggestedDifficulty || performance.currentDifficulty;
      },
      
      needsReview: (contentId: string, contentType: ContentType) => {
        const state = get();
        const key = `${contentType}:${contentId}`;
        const performance = state.contentPerformance[key];
        return performance?.needsReview || false;
      },
      
      canAdvance: (contentId: string, contentType: ContentType) => {
        const state = get();
        const key = `${contentType}:${contentId}`;
        const performance = state.contentPerformance[key];
        return performance?.readyToAdvance || false;
      },
      
      getRecommendations: () => {
        const state = get();
        const review: Array<{ contentId: string; contentType: ContentType; reason: string }> = [];
        const advance: Array<{ contentId: string; contentType: ContentType; reason: string }> = [];
        
        Object.values(state.contentPerformance).forEach(perf => {
          if (perf.needsReview && perf.attempts >= MIN_ATTEMPTS_FOR_ADJUSTMENT) {
            review.push({
              contentId: perf.contentId,
              contentType: perf.contentType,
              reason: `${perf.consecutiveFailures} tentativas consecutivas com precisão < ${MAX_ACCURACY_FOR_FAILURE}%`,
            });
          }
          
          if (perf.readyToAdvance && perf.attempts >= MIN_ATTEMPTS_FOR_ADJUSTMENT) {
            advance.push({
              contentId: perf.contentId,
              contentType: perf.contentType,
              reason: `${perf.consecutiveSuccesses} tentativas consecutivas com precisão ≥ ${MIN_ACCURACY_FOR_SUCCESS}%`,
            });
          }
        });
        
        return { review, advance };
      },
      
      resetDifficulty: (contentId: string, contentType: ContentType) => {
        const state = get();
        const key = `${contentType}:${contentId}`;
        
        set({
          contentPerformance: {
            ...state.contentPerformance,
            [key]: {
              ...state.contentPerformance[key],
              consecutiveFailures: 0,
              consecutiveSuccesses: 0,
              needsReview: false,
              readyToAdvance: false,
              suggestedDifficulty: undefined,
            },
          },
        });
      },
    }),
    {
      name: 'adaptive-difficulty-store',
      version: 1,
    }
  )
);
