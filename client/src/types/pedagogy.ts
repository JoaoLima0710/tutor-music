/**
 * Pedagogical Types - MusicTutor
 * Complete type definitions for the structured learning system
 * Based on ARQUITETURA_PEDAGOGICA.md specification
 */

// =============================================================================
// CORE TYPES
// =============================================================================

export type EducationalLevel = 'beginner' | 'intermediate' | 'advanced';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// =============================================================================
// MODULE
// =============================================================================

export interface Module {
    id: string;                    // "module-1-1"
    level: 1 | 2 | 3;              // 1=Iniciante, 2=Intermediário, 3=Avançado
    order: number;                 // Ordem dentro do nível
    title: string;                 // "Primeiros Passos"
    description: string;           // Descrição curta do módulo
    estimatedDuration: string;     // "2-3 semanas"

    // Conteúdo
    lessons: Lesson[];             // Lições do módulo
    exercises: Exercise[];         // Exercícios práticos
    quiz: Quiz;                    // Avaliação final

    // Requisitos
    prerequisites: string[];       // IDs de módulos anteriores
    requiredXP?: number;           // XP mínimo para desbloquear (optional)

    // Recompensas
    xpReward: number;              // XP ao completar
    badgeReward?: Badge;           // Badge especial (opcional)

    // Metadados
    tags?: string[];               // ["postura", "acordes-básicos"] (optional)
    difficulty?: Difficulty;       // (optional)
    icon: string;                  // Emoji ou ícone
    status?: 'locked' | 'available' | 'in-progress' | 'completed';
    skills?: string[];             // Skill IDs taught
}

// =============================================================================
// LESSON
// =============================================================================

export interface Lesson {
    id: string;                    // "lesson-1-1-1"
    moduleId: string;              // ID do módulo pai
    order: number;                 // Ordem dentro do módulo
    title: string;                 // "Postura Correta ao Tocar"
    description?: string;          // Short description (optional)

    // Conteúdo
    content: LessonContent[];      // Blocos de conteúdo
    estimatedTime: number;         // Tempo em minutos
    xpReward?: number;             // XP reward (optional)

    // Recursos visuais
    images?: LessonImage[];        // Imagens explicativas (optional)
    diagrams?: DiagramReference[]; // Referências a diagramas (optional)

    // Navegação
    nextLessonId?: string;
    previousLessonId?: string;
}

export type LessonContentType =
    | 'text'
    | 'heading'
    | 'list'
    | 'quote'
    | 'tip'
    | 'warning'
    | 'example';

export interface LessonContent {
    type: LessonContentType;
    content: string;
    metadata?: {
        level?: number;              // For headings (h2, h3, etc.)
        items?: string[];            // For lists
        icon?: string;               // For tips/warnings
    };
}

export interface LessonImage {
    url: string;
    alt: string;
    caption?: string;
    position: 'inline' | 'full-width' | 'side';
}

export interface DiagramReference {
    type: 'chord' | 'scale' | 'fretboard';
    id: string;                    // Chord name or scale name
    caption?: string;
}

// =============================================================================
// EXERCISE
// =============================================================================

export type ExerciseType =
    | 'chord-change'
    | 'rhythm'
    | 'fingering'
    | 'reading'
    | 'theory';

export interface Exercise {
    id: string;                    // "exercise-chord-change-c-g"
    moduleId: string;
    lessonId?: string;             // Opcional: vinculado a uma lição

    // Tipo de exercício
    type: ExerciseType;

    // Conteúdo
    title: string;                 // "Troca de Acordes: C → G"
    instructions: string;          // Instruções passo a passo
    goal: string;                  // "Trocar em menos de 2 segundos"

    // Configuração
    difficulty?: 1 | 2 | 3 | 4 | 5;
    estimatedTime: number;         // Minutos
    repetitions?: number;          // Repetições recomendadas

    // Dados específicos por tipo
    data?: ExerciseData | Record<string, unknown>;

    // Feedback
    successCriteria: SuccessCriteria | string[];
    hints: string[];               // Dicas progressivas
    commonMistakes: string[];      // Erros comuns a evitar

    // Gamificação
    xpReward: number;
    streakBonus?: number;          // XP extra por dias consecutivos
}

