/**
 * 🎼 Musical Scales Data
 * 
 * Banco de dados completo de escalas musicais para violão
 * Inspirado no ScaleClock, adaptado para educação de violão
 */

// Importar gerador CAGED
import { generateCAGEDPositions, generateAllKeys } from '@/utils/cagedGenerator';

// ===== INTERFACES =====

export interface MusicalScale {
  id: string;
  name: string;
  shortName: string;
  root: string;
  intervals: number[];
  notes: string[];
  category: ScaleCategory;
  difficulty: number;
  xpReward: number;
  positions: FretboardPosition[];
  relatedChords: string[];
  commonIn: string[];
  description: string;
  sound: 'bright' | 'dark' | 'neutral' | 'exotic';
}

export interface FretboardPosition {
  id: string;
  name: string;
  startFret: number;
  endFret: number;
  fingering: FretNote[];
  shape: string;
  difficulty: number;
  recommended: boolean;
}

export interface FretNote {
  string: number;
  fret: number;
  note: string;
  finger: number;
  isRoot: boolean;
  interval: number;
}

export interface ScalePattern {
  id: string;
  name: string;
  description: string;
  sequence: number[];
  bpm: { min: number; max: number; recommended: number };
  difficulty: number;
  xpReward: number;
  technique: string;
}

export type ScaleCategory = 
  | 'major'
  | 'minor'
  | 'pentatonic'
  | 'mode'
  | 'blues'
  | 'exotic'
  | 'chromatic';

// ===== CONSTANTES =====

export const INTERVAL_COLORS = {
  0: '#22d3ee',  // Fundamental (Cyan)
  1: '#a78bfa',  // 2ª menor (Violet)
  2: '#f472b6',  // 2ª maior (Pink)
  3: '#fb923c',  // 3ª menor (Orange)
  4: '#fbbf24',  // 3ª maior (Amber)
  5: '#4ade80',  // 4ª justa (Green)
  6: '#ef4444',  // 4ª aumentada/5ª diminuta (Red)
  7: '#22d3ee',  // 5ª justa (Cyan)
  8: '#a78bfa',  // 6ª menor (Violet)
  9: '#f472b6',  // 6ª maior (Pink)
  10: '#fb923c', // 7ª menor (Orange)
  11: '#fbbf24', // 7ª maior (Amber)
};

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// ===== TEMPLATES DE ESCALAS (para geração automática) =====

/**
 * Templates de escalas - usados para gerar escalas em todas as 12 tonalidades
 */
