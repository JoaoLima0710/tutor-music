/**
 * Estrutura de Lições - Nível Iniciante
 * Baseado em princípios pedagógicos:
 * - Progressão micro (pequenos passos)
 * - 80% prática, 20% teoria
 * - Feedback imediato
 * - Contexto musical real
 */

export interface LessonStep {
  id: string;
  type: 'video' | 'text' | 'exercise' | 'practice' | 'quiz';
  title: string;
  content: string;
  duration: number; // segundos
  mediaUrl?: string;
  exerciseType?: 'chord' | 'rhythm' | 'ear' | 'scale';
  exerciseData?: any;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  objectives: string[];
  estimatedMinutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prerequisites: string[];
  steps: LessonStep[];
  practiceGoal: string;
  successCriteria: string;
  xpReward: number;
  skillsToUnlock: string[];
}

export interface LessonModule {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  lessons: Lesson[];
  icon: string;
  color: string;
}

// ==========================================
// MÓDULO 1: FUNDAMENTOS
// ==========================================
const fundamentalsLessons: Lesson[] = [
  {
    id: 'lesson-1-1',
    moduleId: 'module-1-fundamentals',
    title: 'Conhecendo Seu Violão',
    description: 'Aprenda as partes do violão e como segurá-lo corretamente',
    objectives: [
      'Identificar as partes do violão',
      'Posicionar o violão corretamente',
      'Entender a numeração das cordas',
    ],
    estimatedMinutes: 8,
    difficulty: 1,
    prerequisites: [],
    steps: [
      {
        id: 'step-1',
        type: 'text',
        title: 'As Partes do Violão',
        content: `O violão tem 3 partes principais:

**Corpo** - A parte grande que amplifica o som
**Braço** - Onde você pressiona as cordas
**Mão/Headstock** - Onde ficam as tarraxas de afinação

As 6 cordas são numeradas de baixo para cima:
1ª (Mi agudo) - mais fina
2ª (Si)
3ª (Sol)
4ª (Ré)
5ª (Lá)
6ª (Mi grave) - mais grossa`,
        duration: 60,
      },
      {
        id: 'step-2',
        type: 'text',
        title: 'Postura Correta',
        content: `**Sentado:**
- Costas retas, ombros relaxados
- Violão apoiado na perna direita (destros)
- Braço do violão levemente inclinado para cima
- Cotovelo direito apoiado no corpo do violão

**Mão Esquerda:**
- Polegar atrás do braço, nunca envolvendo
- Dedos curvados, pontas nas cordas
- Pulso reto, não dobrado

**Mão Direita:**
- Antebraço apoiado no corpo
- Pulso relaxado
- Dedos curvados sobre as cordas`,
        duration: 90,
      },
      {
        id: 'step-3',
        type: 'exercise',
        title: 'Pratique a Postura',
        content: 'Posicione o violão e mantenha por 30 segundos com postura correta.',
        duration: 60,
        exerciseType: 'chord',
        exerciseData: {
          type: 'posture-check',
          checkpoints: ['costas-retas', 'ombros-relaxados', 'violao-posicionado'],
        },
      },
      {
        id: 'step-4',
        type: 'practice',
        title: 'Toque as Cordas Soltas',
        content: 'Toque cada corda solta (sem pressionar nenhum traste) da 6ª até a 1ª.',
        duration: 60,
        exerciseType: 'chord',
        exerciseData: {
          type: 'open-strings',
          strings: [6, 5, 4, 3, 2, 1],
        },
      },
    ],
    practiceGoal: 'Conseguir manter postura correta por 1 minuto e identificar todas as cordas',
    successCriteria: 'Tocar cada corda solta com som limpo',
    xpReward: 30,
    skillsToUnlock: ['posture', 'guitar-parts'],
  },
  {
    id: 'lesson-1-2',
    moduleId: 'module-1-fundamentals',
    title: 'Afinando o Violão',
    description: 'Aprenda a afinar seu violão usando o afinador do app',
    objectives: [
      'Usar o afinador digital',
      'Identificar quando uma corda está desafinada',
      'Ajustar as tarraxas corretamente',
    ],
    estimatedMinutes: 10,
    difficulty: 1,
    prerequisites: ['lesson-1-1'],
    steps: [
      {
        id: 'step-1',
        type: 'text',
        title: 'Afinação Padrão',
        content: `As cordas do violão na afinação padrão são:

**6ª corda** → Mi (E)
**5ª corda** → Lá (A)
**4ª corda** → Ré (D)
**3ª corda** → Sol (G)
**2ª corda** → Si (B)
**1ª corda** → Mi (E)

Dica para memorizar: **E**du **A**ma **D**oce **G**oiaba **B**em **E**squisita`,
        duration: 60,
      },
      {
        id: 'step-2',
        type: 'text',
        title: 'Como Usar o Afinador',
        content: `1. Abra o afinador no app
2. Toque UMA corda por vez
3. Observe o indicador:
   - **Verde no centro** = afinado
   - **Vermelho à esquerda** = grave demais (aperte a tarraxa)
   - **Vermelho à direita** = agudo demais (afrouxe a tarraxa)

4. Gire a tarraxa devagar enquanto observa
5. Pare quando ficar verde`,
        duration: 60,
      },
      {
        id: 'step-3',
        type: 'practice',
        title: 'Afine Seu Violão',
        content: 'Use o afinador para afinar todas as 6 cordas do seu violão.',
        duration: 300,
        exerciseType: 'chord',
        exerciseData: {
          type: 'tuning',
          targetNotes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
        },
      },
    ],
    practiceGoal: 'Conseguir afinar o violão sozinho em menos de 2 minutos',
    successCriteria: 'Todas as 6 cordas afinadas corretamente',
    xpReward: 40,
    skillsToUnlock: ['tuning'],
  },
];

