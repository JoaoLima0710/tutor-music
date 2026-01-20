/**
 * Training Methodology Service
 * Orquestra a geração de treinos e análise de estudantes
 * Refatorado para usar módulos separados
 */

import { TrainingModule, DailyTraining, TrainingAnalysis } from './training/types';
import { getAllTrainingModules, getTrainingModuleById } from './training/TrainingModules';
import { TrainingAnalyzer } from './training/TrainingAnalyzer';
import { TrainingGenerator } from './training/TrainingGenerator';

// Re-exportar tipos para compatibilidade
export type { TrainingModule, DailyTraining, TrainingAnalysis };

class TrainingMethodologyService {
  private analyzer: TrainingAnalyzer;
  private generator: TrainingGenerator;

  constructor() {
    this.analyzer = new TrainingAnalyzer();
    this.generator = new TrainingGenerator();
  }

  /**
   * Gera treino do dia personalizado baseado em análise pedagógica
   */
  async generateDailyTraining(): Promise<DailyTraining> {
    const analysis = await this.analyzer.analyzeStudent();
    const availableModules = await this.generator.getAvailableModules();
    
    return this.generator.generateDailyTraining(analysis, availableModules);
  }

  /**
   * Analisa o estudante baseado em histórico de prática
   */
  async analyzeStudent(): Promise<TrainingAnalysis> {
    return this.analyzer.analyzeStudent();
  }

  /**
   * Obtém todos os módulos de treino
   */
  getAllModules(): TrainingModule[] {
    return getAllTrainingModules();
  }

  /**
   * Obtém um módulo por ID
   */
  getModuleById(id: string): TrainingModule | undefined {
    return getTrainingModuleById(id);
  }
}

export const trainingMethodologyService = new TrainingMethodologyService();
