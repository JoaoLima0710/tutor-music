/**
 * Weekly Curriculum - Pedagogical Enhancement v2.0
 * Based on OAPR Learning Cycle: Ouvir, Analisar, Praticar, Revisar
 * 
 * Philosophy: "We don't teach guitar in isolation, we teach people to express
 * themselves through guitar, where technique is the means, not the end."
 */

// ==========================================
// TYPES
// ==========================================

export interface PlaylistItem {
    title: string;
    artist: string;
    language: 'PT' | 'EN';
    reason: string;
    focus: string;
    spotifyUrl?: string;
    youtubeUrl?: string;
}

export interface DailyContent {
    day: number;
    title: string;
    theme: string;
    objectives: string[];

    // OAPR Cycle
    ouvir: {
        description: string;
        playlist: PlaylistItem[];
        durationMinutes: number;
    };

    analisar: {
        description: string;
        concepts: string[];
        analogies?: string[];
        durationMinutes: number;
    };

    praticar: {
        description: string;
        exercises: Exercise[];
        durationMinutes: number;
    };

    revisar: {
        checklist: string[];
        reflection: string;
        durationMinutes: number;
    };

    tips?: string[];
    warnings?: string[];
}

export interface Exercise {
    id: string;
    type: 'exploration' | 'technique' | 'chord' | 'rhythm' | 'ear' | 'chromatic' | 'melody' | 'warmup';
    title: string;
    description: string;
    instructions: string[];
    targetBPM?: number;
    duration?: number; // seconds
    repetitions?: number;
    data?: any;
}

export interface WeekCurriculum {
    week: number;
    title: string;
    subtitle: string;
    description: string;
    goals: string[];
    days: DailyContent[];
    weeklyPlaylist: PlaylistItem[];
    milestone?: string;
}

// ==========================================
// WEEK 1: PRIMEIRO CONTATO
// ==========================================