// ==========================================
// MÓDULO 2: PRIMEIROS ACORDES
// ==========================================
const firstChordsLessons: Lesson[] = [
  {
    id: 'lesson-2-1',
    moduleId: 'module-2-first-chords',
    title: 'Seu Primeiro Acorde: Em',
    description: 'Aprenda o acorde de Mi menor - o mais fácil do violão!',
    objectives: [
      'Posicionar dedos para o acorde Em',
      'Tocar o acorde com som limpo',
      'Trocar entre cordas soltas e Em',
    ],
    estimatedMinutes: 12,
    difficulty: 1,
    prerequisites: ['lesson-1-2'],
    steps: [
      {
        id: 'step-1',
        type: 'text',
        title: 'O Acorde Em (Mi menor)',
        content: `**Por que começar com Em?**
- Usa apenas 2 dedos
- Posição natural da mão
- Som bonito e versátil
- Usado em milhares de músicas

**Formação:**
- Dedo 1 (indicador): 2ª corda, 2º traste
- Dedo 2 (médio): 3ª corda, 2º traste
- Toque todas as 6 cordas`,
        duration: 60,
      },
      {
        id: 'step-2',
        type: 'exercise',
        title: 'Monte o Acorde',
        content: 'Posicione os dedos conforme o diagrama e toque o acorde Em.',
        duration: 120,
        exerciseType: 'chord',
        exerciseData: {
          chord: 'Em',
          fingers: [
            { string: 5, fret: 2, finger: 2 },
            { string: 4, fret: 2, finger: 1 },
          ],
          stringsToPlay: [6, 5, 4, 3, 2, 1],
        },
      },
      {
        id: 'step-3',
        type: 'practice',
        title: 'Exercício: Montar e Desmontar',
        content: `Pratique montar e desmontar o acorde:

1. Posicione os dedos (Em)
2. Toque todas as cordas
3. Levante os dedos
4. Repita 10 vezes

**Foque em:** Som limpo, sem zumbidos`,
        duration: 180,
        exerciseType: 'chord',
        exerciseData: {
          type: 'mount-unmount',
          chord: 'Em',
          repetitions: 10,
        },
      },
      {
        id: 'step-4',
        type: 'quiz',
        title: 'Verificação',
        content: 'Qual dedo vai na 2ª corda para formar o Em?',
        duration: 30,
        exerciseData: {
          question: 'Qual dedo vai na 2ª corda para formar o Em?',
          options: ['Indicador (1)', 'Médio (2)', 'Anelar (3)', 'Mindinho (4)'],
          correct: 0,
        },
      },
    ],
    practiceGoal: 'Tocar Em 10 vezes seguidas com som limpo',
    successCriteria: 'Todas as cordas soam claramente, sem zumbidos',
    xpReward: 50,
    skillsToUnlock: ['chord-em'],
  },
  {
    id: 'lesson-2-2',
    moduleId: 'module-2-first-chords',
    title: 'Acorde Am (Lá menor)',
    description: 'Aprenda o segundo acorde mais fácil do violão',
    objectives: [
      'Posicionar dedos para Am',
      'Trocar entre Em e Am',
      'Manter ritmo constante na troca',
    ],
    estimatedMinutes: 15,
    difficulty: 1,
    prerequisites: ['lesson-2-1'],
    steps: [
      {
        id: 'step-1',
        type: 'text',
        title: 'O Acorde Am (Lá menor)',
        content: `**Formação:**
- Dedo 1: 2ª corda, 1º traste
- Dedo 2: 4ª corda, 2º traste
- Dedo 3: 3ª corda, 2º traste
- NÃO toque a 6ª corda (Mi grave)

**Dica:** Os dedos 2 e 3 ficam lado a lado no 2º traste, igual ao Em mas uma corda acima.`,
        duration: 60,
      },
      {
        id: 'step-2',
        type: 'exercise',
        title: 'Monte o Am',
        content: 'Posicione os dedos e toque o acorde Am.',
        duration: 120,
        exerciseType: 'chord',
        exerciseData: {
          chord: 'Am',
          fingers: [
            { string: 2, fret: 1, finger: 1 },
            { string: 4, fret: 2, finger: 2 },
            { string: 3, fret: 2, finger: 3 },
          ],
          stringsToPlay: [5, 4, 3, 2, 1],
        },
      },
      {
        id: 'step-3',
        type: 'practice',
        title: 'Troca Em ↔ Am',
        content: `Pratique trocar entre Em e Am:

1. Toque Em (4 batidas)
2. Troque para Am (4 batidas)
3. Repita 10 vezes

**Objetivo:** Trocar em menos de 2 segundos`,
        duration: 240,
        exerciseType: 'chord',
        exerciseData: {
          type: 'chord-change',
          chords: ['Em', 'Am'],
          beatsPerChord: 4,
          repetitions: 10,
          targetChangeTime: 2000,
        },
      },
    ],
    practiceGoal: 'Trocar entre Em e Am 20 vezes sem pausa',
    successCriteria: 'Troca fluida em menos de 2 segundos',
    xpReward: 60,
    skillsToUnlock: ['chord-am'],
  },
  {
    id: 'lesson-2-3',
    moduleId: 'module-2-first-chords',
    title: 'Acorde E (Mi maior)',
    description: 'Aprenda o acorde Mi maior - variação do Em',
    objectives: [
      'Diferenciar Em de E',
      'Ouvir a diferença entre maior e menor',
      'Tocar E com som limpo',
    ],
    estimatedMinutes: 12,
    difficulty: 1,
    prerequisites: ['lesson-2-1'],
    steps: [
      {
        id: 'step-1',
        type: 'text',
        title: 'Acorde E (Mi maior)',
        content: `**Formação:**
- Dedo 1: 3ª corda, 1º traste
- Dedo 2: 5ª corda, 2º traste
- Dedo 3: 4ª corda, 2º traste
- Toque TODAS as 6 cordas

**Diferença Em vs E:**
- Em = som triste (menor)
- E = som alegre (maior)
A única diferença é 1 dedo na 3ª corda!`,
        duration: 60,
      },
      {
        id: 'step-2',
        type: 'exercise',
        title: 'Monte o E',
        content: 'Posicione os dedos e toque o acorde E.',
        duration: 120,
        exerciseType: 'chord',
        exerciseData: {
          chord: 'E',
          fingers: [
            { string: 3, fret: 1, finger: 1 },
            { string: 5, fret: 2, finger: 2 },
            { string: 4, fret: 2, finger: 3 },
          ],
          stringsToPlay: [6, 5, 4, 3, 2, 1],
        },
      },
      {
        id: 'step-3',
        type: 'practice',
        title: 'Ouça a Diferença',
        content: `Compare os dois acordes:

1. Toque Em (escute o som "triste")
2. Toque E (escute o som "alegre")
3. Alterne 5 vezes cada

**Treino auditivo:** Feche os olhos e identifique qual é qual`,
        duration: 120,
        exerciseType: 'ear',
        exerciseData: {
          type: 'chord-comparison',
          chords: ['Em', 'E'],
          quality: ['minor', 'major'],
        },
      },
    ],
    practiceGoal: 'Distinguir auditivamente Em de E',
    successCriteria: 'Acertar 8/10 identificações de ouvido',
    xpReward: 55,
    skillsToUnlock: ['chord-e', 'hear-major-minor'],
  },
  {
    id: 'lesson-2-4',
    moduleId: 'module-2-first-chords',
    title: 'Acorde A (Lá maior)',
    description: 'Complete os 4 primeiros acordes essenciais',
    objectives: [
      'Posicionar 3 dedos em uma linha',
      'Tocar A com som limpo',
      'Trocar entre os 4 acordes básicos',
    ],
    estimatedMinutes: 15,
    difficulty: 2,
    prerequisites: ['lesson-2-2'],
    steps: [
      {
        id: 'step-1',
        type: 'text',
        title: 'Acorde A (Lá maior)',
        content: `**Formação:**
- Dedo 1: 4ª corda, 2º traste
- Dedo 2: 3ª corda, 2º traste
- Dedo 3: 2ª corda, 2º traste
- NÃO toque a 6ª corda

**Dica:** Os 3 dedos ficam lado a lado no 2º traste!
Mantenha os dedos bem curvados para não abafar as cordas vizinhas.`,
        duration: 60,
      },
      {
        id: 'step-2',
        type: 'exercise',
        title: 'Monte o A',
        content: 'Este acorde exige precisão - os dedos ficam bem juntos!',
        duration: 150,
        exerciseType: 'chord',
        exerciseData: {
          chord: 'A',
          fingers: [
            { string: 4, fret: 2, finger: 1 },
            { string: 3, fret: 2, finger: 2 },
            { string: 2, fret: 2, finger: 3 },
          ],
          stringsToPlay: [5, 4, 3, 2, 1],
        },
      },
      {
        id: 'step-3',
        type: 'practice',
        title: 'Ciclo dos 4 Acordes',
        content: `Pratique o ciclo completo:

Em → Am → E → A → (repete)

4 batidas em cada acorde
Repita o ciclo 5 vezes

**Foco:** Manter o tempo constante`,
        duration: 300,
        exerciseType: 'chord',
        exerciseData: {
          type: 'chord-cycle',
          chords: ['Em', 'Am', 'E', 'A'],
          beatsPerChord: 4,
          cycles: 5,
          bpm: 60,
        },
      },
    ],
    practiceGoal: 'Completar 5 ciclos dos 4 acordes sem parar',
    successCriteria: 'Todas as trocas em menos de 2 segundos',
    xpReward: 70,
    skillsToUnlock: ['chord-a'],
  },
];