export type ExerciseData =
    | ChordChangeData
    | RhythmData
    | FingeringData
    | ReadingData
    | TheoryData;

export interface ChordChangeData {
    type: 'chord-change';
    fromChord: string;             // "C"
    toChord: string;               // "G"
    targetTime: number;            // Segundos
    fingeringTips: string[];
}

export interface RhythmData {
    type: 'rhythm';
    pattern: string;               // "↓ ↓ ↑ ↑ ↓ ↑"
    timeSignature: string;         // "4/4"
    bpm: number;                   // 80
    measures: number;              // 4
}

export interface FingeringData {
    type: 'fingering';
    pattern: number[];             // [1,2,3,4,4,3,2,1]
    strings: number[];             // [1,1,1,1,2,2,2,2]
    frets: number[];               // [5,6,7,8,8,7,6,5]
}

export interface ReadingData {
    type: 'reading';
    chords: string[];              // Acordes para identificar
    diagrams: string[];            // IDs dos diagramas
}

export interface TheoryData {
    type: 'theory';
    concept: string;               // Conceito sendo testado
    questions: string[];           // Perguntas de verificação
}

export interface SuccessCriteria {
    type: 'time' | 'accuracy' | 'self-report';
    target?: number;               // Valor alvo (tempo ou porcentagem)
    description: string;           // Descrição legível
}

// =============================================================================
// QUIZ
// =============================================================================

export interface Quiz {
    id: string;
    moduleId: string;
    title: string;                 // "Avaliação: Primeiros Passos"
    description: string;

    // Questões
    questions: QuizQuestion[];

    // Configuração
    passingScore: number;          // Porcentagem mínima (70)
    timeLimit?: number;            // Segundos (opcional)
    allowRetry?: boolean;
    maxAttempts?: number;

    // Recompensas
    xpReward: number;
    perfectScoreBonus: number;     // XP extra por 100%
}

export interface QuizQuestion {
    id: string;
    question: string;
    type?: 'multiple-choice' | 'true-false' | 'image-choice';

    // Opções
    options: QuizOption[];
    correctOptionId: string;

    // Feedback
    explanation: string;           // Explicação da resposta correta
    hint?: string;                 // Dica (mostrada após erro)
    difficulty?: 'easy' | 'medium' | 'hard';

    // Recursos visuais
    image?: string;
    diagram?: DiagramReference;
}

export interface QuizOption {
    id: string;
    text: string;
    image?: string;
}

export interface QuizAnswer {
    questionId: string;
    selectedOptionId: string;
}

export interface QuizResult {
    quizId: string;
    attemptedAt: Date;
    score: number;                 // 0-100
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
    answers: DetailedQuizAnswer[];
    timeSpent: number;             // Segundos
}

export interface DetailedQuizAnswer {
    questionId: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    explanation: string;
}

// =============================================================================
// USER PROGRESS
// =============================================================================

export interface UserProgress {
    userId: string;

    // Nível e XP
    currentLevel: number;          // 1-50
    currentXP: number;
    xpToNextLevel: number;
    totalXP: number;

    // Módulos
    completedModules: string[];    // IDs de módulos completos
    currentModuleId: string | null;// Módulo em progresso
    unlockedModules: string[];     // Módulos desbloqueados

    // Lições e Exercícios
    completedLessons: string[];
    completedExercises: string[];
    exerciseAttempts: ExerciseAttempt[];

    // Quizzes
    quizResults: QuizResult[];

    // Streak e Estatísticas
    currentStreak: number;         // Dias consecutivos
    longestStreak: number;
    totalPracticeTime: number;     // Minutos
    lastPracticeDate: string | null;

    // Badges e Conquistas
    earnedBadges: string[];        // Badge IDs

    // Habilidades Dominadas
    masteredSkills: string[];      // Skill IDs

    // Repertório
    learnedSongs: string[];        // Song IDs
}

export interface ExerciseAttempt {
    exerciseId: string;
    attemptedAt: Date;
    success: boolean;
    score?: number;                // 0-100
    timeSpent: number;             // Segundos
}

// =============================================================================
// BADGE & ACHIEVEMENT
// =============================================================================

