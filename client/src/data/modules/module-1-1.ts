/**
 * Module 1.1: Primeiros Passos
 * First curriculum module for absolute beginners
 */

import { Module, Lesson, Exercise, Quiz } from '@/types/pedagogy';

// =============================================================================
// LESSONS
// =============================================================================

const lesson1: Lesson = {
    id: 'lesson-1-1-1',
    moduleId: 'module-1-1',
    order: 1,
    title: 'Postura Correta ao Tocar',
    estimatedTime: 10,
    content: [
        {
            type: 'text',
            content: 'Você sabia que **80% dos iniciantes** desenvolvem dores nas costas ou ombros por má postura? Aprender a postura correta desde o início vai garantir que você toque por horas sem desconforto!',
        },
        {
            type: 'heading',
            content: 'Por que a Postura é Importante?',
            metadata: { level: 2 },
        },
        {
            type: 'text',
            content: 'A postura correta ao tocar violão não é apenas sobre conforto. Ela afeta diretamente sua **técnica**, **resistência** e **saúde**.',
        },
        {
            type: 'list',
            content: '',
            metadata: {
                items: [
                    '**Técnica**: Uma boa postura permite que seus dedos alcancem todas as cordas com facilidade',
                    '**Resistência**: Com postura correta, você pode praticar por muito mais tempo',
                    '**Saúde**: Evita lesões por esforço repetitivo (LER) e dores crônicas',
                ],
            },
        },
        {
            type: 'quote',
            content: 'Pense na postura como a fundação de uma casa. Se a fundação estiver torta, toda a estrutura ficará comprometida!',
        },
        {
            type: 'heading',
            content: 'Como Sentar Corretamente',
            metadata: { level: 2 },
        },
        {
            type: 'text',
            content: 'A posição sentada é a mais comum para iniciantes. Siga estes passos:',
        },
        {
            type: 'list',
            content: '',
            metadata: {
                items: [
                    'Use uma cadeira **sem braços** e com altura média',
                    'Sente-se na **borda da cadeira**, mantendo as costas retas mas relaxadas',
                    'Seus pés devem tocar o chão confortavelmente',
                    'Pode usar um apoio de pé (10-15cm) para elevar a perna esquerda',
                ],
            },
        },
        {
            type: 'heading',
            content: 'Posição do Violão',
            metadata: { level: 2 },
        },
        {
            type: 'text',
            content: 'O violão deve repousar sobre sua **coxa esquerda** (ou direita, se canhoto), com a curva menor (cintura do violão) apoiada na coxa. O braço do violão deve estar levemente inclinado para cima (aproximadamente 45°).',
        },
        {
            type: 'tip',
            content: 'O violão deve se equilibrar sozinho entre sua coxa e peito. Você não deve precisar segurá-lo com a mão esquerda!',
        },
        {
            type: 'heading',
            content: 'Erros Comuns a Evitar',
            metadata: { level: 2 },
        },
        {
            type: 'warning',
            content: 'Curvar as costas causa dor e comprime os pulmões. Imagine um fio puxando o topo da sua cabeça para cima!',
        },
        {
            type: 'warning',
            content: 'Levantar os ombros cria tensão muscular. Faça um movimento de "encolher e soltar" antes de tocar.',
        },
        {
            type: 'example',
            content: 'Antes de cada sessão de prática, passe 1-2 minutos apenas ajustando sua postura. Feche os olhos e sinta se há alguma tensão no corpo. Com o tempo, a postura correta se tornará natural!',
        },
    ],
    images: [],
    diagrams: [],
    nextLessonId: 'lesson-1-1-2',
};