// ==========================================
// MÓDULO 3: RITMO BÁSICO
// ==========================================
const basicRhythmLessons: Lesson[] = [
  {
    id: 'lesson-3-1',
    moduleId: 'module-3-rhythm',
    title: 'Sentindo o Pulso',
    description: 'Aprenda a manter o tempo com metrônomo',
    objectives: [
      'Entender o conceito de tempo/pulso',
      'Usar o metrônomo',
      'Tocar no tempo com 60 BPM',
    ],
    estimatedMinutes: 10,
    difficulty: 1,
    prerequisites: ['lesson-2-1'],
    steps: [
      {
        id: 'step-1',
        type: 'text',
        title: 'O Que é Pulso/Tempo?',
        content: `O pulso é a batida regular da música - como o coração!

**BPM** = Batidas Por Minuto
- 60 BPM = 1 batida por segundo (bem lento)
- 90 BPM = velocidade de caminhada
- 120 BPM = música animada

O metrônomo marca o pulso para você praticar.`,
        duration: 45,
      },
      {
        id: 'step-2',
        type: 'practice',
        title: 'Pratique com Metrônomo',
        content: `Use o metrônomo em 60 BPM:

1. Escute algumas batidas
2. Bata palma junto
3. Toque a 1ª corda solta junto
4. Continue por 1 minuto

**Objetivo:** Tocar exatamente junto com o clique`,
        duration: 120,
        exerciseType: 'rhythm',
        exerciseData: {
          type: 'metronome-sync',
          bpm: 60,
          duration: 60,
        },
      },
    ],
    practiceGoal: 'Manter sincronia com metrônomo por 1 minuto',
    successCriteria: 'Menos de 5 batidas fora do tempo',
    xpReward: 40,
    skillsToUnlock: ['pulse-feeling'],
  },
  {
    id: 'lesson-3-2',
    moduleId: 'module-3-rhythm',
    title: 'Batida 4/4 Básica',
    description: 'Aprenda a batida mais comum da música popular',
    objectives: [
      'Entender compasso 4/4',
      'Executar batida para baixo',
      'Aplicar em acordes',
    ],
    estimatedMinutes: 15,
    difficulty: 2,
    prerequisites: ['lesson-3-1', 'lesson-2-4'],
    steps: [
      {
        id: 'step-1',
        type: 'text',
        title: 'Compasso 4/4',
        content: `**4/4** significa 4 batidas por compasso.

Conte: **1 - 2 - 3 - 4 | 1 - 2 - 3 - 4**

Na batida básica, você toca para BAIXO em cada tempo:
↓  ↓  ↓  ↓ | ↓  ↓  ↓  ↓
1  2  3  4   1  2  3  4

Esta é a base de 90% das músicas!`,
        duration: 45,
      },
      {
        id: 'step-2',
        type: 'practice',
        title: 'Batida com Acordes',
        content: `Pratique a batida 4/4 com seus acordes:

1. Monte o acorde Em
2. Toque 4 vezes para baixo (↓ ↓ ↓ ↓)
3. Troque para Am
4. Repita

Use metrônomo em 60 BPM`,
        duration: 240,
        exerciseType: 'rhythm',
        exerciseData: {
          type: 'strum-pattern',
          pattern: ['down', 'down', 'down', 'down'],
          chords: ['Em', 'Am'],
          beatsPerChord: 4,
          bpm: 60,
        },
      },
    ],
    practiceGoal: 'Tocar 2 minutos com batida constante',
    successCriteria: 'Manter tempo sem acelerar ou desacelerar',
    xpReward: 60,
    skillsToUnlock: ['rhythm-44'],
  },
];