const SCALE_TEMPLATES = {
  major: {
    intervals: [0, 2, 4, 5, 7, 9, 11],
    category: 'major' as ScaleCategory,
    difficulty: 1,
    xpReward: 30,
    relatedChords: [],
    commonIn: ['Pop', 'Folk', 'Country'],
    description: 'A escala maior. Soa alegre e brilhante. Fundamental para entender teoria musical.',
    sound: 'bright' as const,
  },
  minor: {
    intervals: [0, 2, 3, 5, 7, 8, 10],
    category: 'minor' as ScaleCategory,
    difficulty: 1,
    xpReward: 30,
    relatedChords: [],
    commonIn: ['Rock', 'Pop', 'Metal'],
    description: 'A escala menor natural. Soa triste e melancólica. Essencial para rock e metal.',
    sound: 'dark' as const,
  },
  pentatonicMinor: {
    intervals: [0, 3, 5, 7, 10],
    category: 'pentatonic' as ScaleCategory,
    difficulty: 2,
    xpReward: 40,
    relatedChords: [],
    commonIn: ['Blues', 'Rock', 'Metal'],
    description: 'Escala pentatônica menor. Apenas 5 notas, fácil de usar e versátil. Muito usada em solos.',
    sound: 'dark' as const,
  },
  pentatonicMajor: {
    intervals: [0, 2, 4, 7, 9],
    category: 'pentatonic' as ScaleCategory,
    difficulty: 2,
    xpReward: 40,
    relatedChords: [],
    commonIn: ['Country', 'Folk', 'Pop'],
    description: 'Escala pentatônica maior. Soa alegre e é muito usada em country e folk.',
    sound: 'bright' as const,
  },
  harmonicMinor: {
    intervals: [0, 2, 3, 5, 7, 8, 11],
    category: 'minor' as ScaleCategory,
    difficulty: 3,
    xpReward: 50,
    relatedChords: [],
    commonIn: ['Clássico', 'Metal', 'Jazz'],
    description: 'Escala menor harmônica. Menor natural com 7ª maior. Soa exótica e dramática.',
    sound: 'dark' as const,
  },
  melodicMinor: {
    intervals: [0, 2, 3, 5, 7, 9, 11],
    category: 'minor' as ScaleCategory,
    difficulty: 3,
    xpReward: 50,
    relatedChords: [],
    commonIn: ['Jazz', 'Clássico', 'Fusion'],
    description: 'Escala menor melódica. Menor com 6ª e 7ª maiores. Soa jazzística e sofisticada.',
    sound: 'neutral' as const,
  },
  dorian: {
    intervals: [0, 2, 3, 5, 7, 9, 10],
    category: 'mode' as ScaleCategory,
    difficulty: 3,
    xpReward: 50,
    relatedChords: [],
    commonIn: ['Jazz', 'Bossa Nova', 'Funk'],
    description: 'Modo dórico. Menor natural com 6ª maior. Essencial para Bossa Nova e MPB.',
    sound: 'neutral' as const,
  },
  mixolydian: {
    intervals: [0, 2, 4, 5, 7, 9, 10],
    category: 'mode' as ScaleCategory,
    difficulty: 3,
    xpReward: 50,
    relatedChords: [],
    commonIn: ['Blues', 'Rock', 'Country'],
    description: 'Modo mixolídio. Maior com 7ª menor. Muito usado em blues e rock.',
    sound: 'bright' as const,
  },
  phrygian: {
    intervals: [0, 1, 3, 5, 7, 8, 10],
    category: 'mode' as ScaleCategory,
    difficulty: 4,
    xpReward: 60,
    relatedChords: [],
    commonIn: ['Metal', 'Flamenco', 'Jazz'],
    description: 'Modo frígio. Menor com 2ª menor. Soa exótico e tenso.',
    sound: 'dark' as const,
  },
  lydian: {
    intervals: [0, 2, 4, 6, 7, 9, 11],
    category: 'mode' as ScaleCategory,
    difficulty: 4,
    xpReward: 60,
    relatedChords: [],
    commonIn: ['Jazz', 'Fusion', 'Progressive'],
    description: 'Modo lídio. Maior com 4ª aumentada. Soa brilhante e flutuante.',
    sound: 'bright' as const,
  },
  locrian: {
    intervals: [0, 1, 3, 5, 6, 8, 10],
    category: 'mode' as ScaleCategory,
    difficulty: 5,
    xpReward: 70,
    relatedChords: [],
    commonIn: ['Jazz', 'Metal', 'Avant-garde'],
    description: 'Modo lócrio. Menor com 2ª e 5ª diminutas. Soa instável e tenso.',
    sound: 'dark' as const,
  },
  blues: {
    intervals: [0, 3, 5, 6, 7, 10],
    category: 'blues' as ScaleCategory,
    difficulty: 2,
    xpReward: 45,
    relatedChords: [],
    commonIn: ['Blues', 'Rock', 'Jazz'],
    description: 'Escala de blues. Pentatônica menor com blue note (6ª diminuta). Essencial para blues.',
    sound: 'dark' as const,
  },
  wholeTone: {
    intervals: [0, 2, 4, 6, 8, 10],
    category: 'exotic' as ScaleCategory,
    difficulty: 4,
    xpReward: 60,
    relatedChords: [],
    commonIn: ['Jazz', 'Impressionismo'],
    description: 'Escala de tons inteiros. Soa flutuante e onírica.',
    sound: 'exotic' as const,
  },
  diminished: {
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],
    category: 'exotic' as ScaleCategory,
    difficulty: 5,
    xpReward: 70,
    relatedChords: [],
    commonIn: ['Jazz', 'Clássico'],
    description: 'Escala diminuta. Padrão de tom-semitom repetido. Soa tensa e instável.',
    sound: 'exotic' as const,
  },
};

