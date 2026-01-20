/**
 * Training Analyzer
 * Responsável por analisar o estudante e identificar áreas fortes/fracas
 */

import { useGamificationStore } from '@/stores/useGamificationStore';
import { aiAssistantService } from '../AIAssistantService';
import { TrainingAnalysis, TrainingModule } from './types';

export class TrainingAnalyzer {
  /**
   * Analisa o estudante baseado em histórico de prática
   */
  async analyzeStudent(): Promise<TrainingAnalysis> {
    const stats = useGamificationStore.getState();
    const aiAnalysis = await aiAssistantService.getInsights();
    
    // Analisar áreas fracas baseado em performance
    const weakAreas = await this.identifyWeakAreas();
    const strongAreas = await this.identifyStrongAreas();
    
    // Determinar estilo de aprendizagem
    const learningStyle = await this.determineLearningStyle();
    
    // Taxa de progressão
    const progressionRate = this.calculateProgressionRate();
    
    // Nível de motivação (baseado em streak e frequência)
    const motivationLevel = (stats as any).streak > 7 ? 'high' : (stats as any).streak > 3 ? 'medium' : 'low';
    
    return {
      weakAreas,
      strongAreas,
      suggestedFocus: weakAreas[0]?.area || 'Acordes',
      learningStyle,
      progressionRate,
      motivationLevel,
      pedagogicalRecommendations: this.generatePedagogicalRecommendations(weakAreas, learningStyle, motivationLevel),
    };
  }

  private async identifyWeakAreas(): Promise<Array<{ area: string; severity: number; recommendation: string }>> {
    // Analisar histórico de prática REAL
    const history = await aiAssistantService.getPracticeHistory();
    const weakAreasFromAI = await aiAssistantService.analyzeWeakAreas();
    
    if (weakAreasFromAI.length === 0 && history.length < 5) {
      // Se não há dados suficientes, retornar áreas padrão para iniciantes
      return [
        {
          area: 'Transições de Acordes',
          severity: 2,
          recommendation: 'Pratique transições específicas com metrônomo em velocidade reduzida',
        },
      ];
    }
    
    // Converter WeakArea[] do AIAssistantService para o formato esperado
    return weakAreasFromAI.map(weakArea => {
      // Mapear categoria para área específica
      let area = weakArea.category;
      let recommendation = '';
      
      // Gerar recomendações específicas baseadas na categoria e taxa de erro
      if (weakArea.category === 'Acordes') {
        if (weakArea.errorRate > 0.5) {
          recommendation = 'Foque em acordes básicos primeiro. Pratique cada acorde isoladamente antes de transições.';
        } else {
          recommendation = 'Pratique transições entre acordes comuns. Use metrônomo em velocidade reduzida.';
        }
      } else if (weakArea.category === 'Escalas') {
        recommendation = 'Pratique escalas lentamente com metrônomo. Foque em precisão antes de velocidade.';
      } else if (weakArea.category === 'Músicas') {
        recommendation = 'Divida a música em seções pequenas. Pratique cada seção até dominar antes de continuar.';
      } else if (weakArea.category === 'Treino de Ouvido') {
        recommendation = 'Pratique identificação de intervalos diariamente. Comece com intervalos maiores (5ª, 8ª).';
      } else {
        recommendation = `Continue praticando ${weakArea.category.toLowerCase()} regularmente para melhorar.`;
      }
      
      // Calcular severidade baseada em errorRate e tempo desde última prática
      const daysSinceLastPractice = (Date.now() - weakArea.lastPracticed) / (1000 * 60 * 60 * 24);
      const severity = Math.min(5, Math.round(
        (weakArea.errorRate * 3) + // 0-3 baseado em erro
        (Math.min(daysSinceLastPractice / 7, 2)) // 0-2 baseado em tempo
      ));
      
      return {
        area,
        severity: Math.max(1, severity),
        recommendation,
      };
    });
  }

