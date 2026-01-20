export interface Chord {
  id: string;
  name: string;
  fullName: string;
  category: 'major' | 'minor' | 'seventh' | 'suspended' | 'diminished';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  frets: (number | 'x')[];
  fingers: (number | 0)[];
  description: string;
  tips: string[];
  relatedChords: string[];
  xpReward: number;
}

export const chords: Chord[] = [
  // BEGINNER - Major Chords
  {
    id: 'C',
    name: 'C',
    fullName: 'Dó Maior',
    category: 'major',
    difficulty: 'beginner',
    frets: ['x', 3, 2, 0, 1, 0],
    fingers: [0, 3, 2, 0, 1, 0],
    description: 'Um dos acordes mais fundamentais e fáceis de aprender',
    tips: [
      'Mantenha os dedos curvados',
      'Pressione as cordas com a ponta dos dedos',
      'Certifique-se de que todas as notas soem claramente'
    ],
    relatedChords: ['Am', 'F', 'G'],
    xpReward: 10
  },
  {
    id: 'D',
    name: 'D',
    fullName: 'Ré Maior',
    category: 'major',
    difficulty: 'beginner',
    frets: ['x', 'x', 0, 2, 3, 2],
    fingers: [0, 0, 0, 1, 3, 2],
    description: 'Acorde triangular fácil de formar',
    tips: [
      'Forme um triângulo com os dedos',
      'Não toque as cordas 5 e 6',
      'Mantenha o polegar atrás do braço'
    ],
    relatedChords: ['G', 'A', 'Bm'],
    xpReward: 10
  },
  {
    id: 'E',
    name: 'E',
    fullName: 'Mi Maior',
    category: 'major',
    difficulty: 'beginner',
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
    description: 'Acorde poderoso com todas as cordas',
    tips: [
      'Use os dedos 1, 2 e 3',
      'Toque todas as seis cordas',
      'Mantenha os dedos próximos aos trastes'
    ],
    relatedChords: ['A', 'B7', 'C#m'],
    xpReward: 10
  },
  {
    id: 'G',
    name: 'G',
    fullName: 'Sol Maior',
    category: 'major',
    difficulty: 'beginner',
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [3, 2, 0, 0, 0, 4],
    description: 'Acorde aberto e ressonante',
    tips: [
      'Estique os dedos para alcançar as cordas 1 e 6',
      'Deixe as cordas do meio abertas',
      'Pratique a transição com C e D'
    ],
    relatedChords: ['C', 'D', 'Em'],
    xpReward: 10
  },
  {
    id: 'A',
    name: 'A',
    fullName: 'Lá Maior',
    category: 'major',
    difficulty: 'beginner',
    frets: ['x', 0, 2, 2, 2, 0],
    fingers: [0, 0, 1, 2, 3, 0],
    description: 'Acorde compacto e brilhante',
    tips: [
      'Agrupe os três dedos juntos',
      'Não toque a corda 6',
      'Mantenha os dedos perpendiculares ao braço'
    ],
    relatedChords: ['D', 'E', 'F#m'],
    xpReward: 10
  },
  
  // BEGINNER - Minor Chords
  {
    id: 'Am',
    name: 'Am',
    fullName: 'Lá Menor',
    category: 'minor',
    difficulty: 'beginner',
    frets: ['x', 0, 2, 2, 1, 0],
    fingers: [0, 0, 2, 3, 1, 0],
    description: 'Primeiro acorde menor para muitos iniciantes',
    tips: [
      'Similar ao E, mas com dedos diferentes',
      'Não toque a corda 6',
      'Som melancólico e suave'
    ],
    relatedChords: ['C', 'Dm', 'E'],
    xpReward: 10
  },
  {
    id: 'Em',
    name: 'Em',
    fullName: 'Mi Menor',
    category: 'minor',
    difficulty: 'beginner',
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
    description: 'O acorde mais fácil de todos',
    tips: [
      'Apenas dois dedos necessários',
      'Toque todas as seis cordas',
      'Perfeito para iniciantes absolutos'
    ],
    relatedChords: ['G', 'D', 'C'],
    xpReward: 10
  },
  {
    id: 'Dm',
    name: 'Dm',
    fullName: 'Ré Menor',
    category: 'minor',
    difficulty: 'beginner',
    frets: ['x', 'x', 0, 2, 3, 1],
    fingers: [0, 0, 0, 2, 3, 1],
    description: 'Acorde menor expressivo',
    tips: [
      'Similar ao D maior, mas com dedo mindinho',
      'Não toque as cordas 5 e 6',
      'Som triste e emotivo'
    ],
    relatedChords: ['Am', 'F', 'C'],
    xpReward: 10
  },
  
  // INTERMEDIATE - Seventh Chords
  {
    id: 'G7',
    name: 'G7',
    fullName: 'Sol com Sétima',
    category: 'seventh',
    difficulty: 'intermediate',
    frets: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, 0, 0, 0, 1],
    description: 'Acorde de tensão que resolve para C',
    tips: [
      'Adiciona tensão harmônica',
      'Usado em progressões de blues',
      'Resolve naturalmente para C'
    ],
    relatedChords: ['C', 'D7', 'C7'],
    xpReward: 15
  },
  {
    id: 'D7',
    name: 'D7',
    fullName: 'Ré com Sétima',
    category: 'seventh',
    difficulty: 'intermediate',
    frets: ['x', 'x', 0, 2, 1, 2],
    fingers: [0, 0, 0, 2, 1, 3],
    description: 'Acorde de dominante comum',
    tips: [
      'Resolve para G',
      'Usado em blues e country',
      'Mantenha os dedos curvados'
    ],
    relatedChords: ['G', 'A7', 'G7'],
    xpReward: 15
  },
  {
    id: 'E7',
    name: 'E7',
    fullName: 'Mi com Sétima',
    category: 'seventh',
    difficulty: 'intermediate',
    frets: [0, 2, 0, 1, 0, 0],
    fingers: [0, 2, 0, 1, 0, 0],
    description: 'Acorde de blues clássico',
    tips: [
      'Apenas dois dedos',
      'Som de blues autêntico',
      'Resolve para A'
    ],
    relatedChords: ['A', 'B7', 'A7'],
    xpReward: 15
  },
  
  // INTERMEDIATE - Suspended & Barre Chords
  {
    id: 'Dsus4',
    name: 'Dsus4',
    fullName: 'Ré Suspenso',
    category: 'suspended',
    difficulty: 'intermediate',
    frets: ['x', 'x', 0, 2, 3, 3],
    fingers: [0, 0, 0, 1, 3, 4],
    description: 'Acorde suspenso com tensão',
    tips: [
      'Cria suspense antes de resolver',
      'Usado em intros e bridges',
      'Resolve para D'
    ],
    relatedChords: ['D', 'G', 'A'],
    xpReward: 15
  },
  {
    id: 'Fm',
    name: 'Fm',
    fullName: 'Fá Menor',
    category: 'minor',
    difficulty: 'intermediate',
    frets: [1, 3, 3, 1, 1, 1],
    fingers: [1, 3, 4, 1, 1, 1],
    description: 'Primeiro acorde com pestana',
    tips: [
      'Use o dedo indicador para fazer pestana',
      'Pressione firmemente todas as cordas',
      'Pratique a força da mão'
    ],
    relatedChords: ['Bb', 'C', 'Eb'],
    xpReward: 20
  },
  
  // ADVANCED - Barre Chords
  {
    id: 'F',
    name: 'F',
    fullName: 'Fá Maior',
    category: 'major',
    difficulty: 'advanced',
    frets: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    description: 'Acorde com pestana desafiador',
    tips: [
      'O desafio de todo iniciante',
      'Requer força e técnica',
      'Pratique diariamente para dominar'
    ],
    relatedChords: ['C', 'Bb', 'Gm'],
    xpReward: 25
  },
  {
    id: 'Bm',
    name: 'Bm',
    fullName: 'Si Menor',
    category: 'minor',
    difficulty: 'advanced',
    frets: ['x', 2, 4, 4, 3, 2],
    fingers: [0, 1, 3, 4, 2, 1],
    description: 'Acorde com pestana no 2º traste',
    tips: [
      'Pestana no 2º traste',
      'Forma de Am com pestana',
      'Comum em músicas em D e G'
    ],
    relatedChords: ['D', 'G', 'A'],
    xpReward: 25
  },
  {
    id: 'Bb',
    name: 'Bb',
    fullName: 'Si Bemol Maior',
    category: 'major',
    difficulty: 'advanced',
    frets: ['x', 1, 3, 3, 3, 1],
    fingers: [0, 1, 2, 3, 4, 1],
    description: 'Acorde com pestana comum',
    tips: [
      'Pestana no 1º traste',
      'Forma de A com pestana',
      'Usado em jazz e pop'
    ],
    relatedChords: ['F', 'Eb', 'Cm'],
    xpReward: 25
  }
];