// ===== ESCALAS PARA INICIANTES =====

/**
 * Gera posições CAGED automaticamente para escalas que não têm posições
 */
function ensureCAGEDPositions(scale: MusicalScale): MusicalScale {
  if (scale.positions.length === 0) {
    try {
      scale.positions = generateCAGEDPositions(scale.root, scale.intervals);
    } catch (error) {
      console.warn(`Erro ao gerar posições CAGED para ${scale.id}:`, error);
    }
  }
  return scale;
}

/**
 * Processa todas as escalas e gera posições CAGED quando necessário
 */
function processAllScalesWithCAGED(): {
  BEGINNER_SCALES: MusicalScale[];
  INTERMEDIATE_SCALES: MusicalScale[];
  ADVANCED_SCALES: MusicalScale[];
  EXOTIC_SCALES: MusicalScale[];
} {
  return {
    BEGINNER_SCALES: BEGINNER_SCALES.map(ensureCAGEDPositions),
    INTERMEDIATE_SCALES: INTERMEDIATE_SCALES.map(ensureCAGEDPositions),
    ADVANCED_SCALES: ADVANCED_SCALES.map(ensureCAGEDPositions),
    EXOTIC_SCALES: EXOTIC_SCALES.map(ensureCAGEDPositions),
  };
}