const lesson2: Lesson = {
    id: 'lesson-1-1-2',
    moduleId: 'module-1-1',
    order: 2,
    title: 'Anatomia do Violão',
    estimatedTime: 8,
    content: [
        {
            type: 'text',
            content: 'Conhecer as partes do seu violão é fundamental para entender como ele funciona e como cuidar dele. Vamos explorar cada componente!',
        },
        {
            type: 'heading',
            content: 'O Corpo',
            metadata: { level: 2 },
        },
        {
            type: 'text',
            content: 'O corpo do violão é responsável por **amplificar o som**. Ele é formado pelo tampo (parte frontal), fundo e laterais (ilhargas).',
        },
        {
            type: 'list',
            content: '',
            metadata: {
                items: [
                    '**Tampo**: A parte frontal de madeira que vibra e amplifica o som',
                    '**Boca (Roseta)**: O buraco redondo no tampo por onde o som sai',
                    '**Ponte**: Peça que segura as cordas no corpo do violão',
                    '**Rastilho**: Pequena peça branca na ponte que eleva as cordas',
                ],
            },
        },
        {
            type: 'heading',
            content: 'O Braço',
            metadata: { level: 2 },
        },
        {
            type: 'text',
            content: 'O braço é onde você posiciona os dedos da mão esquerda para formar acordes e notas.',
        },
        {
            type: 'list',
            content: '',
            metadata: {
                items: [
                    '**Escala (espelho)**: Superfície plana onde os dedos pressionam as cordas',
                    '**Trastes**: Barras metálicas que dividem a escala em semitons',
                    '**Casas**: Espaços entre os trastes (numerados a partir da pestana)',
                    '**Pestana (nut)**: Peça no topo do braço que mantém as cordas espaçadas',
                ],
            },
        },
        {
            type: 'heading',
            content: 'A Cabeça',
            metadata: { level: 2 },
        },
        {
            type: 'text',
            content: 'A cabeça contém as **tarraxas** (ou cravelhas), que são usadas para afinar o violão. Girando as tarraxas, você aumenta ou diminui a tensão das cordas.',
        },
        {
            type: 'tip',
            content: 'As cordas são numeradas de 1 a 6, sendo a 1ª a mais fina (Mi agudo) e a 6ª a mais grossa (Mi grave). Lembre-se: "Mi, Si, Sol, Ré, Lá, Mi" ou em inglês "E, B, G, D, A, E".',
        },
        {
            type: 'heading',
            content: 'Nomes das Cordas',
            metadata: { level: 2 },
        },
        {
            type: 'list',
            content: '',
            metadata: {
                items: [
                    '1ª corda (mais fina): **Mi** (E)',
                    '2ª corda: **Si** (B)',
                    '3ª corda: **Sol** (G)',
                    '4ª corda: **Ré** (D)',
                    '5ª corda: **Lá** (A)',
                    '6ª corda (mais grossa): **Mi** (E)',
                ],
            },
        },
        {
            type: 'example',
            content: 'Uma dica para memorizar: "**E**la **B**ebe **G**uaraná **D**entro **A** **E**scola" (E, B, G, D, A, E).',
        },
    ],
    images: [],
    diagrams: [],
    previousLessonId: 'lesson-1-1-1',
    nextLessonId: 'lesson-1-1-3',
};

const lesson3: Lesson = {
    id: 'lesson-1-1-3',
    moduleId: 'module-1-1',
    order: 3,
    title: 'Afinação Básica',
    estimatedTime: 10,
    content: [
        {
            type: 'text',
            content: 'Um violão desafinado produz sons desagradáveis, mesmo que você toque os acordes corretamente. Aprender a afinar é uma habilidade essencial!',
        },
        {
            type: 'heading',
            content: 'Afinação Padrão',
            metadata: { level: 2 },
        },
        {
            type: 'text',
            content: 'A afinação padrão do violão (do grave para o agudo) é: **E - A - D - G - B - E** (Mi, Lá, Ré, Sol, Si, Mi).',
        },
        {
            type: 'heading',
            content: 'Usando um Afinador',
            metadata: { level: 2 },
        },
        {
            type: 'text',
            content: 'A forma mais fácil de afinar é usando um afinador eletrônico ou aplicativo. O afinador mostra se a corda está **acima** (sharp/sustenido) ou **abaixo** (flat/bemol) da nota desejada.',
        },
        {
            type: 'list',
            content: '',
            metadata: {
                items: [
                    'Toque uma corda de cada vez',
                    'Observe o indicador do afinador',
                    'Gire a tarraxa correspondente para ajustar',
                    'Quando o indicador ficar no centro (verde), a corda está afinada',
                ],
            },
        },
        {
            type: 'tip',
            content: 'Este app tem um afinador integrado! Vá para a seção "Afinador" para utilizá-lo.',
        },
        {
            type: 'heading',
            content: 'Dicas para Manter a Afinação',
            metadata: { level: 2 },
        },
        {
            type: 'list',
            content: '',
            metadata: {
                items: [
                    'Afine sempre antes de praticar',
                    'Evite mudanças bruscas de temperatura',
                    'Cordas novas desafinam mais - é normal!',
                    'Verifique a afinação após alguns minutos de prática',
                ],
            },
        },
        {
            type: 'warning',
            content: 'Nunca aperte demais as tarraxas! A corda pode estourar. Se você sentir muita resistência, provavelmente está afinando na oitava errada.',
        },
    ],
    images: [],
    diagrams: [],
    previousLessonId: 'lesson-1-1-2',
    nextLessonId: 'lesson-1-1-4',
};

