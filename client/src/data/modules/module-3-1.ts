import { Module } from '@/types/pedagogy';

export const module3_1: Module = {
    id: 'module-3-1',
    title: 'Introdução à Improvisação',
    description: 'Liberte sua criatividade com a Escala Pentatônica',
    icon: '🔥',
    level: 2,
    order: 2,
    status: 'locked',
    estimatedDuration: '2 semanas',
    xpReward: 300,
    prerequisites: ['module-2-1'],
    skills: ['improvisation', 'pentatonic-scale', 'phrasing'],
    tags: ['solo', 'criatividade', 'blues'],
    badgeReward: {
        id: 'improv-starter',
        name: 'Improvisador Iniciante',
        description: 'Deu os primeiros passos na criação de solos.',
        icon: '🎷',
        rarity: 'uncommon',
        xpBonus: 100
    },
    lessons: [
        {
            id: 'lesson-3-1-1',
            moduleId: 'module-3-1',
            order: 1,
            title: 'O Que é Improvisação?',
            estimatedTime: 10,
            content: [
                {
                    type: 'heading',
                    content: 'Conversando com o Violão',
                    metadata: { level: 2 }
                },
                {
                    type: 'text',
                    content: 'Improvisar é como conversar. Você não lê um roteiro quando fala com seus amigos; você usa as palavras que conhece para expressar ideias na hora. Na música, as "palavras" são as notas e frases.'
                },
                {
                    type: 'quote',
                    content: 'A improvisação é a composição em tempo real.'
                },
                {
                    type: 'text',
                    content: 'Neste módulo, vamos usar a **Escala Pentatônica Menor** como nosso vocabulário principal. Ela é mágica porque quase todas as notas soam bem juntas!'
                }
            ]
        },
        {
            id: 'lesson-3-1-2',
            moduleId: 'module-3-1',
            order: 2,
            title: 'A Escala Pentatônica Menor (Shape 1)',
            estimatedTime: 15,
            content: [
                {
                    type: 'heading',
                    content: 'O Shape Mais Famoso da Guitarra',
                    metadata: { level: 2 }
                },
                {
                    type: 'text',
                    content: 'Este desenho (shape) na tonalidade de Lá Menor (Am) é usado por lendas como Jimi Hendrix, Eric Clapton e David Gilmour.'
                },
                {
                    type: 'list',
                    content: 'Toque casa nota uma por uma, subindo e descendo.',
                    metadata: { items: ['Comece na casa 5 da corda E (Tônica)', 'Use o dedo 1 para a casa 5 e o dedo 4 para a casa 8', 'Mantenha o padrão: 1-4, 1-3, 1-3, 1-3, 1-4, 1-4'] }
                }
            ],
            diagrams: [
                { type: 'scale', id: 'a-minor-pentatonic', caption: 'Pentatônica Menor de Lá (Shape 1)' }
            ]
        },
        {
            id: 'lesson-3-1-3',
            moduleId: 'module-3-1',
            order: 3,
            title: 'Fraseado: Pergunta e Resposta',
            estimatedTime: 20,
            content: [
                {
                    type: 'text',
                    content: 'Não basta subir e descer a escala como um robô. Precisamos criar música! Uma técnica clássica é a "Pergunta e Resposta".'
                },
                {
                    type: 'example',
                    content: 'Tente tocar uma frase curta que soe "inconclusiva" (Pergunta), e depois outra frase que pareça "resolver" a tensão (Resposta).'
                },
                {
                    type: 'tip',
                    content: 'Terminar na nota Tônica (Lá/A) geralmente dá a sensação de "ponto final" ou conclusão.'
                }
            ]
        }
    ],
    exercises: [
        {
            id: 'exercise-3-1-1',
            moduleId: 'module-3-1',
            type: 'fingering',
            title: 'Memorizando o Shape 1',
            instructions: 'Toque a escala pentatônica de Lá Menor completa (ida e volta) sem errar.',
            goal: 'Fluidez e memorização visual',
            estimatedTime: 5,
            successCriteria: {
                type: 'self-report',
                description: 'Consegui tocar subir e descer sem travar'
            },
            xpReward: 30,
            hints: ['Use um dedo para cada casa (Dedo 1 na casa 5, etc).'],
            commonMistakes: ['Levantar muito os dedos', 'Perder o ritmo']
        },
        {
            id: 'exercise-3-1-2',
            moduleId: 'module-3-1',
            type: 'improvisation',
            title: 'Jam Session: Blues em Am',
            instructions: 'Use o Backing Track Player abaixo. Escolha "Blues in Am" e tente criar melodias simples usando apenas as notas da Pentatônica.',
            goal: 'Criatividade e diversão',
            estimatedTime: 10,
            successCriteria: {
                type: 'time',
                target: 300, // 5 minutes
                description: 'Praticar improvisação por 5 minutos'
            },
            xpReward: 50,
            hints: ['Respire! Deixe espaço entre as frases.', 'Repita ideias que soaram bem.'],
            commonMistakes: ['Tocar notas demais', 'Não ouvir a base']
        }
    ],
    quiz: {
        id: 'quiz-3-1',
        moduleId: 'module-3-1',
        title: 'Quiz de Improvisação',
        description: 'Teste seus conhecimentos sobre a pentatônica',
        passingScore: 70,
        xpReward: 50,
        perfectScoreBonus: 20,
        questions: [
            {
                id: 'q1',
                question: 'Quantas notas tem uma escala pentatônica?',
                type: 'multiple-choice',
                options: [
                    { id: 'opt1', text: '5' },
                    { id: 'opt2', text: '7' },
                    { id: 'opt3', text: '12' },
                    { id: 'opt4', text: '8' }
                ],
                correctOptionId: 'opt1',
                explanation: 'Penta = Cinco. A escala remove 2 notas da escala menor natural para evitar tensões.'
            },
            {
                id: 'q2',
                question: 'Qual nota geralmente dá a sensação de conclusão ou resolução?',
                type: 'multiple-choice',
                options: [
                    { id: 'opt1', text: 'A Tônica (Raiz)' },
                    { id: 'opt2', text: 'A Blue Note' },
                    { id: 'opt3', text: 'Qualquer nota' }
                ],
                correctOptionId: 'opt1',
                explanation: 'A tônica é o centro gravitacional da tonalidade. Terminar nela traz a sensação de "casa".'
            }
        ]
    }
};