export const BEGINNER_SCALES: MusicalScale[] = [
  {
    id: 'c-major',
    name: 'Dó Maior',
    shortName: 'C Major',
    root: 'C',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    category: 'major',
    difficulty: 1,
    xpReward: 30,
    positions: [], // Será gerado automaticamente
    relatedChords: ['c', 'dm', 'em', 'f', 'g', 'am'],
    commonIn: ['Pop', 'Folk', 'Country'],
    description: 'A escala maior mais básica. Soa alegre e brilhante. Fundamental para entender teoria musical.',
    sound: 'bright',
  },
  {
    id: 'a-minor',
    name: 'Lá Menor Natural',
    shortName: 'A Minor',
    root: 'A',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    category: 'minor',
    difficulty: 1,
    xpReward: 30,
    positions: [],
    relatedChords: ['am', 'dm', 'em', 'f', 'g', 'c'],
    commonIn: ['Rock', 'Pop', 'Metal'],
    description: 'A escala menor mais comum. Soa triste e melancólica. Essencial para rock e metal.',
    sound: 'dark',
  },
  {
    id: 'a-minor-pentatonic',
    name: 'Lá Menor Pentatônica',
    shortName: 'Am Pent',
    root: 'A',
    intervals: [0, 3, 5, 7, 10],
    notes: ['A', 'C', 'D', 'E', 'G'],
    category: 'pentatonic',
    difficulty: 2,
    xpReward: 40,
    positions: [
      {
        id: 'am-pent-pos1',
        name: 'Posição 1 (Casa 5)',
        startFret: 5,
        endFret: 8,
        fingering: [
          { string: 6, fret: 5, note: 'A', finger: 1, isRoot: true, interval: 0 },
          { string: 6, fret: 8, note: 'C', finger: 4, isRoot: false, interval: 3 },
          { string: 5, fret: 5, note: 'D', finger: 1, isRoot: false, interval: 5 },
          { string: 5, fret: 7, note: 'E', finger: 3, isRoot: false, interval: 7 },
          { string: 4, fret: 5, note: 'G', finger: 1, isRoot: false, interval: 10 },
          { string: 4, fret: 7, note: 'A', finger: 3, isRoot: true, interval: 0 },
          { string: 3, fret: 5, note: 'C', finger: 1, isRoot: false, interval: 3 },
          { string: 3, fret: 7, note: 'D', finger: 3, isRoot: false, interval: 5 },
          { string: 2, fret: 5, note: 'E', finger: 1, isRoot: false, interval: 7 },
          { string: 2, fret: 8, note: 'G', finger: 4, isRoot: false, interval: 10 },
          { string: 1, fret: 5, note: 'A', finger: 1, isRoot: true, interval: 0 },
          { string: 1, fret: 8, note: 'C', finger: 4, isRoot: false, interval: 3 },
        ],
        shape: 'E-shape',
        difficulty: 2,
        recommended: true,
      },
    ],
    relatedChords: ['am', 'c', 'dm', 'em', 'g'],
    commonIn: ['Rock', 'Blues', 'Metal'],
    description: 'A escala mais popular para improvisação. Apenas 5 notas, fácil de aprender e soa bem em qualquer contexto.',
    sound: 'dark',
  },
  {
    id: 'e-minor-pentatonic',
    name: 'Mi Menor Pentatônica',
    shortName: 'Em Pent',
    root: 'E',
    intervals: [0, 3, 5, 7, 10],
    notes: ['E', 'G', 'A', 'B', 'D'],
    category: 'pentatonic',
    difficulty: 2,
    xpReward: 40,
    positions: [
      {
        id: 'em-pent-pos1',
        name: 'Posição 1 (Casa 0)',
        startFret: 0,
        endFret: 3,
        fingering: [
          { string: 6, fret: 0, note: 'E', finger: 0, isRoot: true, interval: 0 },
          { string: 6, fret: 3, note: 'G', finger: 3, isRoot: false, interval: 3 },
          { string: 5, fret: 0, note: 'A', finger: 0, isRoot: false, interval: 5 },
          { string: 5, fret: 2, note: 'B', finger: 2, isRoot: false, interval: 7 },
          { string: 4, fret: 0, note: 'D', finger: 0, isRoot: false, interval: 10 },
          { string: 4, fret: 2, note: 'E', finger: 2, isRoot: true, interval: 0 },
          { string: 3, fret: 0, note: 'G', finger: 0, isRoot: false, interval: 3 },
          { string: 3, fret: 2, note: 'A', finger: 2, isRoot: false, interval: 5 },
          { string: 2, fret: 0, note: 'B', finger: 0, isRoot: false, interval: 7 },
          { string: 2, fret: 3, note: 'D', finger: 3, isRoot: false, interval: 10 },
          { string: 1, fret: 0, note: 'E', finger: 0, isRoot: true, interval: 0 },
          { string: 1, fret: 3, note: 'G', finger: 3, isRoot: false, interval: 3 },
        ],
        shape: 'Open',
        difficulty: 1,
        recommended: true,
      },
    ],
    relatedChords: ['em', 'g', 'am', 'c', 'd'],
    commonIn: ['Rock', 'Blues', 'Folk'],
    description: 'Versão em Mi da pentatônica menor. Posição aberta facilita o aprendizado para iniciantes.',
    sound: 'dark',
  },
  {
    id: 'c-major-pentatonic',
    name: 'Dó Maior Pentatônica',
    shortName: 'C Maj Pent',
    root: 'C',
    intervals: [0, 2, 4, 7, 9],
    notes: ['C', 'D', 'E', 'G', 'A'],
    category: 'pentatonic',
    difficulty: 2,
    xpReward: 40,
    positions: [],
    relatedChords: ['c', 'dm', 'em', 'g', 'am'],
    commonIn: ['Country', 'Folk', 'Pop'],
    description: 'Versão maior da pentatônica. Soa alegre e é muito usada em country e folk.',
    sound: 'bright',
  },
];

// ===== ESCALAS INTERMEDIÁRIAS =====