export const week1: WeekCurriculum = {
    week: 1,
    title: 'Primeiro Contato',
    subtitle: 'Familiarização e Escuta Ativa',
    description: 'Sem pressão técnica - apenas conhecer o instrumento e desenvolver o ouvido musical.',
    goals: [
        'Conhecer todas as partes do instrumento pelo nome',
        'Segurar a guitarra confortavelmente por 10 minutos',
        'Produzir sons explorando cordas soltas',
        'Ouvir atentamente 5 músicas indicadas',
        'Afinar o instrumento com afinador digital',
    ],

    days: [
        // DIA 1 - Anatomia da Guitarra
        {
            day: 1,
            title: 'Anatomia da Guitarra',
            theme: 'Conhecendo seu instrumento',
            objectives: [
                'Identificar cada parte do violão',
                'Tocar o instrumento pela primeira vez',
                'Desenvolver conexão inicial com o instrumento',
            ],

            ouvir: {
                description: 'Escute estas músicas prestando atenção ao som do violão',
                playlist: [
                    {
                        title: 'Chão de Giz',
                        artist: 'Zé Ramalho',
                        language: 'PT',
                        reason: 'Violão dedilhado simples e melódico',
                        focus: 'Observe como o violão "conversa" com a voz',
                    },
                    {
                        title: 'Blackbird',
                        artist: 'The Beatles',
                        language: 'EN',
                        reason: 'Fingerpicking icônico',
                        focus: 'Perceba como cada nota é clara e definida',
                    },
                ],
                durationMinutes: 2,
            },

            analisar: {
                description: 'O violão é como um corpo humano',
                concepts: [
                    'Cabeça: onde ficam as tarraxas (como orelhas que ajustam o som)',
                    'Braço: onde os dedos trabalham para criar notas',
                    'Corpo: onde mora o som, amplifica a vibração',
                    'Cordas: 6 "vozes" do instrumento, da mais grossa à mais fina',
                    'Trastes: os "degraus" que mudam a nota',
                ],
                analogies: [
                    'O violão é como um corpo: cabeça com tarraxas/orelhas, braço onde se trabalha, corpo onde mora o som',
                    'As cordas são como vozes - cada uma tem seu timbre único',
                ],
                durationMinutes: 3,
            },

            praticar: {
                description: 'Exploração livre sem julgamento',
                exercises: [
                    {
                        id: 'week1-day1-explore',
                        type: 'exploration',
                        title: 'Exploração Livre',
                        description: 'Conheça seu instrumento sem preocupação com certo ou errado',
                        instructions: [
                            'Passe a mão pelo instrumento, sentindo as texturas',
                            'Toque cada corda solta, uma por vez',
                            'Escute o som de cada corda',
                            'Experimente tocar mais forte e mais suave',
                            'Sinta a vibração no corpo do violão',
                        ],
                        duration: 600, // 10 minutos
                    },
                ],
                durationMinutes: 10,
            },

            revisar: {
                checklist: [
                    'Consegui identificar: cabeça, braço e corpo',
                    'Toquei todas as 6 cordas',
                    'Escutei as músicas indicadas',
                    'Me senti confortável segurando o instrumento',
                ],
                reflection: 'Como foi sua primeira experiência? Este é apenas o começo de uma jornada incrível!',
                durationMinutes: 5,
            },

            tips: [
                'Não precisa se preocupar com técnica hoje',
                'Deixe sua curiosidade guiar a exploração',
                'Qualquer som que você fizer está correto nesta fase',
            ],
        },

        // DIA 2 - As Seis Cordas
        {
            day: 2,
            title: 'As Seis Cordas',
            theme: 'Nomes e sons de cada corda',
            objectives: [
                'Memorizar os nomes das cordas (E A D G B E)',
                'Identificar cordas pelo som',
                'Desenvolver coordenação mão-corda',
            ],

            ouvir: {
                description: 'Músicas que destacam cordas específicas',
                playlist: [
                    {
                        title: 'Epitáfio',
                        artist: 'Titãs',
                        language: 'PT',
                        reason: 'Violão grave na introdução',
                        focus: 'Escute o som grave (cordas 6, 5, 4)',
                    },
                    {
                        title: 'Dust in the Wind',
                        artist: 'Kansas',
                        language: 'EN',
                        reason: 'Dedilhado usando todas as cordas',
                        focus: 'Perceba a diferença entre graves e agudos',
                    },
                ],
                durationMinutes: 2,
            },

            analisar: {
                description: 'Sistema de nomes das cordas',
                concepts: [
                    '6ª corda (mais grossa) = Mi (E)',
                    '5ª corda = Lá (A)',
                    '4ª corda = Ré (D)',
                    '3ª corda = Sol (G)',
                    '2ª corda = Si (B)',
                    '1ª corda (mais fina) = Mi (E)',
                ],
                analogies: [
                    'Mnemônico PT: "Ela Ainda Dança Gostoso Bem Elegante"',
                    'Mnemônico EN: "Eddie Ate Dynamite Good Bye Eddie"',
                ],
                durationMinutes: 3,
            },

            praticar: {
                description: 'Exercícios de identificação e memorização',
                exercises: [
                    {
                        id: 'week1-day2-names',
                        type: 'technique',
                        title: 'Diga e Toque',
                        description: 'Fale o nome de cada corda em voz alta enquanto toca',
                        instructions: [
                            'Toque a 6ª corda dizendo "MI"',
                            'Toque a 5ª corda dizendo "LÁ"',
                            'Continue até a 1ª corda',
                            'Volte da 1ª até a 6ª',
                            'Repita 5 vezes cada direção',
                        ],
                        repetitions: 5,
                    },
                    {
                        id: 'week1-day2-blind',
                        type: 'ear',
                        title: 'Olhos Fechados',
                        description: 'Identifique cordas sem olhar',
                        instructions: [
                            'Feche os olhos',
                            'Toque uma corda aleatória',
                            'Tente identificar qual é',
                            'Abra os olhos e confira',
                            'Repita 10 vezes',
                        ],
                        repetitions: 10,
                    },
                ],
                durationMinutes: 15,
            },

            revisar: {
                checklist: [
                    'Consigo nomear as cordas da 6ª até a 1ª',
                    'Consigo nomear as cordas da 1ª até a 6ª',
                    'Acertei pelo menos 7/10 identificações de olhos fechados',
                    'Memorizei o mnemônico',
                ],
                reflection: 'As cordas são sua primeira "linguagem" no violão. Quanto mais familiar, mais fácil será tudo depois!',
                durationMinutes: 5,
            },
        },

        // DIA 3 - Afinação
        {
            day: 3,
            title: 'Afinação',
            theme: 'A base de tudo',
            objectives: [
                'Usar afinador digital corretamente',
                'Entender a importância da afinação',
                'Desenvolver ouvido para notas "certas"',
            ],

            ouvir: {
                description: 'Instrumentos perfeitamente afinados',
                playlist: [
                    {
                        title: 'Trem das Cores',
                        artist: 'Caetano Veloso',
                        language: 'PT',
                        reason: 'Violão precisamente afinado',
                        focus: 'Perceba como cada nota soa "limpa"',
                    },
                    {
                        title: 'Here Comes the Sun',
                        artist: 'The Beatles',
                        language: 'EN',
                        reason: 'Harmonia perfeita',
                        focus: 'Ouça como as notas se encaixam perfeitamente',
                    },
                ],
                durationMinutes: 2,
            },

            analisar: {
                description: 'A afinação é como calibrar um instrumento de cozinha',
                concepts: [
                    'Uma balança descalibrada estraga a receita',
                    'Violão desafinado soa errado mesmo tocando corretamente',
                    'Afinação é o primeiro passo antes de qualquer prática',
                    'Dica profissional: sempre afine "para cima"',
                ],
                analogies: [
                    'Violão é como balança de cozinha - precisa estar calibrado',
                    'Se estiver muito agudo, afrouxe bastante e depois suba devagar até a nota correta',
                ],
                durationMinutes: 3,
            },

            praticar: {
                description: 'Domine o afinador',
                exercises: [
                    {
                        id: 'week1-day3-tuning',
                        type: 'technique',
                        title: 'Afinação Completa',
                        description: 'Afine todas as 6 cordas usando o afinador',
                        instructions: [
                            'Abra o afinador no app',
                            'Toque UMA corda por vez',
                            'Observe: verde = afinado, vermelho = ajustar',
                            'Gire a tarraxa devagar',
                            'Se subir demais, afrouxe e suba novamente',
                            'Afine da 6ª até a 1ª corda',
                        ],
                        duration: 300,
                    },
                ],
                durationMinutes: 10,
            },

            revisar: {
                checklist: [
                    'Sei usar o afinador do app',
                    'Todas as 6 cordas estão afinadas',
                    'Entendo a técnica de "afinar para cima"',
                    'Consigo afinar em menos de 3 minutos',
                ],
                reflection: 'A afinação é um ritual sagrado - faça sempre antes de praticar!',
                durationMinutes: 5,
            },

            tips: [
                'Sempre afine em ambiente silencioso',
                'Deixe a corda vibrar livremente (não abafe)',
                'Gire as tarraxas devagar - pequenos ajustes!',
            ],
        },

        // DIA 4 - Postura
        {
            day: 4,
            title: 'Postura que Previne Lesões',
            theme: 'Cuidando do seu corpo',
            objectives: [
                'Aprender os 7 pontos de verificação da postura',
                'Executar rotina de alongamentos',
                'Prevenir lesões por esforço repetitivo',
            ],

            ouvir: {
                description: 'Observe a postura de mestres',
                playlist: [
                    {
                        title: 'Vídeos de João Gilberto',
                        artist: 'João Gilberto',
                        language: 'PT',
                        reason: 'Postura clássica perfeita',
                        focus: 'Observe como ele segura o instrumento relaxadamente',
                    },
                    {
                        title: 'Vídeos de Tommy Emmanuel',
                        artist: 'Tommy Emmanuel',
                        language: 'EN',
                        reason: 'Posição relaxada mesmo em passagens difíceis',
                        focus: 'Note como os ombros ficam baixos e relaxados',
                    },
                ],
                durationMinutes: 2,
            },

            analisar: {
                description: 'Os 7 pontos de verificação',
                concepts: [
                    '1. Coluna: reta, ombros relaxados (não curvados para frente)',
                    '2. Pernas: pés apoiados no chão (use apoio se necessário)',
                    '3. Braço direito: cotovelo apoiado suavemente no corpo',
                    '4. Mão direita: movimento vem do pulso, não do braço',
                    '5. Braço esquerdo: cotovelo afastado do corpo',
                    '6. Mão esquerda: polegar atrás do braço, dedos curvados',
                    '7. Cabeça: olhar para frente, não curvar o pescoço',
                ],
                durationMinutes: 3,
            },

            praticar: {
                description: 'Alongamentos e postura correta',
                exercises: [
                    {
                        id: 'week1-day4-stretch',
                        type: 'warmup',
                        title: 'Rotina de Alongamento (5 min)',
                        description: 'Alongamentos obrigatórios antes de praticar',
                        instructions: [
                            'Pulsos: gire em círculos (30 seg cada direção)',
                            'Dedos: abra e feche as mãos (30 seg)',
                            'Antebraços: estenda o braço e puxe os dedos para trás (30 seg cada)',
                            'Ombros: gire para frente e para trás (30 seg)',
                            'Pescoço: incline suavemente para os lados (30 seg)',
                            'Costas: gire o tronco suavemente (30 seg)',
                        ],
                        duration: 300,
                    },
                    {
                        id: 'week1-day4-posture',
                        type: 'technique',
                        title: 'Checagem dos 7 Pontos',
                        description: 'Pratique manter a postura correta',
                        instructions: [
                            'Sente-se com o violão na posição',
                            'Verifique cada um dos 7 pontos',
                            'Mantenha a postura por 2 minutos',
                            'Se sentir tensão, ajuste e relaxe',
                            'Levante e repita a checagem',
                        ],
                        duration: 300,
                    },
                ],
                durationMinutes: 15,
            },

            revisar: {
                checklist: [
                    'Conheço os 7 pontos de verificação',
                    'Fiz a rotina completa de alongamento',
                    'Consigo manter postura correta por 2 minutos',
                    'Não sinto dor ou tensão excessiva',
                ],
                reflection: 'Uma boa postura agora previne anos de problemas depois!',
                durationMinutes: 5,
            },

            warnings: [
                'Se sentir DOR AGUDA, pare imediatamente',
                'Desconforto muscular leve é normal, dor não é',
                'Faça pausas a cada 20-30 minutos de prática',
            ],
        },

        // DIA 5 - Cifras e Diagramas
        {
            day: 5,
            title: 'Leitura de Cifras e Diagramas',
            theme: 'A linguagem escrita da música',
            objectives: [
                'Entender o sistema internacional de cifras (A-G)',
                'Ler diagramas de acordes',
                'Identificar modificadores (m, 7, maj7, etc)',
            ],

            ouvir: {
                description: 'Músicas com progressões simples',
                playlist: [
                    {
                        title: 'Pais e Filhos',
                        artist: 'Legião Urbana',
                        language: 'PT',
                        reason: 'Usa apenas A, E, D',
                        focus: 'Perceba como os acordes se repetem',
                    },
                    {
                        title: "Knockin' on Heaven's Door",
                        artist: 'Bob Dylan',
                        language: 'EN',
                        reason: 'Usa G, D, Am, C',
                        focus: 'Essa será uma das suas primeiras metas!',
                    },
                ],
                durationMinutes: 2,
            },

            analisar: {
                description: 'O sistema de cifras',
                concepts: [
                    'Sistema internacional: A=Lá, B=Si, C=Dó, D=Ré, E=Mi, F=Fá, G=Sol',
                    'Letra sozinha (A, C, G) = acorde maior (alegre)',
                    'm = menor (Am, Em) = som triste',
                    '7 = sétima (A7, G7) = tensão/blues',
                    'maj7 = sétima maior (Cmaj7) = sofisticado/jazz',
                    'sus4 = suspensa (Dsus4) = tensão que resolve',
                    'dim = diminuto (Bdim) = som tenso',
                ],
                durationMinutes: 3,
            },

            praticar: {
                description: 'Leitura de diagramas',
                exercises: [
                    {
                        id: 'week1-day5-diagrams',
                        type: 'technique',
                        title: 'Interpretando Diagramas',
                        description: 'Entenda como ler diagramas de acordes',
                        instructions: [
                            'O diagrama é o braço visto de frente',
                            'Corda mais grossa (6ª) fica à esquerda',
                            'X = não toque esta corda',
                            'O = toque a corda solta',
                            'Círculos = onde colocar os dedos',
                            'Números indicam qual dedo usar',
                        ],
                        duration: 300,
                    },
                    {
                        id: 'week1-day5-quiz',
                        type: 'ear',
                        title: 'Quiz de Cifras',
                        description: 'Teste seus conhecimentos',
                        instructions: [
                            'O que significa "Am"? (Lá menor)',
                            'O que significa "G7"? (Sol com sétima)',
                            'Qual nota é "D"? (Ré)',
                            'Qual nota é "B"? (Si)',
                        ],
                        repetitions: 10,
                    },
                ],
                durationMinutes: 15,
            },

            revisar: {
                checklist: [
                    'Sei converter letras para notas (A=Lá, B=Si...)',
                    'Entendo o que significa "m" após a letra',
                    'Consigo ler um diagrama básico',
                    'Sei o que significa X e O no diagrama',
                ],
                reflection: 'Com este conhecimento, você pode ler qualquer cifra na internet!',
                durationMinutes: 5,
            },
        },

        // DIA 6 - Ritmo
        {
            day: 6,
            title: 'Ritmo',
            theme: 'O coração da música',
            objectives: [
                'Entender conceitos de pulsação e BPM',
                'Bater palmas no tempo de músicas',
                'Tocar no tempo com metrônomo',
            ],

            ouvir: {
                description: 'Músicas com ritmos distintos',
                playlist: [
                    {
                        title: 'Samba de Uma Nota Só',
                        artist: 'Tom Jobim',
                        language: 'PT',
                        reason: 'Ritmo sincopado característico',
                        focus: 'Tente bater palmas no tempo',
                    },
                    {
                        title: 'Back in Black',
                        artist: 'AC/DC',
                        language: 'EN',
                        reason: 'Rock direto no tempo',
                        focus: 'Contagem clara: 1-2-3-4',
                    },
                    {
                        title: 'No Woman No Cry',
                        artist: 'Bob Marley',
                        language: 'EN',
                        reason: 'Reggae com acentuação no contratempo',
                        focus: 'Perceba a batida "atrasada"',
                    },
                ],
                durationMinutes: 2,
            },

            analisar: {
                description: 'Ritmo é o coração da música',
                concepts: [
                    'Pulsação: a batida constante (BUM-bum-BUM-bum)',
                    'BPM: velocidade da música (60=lento, 120=médio, 180=rápido)',
                    'Compasso: agrupamento de batidas (4/4 é o mais comum)',
                    'Tempo forte: geralmente o 1 e o 3',
                    'Tempo fraco: geralmente o 2 e o 4',
                ],
                analogies: [
                    'Ritmo é como o coração - bate constantemente',
                    'BPM é a velocidade do coração',
                ],
                durationMinutes: 3,
            },

            praticar: {
                description: 'Desenvolvendo senso rítmico',
                exercises: [
                    {
                        id: 'week1-day6-clap',
                        type: 'rhythm',
                        title: 'Palmas no Tempo',
                        description: 'Desenvolva seu pulso interno',
                        instructions: [
                            'Escolha uma música que você gosta',
                            'Bata palmas no tempo',
                            'Conte "1-2-3-4" em voz alta',
                            'Tente não sair do tempo',
                            'Pratique com 3 músicas diferentes',
                        ],
                        duration: 180,
                    },
                    {
                        id: 'week1-day6-metro-60',
                        type: 'rhythm',
                        title: 'Metrônomo 60 BPM',
                        description: 'Toque no tempo do metrônomo',
                        instructions: [
                            'Configure o metrônomo em 60 BPM',
                            'Toque a 5ª corda solta uma vez por batida',
                            'Mantenha por 1 minuto',
                            'Depois, toque DUAS vezes por batida (↓↑)',
                        ],
                        targetBPM: 60,
                        duration: 180,
                    },
                ],
                durationMinutes: 15,
            },

            revisar: {
                checklist: [
                    'Entendo o que é BPM',
                    'Consigo bater palmas no tempo de uma música',
                    'Consegui tocar no tempo do metrônomo',
                    'Pratiquei palhetada alternada (↓↑)',
                ],
                reflection: 'O ritmo é o que faz as pessoas dançarem - ele será seu melhor amigo!',
                durationMinutes: 5,
            },
        },

        // DIA 7 - Revisão
        {
            day: 7,
            title: 'Revisão e Consolidação',
            theme: 'Celebrando a primeira semana',
            objectives: [
                'Revisar todos os conceitos da semana',
                'Realizar autoavaliação completa',
                'Celebrar as conquistas!',
            ],

            ouvir: {
                description: 'Playlist especial da semana',
                playlist: [
                    {
                        title: 'Dois Rios',
                        artist: 'Skank',
                        language: 'PT',
                        reason: 'Violão brasileiro moderno',
                        focus: 'Aprecie a música sem análise',
                    },
                    {
                        title: 'Wish You Were Here',
                        artist: 'Pink Floyd',
                        language: 'EN',
                        reason: 'Dedilhado icônico',
                        focus: 'Um dia você tocará isso!',
                    },
                    {
                        title: 'Anunciação',
                        artist: 'Alceu Valença',
                        language: 'PT',
                        reason: 'Violão brasileiro emotivo',
                        focus: 'Sinta a emoção na música',
                    },
                    {
                        title: 'Hotel California',
                        artist: 'Eagles',
                        language: 'EN',
                        reason: 'Clássico absoluto',
                        focus: 'Sua futura meta!',
                    },
                ],
                durationMinutes: 2,
            },

            analisar: {
                description: 'O que aprendemos esta semana',
                concepts: [
                    'Anatomia: cabeça, braço, corpo, cordas, trastes',
                    'Cordas: E-A-D-G-B-E (da 6ª à 1ª)',
                    'Afinação: usar afinador, afinar "para cima"',
                    'Postura: 7 pontos de verificação',
                    'Cifras: A-G, modificadores (m, 7, etc)',
                    'Ritmo: BPM, compasso 4/4, metrônomo',
                ],
                durationMinutes: 3,
            },

            praticar: {
                description: 'Exercício integrado completo',
                exercises: [
                    {
                        id: 'week1-day7-integrated',
                        type: 'technique',
                        title: 'Sessão Integrada',
                        description: 'Combine tudo que aprendeu',
                        instructions: [
                            '1. Alongamento completo (5 min)',
                            '2. Afine o violão',
                            '3. Toque cada corda dizendo o nome',
                            '4. Pratique palhetada alternada no tempo (60 BPM)',
                            '5. Exploração livre (2 min)',
                        ],
                        duration: 900,
                    },
                ],
                durationMinutes: 20,
            },

            revisar: {
                checklist: [
                    'Identifico as partes da guitarra',
                    'Nomeio as cordas de cor',
                    'Afino com afinador digital',
                    'Sento com postura correta por 15 minutos',
                    'Faço alongamento completo',
                    'Seguro palheta corretamente',
                    'Toco cada corda individualmente',
                    'Leio diagramas básicos',
                    'Identifico cifras',
                    'Bato palmas no tempo',
                    'Toco no tempo com metrônomo',
                ],
                reflection: 'Você completou sua PRIMEIRA SEMANA! Isso é um marco importante. Cada grande músico começou exatamente onde você está agora.',
                durationMinutes: 5,
            },
        },
    ],

    weeklyPlaylist: [
        { title: 'Dois Rios', artist: 'Skank', language: 'PT', reason: 'Violão brasileiro moderno', focus: 'Harmonia rica' },
        { title: 'Wish You Were Here', artist: 'Pink Floyd', language: 'EN', reason: 'Dedilhado icônico', focus: 'Expressividade' },
        { title: 'Anunciação', artist: 'Alceu Valença', language: 'PT', reason: 'Emoção brasileira', focus: 'Dinâmica' },
        { title: 'Hotel California', artist: 'Eagles', language: 'EN', reason: 'Clássico atemporal', focus: 'Meta de longo prazo' },
    ],

    milestone: 'Primeiro Contato Completo! 🎸',
};

