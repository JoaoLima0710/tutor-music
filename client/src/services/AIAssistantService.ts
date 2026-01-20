/**
 * AI Assistant Service
 * Analisa histórico de prática e fornece recomendações personalizadas
 * Agora usa IndexedDB para suportar 1000+ sessões
 */

import { indexedDBService, PracticeSession as IndexedDBSession } from './IndexedDBService';

export interface PracticeSession {
  id: string;
  timestamp: number;
  type: 'chord' | 'scale' | 'song' | 'ear_training';
  itemId: string;
  itemName: string;
  duration: number; // segundos
  accuracy: number; // 0-100
  errors: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  // Campos contextuais adicionais para análise mais rica
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night'; // Hora do dia
  dayOfWeek?: number; // 0-6 (domingo-sábado)
  attempts?: number; // Número de tentativas nesta sessão
  pauses?: number; // Número de pausas durante a prática
  interactions?: number; // Número de interações com a UI (cliques, mudanças)
  emotionalState?: 'focused' | 'frustrated' | 'motivated' | 'tired' | 'excited'; // Estado emocional (opcional, pode ser inferido)
  deviceType?: 'desktop' | 'tablet' | 'mobile'; // Tipo de dispositivo
  audioFeedbackUsed?: boolean; // Se usou feedback de áudio em tempo real
  aiAssistanceUsed?: boolean; // Se consultou o assistente IA durante a prática
}

export interface WeakArea {
  category: string;
  items: string[];
  errorRate: number;
  lastPracticed: number;
  priority: number; // 1-10
}

export interface Recommendation {
  id: string;
  type: 'exercise' | 'song' | 'lesson' | 'review';
  title: string;
  description: string;
  reason: string;
  priority: number;
  estimatedTime: number; // minutos
  targetWeakArea: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface UserProfile {
  level: number;
  totalPracticeTime: number;
  averageAccuracy: number;
  strongAreas: string[];
  weakAreas: WeakArea[];
  learningPace: 'slow' | 'medium' | 'fast';
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
}

class AIAssistantService {
  private readonly STORAGE_KEY = 'musictutor_practice_history';
  private readonly PROFILE_KEY = 'musictutor_user_profile';
  private useIndexedDB = false;
  private migrationChecked = false;

  /**
   * Inicializa e verifica se deve usar IndexedDB
   */
  private async ensureInitialized(): Promise<void> {
    if (this.migrationChecked) {
      return;
    }

    try {
      // Tentar inicializar IndexedDB
      await indexedDBService.initialize();
      
      // Verificar se há dados no IndexedDB
      const count = await indexedDBService.getPracticeSessionCount();
      
      if (count > 0) {
        // Já está usando IndexedDB
        this.useIndexedDB = true;
      } else {
        // Migrar dados do localStorage se existirem
        const localData = localStorage.getItem(this.STORAGE_KEY);
        if (localData) {
          try {
            const sessions: PracticeSession[] = JSON.parse(localData);
            if (sessions.length > 0) {
              await indexedDBService.migrateFromLocalStorage();
              this.useIndexedDB = true;
              console.log('[AIAssistant] Migrado para IndexedDB');
            }
          } catch (error) {
            console.error('[AIAssistant] Erro na migração:', error);
          }
        }
      }
    } catch (error) {
      console.warn('[AIAssistant] IndexedDB não disponível, usando localStorage:', error);
      this.useIndexedDB = false;
    }

    this.migrationChecked = true;
  }