export const INTERMEDIATE_SCALES: MusicalScale[] = [
  {
    id: 'a-minor-harmonic',
    name: 'Lá Menor Harmônica',
    shortName: 'A Harm Min',
    root: 'A',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G#'],
    category: 'minor',
    difficulty: 3,
    xpReward: 50,
    positions: [],
    relatedChords: ['am', 'dm', 'e', 'f', 'g#dim'],
    commonIn: ['Metal', 'Clássico', 'Flamenco'],
    description: 'Escala menor com 7ª maior. Soa exótica e dramática. Muito usada em metal e música clássica.',
    sound: 'exotic',
  },
  {
    id: 'a-minor-melodic',
    name: 'Lá Menor Melódica',
    shortName: 'A Mel Min',
    root: 'A',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    notes: ['A', 'B', 'C', 'D', 'E', 'F#', 'G#'],
    category: 'minor',
    difficulty: 3,
    xpReward: 50,
    positions: [],
    relatedChords: ['am', 'bm', 'c', 'dm', 'e'],
    commonIn: ['Jazz', 'Clássico', 'Fusion'],
    description: 'Escala menor com 6ª e 7ª maiores. Soa jazzística e sofisticada.',
    sound: 'neutral',
  },
  {
    id: 'c-dorian',
    name: 'Dó Dórico',
    shortName: 'C Dorian',
    root: 'C',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    notes: ['C', 'D', 'Eb', 'F', 'G', 'A', 'Bb'],
    category: 'mode',
    difficulty: 3,
    xpReward: 50,
    positions: [],
    relatedChords: ['cm', 'dm', 'eb', 'f', 'gm'],
    commonIn: ['Jazz', 'Bossa Nova', 'Funk'],
    description: 'Modo dórico. Soa jazzístico e é essencial para Bossa Nova e MPB. Menor com 6ª maior.',
    sound: 'neutral',
  },
  {
    id: 'g-mixolydian',
    name: 'Sol Mixolídio',
    shortName: 'G Mixolydian',
    root: 'G',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F'],
    category: 'mode',
    difficulty: 3,
    xpReward: 50,
    positions: [],
    relatedChords: ['g', 'am', 'c', 'd', 'em'],
    commonIn: ['Blues', 'Rock', 'Country'],
    description: 'Modo mixolídio. Soa bluesy. Maior com 7ª menor. Muito usado em blues e rock.',
    sound: 'bright',
  },
  {
    id: 'a-blues',
    name: 'Lá Blues',
    shortName: 'A Blues',
    root: 'A',
    intervals: [0, 3, 5, 6, 7, 10],
    notes: ['A', 'C', 'D', 'Eb', 'E', 'G'],
    category: 'blues',
    difficulty: 3,
    xpReward: 50,
    positions: [],
    relatedChords: ['a7', 'c7', 'd7', 'e7', 'g7'],
    commonIn: ['Blues', 'Rock', 'Jazz'],
    description: 'Escala de blues. Pentatônica menor + blue note (♭5). Som característico do blues.',
    sound: 'dark',
  },
];

// ===== ESCALAS AVANÇADAS =====

