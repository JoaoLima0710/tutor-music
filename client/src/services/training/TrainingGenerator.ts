/**
 * Training Generator
 * Responsável por gerar treinos diários personalizados
 */

import { aiAssistantService } from '../AIAssistantService';
import { TrainingModule, DailyTraining, TrainingAnalysis } from './types';
import { getAllTrainingModules } from './TrainingModules';

export class TrainingGenerator {
  /**
   * Gera treino do dia personalizado baseado em análise pedagógica
   */
  async generateDailyTraining(
    analysis: TrainingAnalysis,
    availableModules: TrainingModule[]
  ): Promise<DailyTraining> {
    // Selecionar módulos baseado em:
    // 1. Áreas fracas (60% do tempo)
    // 2. Revisão de áreas fortes (20% do tempo)
    // 3. Novo conteúdo (20% do tempo)
    
    const selectedModules: TrainingModule[] = [];
    let totalDuration = 0;
    const targetDuration = 45; // 45 minutos de treino diário
    
    // 1. Focar em áreas fracas
    const weakAreaModules = availableModules.filter(m => 
      this.moduleAddressesWeakness(m, analysis.weakAreas[0]?.area)
    );
    
    if (weakAreaModules.length > 0) {
      const priorityModule = weakAreaModules[0];
      selectedModules.push(priorityModule);
      totalDuration += priorityModule.duration;
    }
    
    // 2. Adicionar módulo de revisão
    const reviewModules = availableModules.filter(m => 
      analysis.strongAreas.some(s => m.category === s.area.toLowerCase())
    );
    
    if (reviewModules.length > 0 && totalDuration < targetDuration) {
      const reviewModule = reviewModules[Math.floor(Math.random() * reviewModules.length)];
      selectedModules.push(reviewModule);
      totalDuration += reviewModule.duration;
    }
    
    // 3. Adicionar novo conteúdo (se houver tempo)
    const newModules = availableModules.filter(m => 
      !selectedModules.includes(m) && totalDuration + m.duration <= targetDuration
    );
    
    if (newModules.length > 0) {
      const newModule = newModules[0];
      selectedModules.push(newModule);
      totalDuration += newModule.duration;
    }
    
    // Determinar foco do dia
    const focus = this.determineDailyFocus(analysis, selectedModules);
    
    return {
      date: new Date().toISOString().split('T')[0],
      modules: selectedModules,
      totalDuration,
      focus,
      rationale: this.generateRationale(analysis, selectedModules),
      pedagogicalApproach: this.describePedagogicalApproach(selectedModules),
    };
  }

  private moduleAddressesWeakness(module: TrainingModule, weakness: string | undefined): boolean {
    if (!weakness) return false;
    
    const weaknessMap: Record<string, string[]> = {
      'Transições de Acordes': ['chords-transitions', 'chords-basic-open'],
      'Ritmo': ['rhythm-basic-strumming', 'rhythm-fingerpicking'],
      'Escalas': ['scales-major-pentatonic', 'scales-minor-pentatonic'],
      'Treino de Ouvido': ['ear-intervals', 'ear-chords'],
    };
    
    return weaknessMap[weakness]?.includes(module.id) || false;
  }

  private determineDailyFocus(analysis: TrainingAnalysis, modules: TrainingModule[]): string {
    if (modules.length === 0) return 'Revisão Geral';
    
    const categories = modules.map(m => m.category);
    const mostCommon = categories.sort((a, b) =>
      categories.filter(c => c === a).length - categories.filter(c => c === b).length
    ).pop();
    
    const focusMap: Record<string, string> = {
      'chords': 'Domínio de Acordes',
      'scales': 'Escalas e Improvisação',
      'rhythm': 'Desenvolvimento Rítmico',
      'ear-training': 'Percepção Auditiva',
      'songs': 'Repertório Musical',
      'technique': 'Refinamento Técnico',
    };
    
    return focusMap[mostCommon || 'chords'];
  }

  private generateRationale(analysis: TrainingAnalysis, modules: TrainingModule[]): string {
    const weakArea = analysis.weakAreas[0];
    const focus = this.determineDailyFocus(analysis, modules);
    
    return `Hoje focamos em ${focus} porque sua análise mostra que ${weakArea?.area} precisa de atenção. ` +
           `Os exercícios selecionados seguem uma progressão pedagógica que desenvolve ${modules.map(m => m.skills[0]).join(', ')}. ` +
           `Com sua taxa de progressão ${analysis.progressionRate === 'fast' ? 'rápida' : analysis.progressionRate === 'steady' ? 'constante' : 'gradual'}, ` +
           `esses treinos são ideais para seu nível atual.`;
  }

  private describePedagogicalApproach(modules: TrainingModule[]): string {
    const approaches = modules.map(m => m.methodology);
    const unique = Array.from(new Set(approaches));
    
    return `Metodologia aplicada: ${unique.join('. ')}. ` +
           `Esta abordagem combina teoria e prática, garantindo desenvolvimento equilibrado de habilidades técnicas e musicais.`;
  }

  /**
   * Filtra módulos disponíveis baseado em pré-requisitos e nível do usuário
   */
  async getAvailableModules(): Promise<TrainingModule[]> {
    const profile = await aiAssistantService.getUserProfile();
    const history = await aiAssistantService.getPracticeHistory();
    const allModules = getAllTrainingModules();
    
    // Determinar nível máximo baseado no perfil e histórico
    let maxDifficulty = 1;
    
    if (profile.averageAccuracy > 80 && history.length > 20) {
      maxDifficulty = 3; // Intermediário
    } else if (profile.averageAccuracy > 70 && history.length > 10) {
      maxDifficulty = 2; // Iniciante avançado
    }
    
    // Se usuário está em nível avançado, permitir até dificuldade 5
    if (profile.level > 5 && profile.averageAccuracy > 85) {
      maxDifficulty = 5;
    }
    
    // Filtrar módulos por dificuldade e verificar pré-requisitos
    return allModules.filter(m => {
      // Verificar dificuldade
      if (m.difficulty > maxDifficulty) {
        return false;
      }
      
      // Verificar pré-requisitos baseado em histórico
      if (m.prerequisites.length > 0) {
        // Verificar se o usuário completou módulos pré-requisitos
        // Por enquanto, assumir que módulos básicos estão completos se há histórico suficiente
        if (history.length < 5 && m.prerequisites.length > 0) {
          return false; // Requer pré-requisitos mas não há histórico suficiente
        }
      }
      
      return true;
    });
  }
}