  /**
   * Salva sessão de prática com enriquecimento automático de contexto
   * Agora usa IndexedDB para suportar 1000+ sessões
   */
  async savePracticeSession(session: PracticeSession): Promise<void> {
    await this.ensureInitialized();
    // Enriquecer sessão com contexto automático se não fornecido
    const enrichedSession: PracticeSession = {
      ...session,
      // Garantir ID único
      id: session.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      // Adicionar timestamp se não fornecido
      timestamp: session.timestamp || Date.now(),
      // Adicionar hora do dia
      timeOfDay: session.timeOfDay || this.getTimeOfDay(),
      // Adicionar dia da semana
      dayOfWeek: session.dayOfWeek !== undefined ? session.dayOfWeek : new Date().getDay(),
      // Adicionar tipo de dispositivo (detectar do user agent)
      deviceType: session.deviceType || this.detectDeviceType(),
      // Valores padrão para campos opcionais
      attempts: session.attempts ?? 1,
      pauses: session.pauses ?? 0,
      interactions: session.interactions ?? 0,
      audioFeedbackUsed: session.audioFeedbackUsed ?? false,
      aiAssistanceUsed: session.aiAssistanceUsed ?? false,
    };
    
    if (this.useIndexedDB) {
      // Usar IndexedDB
      await indexedDBService.savePracticeSession(enrichedSession as IndexedDBSession);
      
      // Manter apenas últimas 1000 sessões (limpeza periódica)
      const count = await indexedDBService.getPracticeSessionCount();
      if (count > 1000) {
        await indexedDBService.keepRecentSessions(1000);
      }
    } else {
      // Fallback para localStorage
      const history = this.getPracticeHistorySync();
      history.push(enrichedSession);
      
      // Manter apenas últimas 100 sessões no localStorage
      if (history.length > 100) {
        const recent = history.slice(-100);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recent));
      } else {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
      }
    }
    