export const ADVANCED_SCALES: MusicalScale[] = [
  {
    id: 'd-phrygian',
    name: 'Ré Frígio',
    shortName: 'D Phrygian',
    root: 'D',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    notes: ['D', 'Eb', 'F', 'G', 'A', 'Bb', 'C'],
    category: 'mode',
    difficulty: 4,
    xpReward: 70,
    positions: [],
    relatedChords: ['dm', 'eb', 'f', 'gm', 'am'],
    commonIn: ['Flamenco', 'Metal', 'Música Espanhola'],
    description: 'Modo frígio. Soa espanhol/flamenco. Menor com 2ª menor.',
    sound: 'exotic',
  },
  {
    id: 'c-lydian',
    name: 'Dó Lídio',
    shortName: 'C Lydian',
    root: 'C',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    notes: ['C', 'D', 'E', 'F#', 'G', 'A', 'B'],
    category: 'mode',
    difficulty: 4,
    xpReward: 70,
    positions: [],
    relatedChords: ['c', 'd', 'em', 'f#dim', 'g'],
    commonIn: ['Jazz', 'Fusion', 'Progressivo'],
    description: 'Modo lídio. Soa etéreo e sonhador. Maior com 4ª aumentada.',
    sound: 'bright',
  },
  {
    id: 'e-locrian',
    name: 'Mi Lócrio',
    shortName: 'E Locrian',
    root: 'E',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    notes: ['E', 'F', 'G', 'A', 'Bb', 'C', 'D'],
    category: 'mode',
    difficulty: 4,
    xpReward: 70,
    positions: [],
    relatedChords: ['edim', 'f', 'gm', 'am', 'bb'],
    commonIn: ['Jazz', 'Experimental', 'Metal'],
    description: 'Modo lócrio. Soa instável e tenso. Menor com 2ª e 5ª diminutas.',
    sound: 'dark',
  },
  {
    id: 'c-whole-tone',
    name: 'Dó Tons Inteiros',
    shortName: 'C Whole Tone',
    root: 'C',
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['C', 'D', 'E', 'F#', 'G#', 'A#'],
    category: 'exotic',
    difficulty: 5,
    xpReward: 90,
    positions: [],
    relatedChords: ['caug', 'daug', 'eaug', 'f#aug'],
    commonIn: ['Jazz', 'Impressionismo', 'Experimental'],
    description: 'Escala de tons inteiros. Soa surreal e flutuante. Usada por Debussy.',
    sound: 'exotic',
  },
  {
    id: 'c-diminished',
    name: 'Dó Diminuta',
    shortName: 'C Diminished',
    root: 'C',
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],
    notes: ['C', 'D', 'Eb', 'F', 'F#', 'G#', 'A', 'B'],
    category: 'exotic',
    difficulty: 5,
    xpReward: 90,
    positions: [],
    relatedChords: ['cdim7', 'ebdim7', 'f#dim7', 'adim7'],
    commonIn: ['Jazz', 'Bebop', 'Fusion'],
    description: 'Escala diminuta (semitom-tom). Soa complexa e jazzística.',
    sound: 'exotic',
  },
];

// ===== ESCALAS EXÓTICAS =====

export const EXOTIC_SCALES: MusicalScale[] = [
  {
    id: 'd-phrygian-dominant',
    name: 'Ré Frígio Dominante',
    shortName: 'D Phrygian Dom',
    root: 'D',
    intervals: [0, 1, 4, 5, 7, 8, 10],
    notes: ['D', 'Eb', 'F#', 'G', 'A', 'Bb', 'C'],
    category: 'exotic',
    difficulty: 4,
    xpReward: 80,
    positions: [],
    relatedChords: ['d7', 'eb', 'f#dim', 'gm', 'bb'],
    commonIn: ['Flamenco', 'Metal', 'Música Árabe'],
    description: 'Frígio com 3ª maior. Soa árabe/espanhol. Muito usado em metal e flamenco.',
    sound: 'exotic',
  },
  {
    id: 'c-hirajoshi',
    name: 'Dó Hirajoshi',
    shortName: 'C Hirajoshi',
    root: 'C',
    intervals: [0, 2, 3, 7, 8],
    notes: ['C', 'D', 'Eb', 'G', 'Ab'],
    category: 'exotic',
    difficulty: 4,
    xpReward: 80,
    positions: [],
    relatedChords: ['cm', 'eb', 'ab'],
    commonIn: ['Música Japonesa', 'World Music', 'Ambient'],
    description: 'Escala japonesa tradicional. Soa oriental e contemplativa.',
    sound: 'exotic',
  },
  {
    id: 'c-hungarian-minor',
    name: 'Dó Menor Húngara',
    shortName: 'C Hungarian Min',
    root: 'C',
    intervals: [0, 2, 3, 6, 7, 8, 11],
    notes: ['C', 'D', 'Eb', 'F#', 'G', 'Ab', 'B'],
    category: 'exotic',
    difficulty: 5,
    xpReward: 90,
    positions: [],
    relatedChords: ['cm', 'dm', 'f#dim', 'ab'],
    commonIn: ['Música Cigana', 'Clássico', 'Metal'],
    description: 'Escala menor húngara. Soa dramática e cigana. Menor harmônica com 4ª aumentada.',
    sound: 'exotic',
  },
];

