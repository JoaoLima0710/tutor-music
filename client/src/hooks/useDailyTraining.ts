/**
 * Custom hook para gerenciar treino diário
 * Extrai lógica de negócio do componente DailyTraining
 */

import { useState, useEffect, useCallback } from 'react';
import { trainingMethodologyService, DailyTraining as DailyTrainingType, TrainingModule } from '@/services/TrainingMethodologyService';

interface UseDailyTrainingReturn {
  dailyTraining: DailyTrainingType | null;
  loading: boolean;
  error: Error | null;
  completedModules: Set<string>;
  progress: number;
  markModuleComplete: (moduleId: string) => void;
  refreshTraining: () => Promise<void>;
  getModuleLink: (module: TrainingModule) => string;
}

export function useDailyTraining(): UseDailyTrainingReturn {
  const [dailyTraining, setDailyTraining] = useState<DailyTrainingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

  const loadDailyTraining = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const training = await trainingMethodologyService.generateDailyTraining();
      setDailyTraining(training);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao carregar treino do dia');
      setError(error);
      console.error('Erro ao carregar treino do dia:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDailyTraining();
  }, [loadDailyTraining]);

  const markModuleComplete = useCallback((moduleId: string) => {
    setCompletedModules(prev => new Set(prev).add(moduleId));
  }, []);

  const getModuleLink = useCallback((module: TrainingModule): string => {
    const linkMap: Record<string, string> = {
      'chords': '/chords',
      'scales': '/scales',
      'rhythm': '/practice',
      'ear-training': '/practice',
      'songs': '/songs',
      'technique': '/practice',
    };
    return linkMap[module.category] || '/practice';
  }, []);

  const progress = dailyTraining 
    ? (completedModules.size / dailyTraining.modules.length) * 100 
    : 0;

  return {
    dailyTraining,
    loading,
    error,
    completedModules,
    progress,
    markModuleComplete,
    refreshTraining: loadDailyTraining,
    getModuleLink,
  };
}
