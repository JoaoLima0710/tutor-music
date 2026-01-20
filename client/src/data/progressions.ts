/**
 * Banco de Progressões Harmônicas
 * Progressões comuns organizadas por gênero e dificuldade
 */

export interface HarmonicProgression {
  id: string;
  name: string;
  romanNumerals: string[];
  chords: string[];
  key: string;
  description: string;
  genre: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  examples: { title: string; artist: string }[];
  function: string; // Função harmônica explicada
  xpReward: number;
}

export const HARMONIC_PROGRESSIONS: HarmonicProgression[] = [
  // BEGINNER - Progressões Simples
  {
    id: 'blues-12-bar',
    name: 'Blues de 12 Compassos',
    romanNumerals: ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'I'],
    chords: ['C', 'C', 'C', 'C', 'F', 'F', 'C', 'C', 'G', 'F', 'C', 'C'],
    key: 'C',
    description: 'Progressão mais comum no blues. Base de milhares de músicas.',
    genre: ['Blues', 'Rock', 'Jazz'],
    difficulty: 'beginner',
    examples: [
      { title: 'Sweet Home Chicago', artist: 'Robert Johnson' },
      { title: 'Johnny B. Goode', artist: 'Chuck Berry' },
      { title: 'Crossroads', artist: 'Cream' },
    ],
    function: 'Tônica (I) → Subdominante (IV) → Dominante (V) → Tônica (I). Movimento por quintas cria resolução forte.',
    xpReward: 50,
  },
  {
    id: 'pop-vi-IV-I-V',
    name: 'Progressão Pop (I-V-vi-IV)',
    romanNumerals: ['I', 'V', 'vi', 'IV'],
    chords: ['C', 'G', 'Am', 'F'],
    key: 'C',
    description: 'Progressão mais comum no pop. Usada em milhares de músicas.',
    genre: ['Pop', 'Rock', 'Folk'],
    difficulty: 'beginner',
    examples: [
      { title: 'Let It Be', artist: 'The Beatles' },
      { title: "Don't Stop Believin'", artist: 'Journey' },
      { title: 'With or Without You', artist: 'U2' },
    ],
    function: 'Tônica (I) → Dominante (V) → Relativa Menor (vi) → Subdominante (IV). Cria movimento emocional.',
    xpReward: 50,
  },
  {
    id: 'doo-wop',
    name: 'Doo-Wop (I-vi-IV-V)',
    romanNumerals: ['I', 'vi', 'IV', 'V'],
    chords: ['C', 'Am', 'F', 'G'],
    key: 'C',
    description: 'Progressão clássica dos anos 50-60. Som nostálgico e romântico.',
    genre: ['Pop', 'Rock', 'Soul'],
    difficulty: 'beginner',
    examples: [
      { title: 'Stand By Me', artist: 'Ben E. King' },
      { title: 'Every Breath You Take', artist: 'The Police' },
      { title: 'All I Have to Do Is Dream', artist: 'The Everly Brothers' },
    ],
    function: 'Tônica (I) → Relativa Menor (vi) → Subdominante (IV) → Dominante (V). Movimento suave e melódico.',
    xpReward: 50,
  },
  {
    id: 'folk',
    name: 'Folk (I-IV-I-V)',
    romanNumerals: ['I', 'IV', 'I', 'V'],
    chords: ['C', 'F', 'C', 'G'],
    key: 'C',
    description: 'Progressão simples e direta, comum em folk e country.',
    genre: ['Folk', 'Country', 'Acoustic'],
    difficulty: 'beginner',
    examples: [
      { title: 'Blowin\' in the Wind', artist: 'Bob Dylan' },
      { title: 'Country Roads', artist: 'John Denver' },
    ],
    function: 'Tônica (I) → Subdominante (IV) → Tônica (I) → Dominante (V). Estrutura simples e acessível.',
    xpReward: 40,
  },

  // INTERMEDIATE - Progressões de Jazz
  {
    id: 'jazz-ii-V-I',
    name: 'Jazz II-V-I',
    romanNumerals: ['ii', 'V', 'I'],
    chords: ['Dm7', 'G7', 'Cmaj7'],
    key: 'C',
    description: 'Progressão mais importante do jazz. Base de 90% das músicas de jazz.',
    genre: ['Jazz', 'Bossa Nova', 'MPB'],
    difficulty: 'intermediate',
    examples: [
      { title: 'Autumn Leaves', artist: 'Joseph Kosma' },
      { title: 'All The Things You Are', artist: 'Jerome Kern' },
      { title: 'Girl from Ipanema', artist: 'Tom Jobim' },
    ],
    function: 'Superdominante (ii) → Dominante (V) → Tônica (I). Resolução perfeita por quintas descendentes.',
    xpReward: 75,
  },
  {
    id: 'jazz-iii-vi-ii-V',
    name: 'Jazz iii-vi-ii-V',
    romanNumerals: ['iii', 'vi', 'ii', 'V'],
    chords: ['Em7', 'Am7', 'Dm7', 'G7'],
    key: 'C',
    description: 'Progressão de jazz comum. Movimento circular no círculo das quintas.',
    genre: ['Jazz', 'Bossa Nova'],
    difficulty: 'intermediate',
    examples: [
      { title: 'Blue Bossa', artist: 'Kenny Dorham' },
    ],
    function: 'Movimento circular: iii → vi → ii → V. Cada acorde resolve para o próximo por quinta descendente.',
    xpReward: 75,
  },
  {
    id: 'jazz-turnaround',
    name: 'Turnaround (I-vi-ii-V)',
    romanNumerals: ['I', 'vi', 'ii', 'V'],
    chords: ['Cmaj7', 'Am7', 'Dm7', 'G7'],
    key: 'C',
    description: 'Turnaround clássico. Usado para retornar ao início da progressão.',
    genre: ['Jazz', 'Swing'],
    difficulty: 'intermediate',
    examples: [
      { title: 'I Got Rhythm', artist: 'George Gershwin' },
    ],
    function: 'Tônica (I) → Relativa Menor (vi) → Superdominante (ii) → Dominante (V). Cria expectativa de retorno.',
    xpReward: 70,
  },
  {
    id: 'bossa-nova',
    name: 'Bossa Nova (I-vi-ii-V)',
    romanNumerals: ['I', 'vi', 'ii', 'V'],
    chords: ['Cmaj7', 'Am7', 'Dm7', 'G7'],
    key: 'C',
    description: 'Progressão típica de bossa nova. Som suave e sofisticado.',
    genre: ['Bossa Nova', 'MPB', 'Jazz'],
    difficulty: 'intermediate',
    examples: [
      { title: 'Garota de Ipanema', artist: 'Tom Jobim' },
      { title: 'Chega de Saudade', artist: 'Tom Jobim' },
    ],
    function: 'Mesma progressão do turnaround, mas com voicings específicos de bossa (6/9, 9, 13).',
    xpReward: 70,
  },

  // ADVANCED - Progressões Complexas
  {
    id: 'jazz-rhythm-changes',
    name: 'Rhythm Changes',
    romanNumerals: ['I', 'vi', 'ii', 'V', 'I', 'vi', 'ii', 'V', 'iii', 'vi', 'ii', 'V', 'I', 'I', 'vi', 'ii', 'V'],
    chords: ['Bb', 'Gm', 'Cm', 'F7', 'Bb', 'Gm', 'Cm', 'F7', 'Dm', 'Gm', 'Cm', 'F7', 'Bb', 'Bb', 'Gm', 'Cm', 'F7'],
    key: 'Bb',
    description: 'Progressão base de "I Got Rhythm". Uma das mais importantes do jazz.',
    genre: ['Jazz', 'Bebop'],
    difficulty: 'advanced',
    examples: [
      { title: 'I Got Rhythm', artist: 'George Gershwin' },
      { title: 'Oleo', artist: 'Sonny Rollins' },
      { title: 'Anthropology', artist: 'Charlie Parker' },
    ],
    function: 'Estrutura AABA com turnarounds. Base para centenas de contrafactos de bebop.',
    xpReward: 100,
  },
  {
    id: 'jazz-coltrane',
    name: 'Coltrane Changes',
    romanNumerals: ['I', 'bIII', 'bVI', 'I', 'bIII', 'bVI', 'I'],
    chords: ['Cmaj7', 'Ebmaj7', 'Abmaj7', 'Cmaj7', 'Ebmaj7', 'Abmaj7', 'Cmaj7'],
    key: 'C',
    description: 'Progressão de modulação por terças maiores. Usada por John Coltrane.',
    genre: ['Jazz', 'Avant-garde'],
    difficulty: 'advanced',
    examples: [
      { title: 'Giant Steps', artist: 'John Coltrane' },
    ],
    function: 'Modulação por terças maiores (C → Eb → Ab → C). Cria movimento harmônico intenso.',
    xpReward: 120,
  },
];