// ===== PADRÕES DE PRÁTICA =====

export const SCALE_PATTERNS: ScalePattern[] = [
  {
    id: 'ascending',
    name: 'Ascendente',
    description: 'Tocar a escala subindo',
    sequence: [0, 1, 2, 3, 4, 5, 6],
    bpm: { min: 40, max: 200, recommended: 60 },
    difficulty: 1,
    xpReward: 20,
    technique: 'alternate-picking',
  },
  {
    id: 'descending',
    name: 'Descendente',
    description: 'Tocar a escala descendo',
    sequence: [6, 5, 4, 3, 2, 1, 0],
    bpm: { min: 40, max: 200, recommended: 60 },
    difficulty: 1,
    xpReward: 20,
    technique: 'alternate-picking',
  },
  {
    id: 'asc-desc',
    name: 'Ascendente/Descendente',
    description: 'Subir e descer a escala',
    sequence: [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1, 0],
    bpm: { min: 40, max: 180, recommended: 60 },
    difficulty: 2,
    xpReward: 30,
    technique: 'alternate-picking',
  },
  {
    id: 'thirds',
    name: 'Terças',
    description: 'Tocar intervalos de terça',
    sequence: [0, 2, 1, 3, 2, 4, 3, 5, 4, 6],
    bpm: { min: 40, max: 140, recommended: 50 },
    difficulty: 3,
    xpReward: 40,
    technique: 'legato',
  },
  {
    id: 'fourths',
    name: 'Quartas',
    description: 'Tocar intervalos de quarta',
    sequence: [0, 3, 1, 4, 2, 5, 3, 6],
    bpm: { min: 40, max: 120, recommended: 50 },
    difficulty: 4,
    xpReward: 50,
    technique: 'hybrid-picking',
  },
  {
    id: 'sequence-1234',
    name: 'Sequência 1-2-3-4',
    description: 'Padrão melódico de 4 notas',
    sequence: [0, 1, 2, 3, 1, 2, 3, 4, 2, 3, 4, 5, 3, 4, 5, 6],
    bpm: { min: 40, max: 160, recommended: 60 },
    difficulty: 3,
    xpReward: 40,
    technique: 'alternate-picking',
  },
];

// ===== HELPERS =====

/**
 * Gera escala a partir de intervalos
 */
export function generateScale(root: string, intervals: number[]): string[] {
  const rootIndex = CHROMATIC_NOTES.indexOf(root);
  if (rootIndex === -1) return [];
  
  return intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return CHROMATIC_NOTES[noteIndex];
  });
}

/**
 * Encontra escala por ID (com posições CAGED geradas automaticamente)
 * Busca em todas as escalas disponíveis (manuais + geradas)
 */
export function findScaleById(id: string): MusicalScale | undefined {
  const allScales = getAllScales();
  const scale = allScales.find(s => s.id === id);
  if (scale) {
    return ensureCAGEDPositions(scale);
  }
  return undefined;
}

/**
 * Escalas por categoria (com posições CAGED geradas automaticamente)
 * Inclui escalas geradas automaticamente
 */
export function getScalesByCategory(category: ScaleCategory): MusicalScale[] {
  return getAllScales()
    .filter(s => s.category === category)
    .map(ensureCAGEDPositions);
}

/**
 * Escalas por nível (com posições CAGED geradas automaticamente)
 */
export function getScalesByLevel(level: 'beginner' | 'intermediate' | 'advanced'): MusicalScale[] {
  let scales: MusicalScale[] = [];
  switch (level) {
    case 'beginner':
      scales = BEGINNER_SCALES;
      break;
    case 'intermediate':
      scales = [...BEGINNER_SCALES, ...INTERMEDIATE_SCALES];
      break;
    case 'advanced':
      scales = [...BEGINNER_SCALES, ...INTERMEDIATE_SCALES, ...ADVANCED_SCALES, ...EXOTIC_SCALES];
      break;
  }
  return scales.map(ensureCAGEDPositions);
}