const lesson4: Lesson = {
    id: 'lesson-1-1-4',
    moduleId: 'module-1-1',
    order: 4,
    title: 'Leitura de Cifras',
    estimatedTime: 12,
    content: [
        {
            type: 'text',
            content: 'Cifras são uma forma simples de representar acordes usando letras. É o sistema mais usado em sites de músicas e songbooks!',
        },
        {
            type: 'heading',
            content: 'O Sistema de Cifras',
            metadata: { level: 2 },
        },
        {
            type: 'text',
            content: 'Cada nota musical tem uma letra correspondente:',
        },
        {
            type: 'list',
            content: '',
            metadata: {
                items: [
                    '**A** = Lá',
                    '**B** = Si',
                    '**C** = Dó',
                    '**D** = Ré',
                    '**E** = Mi',
                    '**F** = Fá',
                    '**G** = Sol',
                ],
            },
        },
        {
            type: 'heading',
            content: 'Acordes Maiores e Menores',
            metadata: { level: 2 },
        },
        {
            type: 'text',
            content: 'Uma letra sozinha indica um acorde **maior** (som alegre). Quando tem um "m" minúsculo após a letra, é um acorde **menor** (som melancólico).',
        },
        {
            type: 'example',
            content: '**C** = Dó Maior | **Cm** = Dó menor | **Am** = Lá menor | **G** = Sol Maior',
        },
        {
            type: 'heading',
            content: 'Lendo uma Cifra de Música',
            metadata: { level: 2 },
        },
        {
            type: 'text',
            content: 'Na cifra de uma música, os acordes aparecem acima da letra onde devem ser tocados. Cada acorde é mantido até aparecer outro.',
        },
        {
            type: 'quote',
            content: '  C            G\nPalavras ao vento...\n  Am           F\nLevam a saudade...',
        },
        {
            type: 'tip',
            content: 'No exemplo acima, você toca C em "Palavras", G em "ao", Am em "Levam" e F em "a".',
        },
        {
            type: 'heading',
            content: 'Símbolos Comuns',
            metadata: { level: 2 },
        },
        {
            type: 'list',
            content: '',
            metadata: {
                items: [
                    '**7** depois da letra = acorde com sétima (ex: G7, C7)',
                    '**#** = sustenido (meio tom acima)',
                    '**b** = bemol (meio tom abaixo)',
                    '**/** = baixo alternativo (ex: C/G = Dó com baixo em Sol)',
                ],
            },
        },
    ],
    images: [],
    diagrams: [],
    previousLessonId: 'lesson-1-1-3',
    nextLessonId: 'lesson-1-1-5',
};