    // Atualizar perfil do usuário
    await this.updateUserProfile();
  }

  /**
   * Detecta hora do dia baseado no timestamp
   */
  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Detecta tipo de dispositivo baseado no user agent
   */
  private detectDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    if (typeof window === 'undefined') return 'desktop';
    
    const ua = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Obtém histórico de prática (versão assíncrona com IndexedDB)
   */
  async getPracticeHistory(limit?: number): Promise<PracticeSession[]> {
    await this.ensureInitialized();
    
    if (this.useIndexedDB) {
      return await indexedDBService.getPracticeSessions(limit);
    } else {
      return this.getPracticeHistorySync(limit);
    }
  }

  /**
   * Obtém histórico de prática (versão síncrona para compatibilidade)
   */
  getPracticeHistorySync(limit?: number): PracticeSession[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const history = data ? JSON.parse(data) : [];
    
    // Ordenar por timestamp descendente (mais recentes primeiro)
    const sorted = history.sort((a: PracticeSession, b: PracticeSession) => 
      b.timestamp - a.timestamp
    );
    
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Analisa áreas fracas do usuário com threshold adaptativo e detecção de tendências
   */
  async analyzeWeakAreas(): Promise<WeakArea[]> {
    const history = await this.getPracticeHistory();
    
    if (history.length < 5) {
      return [];
    }

    // Calcular threshold adaptativo baseado no perfil do usuário
    const profile = await this.getUserProfile();
    const adaptiveThreshold = this.calculateAdaptiveThreshold(profile, history);

    // Agrupar por categoria com análise de tendência
    const categoryStats = new Map<string, {
      total: number;
      errors: number;
      lastPracticed: number;
      items: Set<string>;
      recentAccuracy: number[]; // Últimas 5 sessões
      oldAccuracy: number[]; // Sessões anteriores
      trend: 'improving' | 'declining' | 'stable';
    }>();

    history.forEach((session, index) => {
      const category = session.type;
      const stats = categoryStats.get(category) || {
        total: 0,
        errors: 0,
        lastPracticed: 0,
        items: new Set(),
        recentAccuracy: [],
        oldAccuracy: [],
        trend: 'stable' as const,
      };

      stats.total++;
      stats.errors += (100 - session.accuracy) / 100;
      stats.lastPracticed = Math.max(stats.lastPracticed, session.timestamp);
      stats.items.add(session.itemName);

      // Separar em recente vs antigo para análise de tendência
      const isRecent = index >= history.length - 5;
      if (isRecent) {
        stats.recentAccuracy.push(session.accuracy);
      } else {
        stats.oldAccuracy.push(session.accuracy);
      }

      categoryStats.set(category, stats);
    });

    // Calcular tendências
    categoryStats.forEach((stats) => {
      if (stats.recentAccuracy.length >= 3 && stats.oldAccuracy.length >= 3) {
        const recentAvg = stats.recentAccuracy.reduce((a, b) => a + b, 0) / stats.recentAccuracy.length;
        const oldAvg = stats.oldAccuracy.reduce((a, b) => a + b, 0) / stats.oldAccuracy.length;
        const diff = recentAvg - oldAvg;
        
        if (diff > 5) {
          stats.trend = 'improving';
        } else if (diff < -5) {
          stats.trend = 'declining';
        } else {
          stats.trend = 'stable';
        }
      }
    });

    // Calcular áreas fracas com threshold adaptativo
    const weakAreas: WeakArea[] = [];
    
    categoryStats.forEach((stats, category) => {
      const errorRate = stats.errors / stats.total;
      const daysSinceLastPractice = (Date.now() - stats.lastPracticed) / (1000 * 60 * 60 * 24);
      
      // Usar threshold adaptativo ao invés de 30% fixo
      const effectiveThreshold = adaptiveThreshold;
      
      // Considerar área fraca se:
      // 1. Taxa de erro > threshold adaptativo
      // 2. Não praticou nos últimos 7 dias
      // 3. OU está em declínio (tendência negativa)
      const isWeakByError = errorRate > effectiveThreshold;
      const isWeakByTime = daysSinceLastPractice > 7;
      const isDeclining = stats.trend === 'declining' && errorRate > 0.2; // Mesmo com erro menor, se está piorando
      
      if (isWeakByError || isWeakByTime || isDeclining) {
        // Calcular prioridade considerando tendência
        let priority = Math.min(10, Math.round(errorRate * 10 + daysSinceLastPractice / 7));
        
        // Ajustar prioridade baseado em tendência
        if (stats.trend === 'declining') {
          priority += 2; // Prioridade maior se está piorando
        } else if (stats.trend === 'improving') {
          priority = Math.max(1, priority - 1); // Prioridade menor se está melhorando
        }
        
        weakAreas.push({
          category: this.getCategoryName(category),
          items: Array.from(stats.items),
          errorRate,
          lastPracticed: stats.lastPracticed,
          priority: Math.min(10, priority),
        });
      }
    });

    // Ordenar por prioridade
    return weakAreas.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calcula threshold adaptativo baseado no nível e histórico do usuário
   */
  private calculateAdaptiveThreshold(profile: UserProfile, history: PracticeSession[]): number {
    // Threshold base: 30%
    let threshold = 0.3;
    
    // Ajustar baseado no nível do usuário
    // Iniciantes: threshold mais alto (mais tolerante) - 40%
    // Intermediários: threshold médio - 30%
    // Avançados: threshold mais baixo (mais rigoroso) - 20%
    if (profile.level <= 2) {
      threshold = 0.4; // Iniciantes
    } else if (profile.level >= 5) {
      threshold = 0.2; // Avançados
    }
    
    // Ajustar baseado na precisão média
    // Se usuário tem alta precisão média, ser mais rigoroso
    if (profile.averageAccuracy > 85) {
      threshold = Math.max(0.15, threshold - 0.1);
    } else if (profile.averageAccuracy < 60) {
      threshold = Math.min(0.5, threshold + 0.1); // Mais tolerante
    }
    
    // Ajustar baseado na variabilidade (desvio padrão)
    if (history.length >= 10) {
      const accuracies = history.map(s => s.accuracy);
      const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
      const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length;
      const stdDev = Math.sqrt(variance);
      
      // Se há muita variabilidade, ser mais tolerante
      if (stdDev > 20) {
        threshold += 0.05;
      }
    }
    
    return Math.max(0.15, Math.min(0.5, threshold)); // Limitar entre 15% e 50%
  }

  /**
   * Gera recomendações personalizadas
   */
  async generateRecommendations(): Promise<Recommendation[]> {
    const profile = await this.getUserProfile();
    const weakAreas = await this.analyzeWeakAreas();
    const history = await this.getPracticeHistory();
    const recommendations: Recommendation[] = [];

    // 1. Recomendações baseadas em áreas fracas
    weakAreas.slice(0, 3).forEach((weakArea, index) => {
      recommendations.push({
        id: `weak_area_${index}`,
        type: 'exercise',
        title: `Fortalecer ${weakArea.category}`,
        description: `Pratique exercícios focados em ${weakArea.category} para melhorar sua precisão`,
        reason: `Você teve ${Math.round(weakArea.errorRate * 100)}% de erros nesta área`,
        priority: weakArea.priority,
        estimatedTime: 15,
        targetWeakArea: weakArea.category,
        difficulty: profile.preferredDifficulty,
      });
    });

    // 2. Recomendação de revisão (se não praticou recentemente)
    const daysSinceLastPractice = history.length > 0
      ? (Date.now() - history[history.length - 1].timestamp) / (1000 * 60 * 60 * 24)
      : 999;

    if (daysSinceLastPractice > 2) {
      recommendations.push({
        id: 'review_practice',
        type: 'review',
        title: 'Revisar Conteúdo Anterior',
        description: 'Revise o que você praticou anteriormente para consolidar o aprendizado',
        reason: `Você não pratica há ${Math.round(daysSinceLastPractice)} dias`,
        priority: Math.min(10, Math.round(daysSinceLastPractice)),
        estimatedTime: 20,
        targetWeakArea: 'Revisão Geral',
        difficulty: profile.preferredDifficulty,
      });
    }

    // 3. Recomendação de progressão (se está indo bem)
    if (profile.averageAccuracy > 80 && history.length > 10) {
      const nextDifficulty = profile.preferredDifficulty === 'beginner' ? 'intermediate' :
                             profile.preferredDifficulty === 'intermediate' ? 'advanced' : 'advanced';
      
      if (nextDifficulty !== profile.preferredDifficulty) {
        recommendations.push({
          id: 'level_up',
          type: 'lesson',
          title: 'Avançar para Próximo Nível',
          description: `Você está pronto para desafios de nível ${this.getDifficultyName(nextDifficulty)}`,
          reason: `Sua precisão média é de ${Math.round(profile.averageAccuracy)}%`,
          priority: 7,
          estimatedTime: 30,
          targetWeakArea: 'Progressão',
          difficulty: nextDifficulty,
        });
      }
    }

    // 4. Recomendação de variedade (se está focando muito em uma área)
    const recentSessions = history.slice(-10);
    const typeCount = new Map<string, number>();
    recentSessions.forEach(session => {
      typeCount.set(session.type, (typeCount.get(session.type) || 0) + 1);
    });

    const mostPracticedType = Array.from(typeCount.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (mostPracticedType && mostPracticedType[1] > 7) {
      const otherTypes = ['chord', 'scale', 'song', 'ear_training']
        .filter(t => t !== mostPracticedType[0]);
      const suggestedType = otherTypes[Math.floor(Math.random() * otherTypes.length)];

      recommendations.push({
        id: 'variety',
        type: 'exercise',
        title: `Praticar ${this.getCategoryName(suggestedType)}`,
        description: 'Varie seus treinos para um desenvolvimento mais equilibrado',
        reason: `Você tem focado muito em ${this.getCategoryName(mostPracticedType[0])}`,
        priority: 5,
        estimatedTime: 15,
        targetWeakArea: this.getCategoryName(suggestedType),
        difficulty: profile.preferredDifficulty,
      });
    }

    // 5. Recomendação de treino de ouvido (sempre importante)
    const earTrainingSessions = history.filter(s => s.type === 'ear_training');
    if (earTrainingSessions.length < history.length * 0.2) {
      recommendations.push({
        id: 'ear_training',
        type: 'exercise',
        title: 'Treino de Ouvido',
        description: 'Desenvolva seu ouvido musical com exercícios de intervalos e acordes',
        reason: 'Treino de ouvido é fundamental para qualquer músico',
        priority: 6,
        estimatedTime: 10,
        targetWeakArea: 'Percepção Musical',
        difficulty: profile.preferredDifficulty,
      });
    }

    // Ordenar por prioridade
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Atualiza perfil do usuário
   */
  private async updateUserProfile(): Promise<void> {
    const history = await this.getPracticeHistory();
    
    if (history.length === 0) {
      return;
    }

    // Calcular estatísticas
    const totalPracticeTime = history.reduce((sum, s) => sum + s.duration, 0);
    const averageAccuracy = history.reduce((sum, s) => sum + s.accuracy, 0) / history.length;
    
    // Determinar ritmo de aprendizado
    const recentSessions = history.slice(-10);
    const recentAccuracy = recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length;
    const improvementRate = recentAccuracy - averageAccuracy;
    
    const learningPace: 'slow' | 'medium' | 'fast' = 
      improvementRate > 5 ? 'fast' :
      improvementRate > 0 ? 'medium' : 'slow';

    // Determinar dificuldade preferida
    const difficultyCount = new Map<string, number>();
    history.forEach(s => {
      difficultyCount.set(s.difficulty, (difficultyCount.get(s.difficulty) || 0) + 1);
    });
    
    const preferredDifficulty = Array.from(difficultyCount.entries())
      .sort((a, b) => b[1] - a[1])[0][0] as 'beginner' | 'intermediate' | 'advanced';

    // Identificar áreas fortes
    const categoryAccuracy = new Map<string, number[]>();
    history.forEach(s => {
      const accuracies = categoryAccuracy.get(s.type) || [];
      accuracies.push(s.accuracy);
      categoryAccuracy.set(s.type, accuracies);
    });

    const strongAreas: string[] = [];
    categoryAccuracy.forEach((accuracies, category) => {
      const avg = accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length;
      if (avg > 80) {
        strongAreas.push(this.getCategoryName(category));
      }
    });

    const profile: UserProfile = {
      level: Math.floor(totalPracticeTime / 3600) + 1, // 1 nível por hora
      totalPracticeTime,
      averageAccuracy,
      strongAreas,
      weakAreas: await this.analyzeWeakAreas(),
      learningPace,
      preferredDifficulty,
    };

    // Salvar no IndexedDB se disponível
    if (this.useIndexedDB) {
      try {
        await indexedDBService.saveUserProfile('default', profile);
      } catch (error) {
        console.error('[AIAssistant] Erro ao salvar perfil no IndexedDB:', error);
      }
    }
    
    // Também salvar no localStorage como backup
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
  }

  /**
   * Obtém perfil do usuário
   */
  async getUserProfile(): Promise<UserProfile> {
    await this.ensureInitialized();
    
    // Tentar IndexedDB primeiro
    if (this.useIndexedDB) {
      try {
        const profile = await indexedDBService.getUserProfile('default');
        if (profile) {
          return profile as UserProfile;
        }
      } catch (error) {
        console.error('[AIAssistant] Erro ao ler perfil do IndexedDB:', error);
      }
    }
    
    // Fallback para localStorage
    const data = localStorage.getItem(this.PROFILE_KEY);
    
    if (data) {
      return JSON.parse(data);
    }

    // Perfil padrão
    return {
      level: 1,
      totalPracticeTime: 0,
      averageAccuracy: 0,
      strongAreas: [],
      weakAreas: [],
      learningPace: 'medium',
      preferredDifficulty: 'beginner',
    };
  }

  /**
   * Obtém insights personalizados
   */
  async getInsights(): Promise<string[]> {
    const profile = await this.getUserProfile();
    const history = await this.getPracticeHistory();
    const insights: string[] = [];

    // Insight sobre consistência
    if (history.length > 0) {
      const daysSinceLastPractice = (Date.now() - history[history.length - 1].timestamp) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastPractice < 1) {
        insights.push('🔥 Ótimo! Você está mantendo uma prática consistente!');
      } else if (daysSinceLastPractice > 3) {
        insights.push('⏰ Tente praticar com mais frequência para melhores resultados');
      }
    }

    // Insight sobre precisão
    if (profile.averageAccuracy > 85) {
      insights.push('🎯 Sua precisão está excelente! Considere aumentar a dificuldade');
    } else if (profile.averageAccuracy < 60) {
      insights.push('💪 Continue praticando! A consistência traz melhoria');
    }

    // Insight sobre áreas fortes
    if (profile.strongAreas.length > 0) {
      insights.push(`✨ Você está se destacando em: ${profile.strongAreas.join(', ')}`);
    }

    // Insight sobre ritmo de aprendizado
    if (profile.learningPace === 'fast') {
      insights.push('🚀 Você está progredindo rapidamente! Continue assim!');
    }

    // Insight sobre tempo de prática
    const hoursToday = history
      .filter(s => Date.now() - s.timestamp < 24 * 60 * 60 * 1000)
      .reduce((sum, s) => sum + s.duration, 0) / 3600;

    if (hoursToday > 1) {
      insights.push(`⏱️ Você já praticou ${hoursToday.toFixed(1)}h hoje!`);
    }

    return insights;
  }

  /**
   * Helpers
   */
  private getCategoryName(type: string): string {
    const names: Record<string, string> = {
      'chord': 'Acordes',
      'scale': 'Escalas',
      'song': 'Músicas',
      'ear_training': 'Treino de Ouvido',
    };
    return names[type] || type;
  }

  private getDifficultyName(difficulty: string): string {
    const names: Record<string, string> = {
      'beginner': 'Iniciante',
      'intermediate': 'Intermediário',
      'advanced': 'Avançado',
    };
    return names[difficulty] || difficulty;
  }

  /**
   * Limpa histórico (para testes)
   */
  clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.PROFILE_KEY);
  }
}

export const aiAssistantService = new AIAssistantService();