/**
 * Escalas relacionadas (mesma fundamental)
 * Inclui escalas geradas automaticamente
 */
export function getRelatedScales(scaleId: string): MusicalScale[] {
  const scale = findScaleById(scaleId);
  if (!scale) return [];
  
  return getAllScales()
    .filter(s => s.root === scale.root && s.id !== scaleId)
    .map(ensureCAGEDPositions);
}

/**
 * Transpor escala para outra tonalidade
 */
export function transposeScale(scaleId: string, newRoot: string): MusicalScale | null {
  const scale = findScaleById(scaleId);
  if (!scale) return null;
  
  const newNotes = generateScale(newRoot, scale.intervals);
  const newId = `${newRoot.toLowerCase()}-${scale.id.split('-').slice(1).join('-')}`;
  
  return {
    ...scale,
    id: newId,
    root: newRoot,
    notes: newNotes,
    name: scale.name.replace(scale.root, newRoot),
    shortName: scale.shortName.replace(scale.root, newRoot),
  };
}

/**
 * Padrão por ID
 */
export function findPatternById(id: string): ScalePattern | undefined {
  return SCALE_PATTERNS.find(p => p.id === id);
}

/**
 * Gera todas as escalas em todas as 12 tonalidades baseado nos templates
 * Retorna um array expandido com todas as escalas geradas
 */
export function generateAllScalesInAllKeys(): MusicalScale[] {
  const allScales: MusicalScale[] = [];
  
  // Para cada template, gerar em todas as 12 tonalidades
  Object.entries(SCALE_TEMPLATES).forEach(([templateKey, template]) => {
    // Adicionar identificador do template ao template para gerar IDs únicos
    const templateWithKey = {
      ...template,
      _templateKey: templateKey, // Usado apenas internamente para gerar IDs
    };
    const generated = generateAllKeys(templateWithKey);
    allScales.push(...generated);
  });
  
  return allScales;
}

/**
 * Obtém todas as escalas disponíveis (incluindo geradas automaticamente)
 * Cacheia o resultado para performance
 */
let _allScalesCache: MusicalScale[] | null = null;

export function getAllScales(): MusicalScale[] {
  if (_allScalesCache) {
    return _allScalesCache;
  }
  
  // Combinar escalas manuais com escalas geradas
  const manualScales = [...BEGINNER_SCALES, ...INTERMEDIATE_SCALES, ...ADVANCED_SCALES, ...EXOTIC_SCALES];
  const generatedScales = generateAllScalesInAllKeys();
  
  // Criar um mapa para evitar duplicatas (priorizar escalas manuais)
  const scaleMap = new Map<string, MusicalScale>();
  
  // Adicionar escalas manuais primeiro (têm prioridade)
  manualScales.forEach(scale => {
    scaleMap.set(scale.id, ensureCAGEDPositions(scale));
  });
  
  // Adicionar escalas geradas apenas se não existirem
  generatedScales.forEach(scale => {
    if (!scaleMap.has(scale.id)) {
      scaleMap.set(scale.id, ensureCAGEDPositions(scale));
    }
  });
  
  _allScalesCache = Array.from(scaleMap.values());
  return _allScalesCache;
}

/**
 * Limpa o cache de escalas (útil para testes ou atualizações)
 */
export function clearScalesCache(): void {
  _allScalesCache = null;
}

export default {
  BEGINNER_SCALES,
  INTERMEDIATE_SCALES,
  ADVANCED_SCALES,
  EXOTIC_SCALES,
  SCALE_PATTERNS,
  INTERVAL_COLORS,
  generateScale,
  findScaleById,
  getScalesByCategory,
  getScalesByLevel,
  getRelatedScales,
  transposeScale,
  findPatternById,
  generateAllScalesInAllKeys,
  getAllScales,
  clearScalesCache,
};