// ==========================================
// WEEK 2: CORPO E INSTRUMENTO
// ==========================================

export const week2: WeekCurriculum = {
    week: 2,
    title: 'Corpo e Instrumento',
    subtitle: 'De Conhecer para Fazer',
    description: 'Transição de conhecer para fazer - pressionar cordas e primeiras notas individuais.',
    goals: [
        'Pressionar cordas com técnica correta',
        'Tocar notas individuais limpas',
        'Executar exercício cromático básico',
        'Desenvolver calos nos dedos',
        'Tocar primeira melodia simples',
    ],

    days: [
        // DIA 8 - Regras de Ouro
        {
            day: 8,
            title: 'Regras de Ouro',
            theme: 'Técnica para pressionar cordas',
            objectives: [
                'Aprender as 4 regras para pressionar cordas',
                'Produzir primeira nota limpa',
                'Entender posição do polegar',
            ],

            ouvir: {
                description: 'Ouça a clareza das notas',
                playlist: [
                    {
                        title: 'Asa Branca',
                        artist: 'Luiz Gonzaga',
                        language: 'PT',
                        reason: 'Melodia clara e definida',
                        focus: 'Cada nota soa limpa e distinta',
                    },
                    {
                        title: 'Smoke on the Water',
                        artist: 'Deep Purple',
                        language: 'EN',
                        reason: 'Riff icônico com notas claras',
                        focus: 'Perceba como cada nota é precisa',
                    },
                ],
                durationMinutes: 2,
            },

            analisar: {
                description: 'As 4 regras de ouro para pressionar cordas',
                concepts: [
                    '1. Ponta do dedo: use a PONTA, não a almofada',
                    '2. Perto do traste: pressione PERTO do traste metálico, não em cima',
                    '3. Pressão mínima: use apenas a força necessária para som limpo',
                    '4. Polegar atrás: polegar atrás do braço, oposto ao dedo médio',
                ],
                durationMinutes: 3,
            },

            praticar: {
                description: 'Primeiras notas individuais',
                exercises: [
                    {
                        id: 'week2-day8-first-note',
                        type: 'technique',
                        title: 'Nota F na 1ª Corda',
                        description: 'Sua primeira nota pressionada',
                        instructions: [
                            'Posicione o dedo 1 (indicador) na 1ª corda, 1º traste',
                            'Use a PONTA do dedo',
                            'Pressione perto do metal do traste',
                            'Toque a corda com a mão direita',
                            'O som deve ser claro, não abafado',
                            'Repita 20 vezes buscando clareza',
                        ],
                        repetitions: 20,
                    },
                    {
                        id: 'week2-day8-expand',
                        type: 'technique',
                        title: 'Trastes 1-2-3',
                        description: 'Expanda para mais notas',
                        instructions: [
                            'Traste 1 = Dedo 1 (F)',
                            'Traste 2 = Dedo 2 (F#)',
                            'Traste 3 = Dedo 3 (G)',
                            'Toque cada nota 10 vezes',
                            'Foque em som limpo',
                        ],
                        repetitions: 10,
                    },
                ],
                durationMinutes: 15,
            },

            revisar: {
                checklist: [
                    'Conheço as 4 regras de ouro',
                    'Produzi nota limpa no 1º traste',
                    'Usei a ponta do dedo corretamente',
                    'Mantive polegar atrás do braço',
                ],
                reflection: 'Parabéns! Você produziu suas primeiras notas "de verdade"!',
                durationMinutes: 5,
            },

            tips: [
                'É normal sentir desconforto nas pontas dos dedos',
                'Isso faz parte do desenvolvimento de calos',
                'Não force se sentir dor aguda - descanse',
            ],
        },

        // Dias 9-14 seriam expandidos de forma similar...
        // Por brevidade, incluindo estrutura resumida

        {
            day: 9,
            title: 'Exercício Cromático - Corda 1',
            theme: 'Fundamento técnico essencial',
            objectives: ['Executar cromático na 1ª corda', 'Desenvolver coordenação'],
            ouvir: {
                description: 'Melodias com notas sequenciais',
                playlist: [
                    { title: 'Garota de Ipanema', artist: 'Tom Jobim', language: 'PT', reason: 'Melodia fluida', focus: 'Fluidez das notas' },
                ],
                durationMinutes: 2,
            },
            analisar: {
                description: 'O exercício cromático',
                concepts: [
                    'Cromático = tocar trastes 1-2-3-4 em sequência',
                    'Um dedo por traste (1-2-3-4)',
                    'Depois voltar 4-3-2-1',
                    'BPM muito lento: 40-50',
                ],
                durationMinutes: 3,
            },
            praticar: {
                description: 'Cromático na corda 1',
                exercises: [
                    {
                        id: 'week2-day9-chromatic',
                        type: 'chromatic',
                        title: 'Cromático Básico',
                        description: 'Exercício fundamental de digitação',
                        instructions: [
                            'Configure metrônomo em 40-50 BPM',
                            'Na 1ª corda: toque trastes 1-2-3-4',
                            'Depois volte: 4-3-2-1',
                            'Uma nota por batida',
                            'Repita 10 vezes',
                        ],
                        targetBPM: 45,
                        repetitions: 10,
                    },
                ],
                durationMinutes: 15,
            },
            revisar: {
                checklist: ['Executei cromático 1-2-3-4 na corda 1', 'Executei cromático 4-3-2-1', 'Mantive tempo no metrônomo'],
                reflection: 'Este exercício será seu aquecimento diário por muito tempo!',
                durationMinutes: 5,
            },
        },

        // Placeholder para dias 10-14
        {
            day: 10,
            title: 'Cromático - Cordas 1 e 2',
            theme: 'Expandindo o exercício',
            objectives: ['Adicionar 2ª corda ao cromático'],
            ouvir: { description: 'Melodias em duas cordas', playlist: [], durationMinutes: 2 },
            analisar: { description: 'Mesma técnica, nova corda', concepts: ['Aplique a mesma técnica na 2ª corda'], durationMinutes: 3 },
            praticar: { description: 'Cromático em 2 cordas', exercises: [], durationMinutes: 15 },
            revisar: { checklist: ['Cromático em corda 1', 'Cromático em corda 2'], reflection: 'Progresso!', durationMinutes: 5 },
        },
        {
            day: 11,
            title: 'Cromático - Cordas 1, 2 e 3',
            theme: 'Três cordas',
            objectives: ['Cromático fluido em 3 cordas'],
            ouvir: { description: 'Melodias variadas', playlist: [], durationMinutes: 2 },
            analisar: { description: 'Técnica consistente', concepts: [], durationMinutes: 3 },
            praticar: { description: 'Cromático 3 cordas', exercises: [], durationMinutes: 15 },
            revisar: { checklist: [], reflection: 'Ótimo trabalho!', durationMinutes: 5 },
        },
        {
            day: 12,
            title: 'Cromático - 4 Cordas',
            theme: 'Quatro cordas',
            objectives: ['Cromático em 4 cordas'],
            ouvir: { description: 'Linhas de baixo', playlist: [], durationMinutes: 2 },
            analisar: { description: 'Coordenação mão esquerda', concepts: [], durationMinutes: 3 },
            praticar: { description: 'Cromático 4 cordas', exercises: [], durationMinutes: 15 },
            revisar: { checklist: [], reflection: 'Quase lá!', durationMinutes: 5 },
        },
        {
            day: 13,
            title: 'Cromático - 5 Cordas',
            theme: 'Cinco cordas',
            objectives: ['Cromático em 5 cordas'],
            ouvir: { description: 'Riffs diversos', playlist: [], durationMinutes: 2 },
            analisar: { description: 'Resistência', concepts: [], durationMinutes: 3 },
            praticar: { description: 'Cromático 5 cordas', exercises: [], durationMinutes: 15 },
            revisar: { checklist: [], reflection: 'Um passo de cada vez!', durationMinutes: 5 },
        },
        {
            day: 14,
            title: 'Cromático Completo + Primeira Melodia',
            theme: 'Marco da Semana 2',
            objectives: ['Cromático em 6 cordas', 'Tocar Parabéns pra Você'],
            ouvir: { description: 'Melodias simples', playlist: [], durationMinutes: 2 },
            analisar: { description: 'Semana completa!', concepts: [], durationMinutes: 3 },
            praticar: { description: 'Cromático 6 cordas + Melodia', exercises: [], durationMinutes: 20 },
            revisar: { checklist: [], reflection: 'Você completou a Semana 2! Seus dedos já estão mais fortes.', durationMinutes: 5 },
        },
    ],

    weeklyPlaylist: [
        { title: 'Asa Branca', artist: 'Luiz Gonzaga', language: 'PT', reason: 'Melodia clara', focus: 'Notas individuais' },
        { title: 'Smoke on the Water', artist: 'Deep Purple', language: 'EN', reason: 'Riff icônico', focus: 'Notas precisas' },
        { title: 'Come as You Are', artist: 'Nirvana', language: 'EN', reason: 'Riff simples', focus: 'Linha de baixo' },
        { title: 'Você', artist: 'Tim Maia', language: 'PT', reason: 'Soul brasileiro', focus: 'Groove' },
    ],

    milestone: 'Primeiras Notas Limpas! 🎵',
};

