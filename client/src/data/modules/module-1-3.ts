/**
 * Module 1.3: Mais Acordes
 * Expanding chord vocabulary with Em, Am, and simplified F
 */

import { Module } from '@/types/pedagogy';

export const module1_3: Module = {
    id: 'module-1-3',
    title: 'Mais Acordes',
    description: 'Expanda seu vocabulário com acordes menores e o desafio do Fá',
    icon: '🎸',
    level: 1,
    order: 3,
    status: 'available',
    estimatedDuration: '2 semanas',
    xpReward: 200,
    prerequisites: [],
    skills: ['chords-minor', 'chord-f', 'transitions'],

    badgeReward: {
        id: 'badge-sad-songs',
        name: 'Melancólico',
        description: 'Dominou os acordes menores essenciais',
        icon: '😢',
        rarity: 'uncommon',
        category: 'skill',
        unlockedAt: undefined,
        xpBonus: 30,
    },

    lessons: [
        {
            id: 'lesson-1-3-1',
            moduleId: 'module-1-3',
            title: 'O Acorde Mais Fácil: Em',
            description: 'Aprenda o Mi Menor (Em), o acorde mais fácil do violão',
            order: 1,
            estimatedTime: 8,
            xpReward: 15,
            content: [
                {
                    type: 'heading',
                    content: 'Conhecendo o Mi Menor (Em)',
                    metadata: { level: 2 },
                },
                {
                    type: 'text',
                    content: 'O **Mi Menor** (representado por **Em**) é, provavelmente, o acorde mais fácil de tocar. Você só precisa de dois dedos!',
                },
                {
                    type: 'text',
                    content: 'A letra "m" minúscula indica que o acorde é **menor**. Acordes menores geralmente têm um som mais triste ou melancólico.',
                },
                {
                    type: 'heading',
                    content: 'Como Montar',
                    metadata: { level: 3 },
                },
                {
                    type: 'list',
                    content: '',
                    metadata: {
                        items: [
                            'Dedo 2 (médio): 5ª corda (Lá), casa 2',
                            'Dedo 3 (anelar): 4ª corda (Ré), casa 2',
                            'Toque TODAS as 6 cordas!',
                        ],
                    },
                },
                {
                    type: 'tip',
                    content: 'Arqueie bem os dedos para não abafar as cordas de baixo. Todas as cordas devem soar limpas.',
                },
            ],
            images: [],
            diagrams: [
                { id: 'Em', type: 'chord' as const, caption: 'Acorde Em (Mi Menor)' },
            ],
            previousLessonId: undefined,
            nextLessonId: 'lesson-1-3-2',
        },
        {
            id: 'lesson-1-3-2',
            moduleId: 'module-1-3',
            title: 'O Primo do Mi Maior: Am',
            description: 'Aprenda o Lá Menor (Am), essencial para músicas tristes',
            order: 2,
            estimatedTime: 12,
            xpReward: 20,
            content: [
                {
                    type: 'heading',
                    content: 'Apresentando o Lá Menor (Am)',
                    metadata: { level: 2 },
                },
                {
                    type: 'text',
                    content: 'O **Lá Menor (Am)** é outro acorde fundamental. Se você olhar bem, o formato dele é IDÊNTICO ao E Maior que aprendemos antes, só que uma corda abaixo!',
                },
                {
                    type: 'heading',
                    content: 'Como Montar',
                    metadata: { level: 3 },
                },
                {
                    type: 'list',
                    content: '',
                    metadata: {
                        items: [
                            'Dedo 1 (indicador): 2ª corda (Si), casa 1',
                            'Dedo 2 (médio): 4ª corda (Ré), casa 2',
                            'Dedo 3 (anelar): 3ª corda (Sol), casa 2',
                            'Toque da 5ª corda para baixo (evite a 6ª corda)',
                        ],
                    },
                },
                {
                    type: 'warning',
                    content: 'Cuidado para não tocar a 6ª corda (E grave). O baixo do acorde é a corda A (5ª corda) solta.',
                },
                {
                    type: 'heading',
                    content: 'A Troca Em ↔ Am',
                    metadata: { level: 3 },
                },
                {
                    type: 'text',
                    content: 'Esta troca é muito comum. Observe que os dedos 2 e 3 mantêm a mesma forma, apenas descem uma corda e você adiciona o indicador.',
                },
            ],
            images: [],
            diagrams: [
                { id: 'Am', type: 'chord' as const, caption: 'Acorde Am (Lá Menor)' },
                { id: 'Em', type: 'chord' as const, caption: 'Revisão: Em' },
            ],
            previousLessonId: 'lesson-1-3-1',
            nextLessonId: 'lesson-1-3-3',
        },
        {
            id: 'lesson-1-3-3',
            moduleId: 'module-1-3',
            title: 'O Desafio do F (Simplificado)',
            description: 'Aprenda a tocar o Fá Maior sem precisar da temida pestana',
            order: 3,
            estimatedTime: 15,
            xpReward: 25,
            content: [
                {
                    type: 'heading',
                    content: 'O Temido Fá Maior?',
                    metadata: { level: 2 },
                },
                {
                    type: 'text',
                    content: 'Muitos iniciantes desistem no Fá porque a versão tradicional usa uma pestana (o dedo indicador cobrindo todas as cordas). Mas temos um segredo: **você não precisa da pestana agora!**',
                },
                {
                    type: 'heading',
                    content: 'Fá Maior "Fácil" (Fmaj7)',
                    metadata: { level: 3 },
                },
                {
                    type: 'text',
                    content: 'Vamos aprender uma versão simplificada que soa linda e usa apenas 3 dedos (ou 4, se quiser o baixo).',
                },
                {
                    type: 'list',
                    content: '',
                    metadata: {
                        items: [
                            'Dedo 1 (indicador): 2ª corda, casa 1',
                            'Dedo 2 (médio): 3ª corda, casa 2',
                            'Dedo 3 (anelar): 4ª corda, casa 3',
                            'Toque da 4ª corda para baixo',
                        ],
                    },
                },
                {
                    type: 'text',
                    content: 'Isso forma uma "escadinha" com os dedos. É muito parecido com o C, mas "comprimido".',
                },
                {
                    type: 'tip',
                    content: 'Esta versão tecnicamente é um Fmaj7 (Fá com Sétima Maior), mas funciona perfeitamente no lugar do F na maioria das músicas pop!',
                },
            ],
            images: [],
            diagrams: [
                { id: 'F', type: 'chord' as const, caption: 'F (Forma Simplificada)' },
                { id: 'C', type: 'chord' as const, caption: 'Compare com o C' },
            ],
            previousLessonId: 'lesson-1-3-2',
            nextLessonId: 'lesson-1-3-4',
        },
        {
            id: 'lesson-1-3-4',
            moduleId: 'module-1-3',
            title: 'Progressão "Pop Triste"',
            description: 'Junte os acordes para tocar milhares de baladas',
            order: 4,
            estimatedTime: 15,
            xpReward: 25,
            content: [
                {
                    type: 'heading',
                    content: 'A Fórmula Mágica das Baladas',
                    metadata: { level: 2 },
                },
                {
                    type: 'text',
                    content: 'Se você juntar **Am - F - C - G**, você tem a progressão mais famosa para músicas emotivas. Músicas como "Someone Like You" (Adele), "Let It Be" (Beatles - variações) e muitas outras usam estes acordes.',
                },
                {
                    type: 'heading',
                    content: 'Dicas de Transição',
                    metadata: { level: 3 },
                },
                {
                    type: 'list',
                    content: '',
                    metadata: {
                        items: [
                            '**Am → F**: O dedo 3 (anelár) fica na mesma casa, mas muda de corda? Não, na verdade é melhor mover tudo. MAS, note que o formato é parecido.',
                            '**F → C**: Esta é muito fácil! O dedo 1 e 2 ficam quase na mesma posição, você só move o dedo 3 e o 2 sobe uma corda.',
                            '**C → G**: A troca clássica.',
                        ],
                    },
                },
                {
                    type: 'example',
                    content: 'Tente tocar 4 batidas e cada acorde: Am (4x) - F (4x) - C (4x) - G (4x). Soa familiar?',
                },
            ],
            images: [],
            diagrams: [
                { id: 'Am', type: 'chord' as const, caption: 'Am' },
                { id: 'F', type: 'chord' as const, caption: 'F' },
                { id: 'C', type: 'chord' as const, caption: 'C' },
                { id: 'G', type: 'chord' as const, caption: 'G' },
            ],
            previousLessonId: 'lesson-1-3-3',
            nextLessonId: undefined,
        },
    ],

    exercises: [
        {
            id: 'exercise-1-3-1',
            moduleId: 'module-1-3',
            title: 'Troca Em ↔ Am',
            type: 'chord-change',
            instructions: 'Pratique a troca entre Mi Menor e Lá Menor. Observe a economia de movimento.',
            goal: 'Realizar 20 trocas suaves',
            estimatedTime: 5,
            xpReward: 20,
            repetitions: 20,
            hints: [
                'Seus dedos 2 e 3 mantêm o mesmo formato!',
                'Eles apenas descem uma corda (de A/D para D/G)',
                'O dedo 1 entra e sai',
            ],
            successCriteria: ['Trocas fluidas', 'Sem parar o ritmo', 'Todas cordas soando'],
            commonMistakes: [
                'Desmanchar a mão toda para trocar',
                'Esquecer de adicionar o dedo 1 no Am',
                'Tocar a 6ª corda no Am',
            ],
            data: {
                fromChord: 'Em',
                toChord: 'Am',
                targetTime: 1.5,
                fingeringTips: [
                    'Use dedos 2 e 3 para o Em',
                    'Mova 2 e 3 juntos para baixo para o Am',
                ],
            },
        },
        {
            id: 'exercise-1-3-2',
            moduleId: 'module-1-3',
            title: 'Troca C ↔ F (Escadinha)',
            type: 'chord-change',
            instructions: 'Pratique a troca entre Dó e Fá Simplificado. É um movimento pequeno.',
            goal: '15 trocas precisas',
            estimatedTime: 8,
            xpReward: 30,
            repetitions: 15,
            hints: [
                'Do C para o F, o dedo 2 desce uma corda',
                'O dedo 3 também desce e recua uma casa',
                'O dedo 1 FICA na mesma casa e corda!',
            ],
            successCriteria: ['Dedo 1 fixo (pivô)', 'Troca rápida', 'Som limpo no F'],
            commonMistakes: [
                'Tirar o dedo 1 (indicador) - ele é seu âncora!',
                'Abafar a 1ª corda no C',
            ],
            data: {
                fromChord: 'C',
                toChord: 'F',
                targetTime: 2.0,
                fingeringTips: [
                    'Dedo 1 (indicador) não se move!',
                    'Ele é o PIVÔ perfeito entre C e F',
                ],
            },
        },
        {
            id: 'exercise-1-3-3',
            moduleId: 'module-1-3',
            title: 'Progressão das Baladas',
            type: 'chord-change',
            instructions: 'Toque a sequência Am - F - C - G com ritmo básico',
            goal: 'Completar 5 ciclos sem errar',
            estimatedTime: 10,
            xpReward: 40,
            repetitions: 5,
            hints: [
                'Am para F é só adaptar a "escadinha"',
                'F para C usa o dedo 1 como pivô',
                'G exige mudança maior, prepare-se antes',
            ],
            successCriteria: ['Ritmo constante', 'Trocas no tempo', 'Acordes limpos'],
            commonMistakes: [
                'Pausar na troca do F',
                'Tocar cordas erradas no baixo',
                'Perder o ritmo no G',
            ],
            data: {
                chordProgression: ['Am', 'F', 'C', 'G'],
                beatsPerChord: 4,
            },
        },
    ],

    quiz: {
        id: 'quiz-1-3',
        moduleId: 'module-1-3',
        title: 'Quiz: Mais Acordes',
        description: 'Verifique seu conhecimento sobre acordes menores e o Fá',
        passingScore: 70,
        xpReward: 50,
        perfectScoreBonus: 25,
        questions: [
            {
                id: 'q-1-3-1',
                question: 'Qual a principal diferença sonora entre acordes Maiores e Menores?',
                options: [
                    { id: 'a', text: 'Maiores são mais altos, Menores mais baixos' },
                    { id: 'b', text: 'Maiores soam "alegres", Menores soam "tristes/melancólicos"' },
                    { id: 'c', text: 'Menores usam menos dedos' },
                    { id: 'd', text: 'Não há diferença sonora' },
                ],
                correctOptionId: 'b',
                explanation: 'Geralmente associamos acordes Maiores a sentimentos de alegria/brilho e Menores a tristeza/introspecção.',
                difficulty: 'easy',
                hint: 'Pense em "Happy Birthday" (Maior) vs uma música triste.',
            },
            {
                id: 'q-1-3-2',
                question: 'Quantos dedos você OBRIGATORIAMENTE precisa para fazer o Em?',
                options: [
                    { id: 'a', text: '1 dedo' },
                    { id: 'b', text: '2 dedos' },
                    { id: 'c', text: '3 dedos' },
                    { id: 'd', text: '4 dedos' },
                ],
                correctOptionId: 'b',
                explanation: 'O Mi Menor (Em) padrão usa apenas 2 dedos (geralmente médio e anelar na casa 2).',
                difficulty: 'easy',
                hint: 'É o acorde mais fácil!',
            },
            {
                id: 'q-1-3-3',
                question: 'Para o acorde Am, qual corda NÃO devemos tocar?',
                options: [
                    { id: 'a', text: '1ª corda (Ezinha)' },
                    { id: 'b', text: '5ª corda (A)' },
                    { id: 'c', text: '6ª corda (Ezon)' },
                    { id: 'd', text: '3ª corda (G)' },
                ],
                correctOptionId: 'c',
                explanation: 'O baixo do Am é a corda Lá (5ª). Tocar a 6ª corda (Mi) deixa o som "sujo" porque o baixo fica errado (inversão não intencional).',
                difficulty: 'medium',
                hint: 'A corda mais grossa de todas.',
            },
            {
                id: 'q-1-3-4',
                question: 'Qual dedo serve como "Pivô" (não sai do lugar) na troca entre C e F?',
                options: [
                    { id: 'a', text: 'Dedo 1 (Indicador)' },
                    { id: 'b', text: 'Dedo 2 (Médio)' },
                    { id: 'c', text: 'Dedo 3 (Anelar)' },
                    { id: 'd', text: 'Dedo 4 (Mínimo)' },
                ],
                correctOptionId: 'a',
                explanation: 'O dedo 1 (indicador) fica na 1ª casa da 2ª corda tanto no C quanto no Fmaj7 (simplificado). Não o levante!',
                difficulty: 'medium',
                hint: 'Aquele que fica na 2ª corda.',
            },
        ],
    },
};