/**
 * Obter progressão por ID
 */
export function getProgressionById(id: string): HarmonicProgression | undefined {
  return HARMONIC_PROGRESSIONS.find(p => p.id === id);
}

/**
 * Filtrar progressões por dificuldade
 */
export function getProgressionsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): HarmonicProgression[] {
  return HARMONIC_PROGRESSIONS.filter(p => p.difficulty === difficulty);
}

/**
 * Filtrar progressões por gênero
 */
export function getProgressionsByGenre(genre: string): HarmonicProgression[] {
  return HARMONIC_PROGRESSIONS.filter(p => p.genre.includes(genre));
}

/**
 * Transpor progressão para outra tonalidade
 */
export function transposeProgression(
  progression: HarmonicProgression,
  newKey: string
): HarmonicProgression {
  const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  const oldKeyIndex = CHROMATIC_NOTES.indexOf(progression.key);
  const newKeyIndex = CHROMATIC_NOTES.indexOf(newKey);
  const semitones = (newKeyIndex - oldKeyIndex + 12) % 12;

  // Transpor acordes
  const transposedChords = progression.chords.map(chord => {
    // Extrair nota raiz do acorde
    const rootMatch = chord.match(/^([A-G][#b]?)/);
    if (!rootMatch) return chord;
    
    const root = rootMatch[1];
    const rootIndex = CHROMATIC_NOTES.indexOf(root);
    const newRootIndex = (rootIndex + semitones) % 12;
    const newRoot = CHROMATIC_NOTES[newRootIndex];
    
    // Preservar sufixo do acorde (m, 7, maj7, etc.)
    const suffix = chord.substring(rootMatch[0].length);
    return newRoot + suffix;
  });

  return {
    ...progression,
    id: `${progression.id}-${newKey.toLowerCase()}`,
    key: newKey,
    chords: transposedChords,
  };
}

/**
 * Analisar progressão (identificar função harmônica)
 */
export function analyzeProgression(chords: string[], key: string): {
  romanNumerals: string[];
  function: string;
  analysis: string;
} {
  // Mapear acordes para números romanos
  // Simplificado - em produção, usar análise harmônica completa
  const keyChords = getKeyChords(key);
  const romanNumerals = chords.map(chord => {
    const chordIndex = keyChords.findIndex(c => c.toLowerCase() === chord.toLowerCase());
    if (chordIndex === -1) return '?';
    
    const numerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
    return numerals[chordIndex];
  });

  // Identificar função
  const functions = romanNumerals.map(num => {
    if (num === 'I' || num === 'vi') return 'Tônica';
    if (num === 'IV' || num === 'ii') return 'Subdominante';
    if (num === 'V' || num === 'vii°') return 'Dominante';
    return 'Outro';
  });

  const analysis = `Progressão: ${romanNumerals.join(' - ')}. Função: ${functions.join(' → ')}.`;

  return {
    romanNumerals,
    function: functions.join(' → '),
    analysis,
  };
}

/**
 * Obter acordes do campo harmônico de uma tonalidade
 */
function getKeyChords(key: string): string[] {
  return CIRCLE_OF_FIFTHS_CHORDS[key] || CIRCLE_OF_FIFTHS_CHORDS['C'];
}

/**
 * Campo harmônico de cada tonalidade
 */
export const CIRCLE_OF_FIFTHS_CHORDS: Record<string, string[]> = {
  'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
  'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
  'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
  'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
  'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
  'B': ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'],
  'F': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
  'Bb': ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'],
  'Eb': ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'],
  'Ab': ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim'],
  'Db': ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim'],
  'Gb': ['Gb', 'Abm', 'Bbm', 'Cb', 'Db', 'Ebm', 'Fdim'],
  'F#': ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'],
};