// Importar gerador de acordes
import { generateAllChordsInAllKeys, CHORD_TEMPLATES } from '@/utils/chordGenerator';

/**
 * Gera todos os acordes em todas as tonalidades baseado nos templates
 */
function generateAllChords(): Chord[] {
  const allChords: Chord[] = [];
  
  // Para cada template, gerar em todas as 12 tonalidades
  Object.entries(CHORD_TEMPLATES).forEach(([chordType, template]) => {
    const generated = generateAllChordsInAllKeys(chordType, template);
    allChords.push(...generated);
  });
  
  return allChords;
}

/**
 * Cache de todos os acordes (manuais + gerados)
 */
let _allChordsCache: Chord[] | null = null;

/**
 * Obtém todos os acordes disponíveis (manuais + gerados)
 */
export function getAllChords(): Chord[] {
  if (_allChordsCache) {
    return _allChordsCache;
  }
  
  // Combinar acordes manuais com acordes gerados
  const manualChords = [...chords];
  const generatedChords = generateAllChords();
  
  // Criar um mapa para evitar duplicatas (priorizar acordes manuais)
  const chordMap = new Map<string, Chord>();
  
  // Adicionar acordes manuais primeiro (têm prioridade)
  manualChords.forEach(chord => {
    chordMap.set(chord.id.toLowerCase(), chord);
  });
  
  // Adicionar acordes gerados apenas se não existirem
  generatedChords.forEach(chord => {
    const key = chord.id.toLowerCase();
    if (!chordMap.has(key)) {
      chordMap.set(key, chord);
    }
  });
  
  _allChordsCache = Array.from(chordMap.values());
  return _allChordsCache;
}

/**
 * Limpa o cache de acordes
 */
export function clearChordsCache(): void {
  _allChordsCache = null;
}

export const getChordsByDifficulty = (difficulty: Chord['difficulty']) => {
  return getAllChords().filter(chord => chord.difficulty === difficulty);
};

export const getChordsByCategory = (category: Chord['category']) => {
  return getAllChords().filter(chord => chord.category === category);
};

export const getChordById = (id: string) => {
  return getAllChords().find(chord => chord.id.toLowerCase() === id.toLowerCase());
};