  private async identifyStrongAreas(): Promise<Array<{ area: string; proficiency: number }>> {
    // Analisar histórico de prática REAL
    const history = await aiAssistantService.getPracticeHistory();
    const profile = await aiAssistantService.getUserProfile();
    
    if (history.length < 5) {
      // Se não há dados suficientes, retornar vazio
      return [];
    }
    
    // Agrupar por categoria e calcular média de precisão
    const categoryStats = new Map<string, number[]>();
    history.forEach(session => {
      const category = session.type;
      const accuracies = categoryStats.get(category) || [];
      accuracies.push(session.accuracy);
      categoryStats.set(category, accuracies);
    });
    
    const strongAreas: Array<{ area: string; proficiency: number }> = [];
    
    categoryStats.forEach((accuracies, category) => {
      const avgAccuracy = accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length;
      
      // Considerar área forte se média > 75% e pelo menos 3 sessões
      if (avgAccuracy > 75 && accuracies.length >= 3) {
        const categoryName = this.getCategoryName(category);
        strongAreas.push({
          area: categoryName,
          proficiency: Math.round(avgAccuracy),
        });
      }
    });
    
    // Também incluir áreas fortes do perfil do usuário
    profile.strongAreas.forEach(area => {
      if (!strongAreas.some(sa => sa.area === area)) {
        // Estimar proficiência baseada no perfil
        const proficiency = profile.averageAccuracy > 80 ? 85 : 75;
        strongAreas.push({ area, proficiency });
      }
    });
    
    return strongAreas.sort((a, b) => b.proficiency - a.proficiency);
  }
  
  private getCategoryName(type: string): string {
    const names: Record<string, string> = {
      'chord': 'Acordes',
      'scale': 'Escalas',
      'song': 'Músicas',
      'ear_training': 'Treino de Ouvido',
    };
    return names[type] || type;
  }

  private async determineLearningStyle(): Promise<'visual' | 'auditory' | 'kinesthetic' | 'mixed'> {
    // Analisar padrões de uso REAL baseado no histórico
    const history = await aiAssistantService.getPracticeHistory();
    
    if (history.length < 5) {
      return 'mixed'; // Padrão para iniciantes
    }
    
    // Analisar preferências baseadas em tipos de prática
    const recentSessions = history.slice(-10);
    
    // Contar tipos de prática
    const typeCount = new Map<string, number>();
    recentSessions.forEach(session => {
      typeCount.set(session.type, (typeCount.get(session.type) || 0) + 1);
    });
    
    // Visual: prefere escalas e teoria (diagramas visuais)
    const visualScore = (typeCount.get('scale') || 0) * 2;
    
    // Auditory: prefere treino de ouvido e músicas
    const auditoryScore = (typeCount.get('ear_training') || 0) * 2 + (typeCount.get('song') || 0);
    
    // Kinesthetic: prefere acordes e prática repetitiva
    const kinestheticScore = (typeCount.get('chord') || 0) * 2;
    
    // Determinar estilo dominante
    const maxScore = Math.max(visualScore, auditoryScore, kinestheticScore);
    
    if (maxScore === 0) {
      return 'mixed';
    }
    
    if (visualScore === maxScore && visualScore > 2) {
      return 'visual';
    }
    if (auditoryScore === maxScore && auditoryScore > 2) {
      return 'auditory';
    }
    if (kinestheticScore === maxScore && kinestheticScore > 2) {
      return 'kinesthetic';
    }
    
    return 'mixed';
  }

  private calculateProgressionRate(): 'slow' | 'steady' | 'fast' {
    const stats = useGamificationStore.getState();
    const practiceFrequency = (stats as any).streak || 0;
    
    if (practiceFrequency >= 14) return 'fast';
    if (practiceFrequency >= 7) return 'steady';
    return 'slow';
  }

  private generatePedagogicalRecommendations(
    weakAreas: Array<{ area: string; severity: number; recommendation: string }>,
    learningStyle: string,
    motivationLevel: string
  ): string[] {
    const recommendations: string[] = [];
    
    // Recomendações baseadas em áreas fracas
    weakAreas.forEach(weak => {
      recommendations.push(weak.recommendation);
    });
    
    // Recomendações baseadas em estilo de aprendizagem
    if (learningStyle === 'visual') {
      recommendations.push('Use diagramas de acordes e vídeos para reforçar aprendizado');
    } else if (learningStyle === 'auditory') {
      recommendations.push('Pratique com backing tracks e grave suas performances');
    } else if (learningStyle === 'kinesthetic') {
      recommendations.push('Foque em exercícios práticos e repetição física');
    }
    
    // Recomendações baseadas em motivação
    if (motivationLevel === 'low') {
      recommendations.push('Defina metas pequenas e celebre cada conquista');
      recommendations.push('Pratique músicas que você ama para manter motivação');
    } else if (motivationLevel === 'high') {
      recommendations.push('Desafie-se com técnicas mais avançadas');
      recommendations.push('Considere aprender teoria musical mais profunda');
    }
    
    return recommendations;
  }
}