// ==========================================
// WEEK 3: PRIMEIROS ACORDES - Em e E
// ==========================================

export const week3: WeekCurriculum = {
    week: 3,
    title: 'Primeiros Acordes',
    subtitle: 'Mi Menor e Mi Maior',
    description: 'Seus dois primeiros acordes! Em (Mi menor) e E (Mi Maior) - os mais fáceis do violão.',
    goals: [
        'Montar o acorde Em com clareza',
        'Montar o acorde E com clareza',
        'Transitar entre Em e E',
        'Tocar ritmo básico com acordes',
        'Entender a diferença entre maior e menor',
    ],

    days: [
        // DIA 15 - Em (Mi Menor)
        {
            day: 15,
            title: 'Mi Menor (Em)',
            theme: 'Seu primeiro acorde!',
            objectives: [
                'Montar o acorde Em corretamente',
                'Tocar todas as cordas limpas',
                'Desenvolver memória muscular',
            ],

            ouvir: {
                description: 'Músicas que usam Em como base',
                playlist: [
                    {
                        title: 'Nothing Else Matters',
                        artist: 'Metallica',
                        language: 'EN',
                        reason: 'Introdução em Em',
                        focus: 'Ouça a doçura do Mi menor',
                    },
                    {
                        title: 'Garota de Ipanema',
                        artist: 'Tom Jobim',
                        language: 'PT',
                        reason: 'Bossa nova usando Em',
                        focus: 'O som "triste" característico',
                    },
                ],
                durationMinutes: 2,
            },

            analisar: {
                description: 'O acorde Em é o mais fácil do violão',
                concepts: [
                    'Em = Mi menor (som "triste" ou melancólico)',
                    'Usa apenas 2 dedos: médio e anelar',
                    'Dedo 2 (médio) na 2ª casa da corda 5',
                    'Dedo 3 (anelar) na 2ª casa da corda 4',
                    'Todas as 6 cordas são tocadas',
                ],
                analogies: [
                    'Em é como um abraço suave - acolhedor e triste',
                    'É o acorde "pensativo"',
                ],
                durationMinutes: 3,
            },

            praticar: {
                description: 'Construindo seu primeiro acorde',
                exercises: [
                    {
                        id: 'week3-day15-em-build',
                        type: 'chord',
                        title: 'Montando Em',
                        description: 'Aprenda a formar o acorde passo a passo',
                        instructions: [
                            'Coloque o dedo 2 (médio) na 2ª casa da corda 5 (Lá)',
                            'Coloque o dedo 3 (anelar) na 2ª casa da corda 4 (Ré)',
                            'Mantenha os dedos curvados',
                            'Pressione perto do traste (mais fácil)',
                            'Toque cada corda individualmente - todas devem soar',
                            'Repita até cada corda soar limpa',
                        ],
                        data: { chord: 'Em' },
                        repetitions: 10,
                    },
                    {
                        id: 'week3-day15-em-strum',
                        type: 'rhythm',
                        title: 'Primeiro Strum',
                        description: 'Toque o acorde com ritmo simples',
                        instructions: [
                            'Monte o Em',
                            'Toque todas as cordas de cima para baixo (↓)',
                            'Descanse 1 segundo',
                            'Repita 4 vezes',
                            'Use o metrônomo em 60 BPM',
                        ],
                        targetBPM: 60,
                        duration: 300,
                    },
                ],
                durationMinutes: 20,
            },

            revisar: {
                checklist: [
                    'Consigo montar Em sem olhar os dedos',
                    'Todas as 6 cordas soam limpas',
                    'Não há cordas abafadas',
                    'Consigo manter por 10 segundos',
                ],
                reflection: 'Você acabou de aprender seu primeiro acorde! Com ele, já pode tocar centenas de músicas.',
                durationMinutes: 5,
            },

            tips: [
                'Não pressione forte demais - só o necessário',
                'Dedos curvados evitam abafar outras cordas',
                'Paciência! Levará alguns dias para ficar automático',
            ],
        },

        // DIA 16 - E (Mi Maior)
        {
            day: 16,
            title: 'Mi Maior (E)',
            theme: 'De triste para alegre',
            objectives: [
                'Montar o acorde E corretamente',
                'Comparar o som de Em vs E',
                'Começar transição Em ↔ E',
            ],

            ouvir: {
                description: 'Sinta a diferença entre maior e menor',
                playlist: [
                    {
                        title: 'Pais e Filhos',
                        artist: 'Legião Urbana',
                        language: 'PT',
                        reason: 'Usa progressão com E',
                        focus: 'O som "alegre" do E',
                    },
                    {
                        title: 'You Really Got Me',
                        artist: 'The Kinks',
                        language: 'EN',
                        reason: 'Power chord em E',
                        focus: 'Energia do acorde maior',
                    },
                ],
                durationMinutes: 2,
            },

            analisar: {
                description: 'E é como o Em, mas com mais um dedo',
                concepts: [
                    'E = Mi maior (som "alegre" ou triunfante)',
                    'Usa 3 dedos: indicador, médio e anelar',
                    'É o Em + dedo 1 (indicador) na corda 3',
                    'Dedo 1: 1ª casa corda 3 (Sol)',
                    'Dedo 2: 2ª casa corda 5 (Lá)',
                    'Dedo 3: 2ª casa corda 4 (Ré)',
                ],
                analogies: [
                    'E é o Em que sorriu - uma nota muda tudo!',
                    'Menor = triste, Maior = alegre',
                ],
                durationMinutes: 3,
            },

            praticar: {
                description: 'Construindo E e comparando',
                exercises: [
                    {
                        id: 'week3-day16-e-build',
                        type: 'chord',
                        title: 'Montando E',
                        description: 'Forme o acorde E completo',
                        instructions: [
                            'Monte o Em primeiro (dedos 2 e 3)',
                            'Adicione dedo 1 na 1ª casa corda 3',
                            'Verifique: todas as cordas soam?',
                            'Mantenha por 5 segundos',
                            'Solte e repita 10x',
                        ],
                        data: { chord: 'E' },
                        repetitions: 10,
                    },
                    {
                        id: 'week3-day16-compare',
                        type: 'ear',
                        title: 'Em vs E',
                        description: 'Ouça e sinta a diferença',
                        instructions: [
                            'Toque Em - sinta o som',
                            'Toque E - compare',
                            'Qual é mais "alegre"?',
                            'Repita alternando 5x cada',
                        ],
                        repetitions: 5,
                    },
                ],
                durationMinutes: 20,
            },

            revisar: {
                checklist: [
                    'Monto E com clareza',
                    'Identifico a diferença de som Em vs E',
                    'Consigo manter E por 10 segundos',
                    'Entendo o conceito maior vs menor',
                ],
                reflection: 'Com Em e E você já tem 2 acordes! Muitas músicas usam só esses dois.',
                durationMinutes: 5,
            },
        },

        // DIA 17 - Transição Em ↔ E
        {
            day: 17,
            title: 'Transição Em ↔ E',
            theme: 'Troca de acordes',
            objectives: [
                'Transitar suavemente entre Em e E',
                'Manter o ritmo durante trocas',
                'Desenvolver fluidez',
            ],

            ouvir: {
                description: 'Músicas que alternam entre Em e E',
                playlist: [
                    {
                        title: 'Horse With No Name',
                        artist: 'America',
                        language: 'EN',
                        reason: 'Usa Em e variação',
                        focus: 'O ritmo constante entre acordes',
                    },
                ],
                durationMinutes: 2,
            },

            analisar: {
                description: 'Economia de movimento',
                concepts: [
                    'Dedos 2 e 3 NÃO se movem entre Em e E',
                    'Apenas o dedo 1 entra e sai',
                    'Isso é chamado de "pivot" - um ponto fixo',
                    'Quanto menos movimento, mais rápida a troca',
                ],
                analogies: [
                    'É como uma porta: o eixo (pivot) não se move',
                ],
                durationMinutes: 3,
            },

            praticar: {
                description: 'Praticando a transição',
                exercises: [
                    {
                        id: 'week3-day17-transition',
                        type: 'chord',
                        title: 'Em → E → Em',
                        description: 'Pratique apenas a troca',
                        instructions: [
                            'Monte Em (sem tocar)',
                            'Adicione dedo 1 para E (sem tocar)',
                            'Retire dedo 1 voltando para Em',
                            'Repita a troca 20 vezes SEM tocar',
                            'Depois toque: Em(4x) → E(4x) → Em(4x)',
                        ],
                        repetitions: 20,
                    },
                    {
                        id: 'week3-day17-metro',
                        type: 'rhythm',
                        title: 'Troca no tempo',
                        description: 'Use metrônomo',
                        instructions: [
                            'Metrônomo em 40 BPM (bem lento)',
                            'Cada clique = uma palhetada ↓',
                            '4 cliques em Em, 4 cliques em E',
                            'Aumente para 50 BPM quando confortável',
                        ],
                        targetBPM: 40,
                        duration: 300,
                    },
                ],
                durationMinutes: 20,
            },

            revisar: {
                checklist: [
                    'Faço transição sem olhar',
                    'Mantenho dedos 2 e 3 fixos',
                    'Consigo trocar no tempo (40 BPM)',
                    'Não há pausas longas entre acordes',
                ],
                reflection: 'A troca de acordes é o segredo de tocar músicas. Você está no caminho certo!',
                durationMinutes: 5,
            },
        },

        // DIA 18-21 (resumido para brevidade)
        {
            day: 18,
            title: 'Ritmo com Em e E',
            theme: 'Palhetada para baixo e para cima',
            objectives: ['Executar palhetada alternada', 'Aplicar em Em e E', 'Desenvolver groove'],
            ouvir: { description: 'Ritmos básicos', playlist: [], durationMinutes: 2 },
            analisar: { description: '↓↑ = down-up strumming', concepts: ['↓ nos tempos fortes (1, 3)', '↑ nos tempos fracos (2, 4)', 'Padrão: ↓ ↑ ↓ ↑ = 1 e 2 e'], durationMinutes: 3 },
            praticar: { description: 'Palhetada alternada', exercises: [], durationMinutes: 20 },
            revisar: { checklist: [], reflection: 'O ritmo dá vida aos acordes!', durationMinutes: 5 },
        },
        {
            day: 19,
            title: 'Primeira Música - Em/E',
            theme: 'Tocando uma música real',
            objectives: ['Aplicar Em e E em música', 'Cantar enquanto toca', 'Divertir-se!'],
            ouvir: { description: 'A música que vamos tocar', playlist: [], durationMinutes: 2 },
            analisar: { description: 'Estrutura básica da música', concepts: ['Verso usa Em', 'Refrão usa E', 'Simples assim!'], durationMinutes: 3 },
            praticar: { description: 'Tocando a música', exercises: [], durationMinutes: 20 },
            revisar: { checklist: [], reflection: 'Você tocou sua primeira música!', durationMinutes: 5 },
        },
        {
            day: 20,
            title: 'Fortalecimento',
            theme: 'Consolidando Em e E',
            objectives: ['Aumentar BPM', 'Trocas mais rápidas', 'Resistência'],
            ouvir: { description: 'Músicas mais rápidas', playlist: [], durationMinutes: 2 },
            analisar: { description: 'Progressão gradual', concepts: ['Aumentar 5 BPM por vez', 'Só avance quando limpo'], durationMinutes: 3 },
            praticar: { description: 'Subindo velocidade', exercises: [], durationMinutes: 20 },
            revisar: { checklist: [], reflection: 'Mais rápido = mais músicas disponíveis!', durationMinutes: 5 },
        },
        {
            day: 21,
            title: 'Revisão Semana 3',
            theme: 'Celebrando Em e E',
            objectives: ['Revisar tudo', 'Autoavaliação', 'Preparar para Am e A'],
            ouvir: { description: 'Playlist da semana', playlist: [], durationMinutes: 2 },
            analisar: { description: 'Resumo da semana', concepts: ['Em = menor, E = maior', 'Transição com pivot', 'Ritmo ↓↑'], durationMinutes: 3 },
            praticar: { description: 'Sessão completa', exercises: [], durationMinutes: 20 },
            revisar: { checklist: [], reflection: 'Você domina seus 2 primeiros acordes!', durationMinutes: 5 },
        },
    ],

    weeklyPlaylist: [
        { title: 'Nothing Else Matters', artist: 'Metallica', language: 'EN', reason: 'Em icônico', focus: 'Dedilhado' },
        { title: 'Pais e Filhos', artist: 'Legião Urbana', language: 'PT', reason: 'Progressão simples', focus: 'Estrutura' },
        { title: 'Horse With No Name', artist: 'America', language: 'EN', reason: 'Dois acordes', focus: 'Transição' },
    ],

    milestone: 'Primeiros 2 Acordes! 🎸',
};

