/**
 * 🎯 useScaleCompletion Hook
 * 
 * Hook de integração entre treino de escalas e sistema de gamificação
 * Orquestra XP, missões, conquistas e streak
 */

import { useScaleStore } from '../stores/useScaleStore';
import { findScaleById } from '../data/scales';

interface CompleteScaleParams {
  scaleId: string;
  accuracy: number;
  bpm: number;
  duration: number; // em segundos
  patternId?: string;
}

interface XPResult {
  baseXP: number;
  multipliers: {
    accuracy: number;
    speed: number;
    firstTime: number;
    perfect: number;
    streak: number;
  };
  totalXP: number;
}

export function useScaleCompletion() {
  const scaleStore = useScaleStore();
  
  /**
   * Calcular XP com multiplicadores
   */
  const calculateScaleXP = (
    scaleId: string,
    accuracy: number,
    bpm: number,
    isFirstTime: boolean,
    streak: number
  ): XPResult => {
    const scale = findScaleById(scaleId);
    if (!scale) {
      return {
        baseXP: 0,
        multipliers: { accuracy: 1, speed: 1, firstTime: 1, perfect: 1, streak: 1 },
        totalXP: 0,
      };
    }
    
    let xp = scale.xpReward;
    
    // Multiplicador de acurácia (50% a 100%)
    const accuracyMultiplier = Math.max(0.5, accuracy / 100);
    
    // Multiplicador de velocidade (BPM 60-180 → 1.0x-2.0x)
    const speedMultiplier = 1 + Math.min((bpm - 60) / 120, 1);
    
    // Bônus primeira vez
    const firstTimeMultiplier = isFirstTime ? 1.5 : 1;
    
    // Bônus perfect run
    const perfectMultiplier = accuracy === 100 ? 2 : 1;
    
    // Bônus streak (1-7 dias → 1.0x-1.5x)
    const streakMultiplier = 1 + Math.min(streak * 0.1, 0.5);
    
    const totalXP = Math.floor(
      xp * accuracyMultiplier * speedMultiplier * firstTimeMultiplier * perfectMultiplier * streakMultiplier
    );
    
    return {
      baseXP: xp,
      multipliers: {
        accuracy: accuracyMultiplier,
        speed: speedMultiplier,
        firstTime: firstTimeMultiplier,
        perfect: perfectMultiplier,
        streak: streakMultiplier,
      },
      totalXP,
    };
  };
  
  /**
   * Completar escala e integrar com gamificação
   */
  const completeScale = ({
    scaleId,
    accuracy,
    bpm,
    duration,
    patternId,
  }: CompleteScaleParams) => {
    const scale = findScaleById(scaleId);
    if (!scale) return;
    
    const isFirstTime = !scaleStore.completedScales.includes(scaleId);
    const isPerfect = accuracy === 100;
    
    // Calcular XP
    const xpResult = calculateScaleXP(
      scaleId,
      accuracy,
      bpm,
      isFirstTime,
      scaleStore.currentStreak
    );
    
    // Atualizar store de escalas
    scaleStore.completeScale(scaleId, accuracy, bpm, duration);
    
    // Adicionar sessão de prática ao histórico
    scaleStore.addPracticeSession({
      scaleId,
      patternId,
      accuracy,
      bpm,
      xp: xpResult.totalXP,
      timestamp: Date.now(),
      duration,
    });
    
    // TODO: Integrar com useGamificationStore quando implementado
    // useGamificationStore.getState().addXP(xpResult.totalXP);
    // useGamificationStore.getState().updateMissionProgress('daily-scale-practice', 1);
    
    // TODO: Verificar conquistas
    // checkScaleAchievements();
    
    // TODO: Atualizar leaderboard
    // updateLeaderboard();
    
    return {
      xp: xpResult.totalXP,
      xpBreakdown: xpResult,
      isFirstTime,
      isPerfect,
      newStreak: scaleStore.currentStreak,
    };
  };
  
  /**
   * Verificar se escala está desbloqueada
   */
  const isScaleUnlocked = (scaleId: string): boolean => {
    const scale = findScaleById(scaleId);
    if (!scale) return false;
    
    // Escalas de dificuldade 1-2 sempre desbloqueadas
    if (scale.difficulty <= 2) return true;
    
    // Escalas de dificuldade 3+ requerem completar 5 escalas
    if (scale.difficulty === 3) {
      return scaleStore.completedScales.length >= 5;
    }
    
    // Escalas de dificuldade 4+ requerem completar 10 escalas
    if (scale.difficulty === 4) {
      return scaleStore.completedScales.length >= 10;
    }
    
    // Escalas de dificuldade 5 requerem completar 15 escalas
    return scaleStore.completedScales.length >= 15;
  };
  
  /**
   * Obter progresso da escala
   */
  const getScaleProgress = (scaleId: string) => {
    return scaleStore.scaleProgress[scaleId] || null;
  };
  
  /**
   * Verificar se escala foi completada
   */
  const isScaleCompleted = (scaleId: string): boolean => {
    return scaleStore.completedScales.includes(scaleId);
  };
  
  /**
   * Obter estatísticas gerais
   */
  const getStats = () => {
    return {
      totalScalesPracticed: scaleStore.totalScalesPracticed,
      totalScaleTime: scaleStore.totalScaleTime,
      completedScales: scaleStore.completedScales.length,
      maxBPM: scaleStore.maxBPM,
      averageAccuracy: scaleStore.averageAccuracy,
      perfectScales: scaleStore.perfectScales.length,
      currentStreak: scaleStore.currentStreak,
      maxStreak: scaleStore.maxStreak,
      totalXP: scaleStore.totalScaleXP,
    };
  };
  
  return {
    completeScale,
    calculateScaleXP,
    isScaleUnlocked,
    getScaleProgress,
    isScaleCompleted,
    getStats,
  };
}

export default useScaleCompletion;