// ==========================================
// MÓDULO 4: SUA PRIMEIRA MÚSICA
// ==========================================
const firstSongLessons: Lesson[] = [
  {
    id: 'lesson-4-1',
    moduleId: 'module-4-first-song',
    title: 'Preparação: Música com 2 Acordes',
    description: 'Prepare-se para tocar sua primeira música completa',
    objectives: [
      'Dominar troca Em ↔ Am',
      'Manter batida constante por 2 minutos',
      'Entender estrutura de música simples',
    ],
    estimatedMinutes: 12,
    difficulty: 2,
    prerequisites: ['lesson-3-2'],
    steps: [
      {
        id: 'step-1',
        type: 'text',
        title: 'Estrutura de Música Simples',
        content: `Muitas músicas populares usam apenas 2 acordes!

**Estrutura básica:**
- Intro: 4 compassos
- Verso: 8 compassos
- Refrão: 8 compassos
- (repete)

Com Em e Am você já pode tocar várias músicas!`,
        duration: 45,
      },
      {
        id: 'step-2',
        type: 'practice',
        title: 'Treino de Resistência',
        content: `Toque Em → Am por 2 minutos sem parar:

Em: ↓ ↓ ↓ ↓ (1 compasso)
Am: ↓ ↓ ↓ ↓ (1 compasso)

BPM: 70
Foco: Não parar, mesmo se errar!`,
        duration: 180,
        exerciseType: 'chord',
        exerciseData: {
          type: 'endurance',
          chords: ['Em', 'Am'],
          duration: 120,
          bpm: 70,
        },
      },
    ],
    practiceGoal: 'Tocar 2 minutos sem interrupção',
    successCriteria: 'Zero paradas completas',
    xpReward: 50,
    skillsToUnlock: ['chord-changes-basic'],
  },
  {
    id: 'lesson-4-2',
    moduleId: 'module-4-first-song',
    title: 'Sua Primeira Música!',
    description: 'Toque uma música completa do início ao fim',
    objectives: [
      'Tocar música completa',
      'Seguir estrutura de verso/refrão',
      'Celebrar sua conquista!',
    ],
    estimatedMinutes: 20,
    difficulty: 2,
    prerequisites: ['lesson-4-1'],
    steps: [
      {
        id: 'step-1',
        type: 'text',
        title: 'Parabéns!',
        content: `Você chegou no momento mais importante:
**SUA PRIMEIRA MÚSICA COMPLETA!**

Vamos tocar "Asa Branca" simplificada:
- Usa apenas Em e Am
- Ritmo 4/4 básico
- Melodia conhecida

Esta conquista marca o início da sua jornada musical!`,
        duration: 30,
      },
      {
        id: 'step-2',
        type: 'practice',
        title: 'Toque a Música',
        content: `**Asa Branca (Simplificada)**

Intro: Em Em Am Am

Verso:
Em Em Am Am (2x)

Refrão:
Am Am Em Em
Am Am Em Em

Repita tudo 2 vezes.

**Dica:** Cante junto para ajudar no tempo!`,
        duration: 480,
        exerciseType: 'chord',
        exerciseData: {
          type: 'full-song',
          songId: 'asa-branca-simple',
          structure: [
            { section: 'intro', chords: ['Em', 'Em', 'Am', 'Am'] },
            { section: 'verse', chords: ['Em', 'Em', 'Am', 'Am', 'Em', 'Em', 'Am', 'Am'] },
            { section: 'chorus', chords: ['Am', 'Am', 'Em', 'Em', 'Am', 'Am', 'Em', 'Em'] },
          ],
          bpm: 80,
        },
      },
    ],
    practiceGoal: 'Tocar a música completa do início ao fim',
    successCriteria: 'Completar sem paradas longas (> 3 segundos)',
    xpReward: 200,
    skillsToUnlock: ['first-song'],
  },
];