// ==========================================
// WEEK 4: Am e A
// ==========================================

export const week4: WeekCurriculum = {
    week: 4,
    title: 'Expandindo Repertório',
    subtitle: 'Lá Menor e Lá Maior',
    description: 'Am e A - mais dois acordes essenciais. Com 4 acordes você toca milhares de músicas!',
    goals: [
        'Montar Am com clareza',
        'Montar A com clareza',
        'Transitar entre Am e A',
        'Combinar todos os 4 acordes',
    ],

    days: [
        {
            day: 22,
            title: 'Lá Menor (Am)',
            theme: 'Terceiro acorde',
            objectives: ['Montar Am corretamente', 'Comparar com Em'],
            ouvir: { description: 'Músicas com Am', playlist: [{ title: 'Stairway to Heaven', artist: 'Led Zeppelin', language: 'EN', reason: 'Am na introdução', focus: 'Som do Am' }], durationMinutes: 2 },
            analisar: { description: 'Am é primo do Em', concepts: ['Am usa dedos 1, 2, 3', 'Corda 1 solta, corda 6 NÃO toca (X)', 'Dedo 1: corda 2, casa 1', 'Dedo 2: corda 4, casa 2', 'Dedo 3: corda 3, casa 2'], durationMinutes: 3 },
            praticar: { description: 'Montando Am', exercises: [], durationMinutes: 20 },
            revisar: { checklist: ['Am soa limpo', 'Não toco a 6ª corda', 'Corda 1 soa limpa (solta)'], reflection: 'Am é um dos acordes mais usados do mundo!', durationMinutes: 5 },
        },
        {
            day: 23,
            title: 'Lá Maior (A)',
            theme: 'Quarto acorde',
            objectives: ['Montar A corretamente'],
            ouvir: { description: 'Músicas com A', playlist: [], durationMinutes: 2 },
            analisar: { description: 'A: três dedos enfileirados', concepts: ['Todos os 3 dedos na casa 2', 'Dedos 1, 2, 3 nas cordas 4, 3, 2', 'Pode usar apenas 2 dedos (alternativa)'], durationMinutes: 3 },
            praticar: { description: 'Montando A', exercises: [], durationMinutes: 20 },
            revisar: { checklist: [], reflection: 'A é alegre e brilhante!', durationMinutes: 5 },
        },
        {
            day: 24,
            title: 'Transição Am ↔ A',
            theme: 'Troca entre Lás',
            objectives: ['Transitar Am ↔ A'],
            ouvir: { description: 'Músicas que alternam', playlist: [], durationMinutes: 2 },
            analisar: { description: 'Movimento paralelo', concepts: ['Dedo 1 move uma corda para baixo', 'Dedos 2 e 3 também descem uma corda'], durationMinutes: 3 },
            praticar: { description: 'Praticando troca', exercises: [], durationMinutes: 20 },
            revisar: { checklist: [], reflection: 'Com Am e A você tem 4 acordes!', durationMinutes: 5 },
        },
        {
            day: 25,
            title: 'Combinando 4 Acordes',
            theme: 'Em - E - Am - A',
            objectives: ['Transitar entre todos os 4'],
            ouvir: { description: 'Músicas com 4 acordes', playlist: [], durationMinutes: 2 },
            analisar: { description: 'Progressões comuns', concepts: ['Em → Am', 'E → A', 'Am → Em', 'Todas as combinações'], durationMinutes: 3 },
            praticar: { description: 'Circuito de acordes', exercises: [], durationMinutes: 20 },
            revisar: { checklist: [], reflection: 'Você já pode tocar centenas de músicas!', durationMinutes: 5 },
        },
        {
            day: 26,
            title: 'Músicas com 4 Acordes',
            theme: 'Repertório real',
            objectives: ['Tocar músicas completas'],
            ouvir: { description: 'Músicas para aprender', playlist: [], durationMinutes: 2 },
            analisar: { description: 'Estrutura verso-refrão', concepts: [], durationMinutes: 3 },
            praticar: { description: 'Tocando músicas', exercises: [], durationMinutes: 20 },
            revisar: { checklist: [], reflection: 'Você é oficialmente um violonista!', durationMinutes: 5 },
        },
        {
            day: 27,
            title: 'Consolidação',
            theme: 'Fixando 4 acordes',
            objectives: ['Velocidade', 'Limpeza', 'Automação'],
            ouvir: { description: 'Músicas favoritas', playlist: [], durationMinutes: 2 },
            analisar: { description: 'Dicas avançadas', concepts: [], durationMinutes: 3 },
            praticar: { description: 'Prática intensa', exercises: [], durationMinutes: 20 },
            revisar: { checklist: [], reflection: 'Os 4 acordes estão automáticos?', durationMinutes: 5 },
        },
        {
            day: 28,
            title: 'Revisão Semana 4',
            theme: 'Você tem 4 acordes!',
            objectives: ['Autoavaliação completa'],
            ouvir: { description: 'Celebração musical', playlist: [], durationMinutes: 2 },
            analisar: { description: 'O que conquistamos', concepts: ['Em, E, Am, A dominados', '4 acordes = milhares de músicas'], durationMinutes: 3 },
            praticar: { description: 'Show solo!', exercises: [], durationMinutes: 20 },
            revisar: { checklist: [], reflection: 'MARCO: Você domina 4 acordes essenciais!', durationMinutes: 5 },
        },
    ],

    weeklyPlaylist: [
        { title: 'Stairway to Heaven', artist: 'Led Zeppelin', language: 'EN', reason: 'Am icônico', focus: 'Dedilhado' },
        { title: 'Wonderwall', artist: 'Oasis', language: 'EN', reason: 'Progressão clássica', focus: 'Acordes' },
    ],

    milestone: '4 Acordes Dominados! 🎉',
};

