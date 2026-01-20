/**
 * Definição de Módulos de Treino
 * Contém todos os módulos disponíveis no sistema
 */

import { TrainingModule } from './types';

/**
 * Lista completa de módulos de treino disponíveis
 */
export const trainingModules: TrainingModule[] = [
  // ACORDES - Progressão Gradual
  {
    id: 'chords-basic-open',
    category: 'chords',
    name: 'Acordes Abertos Básicos',
    description: 'Domine os 7 acordes fundamentais (C, D, E, G, A, Am, Em)',
    difficulty: 1,
    duration: 15,
    prerequisites: [],
    skills: ['Posicionamento de dedos', 'Transição entre acordes', 'Memória muscular'],
    methodology: 'Prática repetitiva com feedback visual. Foco em precisão antes de velocidade.',
    icon: '🎸',
  },
  {
    id: 'chords-transitions',
    category: 'chords',
    name: 'Transições Suaves',
    description: 'Treine mudanças rápidas entre acordes comuns',
    difficulty: 2,
    duration: 20,
    prerequisites: ['chords-basic-open'],
    skills: ['Velocidade', 'Fluidez', 'Coordenação motora'],
    methodology: 'Método do metrônomo progressivo. Aumentar BPM gradualmente.',
    icon: '⚡',
  },
  {
    id: 'chords-barre',
    category: 'chords',
    name: 'Acordes com Pestana',
    description: 'Desenvolva força e técnica para acordes com pestana',
    difficulty: 3,
    duration: 25,
    prerequisites: ['chords-basic-open', 'chords-transitions'],
    skills: ['Força de dedo', 'Resistência', 'Técnica avançada'],
    methodology: 'Progressão incremental de dificuldade. Exercícios de fortalecimento.',
    icon: '💪',
  },

  // ESCALAS - Construção de Base Teórica
  {
    id: 'scales-major-pentatonic',
    category: 'scales',
    name: 'Escala Pentatônica Maior',
    description: 'A escala mais versátil para improvisação',
    difficulty: 2,
    duration: 15,
    prerequisites: ['chords-basic-open'],
    skills: ['Improvisação', 'Teoria musical', 'Coordenação'],
    methodology: 'Aprendizagem por padrões visuais. Aplicação prática em músicas.',
    icon: '🎵',
  },
  {
    id: 'scales-minor-pentatonic',
    category: 'scales',
    name: 'Escala Pentatônica Menor',
    description: 'Base para blues e rock',
    difficulty: 2,
    duration: 15,
    prerequisites: ['scales-major-pentatonic'],
    skills: ['Expressão musical', 'Blues', 'Improvisação'],
    methodology: 'Contextualização em estilos musicais. Prática com backing tracks.',
    icon: '🎸',
  },

  // RITMO - Fundação Temporal
  {
    id: 'rhythm-basic-strumming',
    category: 'rhythm',
    name: 'Batidas Básicas',
    description: 'Padrões rítmicos fundamentais',
    difficulty: 1,
    duration: 10,
    prerequisites: [],
    skills: ['Senso rítmico', 'Coordenação mão direita', 'Timing'],
    methodology: 'Prática com metrônomo. Subdivisão rítmica consciente.',
    icon: '🥁',
  },
  {
    id: 'rhythm-fingerpicking',
    category: 'rhythm',
    name: 'Dedilhado Básico',
    description: 'Padrões de dedilhado para iniciantes',
    difficulty: 2,
    duration: 20,
    prerequisites: ['rhythm-basic-strumming'],
    skills: ['Independência de dedos', 'Precisão', 'Controle dinâmico'],
    methodology: 'Exercícios de independência digital. Progressão lenta para rápida.',
    icon: '👆',
  },

  // TREINO DE OUVIDO - Desenvolvimento Auditivo
  {
    id: 'ear-intervals',
    category: 'ear-training',
    name: 'Reconhecimento de Intervalos',
    description: 'Identifique intervalos musicais pelo som',
    difficulty: 2,
    duration: 15,
    prerequisites: [],
    skills: ['Percepção auditiva', 'Teoria musical', 'Ouvido relativo'],
    methodology: 'Repetição espaçada. Associação com melodias conhecidas.',
    icon: '👂',
  },
  {
    id: 'ear-chords',
    category: 'ear-training',
    name: 'Reconhecimento de Acordes',
    description: 'Identifique acordes maiores, menores e dominantes',
    difficulty: 3,
    duration: 20,
    prerequisites: ['ear-intervals'],
    skills: ['Harmonia', 'Análise musical', 'Transcrição'],
    methodology: 'Prática contextualizada. Análise de músicas reais.',
    icon: '🎹',
  },

  // MÚSICAS - Aplicação Prática
  {
    id: 'songs-beginner',
    category: 'songs',
    name: 'Primeira Música Completa',
    description: 'Aprenda uma música do início ao fim',
    difficulty: 1,
    duration: 30,
    prerequisites: ['chords-basic-open', 'rhythm-basic-strumming'],
    skills: ['Aplicação prática', 'Memorização', 'Performance'],
    methodology: 'Aprendizagem por chunking. Divisão em seções pequenas.',
    icon: '🎤',
  },

  // TÉCNICA - Refinamento
  {
    id: 'technique-posture',
    category: 'technique',
    name: 'Postura e Ergonomia',
    description: 'Fundamentos para tocar sem lesões',
    difficulty: 1,
    duration: 10,
    prerequisites: [],
    skills: ['Saúde', 'Prevenção de lesões', 'Eficiência'],
    methodology: 'Consciência corporal. Exercícios de alongamento.',
    icon: '🧘',
  },
];

/**
 * Obtém todos os módulos de treino
 */
export function getAllTrainingModules(): TrainingModule[] {
  return trainingModules;
}

/**
 * Obtém um módulo por ID
 */
export function getTrainingModuleById(id: string): TrainingModule | undefined {
  return trainingModules.find(m => m.id === id);
}

/**
 * Filtra módulos por categoria
 */
export function getModulesByCategory(category: TrainingModule['category']): TrainingModule[] {
  return trainingModules.filter(m => m.category === category);
}

/**
 * Filtra módulos por dificuldade
 */
export function getModulesByDifficulty(difficulty: TrainingModule['difficulty']): TrainingModule[] {
  return trainingModules.filter(m => m.difficulty === difficulty);
}
