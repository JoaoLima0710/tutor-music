/**
 * Serviço de Notificações Personalizadas
 * Gera notificações contextuais baseadas no estado do usuário
 */

import { useGamificationStore } from '@/stores/useGamificationStore';
import { aiAssistantService } from './AIAssistantService';
import { toast } from 'sonner';

interface NotificationContext {
  streak?: number;
  dailyGoal?: number;
  dailyProgress?: number;
  weeklyChallenge?: {
    current: number;
    target: number;
    daysRemaining: number;
  };
  level?: number;
  xpToNextLevel?: number;
  currentXP?: number;
}

class NotificationService {
  private lastNotificationTime: Map<string, number> = new Map();
  private readonly COOLDOWN_MS = 3600000; // 1 hora entre notificações do mesmo tipo

  /**
   * Verifica e exibe notificações contextuais
   */
  async checkAndShowNotifications(): Promise<void> {
    try {
      const context = await this.getNotificationContext();
      
      // Verificar streak em risco
      await this.checkStreakWarning(context);
      
      // Verificar meta diária próxima
      await this.checkDailyGoalProgress(context);
      
      // Verificar desafio semanal
      await this.checkWeeklyChallenge(context);
      
      // Verificar próximo nível
      await this.checkLevelProgress(context);
    } catch (error) {
      console.error('Erro ao verificar notificações:', error);
    }
  }

  /**
   * Obtém o contexto atual do usuário
   */
  private async getNotificationContext(): Promise<NotificationContext> {
    // Importar dinamicamente para evitar problemas de circular dependency
    const { useGamificationStore } = await import('@/stores/useGamificationStore');
    const gamificationStore = useGamificationStore.getState();
    const userProfile = await aiAssistantService.getUserProfile();
    const practiceHistory = await aiAssistantService.getPracticeHistory(7); // Últimos 7 dias

    // Calcular progresso diário
    const today = new Date().toDateString();
    const todaySessions = practiceHistory.filter(s => 
      new Date(s.timestamp).toDateString() === today
    );
    const dailyProgress = todaySessions.reduce((acc, s) => acc + s.duration, 0) / 60; // minutos

    return {
      streak: gamificationStore.currentStreak,
      dailyGoal: userProfile.dailyGoalMinutes || 30,
      dailyProgress,
      level: gamificationStore.level,
      xpToNextLevel: gamificationStore.xpToNextLevel,
      currentXP: gamificationStore.xp
    };
  }

  /**
   * Verifica se o streak está em risco
   */
  private async checkStreakWarning(context: NotificationContext): Promise<void> {
    if (!context.streak || context.streak < 3) return;

    const key = 'streak-warning';
    if (this.isOnCooldown(key)) return;

    // Verificar se há prática hoje
    const today = new Date().toDateString();
    const practiceHistory = await aiAssistantService.getPracticeHistory(1);
    const hasPracticedToday = practiceHistory.some(s => 
      new Date(s.timestamp).toDateString() === today
    );

    if (!hasPracticedToday) {
      const hoursUntilMidnight = this.getHoursUntilMidnight();
      
      if (hoursUntilMidnight <= 24 && hoursUntilMidnight > 0) {
        this.showNotification(
          'streak-warning',
          `🔥 Atenção! Você está a ${Math.ceil(hoursUntilMidnight)} hora${Math.ceil(hoursUntilMidnight) > 1 ? 's' : ''} de perder seu streak de ${context.streak} dias!`,
          'Pratique agora para manter sua sequência!',
          'warning'
        );
      }
    }
  }

  /**
   * Verifica progresso da meta diária
   */
  private async checkDailyGoalProgress(context: NotificationContext): Promise<void> {
    if (!context.dailyGoal || !context.dailyProgress) return;

    const key = 'daily-goal-progress';
    if (this.isOnCooldown(key)) return;

    const progress = (context.dailyProgress / context.dailyGoal) * 100;
    const remaining = context.dailyGoal - context.dailyProgress;

    if (progress >= 50 && progress < 100 && remaining <= 10) {
      this.showNotification(
        'daily-goal-progress',
        `🎯 Falta apenas ${Math.ceil(remaining)} minuto${Math.ceil(remaining) > 1 ? 's' : ''} para bater sua meta diária!`,
        'Você está quase lá! Continue praticando.',
        'info'
      );
    } else if (progress >= 100) {
      this.showNotification(
        'daily-goal-complete',
        '🎉 Parabéns! Você completou sua meta diária!',
        `Você praticou ${Math.round(context.dailyProgress)} minutos hoje.`,
        'success'
      );
    }
  }

  /**
   * Verifica desafio semanal
   */
  private async checkWeeklyChallenge(context: NotificationContext): Promise<void> {
    // Implementar quando WeeklyChallengeCard estiver integrado
    // Por enquanto, apenas placeholder
  }

  /**
   * Verifica progresso para próximo nível
   */
  private async checkLevelProgress(context: NotificationContext): Promise<void> {
    if (!context.level || !context.xpToNextLevel || !context.currentXP) return;

    const key = 'level-progress';
    if (this.isOnCooldown(key)) return;

    const progress = (context.currentXP / context.xpToNextLevel) * 100;
    const remaining = context.xpToNextLevel - context.currentXP;

    if (progress >= 80 && remaining <= 50) {
      this.showNotification(
        'level-progress',
        `⭐ Você está a ${remaining} XP do nível ${(context.level || 0) + 1}!`,
        'Continue praticando para subir de nível!',
        'info'
      );
    }
  }

  /**
   * Exibe uma notificação
   */
  private showNotification(
    key: string,
    title: string,
    description: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): void {
    this.lastNotificationTime.set(key, Date.now());

    switch (type) {
      case 'success':
        toast.success(title, { description });
        break;
      case 'warning':
        toast.warning(title, { description });
        break;
      case 'error':
        toast.error(title, { description });
        break;
      default:
        toast.info(title, { description });
    }
  }

  /**
   * Verifica se uma notificação está em cooldown
   */
  private isOnCooldown(key: string): boolean {
    const lastTime = this.lastNotificationTime.get(key);
    if (!lastTime) return false;
    
    return Date.now() - lastTime < this.COOLDOWN_MS;
  }

  /**
   * Calcula horas até meia-noite
   */
  private getHoursUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return (midnight.getTime() - now.getTime()) / (1000 * 60 * 60);
  }

  /**
   * Notificação de novo desafio semanal
   */
  showWeeklyChallengeAvailable(): void {
    toast.info('🎯 Novo Desafio Semanal Disponível!', {
      description: 'Confira seu novo desafio na home e ganhe XP bônus!'
    });
  }

  /**
   * Notificação de conquista desbloqueada
   */
  showAchievementUnlocked(achievementName: string): void {
    toast.success('🏆 Conquista Desbloqueada!', {
      description: achievementName
    });
  }
}

export const notificationService = new NotificationService();