// ==========================================
// WEEK 5: Dm e D
// ==========================================

export const week5: WeekCurriculum = {
    week: 5,
    title: 'Família do Ré',
    subtitle: 'Ré Menor e Ré Maior',
    description: 'Dm e D - completando o alfabeto menor/maior básico.',
    goals: [
        'Montar Dm e D',
        'Transitar dentro da família D',
        'Combinar com acordes anteriores',
    ],

    days: [
        { day: 29, title: 'Ré Menor (Dm)', theme: 'Quinto acorde', objectives: ['Montar Dm'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Dm formato triangular', concepts: ['Dedo 1: corda 1, casa 1', 'Dedo 2: corda 3, casa 2', 'Dedo 3: corda 2, casa 3', 'Cordas 5 e 6: NÃO tocar'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Dm tem um som intenso e dramático!', durationMinutes: 5 } },
        { day: 30, title: 'Ré Maior (D)', theme: 'Sexto acorde', objectives: ['Montar D'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'D formato triangular invertido', concepts: ['Dedo 1: corda 3, casa 2', 'Dedo 2: corda 1, casa 2', 'Dedo 3: corda 2, casa 3', 'Cordas 5 e 6: NÃO tocar'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'D é alegre e brilhante!', durationMinutes: 5 } },
        { day: 31, title: 'Transição Dm ↔ D', theme: 'Troca de Rés', objectives: ['Transitar Dm ↔ D'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: [], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: '', durationMinutes: 5 } },
        { day: 32, title: 'D com outros acordes', theme: 'Combinações', objectives: ['D → G (preview)', 'D → A'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Progressões com D', concepts: [], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: '', durationMinutes: 5 } },
        { day: 33, title: 'Músicas com D', theme: 'Repertório', objectives: ['Tocar músicas com D'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: [], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: '', durationMinutes: 5 } },
        { day: 34, title: 'Consolidação', theme: '6 acordes', objectives: ['Dominar todos os 6'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: [], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: '', durationMinutes: 5 } },
        { day: 35, title: 'Revisão Semana 5', theme: 'Dm e D dominados', objectives: ['Review'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: [], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: '6 acordes! Você está voando!', durationMinutes: 5 } },
    ],

    weeklyPlaylist: [
        { title: 'Sweet Home Alabama', artist: 'Lynyrd Skynyrd', language: 'EN', reason: 'D icônico', focus: 'Riff' },
    ],

    milestone: '6 Acordes! 🎵',
};

// ==========================================
// WEEK 6: C e G
// ==========================================

export const week6: WeekCurriculum = {
    week: 6,
    title: 'Os Gigantes',
    subtitle: 'Dó Maior e Sol Maior',
    description: 'C e G são os acordes mais usados. Completam seu arsenal básico!',
    goals: [
        'Montar C com clareza',
        'Montar G com clareza',
        'Dominar progressão G-C-D',
        'Tocar baladas clássicas',
    ],

    days: [
        { day: 36, title: 'Dó Maior (C)', theme: 'O acorde universal', objectives: ['Montar C'], ouvir: { description: 'Músicas em C', playlist: [{ title: 'Let It Be', artist: 'The Beatles', language: 'EN', reason: 'Progressão com C', focus: 'Som majestoso' }], durationMinutes: 2 }, analisar: { description: 'C: o acorde raiz', concepts: ['Dedo 1: corda 2, casa 1', 'Dedo 2: corda 4, casa 2', 'Dedo 3: corda 5, casa 3', 'Corda 6: NÃO tocar'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'C é o centro de tudo na música ocidental!', durationMinutes: 5 } },
        { day: 37, title: 'Sol Maior (G)', theme: 'O acorde grande', objectives: ['Montar G'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'G: estica os dedos', concepts: ['Dedo 2: corda 5, casa 2', 'Dedo 1: corda 6, casa 3', 'Dedo 3: corda 1, casa 3', 'Todas as cordas tocam'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'G é grande e cheio!', durationMinutes: 5 } },
        { day: 38, title: 'Transição G ↔ C', theme: 'A troca mais comum', objectives: ['G → C fluente'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Dedo 3 como pivot', concepts: ['Dedo 3 move apenas uma posição', 'Dedos 1 e 2 reorganizam'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'G-C é a base de milhares de músicas!', durationMinutes: 5 } },
        { day: 39, title: 'G-C-D Progressão', theme: 'A progressão mágica', objectives: ['Dominar G-C-D'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'I-IV-V em Sol', concepts: ['G = I (tônica)', 'C = IV (subdominante)', 'D = V (dominante)'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Com G-C-D você toca 50% das músicas pop!', durationMinutes: 5 } },
        { day: 40, title: 'Músicas Clássicas', theme: 'Repertório lendário', objectives: ['Knockin on Heavens Door', 'Wonderwall'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: [], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Você toca clássicos!', durationMinutes: 5 } },
        { day: 41, title: 'Consolidação 8 Acordes', theme: 'Arsenal completo', objectives: ['Em E Am A Dm D C G'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '8 acordes = 90% das músicas', concepts: [], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Você tem 8 acordes essenciais!', durationMinutes: 5 } },
        { day: 42, title: 'Revisão Semana 6', theme: 'MARCO: 8 Acordes!', objectives: ['Celebrar conquista'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: ['Em, E, Am, A, Dm, D, C, G', 'Com esses 8 você toca quase tudo!'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'PARABÉNS! Você domina os 8 acordes essenciais do violão!', durationMinutes: 5 } },
    ],

    weeklyPlaylist: [
        { title: 'Let It Be', artist: 'The Beatles', language: 'EN', reason: 'C icônico', focus: 'Balada' },
        { title: "Knockin' on Heaven's Door", artist: 'Bob Dylan', language: 'EN', reason: 'G-D-Am-C', focus: 'Progressão' },
        { title: 'Wonderwall', artist: 'Oasis', language: 'EN', reason: 'Clássico moderno', focus: 'Ritmo' },
    ],

    milestone: '8 Acordes Essenciais! 🏆',
};

// ==========================================
// WEEK 7: DEDILHADO (FINGERPICKING)
// ==========================================

export const week7: WeekCurriculum = {
    week: 7,
    title: 'Dedilhado Básico',
    subtitle: 'Fingerpicking Essencial',
    description: 'Aprenda a tocar com os dedos para criar melodias e acompanhamentos mais elaborados.',
    goals: [
        'Entender posição da mão para dedilhado',
        'Dominar padrão P-I-M-A',
        'Tocar arpejos em acordes conhecidos',
        'Combinar dedilhado com troca de acordes',
    ],

    days: [
        { day: 43, title: 'Introdução ao Dedilhado', theme: 'P-I-M-A', objectives: ['Conhecer nomes dos dedos', 'Posição correta da mão'], ouvir: { description: 'Músicas com fingerpicking', playlist: [{ title: 'Dust in the Wind', artist: 'Kansas', language: 'EN', reason: 'Dedilhado icônico', focus: 'Padrão repetitivo' }], durationMinutes: 2 }, analisar: { description: 'P = Polegar (baixos)', concepts: ['P = Polegar (cordas 6, 5, 4)', 'I = Indicador (corda 3)', 'M = Médio (corda 2)', 'A = Anelar (corda 1)'], durationMinutes: 3 }, praticar: { description: 'Praticando em cordas soltas', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'O dedilhado abre um novo mundo de possibilidades!', durationMinutes: 5 } },
        { day: 44, title: 'Padrão Básico', theme: 'P-I-M-A-M-I', objectives: ['Executar padrão básico'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Padrão "para cima e para baixo"', concepts: ['P-I-M-A = subindo', 'A-M-I = descendo', 'Combinação: P-I-M-A-M-I'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Este padrão está em centenas de músicas!', durationMinutes: 5 } },
        { day: 45, title: 'Dedilhado com Em', theme: 'Primeiro acorde dedilhado', objectives: ['Aplicar padrão em Em'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Polegar no baixo do acorde', concepts: ['Em: polegar na corda 6', 'Padrão P-I-M-A-M-I mantido'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'O Em dedilhado tem som de balada!', durationMinutes: 5 } },
        { day: 46, title: 'Dedilhado com Am e C', theme: 'Variando o baixo', objectives: ['Am com baixo na corda 5', 'C com baixo na corda 5'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Baixo segue a fundamental', concepts: ['Am: baixo = corda 5', 'C: baixo = corda 5', 'D: baixo = corda 4'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Você está criando música!', durationMinutes: 5 } },
        { day: 47, title: 'Transição Dedilhada', theme: 'Trocando acordes', objectives: ['Trocar acordes sem parar o padrão'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Continuidade é a chave', concepts: ['Não pare o padrão na troca', 'Antecipe a mudança', 'Use o polegar como "âncora"'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'A fluidez vem com prática!', durationMinutes: 5 } },
        { day: 48, title: 'Música com Dedilhado', theme: 'House of the Rising Sun', objectives: ['Tocar música completa'], ouvir: { description: 'A música', playlist: [{ title: 'House of the Rising Sun', artist: 'The Animals', language: 'EN', reason: 'Arpejo icônico', focus: 'Am-C-D-F-Am-C-E' }], durationMinutes: 2 }, analisar: { description: 'Estrutura simples', concepts: ['Am - C - D - F', 'Am - C - E', 'Padrão constante'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Você toca um clássico!', durationMinutes: 5 } },
        { day: 49, title: 'Revisão Semana 7', theme: 'Dedilhado consolidado', objectives: ['Review completo'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: ['P-I-M-A dominado', 'Arpejos em 6 acordes', 'Primeira música dedilhada'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Semana do dedilhado completa!', durationMinutes: 5 } },
    ],

    weeklyPlaylist: [
        { title: 'Dust in the Wind', artist: 'Kansas', language: 'EN', reason: 'Fingerpicking perfeito', focus: 'Clareza' },
        { title: 'House of the Rising Sun', artist: 'The Animals', language: 'EN', reason: 'Arpejo icônico', focus: 'Progressão' },
        { title: 'Romaria', artist: 'Elis Regina', language: 'PT', reason: 'Dedilhado brasileiro', focus: 'Expressividade' },
    ],

    milestone: 'Dedilhado Desbloqueado! 🎶',
};

// ==========================================
// WEEK 8: RITMOS AVANÇADOS
// ==========================================

export const week8: WeekCurriculum = {
    week: 8,
    title: 'Ritmos do Mundo',
    subtitle: 'Batidas Características',
    description: 'Aprenda os ritmos mais usados: pop, rock, balada, country e brasileiros.',
    goals: [
        'Dominar batida pop/rock',
        'Executar ritmo de balada',
        'Conhecer batida brasileira básica',
        'Combinar ritmos com repertório',
    ],

    days: [
        { day: 50, title: 'Batida Pop/Rock', theme: '↓ ↓↑ ↑↓↑', objectives: ['Dominar o ritmo mais universal'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'O padrão universal', concepts: ['1 ↓ 2 ↓↑ ↑3↓↑', 'Silêncio no "3"', 'Acentuação no 1 e 3'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Este ritmo funciona em 80% das músicas!', durationMinutes: 5 } },
        { day: 51, title: 'Batida de Balada', theme: '↓ ↓↑ ↓ ↓↑', objectives: ['Ritmo suave'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Mais lento e emotivo', concepts: ['Sem pressa', 'Acentos suaves', 'Ideal para músicas românticas'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Baladas são eternamente populares!', durationMinutes: 5 } },
        { day: 52, title: 'Batida Brasileira', theme: 'Samba-canção ↓ ↑↓ ↑↓↑', objectives: ['Ritmo brasileiro'], ouvir: { description: 'MPB clássica', playlist: [], durationMinutes: 2 }, analisar: { description: 'Síncope brasileira', concepts: ['Acento no contratempo', 'Gingado característico'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'O gingado brasileiro é único!', durationMinutes: 5 } },
        { day: 53, title: 'Batida Country', theme: 'Baixo-acorde', objectives: ['Alternando baixo'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Boom-chicka', concepts: ['Polegar no baixo', 'Dedos nos agudos', 'Alternância constante'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Country é divertido de tocar!', durationMinutes: 5 } },
        { day: 54, title: 'Combinando Ritmos', theme: 'Aplicação prática', objectives: ['Escolher ritmo por música'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Qual ritmo usar?', concepts: ['Pop = rock e pop internacionais', 'Balada = músicas lentas', 'Brasileira = MPB/samba', 'Country = folk/sertanejo'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Você tem 4 ritmos no arsenal!', durationMinutes: 5 } },
        { day: 55, title: 'Músicas com Ritmos', theme: 'Repertório expandido', objectives: ['Aplicar ritmos em músicas'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: [], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Ritmo certo = música certa!', durationMinutes: 5 } },
        { day: 56, title: 'Revisão Semana 8', theme: '4 Ritmos dominados', objectives: ['Review'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: ['Pop/Rock', 'Balada', 'Brasileira', 'Country'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Você domina 4 ritmos essenciais!', durationMinutes: 5 } },
    ],

    weeklyPlaylist: [
        { title: "Knockin' on Heaven's Door", artist: 'Bob Dylan', language: 'EN', reason: 'Pop/rock', focus: 'Ritmo' },
        { title: 'Country Roads', artist: 'John Denver', language: 'EN', reason: 'Country', focus: 'Boom-chicka' },
        { title: 'Aquarela', artist: 'Toquinho', language: 'PT', reason: 'Brasileira', focus: 'Gingado' },
    ],

    milestone: '4 Ritmos Dominados! 🥁',
};

// ==========================================
// WEEK 9-10: PRIMEIRAS MÚSICAS COMPLETAS
// ==========================================

export const week9: WeekCurriculum = {
    week: 9,
    title: 'Repertório Inicial',
    subtitle: 'Suas Primeiras Músicas',
    description: 'Aprenda 4 músicas completas com os acordes e ritmos que você domina.',
    goals: [
        'Tocar 2 músicas do início ao fim',
        'Memorizar estruturas (verso, refrão)',
        'Cantar e tocar simultaneamente',
    ],

    days: [
        { day: 57, title: 'Música 1: Pais e Filhos', theme: 'Legião Urbana', objectives: ['Aprender música completa'], ouvir: { description: 'Ouça a original', playlist: [{ title: 'Pais e Filhos', artist: 'Legião Urbana', language: 'PT', reason: 'Clássico brasileiro', focus: 'Estrutura simples' }], durationMinutes: 2 }, analisar: { description: 'Acordes: A, E, D', concepts: ['Verso: A - E', 'Refrão: D - A - E', 'Ritmo de balada'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Uma das músicas mais tocadas do Brasil!', durationMinutes: 5 } },
        { day: 58, title: 'Música 1: Verso', theme: 'Estrutura A-E', objectives: ['Dominar o verso'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Troca A-E', concepts: ['4 compassos em A', '4 compassos em E', 'Repetir'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Verso dominado!', durationMinutes: 5 } },
        { day: 59, title: 'Música 1: Completa', theme: 'Do início ao fim', objectives: ['Tocar música inteira'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Estrutura completa', concepts: ['Intro → Verso → Refrão → Verso → Refrão → Final'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'PARABÉNS! Primeira música completa!', durationMinutes: 5 } },
        { day: 60, title: 'Música 2: Wonderwall', theme: 'Oasis', objectives: ['Aprender os acordes'], ouvir: { description: '', playlist: [{ title: 'Wonderwall', artist: 'Oasis', language: 'EN', reason: 'Hit eterno', focus: 'Padrão de acordes' }], durationMinutes: 2 }, analisar: { description: 'Em, G, D, A', concepts: ['Capo na casa 2', 'Padrão: Em-G-D-A', 'Ritmo característico'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Wonderwall é pedido em toda roda!', durationMinutes: 5 } },
        { day: 61, title: 'Música 2: Ritmo', theme: 'Padrão do Oasis', objectives: ['Dominar o ritmo específico'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Ritmo sincopado', concepts: ['Acentuação diferente', 'Pratique lento primeiro'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'O ritmo é a alma da música!', durationMinutes: 5 } },
        { day: 62, title: 'Música 2: Completa', theme: 'Wonderwall inteira', objectives: ['Tocar do início ao fim'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: [], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Duas músicas completas!', durationMinutes: 5 } },
        { day: 63, title: 'Revisão Semana 9', theme: '2 músicas no repertório', objectives: ['Tocar as duas'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: [], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Você tem repertório!', durationMinutes: 5 } },
    ],

    weeklyPlaylist: [
        { title: 'Pais e Filhos', artist: 'Legião Urbana', language: 'PT', reason: 'Sua primeira música completa', focus: 'Emoção' },
        { title: 'Wonderwall', artist: 'Oasis', language: 'EN', reason: 'Segunda música', focus: 'Ritmo' },
    ],

    milestone: '2 Músicas Completas! 🎵',
};

export const week10: WeekCurriculum = {
    week: 10,
    title: 'Expandindo Repertório',
    subtitle: 'Mais 2 Músicas',
    description: 'Continue construindo seu repertório com mais 2 músicas.',
    goals: [
        'Aprender mais 2 músicas',
        'Desenvolver memória musical',
        'Tocar 4 músicas completas',
    ],

    days: [
        { day: 64, title: 'Música 3: Epitáfio', theme: 'Titãs', objectives: ['Aprender estrutura'], ouvir: { description: '', playlist: [{ title: 'Epitáfio', artist: 'Titãs', language: 'PT', reason: 'Clássico atemporal', focus: 'Letra poderosa' }], durationMinutes: 2 }, analisar: { description: 'C, Am, F, G', concepts: ['Progressão clássica', 'F é o desafio!'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Epitáfio emociona multidões!', durationMinutes: 5 } },
        { day: 65, title: 'Música 3: Praticando F', theme: 'Acorde difícil', objectives: ['Se aproximando do F'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'F simplificado', concepts: ['Use F/C ou Fmaj7 no início', 'Pestana virá na semana 11'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Alternativas funcionam!', durationMinutes: 5 } },
        { day: 66, title: 'Música 3: Completa', theme: 'Epitáfio inteiro', objectives: ['Tocar do início ao fim'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: [], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: '3 músicas no repertório!', durationMinutes: 5 } },
        { day: 67, title: 'Música 4: Asa Branca', theme: 'Luiz Gonzaga', objectives: ['Clássico nordestino'], ouvir: { description: '', playlist: [{ title: 'Asa Branca', artist: 'Luiz Gonzaga', language: 'PT', reason: 'Patrimônio brasileiro', focus: 'Melodia icônica' }], durationMinutes: 2 }, analisar: { description: 'D, A7, G', concepts: ['Baião simplificado', 'Pode dedilhar ou bater'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Asa Branca é imortal!', durationMinutes: 5 } },
        { day: 68, title: 'Música 4: Melodia', theme: 'Intro icônica', objectives: ['Tocar a introdução'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Notas da intro', concepts: ['Pode ser tocada em notas simples', 'Ou só acordes'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'A intro é reconhecível!', durationMinutes: 5 } },
        { day: 69, title: 'Música 4: Completa', theme: 'Asa Branca inteira', objectives: ['Tocar completa'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: [], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: '4 músicas completas!', durationMinutes: 5 } },
        { day: 70, title: 'Revisão Semana 10', theme: '4 músicas!', objectives: ['Review repertório'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Seu repertório', concepts: ['Pais e Filhos', 'Wonderwall', 'Epitáfio', 'Asa Branca'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'MARCO: 4 músicas completas!', durationMinutes: 5 } },
    ],

    weeklyPlaylist: [
        { title: 'Epitáfio', artist: 'Titãs', language: 'PT', reason: 'Terceira música', focus: 'Emoção' },
        { title: 'Asa Branca', artist: 'Luiz Gonzaga', language: 'PT', reason: 'Quarta música', focus: 'Brasilidade' },
    ],

    milestone: '4 Músicas Completas! 🎸',
};

// ==========================================
// WEEK 11-12: PESTANA (BARRE CHORDS)
// ==========================================

export const week11: WeekCurriculum = {
    week: 11,
    title: 'Introdução à Pestana',
    subtitle: 'Barre Chords Básicos',
    description: 'O grande desafio! Aprenda acordes com pestana para tocar qualquer acorde.',
    goals: [
        'Entender mecânica da pestana',
        'Desenvolver força no indicador',
        'Montar F maior',
        'Transitar para pestana',
    ],

    days: [
        { day: 71, title: 'O que é Pestana', theme: 'Barre chord', objectives: ['Entender o conceito'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Pestana = capotraste móvel', concepts: ['O indicador vira uma barra', 'Permite tocar QUALQUER acorde', 'Exige força e técnica'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'A pestana é o "nível 2" do violão!', durationMinutes: 5 } },
        { day: 72, title: 'Exercícios de Força', theme: 'Fortalecendo o dedo', objectives: ['Desenvolver força'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Técnica correta', concepts: ['Use a lateral do dedo', 'Posicione perto do traste', 'Não pressione demais - use alavanca'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Força vem com tempo!', durationMinutes: 5 } },
        { day: 73, title: 'Meia Pestana', theme: 'Só 3 cordas', objectives: ['Pestana parcial'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Comece pequeno', concepts: ['Pressione só cordas 1, 2, 3', 'É mais fácil que pestana completa', 'Alguns acordes só usam meia'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Meia pestana já é uma vitória!', durationMinutes: 5 } },
        { day: 74, title: 'Forma de E com Pestana', theme: 'F maior', objectives: ['Montar o F'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'F = E movido 1 casa', concepts: ['Pestana na casa 1', 'Formato de E por trás', 'É assim que nascem todos os acordes maiores!'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'F é o acorde mais difícil - você está tentando!', durationMinutes: 5 } },
        { day: 75, title: 'Praticando F', theme: 'Repetição é a chave', objectives: ['Melhorar clareza do F'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Dicas pro F', concepts: ['Cotovelo para dentro', 'Polegar atrás do braço', 'Paciência - pode levar semanas'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Cada dia um pouco melhor!', durationMinutes: 5 } },
        { day: 76, title: 'Transição C ↔ F', theme: 'A troca difícil', objectives: ['Trocar para F'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Movimento mínimo', concepts: ['Dedos 2 e 3 mantêm forma similar', 'Dedo 1 estica para pestana'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'C-F é uma das trocas mais importantes!', durationMinutes: 5 } },
        { day: 77, title: 'Revisão Semana 11', theme: 'Pestana iniciada', objectives: ['Review'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: ['Técnica de pestana', 'Meia pestana', 'F maior', 'Transição C-F'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'A pestana é um processo - continue!', durationMinutes: 5 } },
    ],

    weeklyPlaylist: [
        { title: 'Hey Jude', artist: 'The Beatles', language: 'EN', reason: 'Usa F', focus: 'F na música' },
        { title: 'More Than Words', artist: 'Extreme', language: 'EN', reason: 'Dedilhado com F', focus: 'Técnica' },
    ],

    milestone: 'Pestana Iniciada! 💪',
};

export const week12: WeekCurriculum = {
    week: 12,
    title: 'Dominando a Pestana',
    subtitle: 'Bm e Sistema CAGED',
    description: 'Continue desenvolvendo a pestana e aprenda o sistema que permite tocar qualquer acorde.',
    goals: [
        'Montar Bm com pestana',
        'Entender sistema CAGED',
        'Tocar músicas com pestana',
        'CELEBRAR: Curso completo!',
    ],

    days: [
        { day: 78, title: 'Forma de Am com Pestana', theme: 'Bm', objectives: ['Montar Bm'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'Bm = Am na casa 2', concepts: ['Pestana na casa 2', 'Formato de Am por trás', 'Assim nascem acordes menores!'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Bm é muito usado!', durationMinutes: 5 } },
        { day: 79, title: 'Praticando Bm', theme: 'Fortalecimento', objectives: ['Melhorar Bm'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: [], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Bm ficando mais fácil!', durationMinutes: 5 } },
        { day: 80, title: 'Sistema CAGED', theme: 'O segredo do braço', objectives: ['Entender CAGED'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'CAGED = formas móveis', concepts: ['C-A-G-E-D', 'Cada forma pode ser movida', 'Com pestana, vira qualquer acorde'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'CAGED abre o braço inteiro!', durationMinutes: 5 } },
        { day: 81, title: 'Músicas com Pestana', theme: 'Aplicação real', objectives: ['Tocar músicas com F e Bm'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: [], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Repertório expandido!', durationMinutes: 5 } },
        { day: 82, title: 'Consolidação Final', theme: 'Tudo junto', objectives: ['Revisar todo o curso'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: 'O que você aprendeu', concepts: ['8 acordes abertos + F + Bm', '4 ritmos', 'Dedilhado', '4+ músicas'], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Você é um violonista!', durationMinutes: 5 } },
        { day: 83, title: 'Show Solo', theme: 'Tocando seu repertório', objectives: ['Tocar todas as músicas'], ouvir: { description: '', playlist: [], durationMinutes: 2 }, analisar: { description: '', concepts: [], durationMinutes: 3 }, praticar: { description: '', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: 'Seu show particular!', durationMinutes: 5 } },
        { day: 84, title: '🎉 FORMATURA!', theme: 'Curso Completo', objectives: ['Celebrar!'], ouvir: { description: 'Suas músicas favoritas', playlist: [], durationMinutes: 2 }, analisar: { description: 'Sua jornada', concepts: ['84 dias de dedicação', '10 acordes dominados', '4+ músicas no repertório', 'Você é um músico!'], durationMinutes: 3 }, praticar: { description: 'Toque o que quiser!', exercises: [], durationMinutes: 20 }, revisar: { checklist: [], reflection: '🎉 PARABÉNS! VOCÊ COMPLETOU O CURSO DE 12 SEMANAS! 🎉', durationMinutes: 5 } },
    ],

    weeklyPlaylist: [
        { title: 'Hotel California', artist: 'Eagles', language: 'EN', reason: 'Bm icônico', focus: 'Sua meta!' },
        { title: 'Você', artist: 'Tim Maia', language: 'PT', reason: 'Soul brasileiro', focus: 'Celebração' },
    ],

    milestone: '🎓 CURSO COMPLETO! 🎓',
};

// ==========================================
// EXPORT ALL WEEKS
// ==========================================

export const WEEKLY_CURRICULUM: WeekCurriculum[] = [
    week1,
    week2,
    week3,
    week4,
    week5,
    week6,
    week7,
    week8,
    week9,
    week10,
    week11,
    week12,
];

// Helper functions
export const getWeekByNumber = (weekNum: number): WeekCurriculum | undefined => {
    return WEEKLY_CURRICULUM.find(w => w.week === weekNum);
};

export const getDayContent = (weekNum: number, dayNum: number): DailyContent | undefined => {
    const week = getWeekByNumber(weekNum);
    return week?.days.find(d => d.day === dayNum);
};

export const getTotalDays = (): number => {
    return WEEKLY_CURRICULUM.reduce((acc, week) => acc + week.days.length, 0);
};
