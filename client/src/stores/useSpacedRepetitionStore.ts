/**
 * Store para gerenciar revisão espaçada (Algoritmo Anki)
 * Conteúdo dominado reaparece após intervalos crescentes
 * Integrado no Treino do Dia
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ReviewContentType = 'chord' | 'scale' | 'theory' | 'interval' | 'progression';

export interface SpacedRepetitionItem {
  contentId: string;
  contentType: ReviewContentType;
  name: string; // Nome amigável para exibição
  nextReviewDate: number; // Timestamp da próxima revisão
  interval: number; // Intervalo em dias
  easeFactor: number; // Fator de facilidade (SM-2)
  repetitions: number; // Número de repetições bem-sucedidas
  lastReviewDate?: number; // Última vez que foi revisado
  consecutiveFailures: number; // Falhas consecutivas
  masteredAt: number; // Quando foi dominado (timestamp)
}

interface SpacedRepetitionState {
  items: Record<string, SpacedRepetitionItem>; // Key: `${contentType}:${contentId}`
  
  // Adicionar item para revisão (quando dominado)
  addItem: (contentId: string, contentType: ReviewContentType, name: string) => void;
  
  // Processar revisão (algoritmo SM-2)
  processReview: (contentId: string, contentType: ReviewContentType, quality: number) => void;
  
  // Obter itens para revisão hoje
  getDueItems: () => SpacedRepetitionItem[];
  
  // Obter itens para revisão nos próximos N dias
  getUpcomingItems: (days: number) => SpacedRepetitionItem[];
  
  // Verificar se item está na fila de revisão
  isInQueue: (contentId: string, contentType: ReviewContentType) => boolean;
  
  // Remover item da fila (se não for mais necessário)
  removeItem: (contentId: string, contentType: ReviewContentType) => void;
  
  // Obter estatísticas
  getStats: () => {
    totalItems: number;
    dueToday: number;
    dueThisWeek: number;
    averageInterval: number;
  };
}

// Algoritmo SM-2 simplificado
const calculateNextInterval = (
  currentInterval: number,
  easeFactor: number,
  repetitions: number,
  quality: number
): { interval: number; easeFactor: number; repetitions: number } => {
  // Quality: 0-5 (0 = esqueceu completamente, 5 = lembrou perfeitamente)
  
  let newEaseFactor = easeFactor;
  let newInterval: number;
  let newRepetitions: number;
  
  // Ajustar ease factor baseado na qualidade
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, Math.min(2.5, newEaseFactor)); // Limitar entre 1.3 e 2.5
  
  if (quality < 3) {
    // Resposta incorreta - reiniciar
    newInterval = 1;
    newRepetitions = 0;
  } else {
    // Resposta correta
    if (repetitions === 0) {
      newInterval = 1; // Primeira revisão: amanhã
    } else if (repetitions === 1) {
      newInterval = 6; // Segunda revisão: 6 dias
    } else {
      newInterval = Math.round(currentInterval * newEaseFactor);
    }
    newRepetitions = repetitions + 1;
  }
  
  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: newRepetitions,
  };
};

export const useSpacedRepetitionStore = create<SpacedRepetitionState>()(
  persist(
    (set, get) => ({
      items: {},
      
      addItem: (contentId: string, contentType: ReviewContentType, name: string) => {
        const key = `${contentType}:${contentId}`;
        const state = get();
        
        // Se já existe, não adicionar novamente
        if (state.items[key]) {
          return;
        }
        
        const now = Date.now();
        const newItem: SpacedRepetitionItem = {
          contentId,
          contentType,
          name,
          nextReviewDate: now + 24 * 60 * 60 * 1000, // Primeira revisão: amanhã
          interval: 1,
          easeFactor: 2.5, // Ease factor inicial
          repetitions: 0,
          masteredAt: now,
          consecutiveFailures: 0,
        };
        
        set({
          items: {
            ...state.items,
            [key]: newItem,
          },
        });
      },
      
      processReview: (contentId: string, contentType: ReviewContentType, quality: number) => {
        const key = `${contentType}:${contentId}`;
        const state = get();
        const item = state.items[key];
        
        if (!item) {
          return;
        }
        
        const now = Date.now();
        const { interval: newInterval, easeFactor: newEaseFactor, repetitions: newRepetitions } =
          calculateNextInterval(item.interval, item.easeFactor, item.repetitions, quality);
        
        const newConsecutiveFailures = quality < 3 
          ? item.consecutiveFailures + 1 
          : 0;
        
        // Se falhou 3 vezes consecutivas, remover da fila (precisa re-dominar)
        if (newConsecutiveFailures >= 3) {
          const { [key]: removed, ...rest } = state.items;
          set({ items: rest });
          return;
        }
        
        const updatedItem: SpacedRepetitionItem = {
          ...item,
          nextReviewDate: now + newInterval * 24 * 60 * 60 * 1000,
          interval: newInterval,
          easeFactor: newEaseFactor,
          repetitions: newRepetitions,
          lastReviewDate: now,
          consecutiveFailures: newConsecutiveFailures,
        };
        
        set({
          items: {
            ...state.items,
            [key]: updatedItem,
          },
        });
      },
      
      getDueItems: () => {
        const state = get();
        const now = Date.now();
        
        return Object.values(state.items)
          .filter(item => item.nextReviewDate <= now)
          .sort((a, b) => a.nextReviewDate - b.nextReviewDate);
      },
      
      getUpcomingItems: (days: number) => {
        const state = get();
        const now = Date.now();
        const futureDate = now + days * 24 * 60 * 60 * 1000;
        
        return Object.values(state.items)
          .filter(item => item.nextReviewDate > now && item.nextReviewDate <= futureDate)
          .sort((a, b) => a.nextReviewDate - b.nextReviewDate);
      },
      
      isInQueue: (contentId: string, contentType: ReviewContentType) => {
        const key = `${contentType}:${contentId}`;
        return !!get().items[key];
      },
      
      removeItem: (contentId: string, contentType: ReviewContentType) => {
        const key = `${contentType}:${contentId}`;
        const state = get();
        const { [key]: removed, ...rest } = state.items;
        set({ items: rest });
      },
      
      getStats: () => {
        const state = get();
        const items = Object.values(state.items);
        const now = Date.now();
        const weekFromNow = now + 7 * 24 * 60 * 60 * 1000;
        
        const dueToday = items.filter(item => item.nextReviewDate <= now).length;
        const dueThisWeek = items.filter(
          item => item.nextReviewDate > now && item.nextReviewDate <= weekFromNow
        ).length;
        
        const averageInterval = items.length > 0
          ? items.reduce((sum, item) => sum + item.interval, 0) / items.length
          : 0;
        
        return {
          totalItems: items.length,
          dueToday,
          dueThisWeek,
          averageInterval: Math.round(averageInterval),
        };
      },
    }),
    {
      name: 'spaced-repetition-store',
      version: 1,
    }
  )
);