const lesson5: Lesson = {
    id: 'lesson-1-1-5',
    moduleId: 'module-1-1',
    order: 5,
    title: 'Seus Primeiros 3 Acordes',
    estimatedTime: 15,
    content: [
        {
            type: 'text',
            content: 'Parabéns por chegar até aqui! Agora vamos aprender seus primeiros acordes: **C (Dó Maior)**, **G (Sol Maior)** e **D (Ré Maior)**. Com esses três acordes, você já pode tocar centenas de músicas!',
        },
        {
            type: 'heading',
            content: 'Acorde de C (Dó Maior)',
            metadata: { level: 2 },
        },
        {
            type: 'text',
            content: 'O C é um dos acordes mais usados. Posicione seus dedos assim:',
        },
        {
            type: 'list',
            content: '',
            metadata: {
                items: [
                    '**Dedo 1** (indicador): 1ª casa, corda B (2ª corda)',
                    '**Dedo 2** (médio): 2ª casa, corda D (4ª corda)',
                    '**Dedo 3** (anelar): 3ª casa, corda A (5ª corda)',
                    'Não toque a corda 6 (E grave)',
                ],
            },
        },
        {
            type: 'tip',
            content: 'Pressione as cordas com a ponta dos dedos, bem próximo ao traste (metal), mas sem encostar nele.',
        },
        {
            type: 'heading',
            content: 'Acorde de G (Sol Maior)',
            metadata: { level: 2 },
        },
        {
            type: 'text',
            content: 'O G tem um som cheio e é muito popular no rock e pop:',
        },
        {
            type: 'list',
            content: '',
            metadata: {
                items: [
                    '**Dedo 1** (indicador): 2ª casa, corda A (5ª corda)',
                    '**Dedo 2** (médio): 3ª casa, corda E grave (6ª corda)',
                    '**Dedo 3** (anelar): 3ª casa, corda E agudo (1ª corda)',
                    'Toque todas as 6 cordas',
                ],
            },
        },
        {
            type: 'heading',
            content: 'Acorde de D (Ré Maior)',
            metadata: { level: 2 },
        },
        {
            type: 'text',
            content: 'O D é um acorde brilhante e alegre:',
        },
        {
            type: 'list',
            content: '',
            metadata: {
                items: [
                    '**Dedo 1** (indicador): 2ª casa, corda G (3ª corda)',
                    '**Dedo 2** (médio): 2ª casa, corda E agudo (1ª corda)',
                    '**Dedo 3** (anelar): 3ª casa, corda B (2ª corda)',
                    'Toque apenas as 4 cordas mais finas (não toque E e A)',
                ],
            },
        },
        {
            type: 'example',
            content: 'Com C, G e D você já pode tocar: "Marcha Soldado", "Asa Branca", "Sweet Home Alabama" e muitas outras!',
        },
        {
            type: 'warning',
            content: 'Seus dedos vão doer no início - isso é completamente normal! As pontas dos dedos precisam criar calos. Continue praticando e a dor vai diminuir em algumas semanas.',
        },
    ],
    images: [],
    diagrams: [
        { type: 'chord', id: 'C', caption: 'Acorde de Dó Maior (C)' },
        { type: 'chord', id: 'G', caption: 'Acorde de Sol Maior (G)' },
        { type: 'chord', id: 'D', caption: 'Acorde de Ré Maior (D)' },
    ],
    previousLessonId: 'lesson-1-1-4',
};

// =============================================================================
// EXERCISES
// =============================================================================

const exercise1: Exercise = {
    id: 'exercise-1-1-posture',
    moduleId: 'module-1-1',
    lessonId: 'lesson-1-1-1',
    type: 'theory',
    title: 'Checklist de Postura',
    instructions: 'Sente-se com o violão e verifique cada item da lista. Marque como concluído quando estiver na posição correta.',
    goal: 'Manter a postura correta por 2 minutos sem tensão',
    difficulty: 1,
    estimatedTime: 5,
    data: {
        type: 'theory',
        concept: 'postura',
        questions: [
            'Costas retas mas relaxadas?',
            'Ombros relaxados (não levantados)?',
            'Pés apoiados no chão?',
            'Violão apoiado na coxa esquerda?',
            'Braço do violão inclinado 45°?',
        ],
    },
    successCriteria: {
        type: 'self-report',
        description: 'Confirme que conseguiu manter a postura correta',
    },
    hints: [
        'Feche os olhos e sinta onde há tensão no corpo',
        'Faça respirações profundas para relaxar os ombros',
        'Use um espelho para verificar sua postura',
    ],
    commonMistakes: [
        'Curvar as costas para ver os acordes',
        'Segurar o violão com a mão esquerda',
    ],
    xpReward: 15,
};

