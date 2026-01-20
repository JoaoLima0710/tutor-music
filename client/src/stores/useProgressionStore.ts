/**
 * Sistema de Progressão Educacional
 * Baseado em princípios pedagógicos de ensino musical progressivo
 * 
 * Níveis:
 * - Iniciante (0-3 meses): Fundamentos, postura, acordes básicos
 * - Intermediário (3-12 meses): Pestanas, escalas, campo harmônico
 * - Avançado (12+ meses): Harmonia funcional, improvisação, técnicas avançadas
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipos de nível educacional
export type EducationalLevel = 'beginner' | 'intermediate' | 'advanced';

// Habilidades específicas por nível
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: 'technique' | 'theory' | 'ear_training' | 'repertoire';
  level: EducationalLevel;
  progress: number; // 0-100
  practiceCount: number;
  lastPracticed?: number;
  mastered: boolean;
  masteredAt?: number;
}

// Módulos de aprendizado
export interface LearningModule {
  id: string;
  title: string;
  description: string;
  level: EducationalLevel;
  category: string;
  skills: string[]; // IDs das habilidades
  estimatedDuration: number; // minutos
  prerequisites: string[]; // IDs de módulos anteriores
  completed: boolean;
  progress: number;
}

// Item para revisão espaçada
export interface ReviewItem {
  skillId: string;
  nextReviewDate: number;
  interval: number; // dias
  easeFactor: number; // multiplicador de dificuldade
  repetitions: number;
}

// Rotina de treino diário
export interface DailyRoutine {
  level: EducationalLevel;
  totalMinutes: number;
  blocks: {
    name: string;
    minutes: number;
    type: 'warmup' | 'technique' | 'theory' | 'practice' | 'review';
    description: string;
  }[];
}

interface ProgressionStore {
  // Estado do aluno
  educationalLevel: EducationalLevel;
  enrollmentDate: number;
  totalPracticeMinutes: number;
  totalSessions: number;
  
  // Habilidades
  skills: Skill[];
  
  // Módulos
  modules: LearningModule[];
  currentModuleId: string | null;
  
  // Revisão espaçada
  reviewQueue: ReviewItem[];
  
  // Dificuldades detectadas
  difficulties: string[];
  
  // Preferências de treino
  preferredPracticeTime: 'morning' | 'afternoon' | 'evening';
  dailyGoalMinutes: number;
  
  // Métricas
  weeklyProgress: number[];
  averageAccuracy: number;
  
  // Ações
  updateSkillProgress: (skillId: string, progress: number, accuracy?: number) => void;
  completeModule: (moduleId: string) => void;
  addPracticeTime: (minutes: number) => void;
  checkLevelUp: () => boolean;
  getRecommendedSkills: () => Skill[];
  getDailyRoutine: () => DailyRoutine;
  addToReviewQueue: (skillId: string) => void;
  processReview: (skillId: string, quality: number) => void;
  getNextReviewItems: () => ReviewItem[];
  detectDifficulty: (skillId: string) => void;
  getProgressMetrics: () => ProgressMetrics;
}

interface ProgressMetrics {
  level: EducationalLevel;
  daysActive: number;
  totalMinutes: number;
  sessionsCompleted: number;
  skillsMastered: number;
  totalSkills: number;
  modulesCompleted: number;
  totalModules: number;
  currentStreak: number;
  averageSessionLength: number;
  strongAreas: string[];
  weakAreas: string[];
}

// Habilidades iniciais baseadas no estudo pedagógico
const initialSkills: Skill[] = [
  // INICIANTE - Técnica
  { id: 'posture', name: 'Postura Correta', description: 'Sentar, segurar o violão, posição das mãos', category: 'technique', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  { id: 'tuning', name: 'Afinação', description: 'Afinar o violão com afinador e de ouvido', category: 'technique', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  { id: 'chord-em', name: 'Acorde Em', description: 'Acorde de Mi menor - primeiro acorde', category: 'technique', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  { id: 'chord-am', name: 'Acorde Am', description: 'Acorde de Lá menor', category: 'technique', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  { id: 'chord-e', name: 'Acorde E', description: 'Acorde de Mi maior', category: 'technique', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  { id: 'chord-a', name: 'Acorde A', description: 'Acorde de Lá maior', category: 'technique', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  { id: 'chord-dm', name: 'Acorde Dm', description: 'Acorde de Ré menor', category: 'technique', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  { id: 'chord-d', name: 'Acorde D', description: 'Acorde de Ré maior', category: 'technique', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  { id: 'chord-c', name: 'Acorde C', description: 'Acorde de Dó maior', category: 'technique', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  { id: 'chord-g', name: 'Acorde G', description: 'Acorde de Sol maior', category: 'technique', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  { id: 'chord-changes-basic', name: 'Troca de Acordes Básica', description: 'Trocar entre acordes sem pausas longas', category: 'technique', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  { id: 'rhythm-44', name: 'Ritmo 4/4 Básico', description: 'Manter batida constante em 4/4', category: 'technique', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  
  // INICIANTE - Teoria
  { id: 'guitar-parts', name: 'Partes do Violão', description: 'Conhecer corpo, braço, trastes, cordas', category: 'theory', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  { id: 'cifra-reading', name: 'Leitura de Cifras', description: 'Entender notação de cifras básicas', category: 'theory', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  { id: 'major-minor-diff', name: 'Maior vs Menor', description: 'Diferenciar acordes maiores e menores', category: 'theory', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  
  // INICIANTE - Percepção Auditiva
  { id: 'hear-major-minor', name: 'Ouvir Maior/Menor', description: 'Identificar acordes maiores e menores pelo som', category: 'ear_training', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  { id: 'pulse-feeling', name: 'Sentir Pulsação', description: 'Identificar o tempo/batida da música', category: 'ear_training', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  
  // INICIANTE - Repertório
  { id: 'first-song', name: 'Primeira Música', description: 'Tocar uma música completa do início ao fim', category: 'repertoire', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  { id: 'three-songs', name: 'Três Músicas', description: 'Dominar 3 músicas simples', category: 'repertoire', level: 'beginner', progress: 0, practiceCount: 0, mastered: false },
  
  // INTERMEDIÁRIO - Técnica
  { id: 'barre-chord-f', name: 'Pestana F', description: 'Dominar acorde F com pestana', category: 'technique', level: 'intermediate', progress: 0, practiceCount: 0, mastered: false },
  { id: 'barre-chord-bm', name: 'Pestana Bm', description: 'Dominar acorde Bm com pestana', category: 'technique', level: 'intermediate', progress: 0, practiceCount: 0, mastered: false },
  { id: 'caged-system', name: 'Sistema CAGED', description: 'Entender formas móveis de acordes', category: 'technique', level: 'intermediate', progress: 0, practiceCount: 0, mastered: false },
  { id: 'major-scale', name: 'Escala Maior', description: 'Tocar escala maior em 3 posições', category: 'technique', level: 'intermediate', progress: 0, practiceCount: 0, mastered: false },
  { id: 'pentatonic-scale', name: 'Escala Pentatônica', description: 'Dominar padrão 1 da pentatônica', category: 'technique', level: 'intermediate', progress: 0, practiceCount: 0, mastered: false },
  { id: 'rhythm-variations', name: 'Variações Rítmicas', description: 'Tocar em 5+ ritmos diferentes', category: 'technique', level: 'intermediate', progress: 0, practiceCount: 0, mastered: false },
  
  // INTERMEDIÁRIO - Teoria
  { id: 'harmonic-field', name: 'Campo Harmônico', description: 'Entender campo harmônico maior', category: 'theory', level: 'intermediate', progress: 0, practiceCount: 0, mastered: false },
  { id: 'common-progressions', name: 'Progressões Comuns', description: 'Conhecer I-IV-V, I-V-vi-IV, ii-V-I', category: 'theory', level: 'intermediate', progress: 0, practiceCount: 0, mastered: false },
  { id: 'chord-extensions', name: 'Extensões', description: 'Entender 7ª, 9ª e outras extensões', category: 'theory', level: 'intermediate', progress: 0, practiceCount: 0, mastered: false },
  
  // INTERMEDIÁRIO - Percepção Auditiva
  { id: 'interval-recognition', name: 'Reconhecer Intervalos', description: 'Identificar 2ª, 3ª, 4ª, 5ª pelo som', category: 'ear_training', level: 'intermediate', progress: 0, practiceCount: 0, mastered: false },
  { id: 'chord-quality', name: 'Qualidade do Acorde', description: 'Identificar M, m, 7, dim pelo som', category: 'ear_training', level: 'intermediate', progress: 0, practiceCount: 0, mastered: false },
  
  // INTERMEDIÁRIO - Repertório
  { id: 'ten-songs', name: '10 Músicas', description: 'Dominar 10 músicas de memória', category: 'repertoire', level: 'intermediate', progress: 0, practiceCount: 0, mastered: false },
  { id: 'play-in-band', name: 'Tocar em Grupo', description: 'Acompanhar outros músicos', category: 'repertoire', level: 'intermediate', progress: 0, practiceCount: 0, mastered: false },
  
  // AVANÇADO - Técnica
  { id: 'fingerstyle', name: 'Fingerstyle', description: 'Técnica de dedilhado avançada', category: 'technique', level: 'advanced', progress: 0, practiceCount: 0, mastered: false },
  { id: 'sweep-picking', name: 'Sweep Picking', description: 'Técnica de varredura para arpejos', category: 'technique', level: 'advanced', progress: 0, practiceCount: 0, mastered: false },
  { id: 'harmonics', name: 'Harmônicos', description: 'Naturais e artificiais', category: 'technique', level: 'advanced', progress: 0, practiceCount: 0, mastered: false },
  { id: 'all-scale-positions', name: 'Todas Posições', description: 'Escalas em todo o braço', category: 'technique', level: 'advanced', progress: 0, practiceCount: 0, mastered: false },
  
  // AVANÇADO - Teoria
  { id: 'greek-modes', name: 'Modos Gregos', description: 'Jônio, Dórico, Frígio, etc.', category: 'theory', level: 'advanced', progress: 0, practiceCount: 0, mastered: false },
  { id: 'functional-harmony', name: 'Harmonia Funcional', description: 'Substituições, dominantes secundárias', category: 'theory', level: 'advanced', progress: 0, practiceCount: 0, mastered: false },
  { id: 'chord-voicings', name: 'Voicings Avançados', description: 'Inversões e voicings de jazz', category: 'theory', level: 'advanced', progress: 0, practiceCount: 0, mastered: false },
  
  // AVANÇADO - Percepção Auditiva
  { id: 'transcribe-melody', name: 'Transcrever Melodia', description: 'Tirar melodias de ouvido', category: 'ear_training', level: 'advanced', progress: 0, practiceCount: 0, mastered: false },
  { id: 'transcribe-harmony', name: 'Transcrever Harmonia', description: 'Tirar acordes de ouvido', category: 'ear_training', level: 'advanced', progress: 0, practiceCount: 0, mastered: false },
  { id: 'progression-recognition', name: 'Reconhecer Progressões', description: 'Identificar progressões comuns', category: 'ear_training', level: 'advanced', progress: 0, practiceCount: 0, mastered: false },
  
  // AVANÇADO - Repertório
  { id: 'improvisation', name: 'Improvisação', description: 'Improvisar sobre qualquer progressão', category: 'repertoire', level: 'advanced', progress: 0, practiceCount: 0, mastered: false },
  { id: 'arrangements', name: 'Criar Arranjos', description: 'Fazer arranjos próprios', category: 'repertoire', level: 'advanced', progress: 0, practiceCount: 0, mastered: false },
];

// Módulos de aprendizado estruturados
const initialModules: LearningModule[] = [
  // MÓDULO INICIANTE 1: Fundamentos
  {
    id: 'beginner-1-fundamentals',
    title: 'Fundamentos Físicos',
    description: 'Postura, ergonomia e cuidados com o violão',
    level: 'beginner',
    category: 'technique',
    skills: ['posture', 'guitar-parts', 'tuning'],
    estimatedDuration: 45,
    prerequisites: [],
    completed: false,
    progress: 0,
  },
  // MÓDULO INICIANTE 2: Primeiros Acordes
  {
    id: 'beginner-2-first-chords',
    title: 'Primeiros Acordes',
    description: 'Em, Am, E, A - seus primeiros acordes',
    level: 'beginner',
    category: 'technique',
    skills: ['chord-em', 'chord-am', 'chord-e', 'chord-a'],
    estimatedDuration: 120,
    prerequisites: ['beginner-1-fundamentals'],
    completed: false,
    progress: 0,
  },
  // MÓDULO INICIANTE 3: Mais Acordes
  {
    id: 'beginner-3-more-chords',
    title: 'Expandindo Acordes',
    description: 'Dm, D, C, G - completando os acordes básicos',
    level: 'beginner',
    category: 'technique',
    skills: ['chord-dm', 'chord-d', 'chord-c', 'chord-g'],
    estimatedDuration: 150,
    prerequisites: ['beginner-2-first-chords'],
    completed: false,
    progress: 0,
  },
  // MÓDULO INICIANTE 4: Ritmo
  {
    id: 'beginner-4-rhythm',
    title: 'Ritmo e Pulsação',
    description: 'Manter o tempo, batidas básicas',
    level: 'beginner',
    category: 'technique',
    skills: ['rhythm-44', 'pulse-feeling'],
    estimatedDuration: 90,
    prerequisites: ['beginner-2-first-chords'],
    completed: false,
    progress: 0,
  },
  // MÓDULO INICIANTE 5: Troca de Acordes
  {
    id: 'beginner-5-chord-changes',
    title: 'Troca de Acordes',
    description: 'Transições fluidas entre acordes',
    level: 'beginner',
    category: 'technique',
    skills: ['chord-changes-basic'],
    estimatedDuration: 180,
    prerequisites: ['beginner-3-more-chords', 'beginner-4-rhythm'],
    completed: false,
    progress: 0,
  },
  // MÓDULO INICIANTE 6: Teoria Básica
  {
    id: 'beginner-6-theory',
    title: 'Teoria Básica',
    description: 'Cifras e diferença entre maior/menor',
    level: 'beginner',
    category: 'theory',
    skills: ['cifra-reading', 'major-minor-diff', 'hear-major-minor'],
    estimatedDuration: 60,
    prerequisites: ['beginner-2-first-chords'],
    completed: false,
    progress: 0,
  },
  // MÓDULO INICIANTE 7: Primeira Música
  {
    id: 'beginner-7-first-song',
    title: 'Sua Primeira Música',
    description: 'Toque uma música completa!',
    level: 'beginner',
    category: 'repertoire',
    skills: ['first-song'],
    estimatedDuration: 120,
    prerequisites: ['beginner-5-chord-changes'],
    completed: false,
    progress: 0,
  },
  
  // MÓDULOS INTERMEDIÁRIOS
  {
    id: 'intermediate-1-barre',
    title: 'Pestanas',
    description: 'Dominando acordes com pestana',
    level: 'intermediate',
    category: 'technique',
    skills: ['barre-chord-f', 'barre-chord-bm', 'caged-system'],
    estimatedDuration: 300,
    prerequisites: ['beginner-7-first-song'],
    completed: false,
    progress: 0,
  },
  {
    id: 'intermediate-2-scales',
    title: 'Escalas',
    description: 'Maior e Pentatônica',
    level: 'intermediate',
    category: 'technique',
    skills: ['major-scale', 'pentatonic-scale'],
    estimatedDuration: 240,
    prerequisites: ['intermediate-1-barre'],
    completed: false,
    progress: 0,
  },
  {
    id: 'intermediate-3-harmony',
    title: 'Campo Harmônico',
    description: 'Entendendo harmonia',
    level: 'intermediate',
    category: 'theory',
    skills: ['harmonic-field', 'common-progressions', 'chord-extensions'],
    estimatedDuration: 180,
    prerequisites: ['beginner-6-theory'],
    completed: false,
    progress: 0,
  },
  {
    id: 'intermediate-4-ear',
    title: 'Treinamento Auditivo',
    description: 'Desenvolvendo o ouvido',
    level: 'intermediate',
    category: 'ear_training',
    skills: ['interval-recognition', 'chord-quality'],
    estimatedDuration: 240,
    prerequisites: ['beginner-6-theory'],
    completed: false,
    progress: 0,
  },
  
  // MÓDULOS AVANÇADOS
  {
    id: 'advanced-1-techniques',
    title: 'Técnicas Avançadas',
    description: 'Fingerstyle, harmonics e mais',
    level: 'advanced',
    category: 'technique',
    skills: ['fingerstyle', 'harmonics', 'sweep-picking'],
    estimatedDuration: 600,
    prerequisites: ['intermediate-2-scales'],
    completed: false,
    progress: 0,
  },
  {
    id: 'advanced-2-modes',
    title: 'Modos e Harmonia',
    description: 'Modos gregos e harmonia funcional',
    level: 'advanced',
    category: 'theory',
    skills: ['greek-modes', 'functional-harmony', 'chord-voicings'],
    estimatedDuration: 480,
    prerequisites: ['intermediate-3-harmony'],
    completed: false,
    progress: 0,
  },
  {
    id: 'advanced-3-improvisation',
    title: 'Improvisação',
    description: 'Criar música no momento',
    level: 'advanced',
    category: 'repertoire',
    skills: ['improvisation', 'arrangements', 'transcribe-melody', 'transcribe-harmony'],
    estimatedDuration: 720,
    prerequisites: ['advanced-1-techniques', 'advanced-2-modes'],
    completed: false,
    progress: 0,
  },
];

// Rotinas de treino diário por nível
const dailyRoutines: Record<EducationalLevel, DailyRoutine> = {
  beginner: {
    level: 'beginner',
    totalMinutes: 20,
    blocks: [
      { name: 'Aquecimento', minutes: 3, type: 'warmup', description: 'Cromático lento, alongamento dos dedos' },
      { name: 'Acordes', minutes: 5, type: 'technique', description: 'Praticar acordes do dia' },
      { name: 'Troca de Acordes', minutes: 5, type: 'technique', description: 'Exercício de transição com metrônomo' },
      { name: 'Música', minutes: 5, type: 'practice', description: 'Aplicar em música real' },
      { name: 'Revisão', minutes: 2, type: 'review', description: 'Rever pontos de dificuldade' },
    ],
  },
  intermediate: {
    level: 'intermediate',
    totalMinutes: 35,
    blocks: [
      { name: 'Aquecimento', minutes: 5, type: 'warmup', description: 'Cromático e escalas em velocidade progressiva' },
      { name: 'Escalas/Técnica', minutes: 8, type: 'technique', description: 'Praticar escalas e técnicas do dia' },
      { name: 'Acordes/Harmonia', minutes: 8, type: 'technique', description: 'Pestanas e progressões' },
      { name: 'Repertório', minutes: 8, type: 'practice', description: 'Músicas em estudo' },
      { name: 'Treino Auditivo', minutes: 4, type: 'theory', description: 'Intervalos e acordes de ouvido' },
      { name: 'Revisão', minutes: 2, type: 'review', description: 'Revisar conteúdo com dificuldade' },
    ],
  },
  advanced: {
    level: 'advanced',
    totalMinutes: 50,
    blocks: [
      { name: 'Técnica Avançada', minutes: 10, type: 'technique', description: 'Exercícios de velocidade e precisão' },
      { name: 'Harmonia/Teoria', minutes: 12, type: 'theory', description: 'Voicings, modos, substituições' },
      { name: 'Repertório/Estudo', minutes: 12, type: 'practice', description: 'Peças em estudo, leitura à primeira vista' },
      { name: 'Improvisação', minutes: 10, type: 'practice', description: 'Improvisar sobre backing tracks' },
      { name: 'Transcrição', minutes: 6, type: 'theory', description: 'Tirar músicas de ouvido' },
    ],
  },
};

export const useProgressionStore = create<ProgressionStore>()(
  persist(
    (set, get) => ({
      educationalLevel: 'beginner',
      enrollmentDate: Date.now(),
      totalPracticeMinutes: 0,
      totalSessions: 0,
      skills: initialSkills,
      modules: initialModules,
      currentModuleId: 'beginner-1-fundamentals',
      reviewQueue: [],
      difficulties: [],
      preferredPracticeTime: 'evening',
      dailyGoalMinutes: 20,
      weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
      averageAccuracy: 0,
      
      updateSkillProgress: (skillId, progress, accuracy) => {
        set((state) => {
          const newSkills = state.skills.map((skill) => {
            if (skill.id === skillId) {
              const newProgress = Math.min(100, Math.max(0, progress));
              const mastered = newProgress >= 80;
              
              return {
                ...skill,
                progress: newProgress,
                practiceCount: skill.practiceCount + 1,
                lastPracticed: Date.now(),
                mastered,
                masteredAt: mastered && !skill.mastered ? Date.now() : skill.masteredAt,
              };
            }
            return skill;
          });
          
          // Atualizar progresso do módulo
          const newModules = state.modules.map((module) => {
            if (module.skills.includes(skillId)) {
              const moduleSkills = newSkills.filter((s) => module.skills.includes(s.id));
              const avgProgress = moduleSkills.reduce((sum, s) => sum + s.progress, 0) / moduleSkills.length;
              const allMastered = moduleSkills.every((s) => s.mastered);
              
              return {
                ...module,
                progress: avgProgress,
                completed: allMastered,
              };
            }
            return module;
          });
          
          // Atualizar média de precisão
          let newAvgAccuracy = state.averageAccuracy;
          if (accuracy !== undefined) {
            newAvgAccuracy = (state.averageAccuracy * state.totalSessions + accuracy) / (state.totalSessions + 1);
          }
          
          return {
            skills: newSkills,
            modules: newModules,
            averageAccuracy: newAvgAccuracy,
          };
        });
        
        // Adicionar à fila de revisão se dominou
        const skill = get().skills.find((s) => s.id === skillId);
        if (skill && skill.progress >= 80) {
          get().addToReviewQueue(skillId);
        }
        
        // Verificar se deve subir de nível
        get().checkLevelUp();
      },
      
      completeModule: (moduleId) => {
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId ? { ...m, completed: true, progress: 100 } : m
          ),
        }));
        
        // Encontrar próximo módulo
        const state = get();
        const completedModule = state.modules.find((m) => m.id === moduleId);
        if (completedModule) {
          const nextModule = state.modules.find(
            (m) => !m.completed && m.prerequisites.every((p) => 
              state.modules.find((mod) => mod.id === p)?.completed
            )
          );
          if (nextModule) {
            set({ currentModuleId: nextModule.id });
          }
        }
        
        get().checkLevelUp();
      },
      
      addPracticeTime: (minutes) => {
        set((state) => {
          const today = new Date().getDay();
          const newWeeklyProgress = [...state.weeklyProgress];
          newWeeklyProgress[today] += minutes;
          
          return {
            totalPracticeMinutes: state.totalPracticeMinutes + minutes,
            totalSessions: state.totalSessions + 1,
            weeklyProgress: newWeeklyProgress,
          };
        });
      },
      
      checkLevelUp: () => {
        const state = get();
        const beginnerSkills = state.skills.filter((s) => s.level === 'beginner');
        const intermediateSkills = state.skills.filter((s) => s.level === 'intermediate');
        
        const beginnerMastered = beginnerSkills.filter((s) => s.mastered).length;
        const intermediateMastered = intermediateSkills.filter((s) => s.mastered).length;
        
        let newLevel: EducationalLevel = state.educationalLevel;
        
        // 80% das habilidades de iniciante dominadas → intermediário
        if (state.educationalLevel === 'beginner' && beginnerMastered >= beginnerSkills.length * 0.8) {
          newLevel = 'intermediate';
        }
        // 80% das habilidades de intermediário dominadas → avançado
        else if (state.educationalLevel === 'intermediate' && intermediateMastered >= intermediateSkills.length * 0.8) {
          newLevel = 'advanced';
        }
        
        if (newLevel !== state.educationalLevel) {
          set({ 
            educationalLevel: newLevel,
            dailyGoalMinutes: newLevel === 'beginner' ? 20 : newLevel === 'intermediate' ? 35 : 50,
          });
          return true;
        }
        
        return false;
      },
      
      getRecommendedSkills: () => {
        const state = get();
        const levelSkills = state.skills.filter(
          (s) => s.level === state.educationalLevel && !s.mastered
        );
        
        // Priorizar habilidades não praticadas ou com baixo progresso
        return levelSkills
          .sort((a, b) => {
            // Prioridade 1: Nunca praticado
            if (a.practiceCount === 0 && b.practiceCount > 0) return -1;
            if (b.practiceCount === 0 && a.practiceCount > 0) return 1;
            // Prioridade 2: Menor progresso
            return a.progress - b.progress;
          })
          .slice(0, 3);
      },
      
      getDailyRoutine: () => {
        const state = get();
        return dailyRoutines[state.educationalLevel];
      },
      
      addToReviewQueue: (skillId) => {
        set((state) => {
          // Verificar se já está na fila
          if (state.reviewQueue.some((r) => r.skillId === skillId)) {
            return state;
          }
          
          const newItem: ReviewItem = {
            skillId,
            nextReviewDate: Date.now() + 24 * 60 * 60 * 1000, // Amanhã
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0,
          };
          
          return {
            reviewQueue: [...state.reviewQueue, newItem],
          };
        });
      },
      
      processReview: (skillId, quality) => {
        // Algoritmo SM-2 simplificado para revisão espaçada
        set((state) => {
          const newQueue = state.reviewQueue.map((item) => {
            if (item.skillId !== skillId) return item;
            
            let newEaseFactor = item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
            newEaseFactor = Math.max(1.3, newEaseFactor);
            
            let newInterval: number;
            let newReps: number;
            
            if (quality < 3) {
              // Resposta incorreta, reiniciar
              newInterval = 1;
              newReps = 0;
            } else {
              // Resposta correta
              if (item.repetitions === 0) {
                newInterval = 1;
              } else if (item.repetitions === 1) {
                newInterval = 6;
              } else {
                newInterval = Math.round(item.interval * newEaseFactor);
              }
              newReps = item.repetitions + 1;
            }
            
            return {
              ...item,
              interval: newInterval,
              easeFactor: newEaseFactor,
              repetitions: newReps,
              nextReviewDate: Date.now() + newInterval * 24 * 60 * 60 * 1000,
            };
          });
          
          return { reviewQueue: newQueue };
        });
      },
      
      getNextReviewItems: () => {
        const state = get();
        const now = Date.now();
        return state.reviewQueue
          .filter((item) => item.nextReviewDate <= now)
          .sort((a, b) => a.nextReviewDate - b.nextReviewDate)
          .slice(0, 5);
      },
      
      detectDifficulty: (skillId) => {
        set((state) => {
          const skill = state.skills.find((s) => s.id === skillId);
          if (!skill) return state;
          
          // Detectar dificuldade: muitas práticas com pouco progresso
          if (skill.practiceCount >= 5 && skill.progress < 30) {
            if (!state.difficulties.includes(skillId)) {
              return { difficulties: [...state.difficulties, skillId] };
            }
          }
          
          return state;
        });
      },
      
      getProgressMetrics: () => {
        const state = get();
        const now = Date.now();
        const daysActive = Math.floor((now - state.enrollmentDate) / (24 * 60 * 60 * 1000));
        
        const skillsMastered = state.skills.filter((s) => s.mastered).length;
        const modulesCompleted = state.modules.filter((m) => m.completed).length;
        
        // Identificar áreas fortes e fracas
        const categories = ['technique', 'theory', 'ear_training', 'repertoire'];
        const categoryProgress = categories.map((cat) => {
          const catSkills = state.skills.filter(
            (s) => s.category === cat && s.level === state.educationalLevel
          );
          const avgProgress = catSkills.length > 0
            ? catSkills.reduce((sum, s) => sum + s.progress, 0) / catSkills.length
            : 0;
          return { category: cat, progress: avgProgress };
        });
        
        const sortedCategories = [...categoryProgress].sort((a, b) => b.progress - a.progress);
        const strongAreas = sortedCategories.slice(0, 2).map((c) => c.category);
        const weakAreas = sortedCategories.slice(-2).map((c) => c.category);
        
        return {
          level: state.educationalLevel,
          daysActive,
          totalMinutes: state.totalPracticeMinutes,
          sessionsCompleted: state.totalSessions,
          skillsMastered,
          totalSkills: state.skills.length,
          modulesCompleted,
          totalModules: state.modules.length,
          currentStreak: 0, // Integrar com gamification store
          averageSessionLength: state.totalSessions > 0 
            ? Math.round(state.totalPracticeMinutes / state.totalSessions) 
            : 0,
          strongAreas,
          weakAreas,
        };
      },
    }),
    {
      name: 'progression-store',
      version: 1,
    }
  )
);
