/**
 * Module 1.2: Ritmo Básico
 * Learning basic rhythm patterns and strumming
 */

import { Module } from '@/types/pedagogy';

export const module1_2: Module = {
    id: 'module-1-2',
    title: 'Ritmo Básico',
    description: 'Aprenda os fundamentos do ritmo e desenvolva sua mão direita',
    icon: '🥁',
    level: 1,
    order: 2,
    status: 'locked',
    estimatedDuration: '2 semanas',
    xpReward: 150,
    prerequisites: ['module-1-1'],
    skills: ['rhythm-basic', 'strumming', 'tempo'],

    badgeReward: {
        id: 'badge-rhythmist',
        name: 'Ritmista',
        description: 'Dominou os fundamentos do ritmo',
        icon: '🥁',
        rarity: 'uncommon',
        category: 'skill',
        unlockedAt: undefined,
        xpBonus: 25,
    },

    lessons: [
        {
            id: 'lesson-1-2-1',
            moduleId: 'module-1-2',
            title: 'O Que é Ritmo?',
            description: 'Entenda o conceito de ritmo e sua importância na música',
            order: 1,
            estimatedTime: 10,
            xpReward: 15,
            content: [
                {
                    type: 'heading',
                    content: 'Por Que o Ritmo é Tão Importante?',
                    metadata: { level: 2 },
                },
                {
                    type: 'text',
                    content: 'O ritmo é a **alma** da música. Mesmo que você toque as notas certas, sem ritmo a música não funciona. É o ritmo que faz as pessoas dançarem, baterem o pé, e sentirem a música.',
                },
                {
                    type: 'quote',
                    content: 'O ritmo é a batida do coração da música. Sem ele, não há vida.',
                },
                {
                    type: 'heading',
                    content: 'Elementos do Ritmo',
                    metadata: { level: 3 },
                },
                {
                    type: 'list',
                    content: '',
                    metadata: {
                        items: [
                            '**Tempo**: A velocidade da música (lenta, média, rápida)',
                            '**Compasso**: A organização dos tempos em grupos',
                            '**Pulso**: A batida regular que você sente',
                            '**Divisão**: Como cada tempo é subdividido',
                        ],
                    },
                },
                {
                    type: 'tip',
                    content: 'Uma boa forma de sentir o pulso é ouvir músicas e tentar bater palmas junto. Comece com músicas simples como cantigas populares.',
                },
                {
                    type: 'heading',
                    content: 'O Compasso 4/4',
                    metadata: { level: 3 },
                },
                {
                    type: 'text',
                    content: 'A maioria das músicas populares usa o **compasso 4/4**. Isso significa que cada compasso tem 4 tempos. Você pode contar: **1, 2, 3, 4, 1, 2, 3, 4...**',
                },
                {
                    type: 'example',
                    content: 'Músicas em 4/4: "Asa Branca", "Garota de Ipanema", "Imagine" (Beatles). Experimente ouvir e contar os tempos!',
                },
            ],
            images: [],
            diagrams: [],
            previousLessonId: undefined,
            nextLessonId: 'lesson-1-2-2',
        },
        {
            id: 'lesson-1-2-2',
            moduleId: 'module-1-2',
            title: 'Batida Básica Para Baixo',
            description: 'Aprenda a primeira técnica de batida com movimentos descendentes',
            order: 2,
            estimatedTime: 12,
            xpReward: 15,
            content: [
                {
                    type: 'heading',
                    content: 'A Batida Mais Simples',
                    metadata: { level: 2 },
                },
                {
                    type: 'text',
                    content: 'Vamos começar com a batida mais básica: tocar **apenas para baixo**, uma vez por tempo. Isso é chamado de **downstroke** ou **batida descendente**.',
                },
                {
                    type: 'heading',
                    content: 'Como Fazer',
                    metadata: { level: 3 },
                },
                {
                    type: 'list',
                    content: '',
                    metadata: {
                        items: [
                            'Segure a palheta (ou use o polegar) relaxadamente',
                            'Posicione a mão sobre a boca do violão',
                            'Mova o braço para baixo, tocando todas as cordas',
                            'Mantenha o movimento fluido e contínuo',
                        ],
                    },
                },
                {
                    type: 'warning',
                    content: 'NÃO trave o pulso! O movimento deve vir do antebraço, não apenas do pulso. Mantenha o pulso relaxado.',
                },
                {
                    type: 'heading',
                    content: 'Padrão: 4 Batidas por Compasso',
                    metadata: { level: 3 },
                },
                {
                    type: 'text',
                    content: 'Pratique assim: **↓ ↓ ↓ ↓** (conte: 1, 2, 3, 4). Cada seta representa uma batida para baixo. Faça isso devagar primeiro!',
                },
                {
                    type: 'tip',
                    content: 'Use um metrônomo a 60 BPM para começar. Cada "click" é um tempo onde você faz a batida.',
                },
                {
                    type: 'example',
                    content: 'Com o acorde de Dó (C), faça: C↓ C↓ C↓ C↓ | C↓ C↓ C↓ C↓ - repita várias vezes mantendo o ritmo constante.',
                },
            ],
            images: [],
            diagrams: [
                { id: 'C', type: 'chord' as const, caption: 'Acorde C para praticar' },
            ],
            previousLessonId: 'lesson-1-2-1',
            nextLessonId: 'lesson-1-2-3',
        },
        {
            id: 'lesson-1-2-3',
            moduleId: 'module-1-2',
            title: 'Batida Para Cima e Para Baixo',
            description: 'Adicione o movimento ascendente para criar batidas mais dinâmicas',
            order: 3,
            estimatedTime: 15,
            xpReward: 20,
            content: [
                {
                    type: 'heading',
                    content: 'Introduzindo o Upstroke',
                    metadata: { level: 2 },
                },
                {
                    type: 'text',
                    content: 'Agora vamos adicionar a batida **para cima** (upstroke). Isso dobra sua possibilidade rítmica e cria batidas mais interessantes.',
                },
                {
                    type: 'heading',
                    content: 'Técnica do Upstroke',
                    metadata: { level: 3 },
                },
                {
                    type: 'list',
                    content: '',
                    metadata: {
                        items: [
                            'Após a batida para baixo, retorne para cima tocando as cordas',
                            'O upstroke geralmente é mais leve que o downstroke',
                            'Você pode tocar apenas as 3 cordas mais agudas no upstroke',
                            'O movimento deve ser contínuo: baixo-cima-baixo-cima',
                        ],
                    },
                },
                {
                    type: 'heading',
                    content: 'Padrão: 8 Batidas por Compasso',
                    metadata: { level: 3 },
                },
                {
                    type: 'text',
                    content: 'Agora temos: **↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑** (conte: 1 e 2 e 3 e 4 e). Os "e" são os upstrokes entre os tempos.',
                },
                {
                    type: 'tip',
                    content: 'Para facilitar, pense no movimento como um pêndulo constante. Sua mão nunca para - ela está sempre indo para baixo ou para cima.',
                },
                {
                    type: 'warning',
                    content: 'Mantenha o tempo! É melhor tocar devagar e certinho do que rápido e desigual.',
                },
                {
                    type: 'example',
                    content: 'Com acordes G e C: G↓↑↓↑↓↑↓↑ | C↓↑↓↑↓↑↓↑ - cada compasso tem 4 tempos com subdivisões.',
                },
            ],
            images: [],
            diagrams: [
                { id: 'G', type: 'chord' as const, caption: 'Acorde G' },
                { id: 'C', type: 'chord' as const, caption: 'Acorde C' },
            ],
            previousLessonId: 'lesson-1-2-2',
            nextLessonId: 'lesson-1-2-4',
        },
        {
            id: 'lesson-1-2-4',
            moduleId: 'module-1-2',
            title: 'Padrão de Levada Popular',
            description: 'Aprenda a levada mais usada na música brasileira',
            order: 4,
            estimatedTime: 15,
            xpReward: 25,
            content: [
                {
                    type: 'heading',
                    content: 'A Levada Brasileira',
                    metadata: { level: 2 },
                },
                {
                    type: 'text',
                    content: 'Uma das levadas mais versáteis e usadas no Brasil é a **levada de pop/rock brasileiro**. Ela funciona para centenas de músicas!',
                },
                {
                    type: 'heading',
                    content: 'O Padrão',
                    metadata: { level: 3 },
                },
                {
                    type: 'text',
                    content: 'O padrão é: **↓ ↓ ↑ _ ↑ ↓ ↑** (o "_" significa que você move a mão mas NÃO toca as cordas).',
                },
                {
                    type: 'list',
                    content: '',
                    metadata: {
                        items: [
                            'Tempo 1: ↓ (para baixo)',
                            'Tempo 2: ↓↑ (baixo-cima)',
                            'Tempo 3: ↑ (só para cima - "pula" o baixo)',
                            'Tempo 4: ↓↑ (baixo-cima)',
                        ],
                    },
                },
                {
                    type: 'tip',
                    content: 'O segredo está no tempo 3. Sua mão continua o movimento para baixo, mas você "erra" de propósito as cordas. Isso cria uma síncope.',
                },
                {
                    type: 'heading',
                    content: 'Músicas Que Usam Essa Levada',
                    metadata: { level: 3 },
                },
                {
                    type: 'list',
                    content: '',
                    metadata: {
                        items: [
                            '"Pais e Filhos" - Legião Urbana',
                            '"Amor de Verdade" - MC Kevinho',
                            '"Exagerado" - Cazuza',
                            'Muitas músicas sertanejas',
                        ],
                    },
                },
                {
                    type: 'warning',
                    content: 'Pratique MUITO devagar no começo. É mais importante manter o padrão certo do que ir rápido.',
                },
            ],
            images: [],
            diagrams: [],
            previousLessonId: 'lesson-1-2-3',
            nextLessonId: 'lesson-1-2-5',
        },
        {
            id: 'lesson-1-2-5',
            moduleId: 'module-1-2',
            title: 'Trocando Acordes com Ritmo',
            description: 'Combine trocas de acordes com padrões rítmicos',
            order: 5,
            estimatedTime: 18,
            xpReward: 30,
            content: [
                {
                    type: 'heading',
                    content: 'O Grande Desafio',
                    metadata: { level: 2 },
                },
                {
                    type: 'text',
                    content: 'Agora vem o desafio real: manter o ritmo enquanto troca de acordes. Isso exige **coordenação entre as duas mãos** e é a base para tocar músicas completas.',
                },
                {
                    type: 'heading',
                    content: 'Estratégias para Trocar Acordes',
                    metadata: { level: 3 },
                },
                {
                    type: 'list',
                    content: '',
                    metadata: {
                        items: [
                            '**Antecipe a troca**: comece a mover os dedos da mão esquerda um pouco antes',
                            '**Pratique a transição isolada**: troque sem tocar, só movendo os dedos',
                            '**Use apenas 2 acordes no início**: domine a troca antes de adicionar mais',
                            '**Aceite acordes imperfeitos temporariamente**: é melhor manter o ritmo',
                        ],
                    },
                },
                {
                    type: 'tip',
                    content: 'A mão direita (ritmo) deve ser como um relógio - nunca para. Se você errar a troca, continue o ritmo mesmo que o acorde não soe perfeito.',
                },
                {
                    type: 'heading',
                    content: 'Progressão para Praticar: G - C - D - G',
                    metadata: { level: 3 },
                },
                {
                    type: 'text',
                    content: 'Esta é uma das progressões mais comuns na música! Pratique assim:',
                },
                {
                    type: 'list',
                    content: '',
                    metadata: {
                        items: [
                            'G: 1 compasso (4 tempos)',
                            'C: 1 compasso (4 tempos)',
                            'D: 1 compasso (4 tempos)',
                            'G: 1 compasso (4 tempos)',
                            'Repita!',
                        ],
                    },
                },
                {
                    type: 'warning',
                    content: 'Comece a 40-50 BPM. Só aumente o tempo quando conseguir fazer sem hesitações.',
                },
                {
                    type: 'example',
                    content: 'Músicas com G-C-D: "Sweet Home Alabama", "Wild Thing", "La Bamba" (versão simplificada).',
                },
            ],
            images: [],
            diagrams: [
                { id: 'G', type: 'chord' as const, caption: 'Acorde G' },
                { id: 'C', type: 'chord' as const, caption: 'Acorde C' },
                { id: 'D', type: 'chord' as const, caption: 'Acorde D' },
            ],
            previousLessonId: 'lesson-1-2-4',
            nextLessonId: undefined,
        },
    ],

    exercises: [
        {
            id: 'exercise-1-2-1',
            moduleId: 'module-1-2',
            title: 'Batida Descendente com Metrônomo',
            type: 'rhythm',
            instructions: 'Pratique a batida apenas para baixo, mantendo o tempo com o metrônomo',
            goal: 'Completar 2 minutos de batidas constantes a 60 BPM',
            estimatedTime: 5,
            xpReward: 20,
            hints: [
                'Conte em voz alta: 1, 2, 3, 4',
                'Olhe para sua mão e veja se está relaxada',
                'Respire normalmente, não prenda a respiração',
            ],
            successCriteria: ['Manter o tempo por 2 minutos', 'Sem hesitações perceptíveis', 'Mão relaxada'],
            commonMistakes: [
                'Pulso tenso - relaxe!',
                'Batidas irregulares',
                'Parar para pensar',
            ],
            data: {
                bpm: 60,
                duration: 120,
                pattern: '↓ ↓ ↓ ↓',
            },
        },
        {
            id: 'exercise-1-2-2',
            moduleId: 'module-1-2',
            title: 'Alternando Baixo e Cima',
            type: 'rhythm',
            instructions: 'Pratique a batida alternada baixo-cima de forma contínua',
            goal: 'Manter o padrão ↓↑↓↑ por 2 minutos a 60 BPM',
            estimatedTime: 8,
            xpReward: 25,
            hints: [
                'Pense em um pêndulo balançando',
                'O upstroke deve ser mais leve',
                'Mantenha o braço em movimento constante',
            ],
            successCriteria: ['Padrão constante baixo-cima', 'Upstrokes mais leves', 'Sem pausas'],
            commonMistakes: [
                'Upstroke muito forte',
                'Parar o movimento entre batidas',
                'Acelerar sem perceber',
            ],
            data: {
                bpm: 60,
                duration: 120,
                pattern: '↓↑↓↑↓↑↓↑',
            },
        },
        {
            id: 'exercise-1-2-3',
            moduleId: 'module-1-2',
            title: 'Levada Brasileira Básica',
            type: 'rhythm',
            instructions: 'Domine o padrão de levada popular ↓ ↓↑ _ ↑ ↓↑',
            goal: 'Executar o padrão fluentemente por 2 minutos',
            estimatedTime: 10,
            xpReward: 30,
            hints: [
                'No tempo 3, sua mão se move mas não toca',
                'Pratique em câmera lenta primeiro',
                'Conte: 1, 2e, e, 4e',
            ],
            successCriteria: ['Padrão correto', 'Síncope clara no tempo 3', 'Ritmo constante'],
            commonMistakes: [
                'Tocar o downstroke no tempo 3',
                'Pausar em vez de "passar" as cordas',
                'Perder a contagem',
            ],
            data: {
                bpm: 50,
                duration: 120,
                pattern: '↓ ↓↑ _↑ ↓↑',
            },
        },
        {
            id: 'exercise-1-2-4',
            moduleId: 'module-1-2',
            title: 'Troca G - C com Ritmo',
            type: 'chord-change',
            instructions: 'Pratique trocar entre G e C mantendo o ritmo de 4 batidas por compasso',
            goal: 'Fazer 20 trocas sem erros de ritmo',
            estimatedTime: 10,
            xpReward: 35,
            repetitions: 20,
            hints: [
                'Antecipe o movimento - comece a mover antes',
                'Foque no ritmo, não na perfeição do acorde',
                'O 3º dedo é o pivô entre G e C',
            ],
            successCriteria: ['20 trocas consecutivas', 'Ritmo mantido durante trocas', 'Acordes reconhecíveis'],
            commonMistakes: [
                'Parar o ritmo para trocar',
                'Esperar o acorde ficar perfeito antes de tocar',
                'Tensionar a mão esquerda',
            ],
            data: {
                fromChord: 'G',
                toChord: 'C',
                targetTime: 1.5,
                fingeringTips: [
                    'O 3º dedo (anelar) fica na 3ª casa em ambos os acordes',
                    'Use-o como âncora durante a troca',
                ],
            },
        },
        {
            id: 'exercise-1-2-5',
            moduleId: 'module-1-2',
            title: 'Progressão G - C - D',
            type: 'chord-change',
            instructions: 'Toque a progressão completa G - C - D - G com ritmo',
            goal: 'Completar 8 ciclos completos da progressão',
            estimatedTime: 12,
            xpReward: 40,
            repetitions: 8,
            hints: [
                'Cada acorde dura 1 compasso (4 tempos)',
                'Pratique cada troca isoladamente primeiro',
                'D para G é a troca mais difícil - foque nela',
            ],
            successCriteria: ['8 ciclos sem paradas', 'Ritmo constante', 'Transições suaves'],
            commonMistakes: [
                'Pausar entre acordes',
                'Perder a contagem do compasso',
                'Trocas desiguais (algumas lentas, outras rápidas)',
            ],
            data: {
                chordProgression: ['G', 'C', 'D', 'G'],
                beatsPerChord: 4,
            },
        },
    ],

    quiz: {
        id: 'quiz-1-2',
        moduleId: 'module-1-2',
        title: 'Quiz: Ritmo Básico',
        description: 'Teste seus conhecimentos sobre ritmo e batidas',
        passingScore: 70,
        xpReward: 50,
        perfectScoreBonus: 25,
        questions: [
            {
                id: 'q-1-2-1',
                question: 'O que significa o compasso 4/4?',
                options: [
                    { id: 'a', text: 'A música tem 4 acordes' },
                    { id: 'b', text: 'Cada compasso tem 4 tempos' },
                    { id: 'c', text: 'A música dura 4 minutos' },
                    { id: 'd', text: 'Você deve usar 4 dedos' },
                ],
                correctOptionId: 'b',
                explanation: 'O compasso 4/4 indica que cada compasso musical tem 4 tempos. É o compasso mais comum na música popular.',
                difficulty: 'easy',
                hint: 'Pense na contagem: 1, 2, 3, 4...',
            },
            {
                id: 'q-1-2-2',
                question: 'O que é um "downstroke"?',
                options: [
                    { id: 'a', text: 'Uma batida para cima' },
                    { id: 'b', text: 'Uma batida para baixo' },
                    { id: 'c', text: 'Uma batida silenciosa' },
                    { id: 'd', text: 'Uma técnica de dedilhado' },
                ],
                correctOptionId: 'b',
                explanation: 'Downstroke (batida descendente) é quando você move a mão para baixo, tocando as cordas de cima para baixo.',
                difficulty: 'easy',
                hint: 'Down = baixo em inglês.',
            },
            {
                id: 'q-1-2-3',
                question: 'Na batida alternada, o que acontece entre os tempos principais?',
                options: [
                    { id: 'a', text: 'Silêncio' },
                    { id: 'b', text: 'Batida para cima (upstroke)' },
                    { id: 'c', text: 'Mudança de acorde' },
                    { id: 'd', text: 'Nada' },
                ],
                correctOptionId: 'b',
                explanation: 'Na batida alternada, fazemos upstrokes entre os tempos principais, contando "1 e 2 e 3 e 4 e".',
                difficulty: 'medium',
                hint: 'Para onde a mão vai depois de descer?',
            },
            {
                id: 'q-1-2-4',
                question: 'Qual é a melhor velocidade para começar a praticar uma nova batida?',
                options: [
                    { id: 'a', text: 'A mais rápida possível' },
                    { id: 'b', text: 'Velocidade média (80-90 BPM)' },
                    { id: 'c', text: 'Bem devagar (40-60 BPM)' },
                    { id: 'd', text: 'Sem metrônomo' },
                ],
                correctOptionId: 'c',
                explanation: 'Sempre comece devagar! É mais importante fazer corretamente do que rapidamente. A velocidade vem com a prática.',
                difficulty: 'easy',
                hint: 'Qualidade antes de velocidade.',
            },
            {
                id: 'q-1-2-5',
                question: 'O que deve acontecer com a mão direita quando você troca de acorde?',
                options: [
                    { id: 'a', text: 'Ela deve parar e esperar' },
                    { id: 'b', text: 'Ela deve continuar o ritmo' },
                    { id: 'c', text: 'Ela deve mudar de padrão' },
                    { id: 'd', text: 'Ela deve se mover mais devagar' },
                ],
                correctOptionId: 'b',
                explanation: 'A mão direita é como um relógio - nunca para! Mesmo que a troca de acordes não seja perfeita, o ritmo deve continuar.',
                difficulty: 'medium',
                hint: 'O ritmo é a alma da música...',
            },
            {
                id: 'q-1-2-6',
                question: 'Qual é o erro mais comum ao fazer upstrokes?',
                options: [
                    { id: 'a', text: 'Tocar muito leve' },
                    { id: 'b', text: 'Tocar muito forte' },
                    { id: 'c', text: 'Não tocar' },
                    { id: 'd', text: 'Tocar as cordas erradas' },
                ],
                correctOptionId: 'b',
                explanation: 'O upstroke deve ser mais leve que o downstroke. Muitos iniciantes tocam ambos com a mesma força.',
                difficulty: 'medium',
                hint: 'Pense no movimento natural - subir é mais fácil que descer.',
            },
            {
                id: 'q-1-2-7',
                question: 'Na levada brasileira básica, o que acontece no tempo 3?',
                options: [
                    { id: 'a', text: 'Batida forte para baixo' },
                    { id: 'b', text: 'Batida para cima' },
                    { id: 'c', text: 'A mão se move mas não toca (síncope)' },
                    { id: 'd', text: 'Silêncio total' },
                ],
                correctOptionId: 'c',
                explanation: 'No tempo 3 da levada brasileira, a mão continua o movimento descendente mas "passa" sem tocar as cordas, criando uma síncope.',
                difficulty: 'hard',
                hint: 'É como "pular" uma batida mantendo o movimento.',
            },
            {
                id: 'q-1-2-8',
                question: 'O que é "pulso" na música?',
                options: [
                    { id: 'a', text: 'A velocidade da música' },
                    { id: 'b', text: 'A batida regular que você sente' },
                    { id: 'c', text: 'O volume do som' },
                    { id: 'd', text: 'A sequência de acordes' },
                ],
                correctOptionId: 'b',
                explanation: 'O pulso é a batida regular e constante que você sente na música - é o que faz você bater o pé ou balançar a cabeça.',
                difficulty: 'easy',
                hint: 'Pense no batimento do seu coração.',
            },
            {
                id: 'q-1-2-9',
                question: 'Por que devemos "antecipar" a troca de acordes?',
                options: [
                    { id: 'a', text: 'Porque parece mais profissional' },
                    { id: 'b', text: 'Para ter tempo de formar o acorde antes do tempo' },
                    { id: 'c', text: 'Porque é mais fácil' },
                    { id: 'd', text: 'Para tocar mais rápido' },
                ],
                correctOptionId: 'b',
                explanation: 'Antecipar a troca permite que os dedos estejam no lugar certo quando o tempo chegar, mantendo o ritmo fluente.',
                difficulty: 'medium',
                hint: 'Pense: quando o tempo bater, o acorde já deve estar pronto.',
            },
            {
                id: 'q-1-2-10',
                question: 'Qual progressão de acordes foi mencionada como sendo muito comum?',
                options: [
                    { id: 'a', text: 'Am - F - C' },
                    { id: 'b', text: 'G - C - D - G' },
                    { id: 'c', text: 'E - A - B' },
                    { id: 'd', text: 'D - G - A' },
                ],
                correctOptionId: 'b',
                explanation: 'A progressão G - C - D - G é uma das mais usadas na música popular, presente em centenas de músicas famosas.',
                difficulty: 'easy',
                hint: 'São três acordes que você já aprendeu no módulo anterior.',
            },
        ],
    },
};