const exercise2: Exercise = {
    id: 'exercise-1-1-strings',
    moduleId: 'module-1-1',
    lessonId: 'lesson-1-1-2',
    type: 'reading',
    title: 'Identificar as Cordas',
    instructions: 'Toque cada corda do violão e identifique seu nome (E, B, G, D, A, E).',
    goal: 'Identificar todas as 6 cordas corretamente',
    difficulty: 1,
    estimatedTime: 5,
    data: {
        type: 'reading',
        chords: [],
        diagrams: [],
    },
    successCriteria: {
        type: 'self-report',
        description: 'Confirme que consegue nomear todas as cordas',
    },
    hints: [
        'Lembre-se: de baixo para cima é E, B, G, D, A, E',
        'Use a frase: "Ela Bebe Guaraná Dentro A Escola"',
    ],
    commonMistakes: [
        'Confundir a ordem das cordas',
        'Esquecer que as duas cordas E têm alturas diferentes',
    ],
    xpReward: 15,
};

const exercise3: Exercise = {
    id: 'exercise-1-1-chord-c',
    moduleId: 'module-1-1',
    lessonId: 'lesson-1-1-5',
    type: 'chord-change',
    title: 'Formar o Acorde C',
    instructions: 'Pratique formar o acorde C. Toque cada corda individualmente para verificar se todas soam limpas.',
    goal: 'Formar o acorde C com todas as notas soando claramente',
    difficulty: 2,
    estimatedTime: 10,
    repetitions: 10,
    data: {
        type: 'chord-change',
        fromChord: '',
        toChord: 'C',
        targetTime: 5,
        fingeringTips: [
            'Dedo 3 na 3ª casa da corda A é a base do acorde',
            'Curve os dedos para não abafar cordas adjacentes',
            'Pressione próximo ao traste',
        ],
    },
    successCriteria: {
        type: 'self-report',
        description: 'Todas as 5 cordas soam claramente',
    },
    hints: [
        'Se uma corda está abafada, ajuste o ângulo do dedo',
        'Pressione mais perto do traste (metal)',
        'Verifique se seus dedos estão curvados',
    ],
    commonMistakes: [
        'Tocar a 6ª corda (E grave) - ela não faz parte do C',
        'Dedos achatados que abafam cordas adjacentes',
    ],
    xpReward: 20,
};

const exercise4: Exercise = {
    id: 'exercise-1-1-chord-g',
    moduleId: 'module-1-1',
    lessonId: 'lesson-1-1-5',
    type: 'chord-change',
    title: 'Formar o Acorde G',
    instructions: 'Pratique formar o acorde G. Verifique se todas as 6 cordas soam limpas.',
    goal: 'Formar o acorde G com todas as notas soando claramente',
    difficulty: 2,
    estimatedTime: 10,
    repetitions: 10,
    data: {
        type: 'chord-change',
        fromChord: '',
        toChord: 'G',
        targetTime: 5,
        fingeringTips: [
            'Este acorde usa todas as 6 cordas',
            'Dedo 2 e 3 ficam na mesma casa (3ª)',
            'Mantenha a mão relaxada',
        ],
    },
    successCriteria: {
        type: 'self-report',
        description: 'Todas as 6 cordas soam claramente',
    },
    hints: [
        'Os dedos 2 e 3 precisam estar bem curvados',
        'O polegar atrás do braço dá suporte',
    ],
    commonMistakes: [
        'Abafar a 5ª corda (A) com o dedo 2',
        'Não pressionar forte o suficiente na 6ª corda',
    ],
    xpReward: 20,
};

