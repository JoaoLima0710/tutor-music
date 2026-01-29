/**
 * Module 2.1: Pestanas (Barre Chords)
 * Introduction to movable chords and the F Major / B Minor shapes
 */

import { Module } from '@/types/pedagogy';

export const module2_1: Module = {
    id: 'module-2-1',
    title: 'Pestanas',
    description: 'Desbloqueie o braço inteiro do violão com acordes móveis',
    icon: '🗝️',
    level: 2,
    order: 1,
    status: 'available',
    estimatedDuration: '3 semanas',
    xpReward: 300,
    prerequisites: ['module-1-3'],
    skills: ['barre-chords', 'movable-shapes', 'finger-strength'],

    badgeReward: {
        id: 'badge-barre-master',
        name: 'Mestre das Chaves',
        description: 'Dominou a técnica da pestana',
        icon: '💪',
        rarity: 'rare',
        category: 'technique',
        unlockedAt: undefined,
        xpBonus: 50,
    },

    lessons: [
        {
            id: 'lesson-2-1-1',
            moduleId: 'module-2-1',
            title: 'O Que é uma Pestana?',
            description: 'A técnica que separa iniciantes de intermediários',
            order: 1,
            estimatedTime: 10,
            xpReward: 20,
            content: [
                {
                    type: 'heading',
                    content: 'O Dedo Que Vale Por Mil',
                    metadata: { level: 2 },
                },
                {
                    type: 'text',
                    content: 'Até agora, usamos o "capotraste" (ou a pestana branca do violão) como base. Mas e se você pudesse mover essa base? A **pestana** é exatamente isso: usar seu dedo indicador para apertar várias cordas ao mesmo tempo.',
                },
                {
                    type: 'heading',
                    content: 'Anatomia Perfeita',
                    metadata: { level: 3 },
                },
                {
                    type: 'list',
                    content: '',
                    metadata: {
                        items: [
                            '**Dedo Reto**: Seu indicador deve ficar reto, como uma barra rígida.',
                            '**Use a Lateral**: Não use a parte "gordinha" da frente do dedo. Gire-o levemente para usar a lateral óssea (lado do polegar).',
                            '**Polegar Baixo**: Seu polegar deve descer para o meio do braço (atrás), dando suporte.',
                            '**Punho para Frente**: Projete o punho levemente para frente para dar alcance.',
                        ],
                    },
                },
                {
                    type: 'warning',
                    content: 'É normal sentir cansaço no músculo do polegar no início. Faça pausas! Não force se sentir dor.',
                },
            ],
            images: [],
            diagrams: [],
            previousLessonId: undefined,
            nextLessonId: 'lesson-2-1-2',
        },
        {
            id: 'lesson-2-1-2',
            moduleId: 'module-2-1',
            title: 'O Fá Maior (Shape de E)',
            description: 'Seu primeiro desafio real: o acorde de Fá com pestana',
            order: 2,
            estimatedTime: 15,
            xpReward: 30,
            content: [
                {
                    type: 'heading',
                    content: 'O Formato de Mi (E)',
                    metadata: { level: 2 },
                },
                {
                    type: 'text',
                    content: 'Lembra do E Maior? Se você fizer o E Maior com os dedos 2, 3 e 4 (deixando o indicador livre) e deslizar tudo uma casa para frente, o seu indicador assume o papel da "pestana branca".',
                },
                {
                    type: 'heading',
                    content: 'Como Montar o F (Fá Maior)',
                    metadata: { level: 3 },
                },
                {
                    type: 'list',
                    content: '',
                    metadata: {
                        items: [
                            '**Passo 1**: Coloque a pestana na CASA 1 cobrindo todas as 6 cordas.',
                            '**Passo 2**: Dedo 2 (médio) na 3ª corda, casa 2.',
                            '**Passo 3**: Dedo 3 (anelar) na 5ª corda, casa 3.',
                            '**Passo 4**: Dedo 4 (mínimo) na 4ª corda, casa 3.',
                        ],
                    },
                },
                {
                    type: 'text',
                    content: 'Percebeu? É o desenho do E, mas deslocado.',
                },
                {
                    type: 'tip',
                    content: 'Você não precisa aplicar força em TODAS as cordas com a pestana. Foque na pressão da 6ª corda, e das cordas 1 e 2. O "miolo" já está sendo apertado pelos outros dedos!',
                },
            ],
            images: [],
            diagrams: [
                { id: 'F_barre', type: 'chord' as const, caption: 'F (Fá Maior - Pestana)' },
                { id: 'E', type: 'chord' as const, caption: 'Compare com o E (Mi Maior)' },
            ],
            previousLessonId: 'lesson-2-1-1',
            nextLessonId: 'lesson-2-1-3',
        },
        {
            id: 'lesson-2-1-3',
            moduleId: 'module-2-1',
            title: 'A Mágica dos Acordes Móveis',
            description: 'Como transformar um acorde em doze',
            order: 3,
            estimatedTime: 10,
            xpReward: 25,
            content: [
                {
                    type: 'heading',
                    content: 'O Segredo',
                    metadata: { level: 2 },
                },
                {
                    type: 'text',
                    content: 'A beleza da pestana é que **o desenho não muda**. Se você arrastar o formato do Fá duas casas para frente (pestana na casa 3), ele vira um Sol (G). Mais duas casas (casa 5), vira um Lá (A).',
                },
                {
                    type: 'heading',
                    content: 'Onde está a Tônica?',
                    metadata: { level: 3 },
                },
                {
                    type: 'text',
                    content: 'A nota que dá nome ao acorde está na **6ª corda** (onde seu dedo indicador aperta a corda mais grossa).',
                },
                {
                    type: 'list',
                    content: '',
                    metadata: {
                        items: [
                            'Casa 1: Fá (F)',
                            'Casa 3: Sol (G)',
                            'Casa 5: Lá (A)',
                            'Casa 7: Si (B)',
                        ],
                    },
                },
                {
                    type: 'tip',
                    content: 'Agora você pode tocar qualquer acorde Maior apenas movendo esse único formato pelo braço!',
                },
            ],
            images: [],
            diagrams: [
                { id: 'F_barre', type: 'chord' as const, caption: 'F (Casa 1)' },
                { id: 'G_barre', type: 'chord' as const, caption: 'G (Casa 3 - mesmo desenho!)' },
            ],
            previousLessonId: 'lesson-2-1-2',
            nextLessonId: 'lesson-2-1-4',
        },
        {
            id: 'lesson-2-1-4',
            moduleId: 'module-2-1',
            title: 'Si Menor (Bm) - A Pestana de Lá',
            description: 'O segundo formato essencial: baseado no Lá Menor',
            order: 4,
            estimatedTime: 15,
            xpReward: 30,
            content: [
                {
                    type: 'heading',
                    content: 'O Formato de Lá Menor (Am)',
                    metadata: { level: 2 },
                },
                {
                    type: 'text',
                    content: 'Agora vamos fazer a mesma mágica com o acorde Am. Se movermos o Am duas casas para frente e colocarmos a pestana na casa 2, temos o **Si Menor (Bm)**.',
                },
                {
                    type: 'heading',
                    content: 'Como Montar o Bm',
                    metadata: { level: 3 },
                },
                {
                    type: 'list',
                    content: '',
                    metadata: {
                        items: [
                            '**Pestana**: Casa 2, da 5ª corda para baixo (a ponta do indicador toca levemente a 6ª corda para abafá-la).',
                            '**Dedo 2**: 2ª corda, casa 3.',
                            '**Dedo 3**: 4ª corda, casa 4.',
                            '**Dedo 4**: 3ª corda, casa 4.',
                        ],
                    },
                },
                {
                    type: 'alert',
                    content: 'A tônica (nota principal) agora está na 5ª corda. Não toque a corda 6 (E grave)!',
                },
            ],
            images: [],
            diagrams: [
                { id: 'Bm', type: 'chord' as const, caption: 'Bm (Si Menor)' },
                { id: 'Am', type: 'chord' as const, caption: 'Baseado no Am' },
            ],
            previousLessonId: 'lesson-2-1-3',
            nextLessonId: undefined,
        },
    ],

    exercises: [
        {
            id: 'exercise-2-1-1',
            moduleId: 'module-2-1',
            title: 'Força da Pinça (Pestana Limpa)',
            type: 'theory', // Using theory template for checklist-style drill
            instructions: 'Verifique se todas as notas da sua pestana estão soando limpas.',
            goal: 'Garantir clareza no som',
            estimatedTime: 5,
            xpReward: 20,
            repetitions: 10,
            hints: [
                'Gire o dedo indicador levemente (use a lateral)',
                'Aproxime a pestana do traste (ferrinho) da frente',
                'Verifique corda por corda',
            ],
            successCriteria: ['Todas as cordas soam', 'Sem trastejamento', 'Sem dor excessiva'],
            commonMistakes: [
                'Pestana muito longe do traste',
                'Dedo "mole" ou curvo',
                'Polegar muito alto (abraçando o braço)',
            ],
            data: {
                questions: [
                    'A 6ª corda está soando limpa?',
                    'As cordas 1 e 2 (lá embaixo) estão claras?',
                    'O polegar está posicionado no meio do braço?',
                ],
            },
        },
        {
            id: 'exercise-2-1-2',
            moduleId: 'module-2-1',
            title: 'A "Escadinha" do Fá',
            type: 'chord-change',
            instructions: 'Pratique sair do E Maior (aberto) para o F Maior (Pestana).',
            goal: '10 trocas precisas',
            estimatedTime: 10,
            xpReward: 35,
            repetitions: 10,
            hints: [
                'Monte a forma do acorde no ar antes de pousar',
                'Ou, coloque a pestana primeiro e depois os dedos (ou vice-versa, descubra o que é melhor para você)',
                'Use o E como descanso para a mão',
            ],
            successCriteria: ['Som limpo após a troca', 'Tempo razoável (menos de 2s)', 'Forma correta'],
            commonMistakes: [
                'Desistir porque dói (faça pausas!)',
                'Colocar dedo por dedo lentamente',
            ],
            data: {
                fromChord: 'E',
                toChord: 'F',
                targetTime: 3.0,
                fingeringTips: [
                    'Imagine que o E deslizou uma casa',
                    'O indicador entra "atrás" para fazer a barra',
                ],
            },
        },
        {
            id: 'exercise-2-1-3',
            moduleId: 'module-2-1',
            title: 'Progressão Pestanuda',
            type: 'chord-change',
            instructions: 'Toque Bm - G (com pestana casa 3) - A (com pestana casa 5). Sinta o poder de mover a forma!',
            goal: 'Fluidez no movimento horizontal',
            estimatedTime: 12,
            xpReward: 45,
            repetitions: 5,
            hints: [
                'Do G para o A, a mão NÃO MUDA de formato! Apenas deslize 2 casas.',
                'Do Bm para o G, você muda da "forma de Am" para a "forma de E".',
            ],
            successCriteria: ['Deslizamento preciso', 'Manter pressão durante música', 'Acordes soando'],
            commonMistakes: [
                'Perder a pressão durante o deslizamento',
                'Errar a casa de destino',
            ],
            data: {
                chordProgression: ['Bm', 'G', 'A', 'Bm'], // G and A implied as barres here
                beatsPerChord: 4,
            },
        },
    ],

    quiz: {
        id: 'quiz-2-1',
        moduleId: 'module-2-1',
        title: 'Quiz das Pestanas',
        description: 'Teste seu conhecimento sobre a técnica e teoria',
        passingScore: 70,
        xpReward: 60,
        perfectScoreBonus: 30,
        questions: [
            {
                id: 'q-2-1-1',
                question: 'Qual parte do dedo indicador devemos usar preferencialmente para fazer a pestana?',
                options: [
                    { id: 'a', text: 'A frente (parte macia)' },
                    { id: 'b', text: 'A lateral (parte óssea)' },
                    { id: 'c', text: 'A ponta do dedo apenas' },
                    { id: 'd', text: 'A base do dedo' },
                ],
                correctOptionId: 'b',
                explanation: 'A lateral do dedo é mais rígida e tem menos "carne", facilitando prender todas as cordas com firmeza.',
                difficulty: 'easy',
                hint: 'Gire levemente o dedo.',
            },
            {
                id: 'q-2-1-2',
                question: 'Se eu tenho um acorde F (Fá) na casa 1, que acorde eu tenho se mover o mesmo desenho para a casa 3?',
                options: [
                    { id: 'a', text: 'F# (Fá Sustenido)' },
                    { id: 'b', text: 'G (Sol)' },
                    { id: 'c', text: 'A (Lá)' },
                    { id: 'd', text: 'E (Mi)' },
                ],
                correctOptionId: 'b',
                explanation: 'A escala cromática é F -> F# -> G. Duas casas para frente transformam o Fá em Sol.',
                difficulty: 'medium',
                hint: 'Fá -> Fá# -> Sol',
            },
            {
                id: 'q-2-1-3',
                question: 'Onde está a nota Tônica (Raiz) do acorde Si Menor (Bm)?',
                options: [
                    { id: 'a', text: '6ª corda (E)' },
                    { id: 'b', text: '5ª corda (A)' },
                    { id: 'c', text: '4ª corda (D)' },
                    { id: 'd', text: '1ª corda (E)' },
                ],
                correctOptionId: 'b',
                explanation: 'O formato de Bm é baseado no Am. A tônica do Am é a corda Lá solta (5ª). Logo, a tônica do Bm também está na 5ª corda (na casa da pestana).',
                difficulty: 'medium',
                hint: 'É igual ao Lá Menor.',
            },
            {
                id: 'q-2-1-4',
                question: 'Onde o polegar deve ficar para dar melhor suporte à pestana?',
                options: [
                    { id: 'a', text: 'Abraçando o braço lá em cima' },
                    { id: 'b', text: 'No meio do braço, atrás, paralelo ao indicador' },
                    { id: 'c', text: 'Apontando para a mão do violão' },
                    { id: 'd', text: 'Não encosta no braço' },
                ],
                correctOptionId: 'b',
                explanation: 'O polegar deve descer para o meio do braço para fazer uma "pinça" eficiente com o indicador.',
                difficulty: 'easy',
                hint: 'Pense em uma pinça.',
            },
        ],
    },
};