// ==========================================
// EXPORTAR MÓDULOS
// ==========================================
export const lessonModules: LessonModule[] = [
  {
    id: 'module-1-fundamentals',
    title: 'Fundamentos',
    description: 'Postura, partes do violão e afinação',
    level: 'beginner',
    order: 1,
    lessons: fundamentalsLessons,
    icon: '🎸',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'module-2-first-chords',
    title: 'Primeiros Acordes',
    description: 'Em, Am, E, A - seus 4 primeiros acordes',
    level: 'beginner',
    order: 2,
    lessons: firstChordsLessons,
    icon: '🎵',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'module-3-rhythm',
    title: 'Ritmo Básico',
    description: 'Pulso, metrônomo e batida 4/4',
    level: 'beginner',
    order: 3,
    lessons: basicRhythmLessons,
    icon: '🥁',
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 'module-4-first-song',
    title: 'Primeira Música',
    description: 'Toque sua primeira música completa!',
    level: 'beginner',
    order: 4,
    lessons: firstSongLessons,
    icon: '🎤',
    color: 'from-purple-500 to-pink-500',
  },
];

// Helper para obter todas as lições
export const getAllLessons = (): Lesson[] => {
  return lessonModules.flatMap(m => m.lessons);
};

// Helper para obter lição por ID
export const getLessonById = (id: string): Lesson | undefined => {
  return getAllLessons().find(l => l.id === id);
};

// Helper para obter próxima lição
export const getNextLesson = (currentLessonId: string): Lesson | undefined => {
  const allLessons = getAllLessons();
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
  return allLessons[currentIndex + 1];
};

// Helper para verificar pré-requisitos
export const checkPrerequisites = (lessonId: string, completedLessons: string[]): boolean => {
  const lesson = getLessonById(lessonId);
  if (!lesson) return false;
  return lesson.prerequisites.every(prereq => completedLessons.includes(prereq));
};