const exercise5: Exercise = {
    id: 'exercise-1-1-chord-change-cg',
    moduleId: 'module-1-1',
    lessonId: 'lesson-1-1-5',
    type: 'chord-change',
    title: 'Troca de Acordes: C → G',
    instructions: 'Pratique trocar entre C e G. Comece devagar e aumente a velocidade gradualmente.',
    goal: 'Trocar entre C e G em menos de 3 segundos',
    difficulty: 3,
    estimatedTime: 15,
    repetitions: 20,
    data: {
        type: 'chord-change',
        fromChord: 'C',
        toChord: 'G',
        targetTime: 3,
        fingeringTips: [
            'O dedo 3 se move da corda A para a corda E agudo',
            'Pratique o movimento no ar antes de tocar',
            'Mantenha os dedos próximos às cordas',
        ],
    },
    successCriteria: {
        type: 'time',
        target: 3,
        description: 'Trocar em menos de 3 segundos',
    },
    hints: [
        'Levante todos os dedos juntos, não um de cada vez',
        'Visualize a próxima posição antes de mover',
        'Use um metrônomo em velocidade baixa',
    ],
    commonMistakes: [
        'Mover cada dedo separadamente (muito lento)',
        'Olhar para a mão o tempo todo',
    ],
    xpReward: 25,
    streakBonus: 5,
};

// =============================================================================
// QUIZ
// =============================================================================