export interface Badge {
    id: string;
    name: string;                  // "Primeira Música"
    description: string;
    icon: string;                  // Emoji ou URL
    rarity: BadgeRarity;
    category?: string;             // Category (optional)
    unlockedAt?: Date;             // When unlocked (optional)

    // Critérios
    criteria?: BadgeCriteria;

    // Recompensa
    xpBonus: number;
}

export interface BadgeCriteria {
    type: 'module-complete' | 'streak' | 'perfect-quiz' | 'skill-master' | 'song-learned' | 'xp-total' | 'lessons-complete';
    target: number | string;       // Valor alvo
}

// =============================================================================
// SKILL
// =============================================================================

export interface Skill {
    id: string;
    name: string;                  // "Troca de Acordes"
    category: 'technique' | 'theory' | 'reading' | 'rhythm' | 'ear_training';

    // Progresso
    level: 1 | 2 | 3 | 4 | 5;      // Iniciante → Mestre
    progress: number;              // 0-100 (dentro do nível atual)

    // Exercícios relacionados
    relatedExercises: string[];

    // Metadados
    description: string;
    icon: string;
}

// =============================================================================
// SONG
// =============================================================================

export interface Song {
    id: string;
    title: string;
    artist: string;

    // Dificuldade
    difficulty: 1 | 2 | 3 | 4 | 5;
    requiredLevel: number;         // Nível mínimo do usuário

    // Conteúdo
    chords: string[];              // ["C", "G", "Am", "F"]
    strummingPattern: string;      // "↓ ↓ ↑ ↑ ↓ ↑"
    bpm: number;
    timeSignature: string;         // "4/4"

    // Estrutura
    sections: SongSection[];

    // Recursos
    lyrics: string;
    chordChart: string;            // Markdown format

    // Análise Pedagógica
    keySignature: string;          // "C Major"
    techniques: string[];          // ["fingerpicking", "palm-mute"]
}

export interface SongSection {
    name: string;                  // "Intro", "Verse", "Chorus"
    chords: string[];
    measures: number;
    repeat: number;
}

// =============================================================================
// DAILY TRAINING
// =============================================================================

export interface DailyTraining {
    id: string;
    date: string;                  // ISO date

    warmup: {
        exercises: string[];         // Exercise IDs
        duration: number;            // Minutes
    };

    technique: {
        exercises: string[];
        duration: number;
    };

    theory: {
        lessonId?: string;
        duration: number;
    };

    repertoire: {
        songId?: string;
        duration: number;
    };

    totalTime: number;
    isCompleted: boolean;
}

// =============================================================================
// XP SYSTEM CONSTANTS
// =============================================================================

export const XP_REWARDS = {
    lesson: 10,
    exercise: 15,
    quiz: 30,
    quizPerfect: 50,
    dailyStreak: 5,
    weeklyStreak: 25,
    moduleComplete: 100,
} as const;

export const LEVEL_TITLES: Record<string, string> = {
    '1-5': 'Iniciante',
    '6-15': 'Aprendiz',
    '16-25': 'Praticante',
    '26-35': 'Experiente',
    '36-45': 'Avançado',
    '46-50': 'Mestre',
};

/**
 * Calculate XP needed for a specific level
 * Uses exponential growth: 100 * 1.5^(level-1)
 */
export function calculateXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Calculate total XP accumulated up to a level
 */
export function calculateTotalXPToLevel(level: number): number {
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += calculateXPForLevel(i);
    }
    return total;
}

/**
 * Get level from total XP
 */
export function getLevelFromXP(totalXP: number): number {
    let level = 1;
    let accumulatedXP = 0;

    while (accumulatedXP + calculateXPForLevel(level) <= totalXP) {
        accumulatedXP += calculateXPForLevel(level);
        level++;
    }

    return level;
}

/**
 * Get level title from level number
 */
export function getLevelTitle(level: number): string {
    if (level <= 5) return LEVEL_TITLES['1-5'];
    if (level <= 15) return LEVEL_TITLES['6-15'];
    if (level <= 25) return LEVEL_TITLES['16-25'];
    if (level <= 35) return LEVEL_TITLES['26-35'];
    if (level <= 45) return LEVEL_TITLES['36-45'];
    return LEVEL_TITLES['46-50'];
}
