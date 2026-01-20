/**
 * Tipos e interfaces para o sistema de treino
 */

export interface TrainingModule {
  id: string;
  category: 'chords' | 'scales' | 'rhythm' | 'ear-training' | 'songs' | 'technique';
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5; // 1=Iniciante, 5=Avançado
  duration: number; // minutos
  prerequisites: string[]; // IDs de módulos anteriores
  skills: string[]; // Habilidades desenvolvidas
  methodology: string; // Abordagem pedagógica
  icon: string;
}

export interface DailyTraining {
  date: string;
  modules: TrainingModule[];
  totalDuration: number;
  focus: string; // Área de foco do dia
  rationale: string; // Por que esses treinos hoje
  pedagogicalApproach: string; // Metodologia aplicada
}

export interface TrainingAnalysis {
  weakAreas: Array<{ area: string; severity: number; recommendation: string }>;
  strongAreas: Array<{ area: string; proficiency: number }>;
  suggestedFocus: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  progressionRate: 'slow' | 'steady' | 'fast';
  motivationLevel: 'low' | 'medium' | 'high';
  pedagogicalRecommendations: string[];
}