const quiz: Quiz = {
    id: 'quiz-1-1',
    moduleId: 'module-1-1',
    title: 'Avaliação: Primeiros Passos',
    description: 'Teste seus conhecimentos sobre postura, anatomia do violão, afinação e acordes básicos.',
    questions: [
        {
            id: 'q1',
            question: 'Qual é a postura correta ao tocar violão sentado?',
            type: 'multiple-choice',
            options: [
                { id: 'a', text: 'Costas curvadas, violão na coxa direita' },
                { id: 'b', text: 'Costas retas, violão na coxa esquerda, braço inclinado 45°' },
                { id: 'c', text: 'Reclinado para trás, violão no colo' },
                { id: 'd', text: 'Em pé, sem apoio' },
            ],
            correctOptionId: 'b',
            explanation: 'A postura correta envolve costas retas, violão na coxa esquerda e braço inclinado para facilitar o acesso às cordas e prevenir lesões.',
            hint: 'Pense no que seria mais confortável para praticar por horas.',
        },
        {
            id: 'q2',
            question: 'Quantas cordas tem um violão padrão?',
            type: 'multiple-choice',
            options: [
                { id: 'a', text: '4 cordas' },
                { id: 'b', text: '5 cordas' },
                { id: 'c', text: '6 cordas' },
                { id: 'd', text: '7 cordas' },
            ],
            correctOptionId: 'c',
            explanation: 'O violão padrão tem 6 cordas, afinadas em E, A, D, G, B, E (Mi, Lá, Ré, Sol, Si, Mi).',
        },
        {
            id: 'q3',
            question: 'Como são chamadas as barras metálicas no braço do violão?',
            type: 'multiple-choice',
            options: [
                { id: 'a', text: 'Casas' },
                { id: 'b', text: 'Trastes' },
                { id: 'c', text: 'Pestana' },
                { id: 'd', text: 'Rastilho' },
            ],
            correctOptionId: 'b',
            explanation: 'Os trastes são as barras metálicas que dividem o braço em semitons. Os espaços entre eles são chamados de casas.',
        },
        {
            id: 'q4',
            question: 'Qual é a afinação padrão do violão (da corda mais grossa para a mais fina)?',
            type: 'multiple-choice',
            options: [
                { id: 'a', text: 'E - A - D - G - B - E' },
                { id: 'b', text: 'A - D - G - B - E - A' },
                { id: 'c', text: 'D - G - B - E - A - D' },
                { id: 'd', text: 'G - C - E - A - D - G' },
            ],
            correctOptionId: 'a',
            explanation: 'A afinação padrão é E - A - D - G - B - E (Mi, Lá, Ré, Sol, Si, Mi), da corda mais grossa (6ª) para a mais fina (1ª).',
        },
        {
            id: 'q5',
            question: 'O que significa a cifra "Am"?',
            type: 'multiple-choice',
            options: [
                { id: 'a', text: 'Lá Maior' },
                { id: 'b', text: 'Lá menor' },
                { id: 'c', text: 'Lá com sétima' },
                { id: 'd', text: 'Lá sustenido' },
            ],
            correctOptionId: 'b',
            explanation: 'O "m" minúsculo após a letra indica um acorde menor. "Am" é Lá menor, que tem um som mais melancólico que o Lá Maior (A).',
        },
        {
            id: 'q6',
            question: 'Em qual corda NÃO se toca no acorde de C (Dó Maior)?',
            type: 'multiple-choice',
            options: [
                { id: 'a', text: '1ª corda (E agudo)' },
                { id: 'b', text: '3ª corda (G)' },
                { id: 'c', text: '5ª corda (A)' },
                { id: 'd', text: '6ª corda (E grave)' },
            ],
            correctOptionId: 'd',
            explanation: 'No acorde de C, não se toca a 6ª corda (E grave). O acorde usa apenas as cordas 1 a 5.',
            diagram: { type: 'chord', id: 'C' },
        },
        {
            id: 'q7',
            question: 'Qual é a função das tarraxas no violão?',
            type: 'multiple-choice',
            options: [
                { id: 'a', text: 'Amplificar o som' },
                { id: 'b', text: 'Mudar o timbre' },
                { id: 'c', text: 'Afinar as cordas' },
                { id: 'd', text: 'Segurar as cordas na ponte' },
            ],
            correctOptionId: 'c',
            explanation: 'As tarraxas são usadas para afinar as cordas, aumentando ou diminuindo sua tensão para ajustar a altura do som.',
        },
        {
            id: 'q8',
            question: 'Por que é importante manter a postura correta?',
            type: 'multiple-choice',
            options: [
                { id: 'a', text: 'Apenas por estética' },
                { id: 'b', text: 'Para tocar mais alto' },
                { id: 'c', text: 'Para evitar lesões e tocar com mais facilidade' },
                { id: 'd', text: 'Para afinar melhor' },
            ],
            correctOptionId: 'c',
            explanation: 'A postura correta previne lesões por esforço repetitivo, permite praticar por mais tempo e facilita a técnica.',
        },
        {
            id: 'q9',
            question: 'Quantas cordas são tocadas no acorde de G (Sol Maior)?',
            type: 'multiple-choice',
            options: [
                { id: 'a', text: '4 cordas' },
                { id: 'b', text: '5 cordas' },
                { id: 'c', text: '6 cordas' },
                { id: 'd', text: '3 cordas' },
            ],
            correctOptionId: 'c',
            explanation: 'O acorde de G usa todas as 6 cordas do violão, criando um som cheio e encorpado.',
            diagram: { type: 'chord', id: 'G' },
        },
        {
            id: 'q10',
            question: 'Qual letra representa a nota "Ré" no sistema de cifras?',
            type: 'multiple-choice',
            options: [
                { id: 'a', text: 'R' },
                { id: 'b', text: 'D' },
                { id: 'c', text: 'E' },
                { id: 'd', text: 'A' },
            ],
            correctOptionId: 'b',
            explanation: 'No sistema de cifras internacional, D representa Ré, seguindo a sequência: A=Lá, B=Si, C=Dó, D=Ré, E=Mi, F=Fá, G=Sol.',
        },
    ],
    passingScore: 70,
    allowRetry: true,
    xpReward: 50,
    perfectScoreBonus: 30,
};

// =============================================================================
// MODULE EXPORT
// =============================================================================

export const module1_1: Module = {
    id: 'module-1-1',
    level: 1,
    order: 1,
    title: 'Primeiros Passos',
    description: 'Fundamentos essenciais: postura, anatomia do violão, afinação, cifras e seus primeiros acordes (C, G, D).',
    estimatedDuration: '2-3 semanas',
    lessons: [lesson1, lesson2, lesson3, lesson4, lesson5],
    exercises: [exercise1, exercise2, exercise3, exercise4, exercise5],
    quiz,
    prerequisites: [],
    requiredXP: 0,
    xpReward: 100,
    badgeReward: {
        id: 'badge-first-module',
        name: 'Primeiro Módulo',
        description: 'Completou o módulo Primeiros Passos',
        icon: '🎸',
        rarity: 'common',
        criteria: { type: 'module-complete', target: 'module-1-1' },
        xpBonus: 25,
    },
    tags: ['iniciante', 'postura', 'anatomia', 'afinacao', 'cifras', 'acordes-basicos'],
    difficulty: 'easy',
    icon: '🎸',
};

export default module1_1;
