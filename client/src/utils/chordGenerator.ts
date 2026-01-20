/**
 * Gerador Automático de Acordes
 * Gera acordes em todas as 12 tonalidades com múltiplas posições
 */

import { Chord } from '@/data/chords';

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const GUITAR_STRINGS = ['E', 'A', 'D', 'G', 'B', 'E']; // Da corda 6 (grave) para corda 1 (aguda)

/**
 * Templates de intervalos para cada tipo de acorde
 */
const CHORD_INTERVALS: Record<string, number[]> = {
  // Tríades
  major: [0, 4, 7],           // Fundamental, 3ª maior, 5ª justa
  minor: [0, 3, 7],           // Fundamental, 3ª menor, 5ª justa
  diminished: [0, 3, 6],      // Fundamental, 3ª menor, 5ª diminuta
  augmented: [0, 4, 8],       // Fundamental, 3ª maior, 5ª aumentada
  
  // Tétrades
  '7': [0, 4, 7, 10],         // Dominante (maior com 7ª menor)
  'maj7': [0, 4, 7, 11],      // Maior com 7ª maior
  'm7': [0, 3, 7, 10],        // Menor com 7ª menor
  'mM7': [0, 3, 7, 11],       // Menor com 7ª maior
  'dim7': [0, 3, 6, 9],       // Diminuto com 7ª diminuta
  'm7b5': [0, 3, 6, 10],      // Meio-diminuto
  
  // Suspensos
  'sus2': [0, 2, 7],          // Suspenso com 2ª
  'sus4': [0, 5, 7],          // Suspenso com 4ª
  
  // Extensões
  'add9': [0, 4, 7, 14],      // Maior com 9ª adicionada
  'madd9': [0, 3, 7, 14],     // Menor com 9ª adicionada
  '6': [0, 4, 7, 9],          // Maior com 6ª
  'm6': [0, 3, 7, 9],         // Menor com 6ª
  '9': [0, 4, 7, 10, 14],     // Dominante com 9ª
  'maj9': [0, 4, 7, 11, 14],  // Maior com 9ª
  'm9': [0, 3, 7, 10, 14],    // Menor com 9ª
  
  // Power chords
  '5': [0, 7],                // Power chord (fundamental + 5ª)
};

/**
 * Obtém a nota em uma posição específica do braço
 */
function getNoteAtPosition(stringIndex: number, fret: number): string {
  const stringNote = GUITAR_STRINGS[stringIndex];
  const stringNoteIndex = CHROMATIC_NOTES.indexOf(stringNote);
  const noteIndex = (stringNoteIndex + fret) % 12;
  return CHROMATIC_NOTES[noteIndex];
}

/**
 * Encontra posições de um acorde no braço
 * Retorna múltiplas posições (open, barre, etc.)
 */
function findChordPositions(
  root: string,
  intervals: number[]
): Array<{ frets: (number | 'x')[]; fingers: (number | 0)[]; startFret: number; name: string }> {
  const positions: Array<{ frets: (number | 'x')[]; fingers: (number | 0)[]; startFret: number; name: string }> = [];
  
  // Gerar notas do acorde
  const rootIndex = CHROMATIC_NOTES.indexOf(root);
  const chordNotes: string[] = [];
  intervals.forEach(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    chordNotes.push(CHROMATIC_NOTES[noteIndex]);
  });
  
  // Estratégia 1: Posição aberta (se possível)
  const openPosition = findOpenPosition(root, chordNotes);
  if (openPosition) {
    positions.push({
      ...openPosition,
      name: 'Posição Aberta',
    });
  }
  
  // Estratégia 2: Posições de pestana (barre) em diferentes trastes
  for (let startFret = 1; startFret <= 5; startFret++) {
    const barrePosition = findBarrePosition(root, chordNotes, startFret);
    if (barrePosition) {
      positions.push({
        ...barrePosition,
        name: `Pestana (Casa ${startFret})`,
      });
    }
  }
  
  // Estratégia 3: Posições intermediárias (sem pestana completa)
  for (let startFret = 3; startFret <= 7; startFret++) {
    const intermediatePosition = findIntermediatePosition(root, chordNotes, startFret);
    if (intermediatePosition && positions.length < 5) {
      positions.push({
        ...intermediatePosition,
        name: `Posição ${startFret}`,
      });
    }
  }
  
  return positions.slice(0, 5); // Limitar a 5 posições
}

/**
 * Encontra posição aberta (sem pestana)
 */
function findOpenPosition(root: string, chordNotes: string[]): { frets: (number | 'x')[]; fingers: (number | 0)[]; startFret: number } | null {
  const frets: (number | 'x')[] = [];
  const fingers: (number | 0)[] = [];
  let fingerCount = 0;
  
  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    const openNote = GUITAR_STRINGS[stringIndex];
    
    // Verificar se a nota aberta está no acorde
    if (chordNotes.includes(openNote)) {
      frets.push(0);
      fingers.push(0);
    } else {
      // Tentar encontrar nota do acorde em trastes baixos (0-3)
      let found = false;
      for (let fret = 1; fret <= 3; fret++) {
        const note = getNoteAtPosition(stringIndex, fret);
        if (chordNotes.includes(note)) {
          frets.push(fret);
          fingerCount++;
          fingers.push(fingerCount);
          found = true;
          break;
        }
      }
      if (!found) {
        frets.push('x');
        fingers.push(0);
      }
    }
  }
  
  // Validar: deve ter pelo menos 3 notas do acorde
  const validNotes = frets.filter(f => f !== 'x' && f !== undefined).length;
  if (validNotes >= 3) {
    return { frets, fingers, startFret: 0 };
  }
  
  return null;
}

/**
 * Encontra posição de pestana
 */
function findBarrePosition(
  root: string,
  chordNotes: string[],
  startFret: number
): { frets: (number | 'x')[]; fingers: (number | 0)[]; startFret: number } | null {
  const frets: (number | 'x')[] = [];
  const fingers: (number | 0)[] = [];
  
  // Verificar se a pestana no startFret contém a fundamental
  const rootAtBarre = getNoteAtPosition(5, startFret); // Corda 6 (grave)
  if (rootAtBarre !== root) {
    return null;
  }
  
  // Pestana na corda 6 (ou outras se necessário)
  let hasBarre = false;
  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    const noteAtFret = getNoteAtPosition(stringIndex, startFret);
    
    if (chordNotes.includes(noteAtFret)) {
      // Verificar se precisa de pestana (múltiplas cordas no mesmo traste)
      if (stringIndex <= 2 && !hasBarre) {
        frets.push(startFret);
        fingers.push(1); // Dedilhado 1 = pestana
        hasBarre = true;
      } else {
        frets.push(startFret);
        fingers.push(1);
      }
    } else {
      // Tentar encontrar nota do acorde em trastes próximos
      let found = false;
      for (let offset = 1; offset <= 3; offset++) {
        const testFret = startFret + offset;
        if (testFret > 12) break;
        
        const note = getNoteAtPosition(stringIndex, testFret);
        if (chordNotes.includes(note)) {
          frets.push(testFret);
          fingers.push(offset + 1); // Dedilhado baseado no offset
          found = true;
          break;
        }
      }
      if (!found) {
        frets.push('x');
        fingers.push(0);
      }
    }
  }
  
  // Validar: deve ter pelo menos 4 notas do acorde
  const validNotes = frets.filter(f => f !== 'x' && f !== undefined).length;
  if (validNotes >= 4 && hasBarre) {
    return { frets, fingers, startFret };
  }
  
  return null;
}

/**
 * Encontra posição intermediária (sem pestana completa)
 */
function findIntermediatePosition(
  root: string,
  chordNotes: string[],
  startFret: number
): { frets: (number | 'x')[]; fingers: (number | 0)[]; startFret: number } | null {
  const frets: (number | 'x')[] = [];
  const fingers: (number | 0)[] = [];
  let fingerCount = 0;
  
  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    let found = false;
    
    // Procurar nota do acorde em range de 4 trastes
    for (let offset = 0; offset <= 4; offset++) {
      const testFret = startFret + offset;
      if (testFret > 12) break;
      
      const note = getNoteAtPosition(stringIndex, testFret);
      if (chordNotes.includes(note)) {
        frets.push(testFret);
        fingerCount++;
        fingers.push(fingerCount);
        found = true;
        break;
      }
    }
    
    if (!found) {
      frets.push('x');
      fingers.push(0);
    }
  }
  
  // Validar: deve ter pelo menos 3 notas do acorde
  const validNotes = frets.filter(f => f !== 'x' && f !== undefined).length;
  if (validNotes >= 3) {
    return { frets, fingers, startFret };
  }
  
  return null;
}

/**
 * Determina dificuldade baseado no tipo de acorde e posição
 */
function determineDifficulty(
  chordType: string,
  position: { startFret: number; name: string }
): 'beginner' | 'intermediate' | 'advanced' {
  // Acordes básicos em posição aberta = beginner
  if (position.startFret === 0 && ['major', 'minor', '5'].includes(chordType)) {
    return 'beginner';
  }
  
  // Acordes com pestana = advanced
  if (position.name.includes('Pestana')) {
    return 'advanced';
  }
  
  // Acordes intermediários = intermediate
  if (['7', 'm7', 'maj7', 'sus2', 'sus4'].includes(chordType)) {
    return 'intermediate';
  }
  
  // Acordes complexos = advanced
  if (['9', 'maj9', 'm9', 'add9', '6', 'm6'].includes(chordType)) {
    return 'advanced';
  }
  
  return 'intermediate';
}

/**
 * Gera nome completo do acorde em português
 */
function generateFullName(root: string, chordType: string): string {
  const rootNames: Record<string, string> = {
    'C': 'Dó', 'C#': 'Dó#', 'D': 'Ré', 'D#': 'Ré#',
    'E': 'Mi', 'F': 'Fá', 'F#': 'Fá#', 'G': 'Sol',
    'G#': 'Sol#', 'A': 'Lá', 'A#': 'Lá#', 'B': 'Si',
  };
  
  const typeNames: Record<string, string> = {
    'major': 'Maior',
    'minor': 'Menor',
    '7': 'com Sétima',
    'maj7': 'Maior com Sétima',
    'm7': 'Menor com Sétima',
    'sus2': 'Suspenso (2ª)',
    'sus4': 'Suspenso (4ª)',
    'dim': 'Diminuto',
    'aug': 'Aumentado',
    'add9': 'com Nona',
    '9': 'com Nona',
    'maj9': 'Maior com Nona',
    'm9': 'Menor com Nona',
    '6': 'com Sexta',
    'm6': 'Menor com Sexta',
    '5': 'Power Chord',
  };
  
  const rootName = rootNames[root] || root;
  const typeName = typeNames[chordType] || chordType;
  
  return `${rootName} ${typeName}`;
}

/**
 * Gera acorde em todas as 12 tonalidades
 */
export function generateAllChordsInAllKeys(
  chordType: string,
  template: Omit<Chord, 'id' | 'name' | 'fullName' | 'frets' | 'fingers' | 'relatedChords'>
): Chord[] {
  const chords: Chord[] = [];
  const intervals = CHORD_INTERVALS[chordType];
  
  if (!intervals) {
    console.warn(`Tipo de acorde não encontrado: ${chordType}`);
    return [];
  }
  
  CHROMATIC_NOTES.forEach((root) => {
    // Encontrar posições do acorde
    const positions = findChordPositions(root, intervals);
    
    if (positions.length === 0) {
      // Se não encontrou posições, criar uma posição básica
      positions.push({
        frets: ['x', 'x', 'x', 'x', 'x', 'x'],
        fingers: [0, 0, 0, 0, 0, 0],
        startFret: 0,
        name: 'Básica',
      });
    }
    
    // Criar acorde para cada posição
    positions.forEach((position, index) => {
      const chordId = index === 0 
        ? `${root}${chordType === 'major' ? '' : chordType === 'minor' ? 'm' : chordType}`
        : `${root}${chordType === 'major' ? '' : chordType === 'minor' ? 'm' : chordType}-pos${index + 1}`;
      
      const difficulty = determineDifficulty(chordType, position);
      const fullName = generateFullName(root, chordType);
      
      chords.push({
        ...template,
        id: chordId.toLowerCase().replace('#', '-sharp'),
        name: index === 0 
          ? `${root}${chordType === 'major' ? '' : chordType === 'minor' ? 'm' : chordType}`
          : `${root}${chordType === 'major' ? '' : chordType === 'minor' ? 'm' : chordType} (${position.name})`,
        fullName: index === 0 ? fullName : `${fullName} - ${position.name}`,
        category: getCategoryFromType(chordType),
        difficulty,
        frets: position.frets,
        fingers: position.fingers,
        relatedChords: [],
        xpReward: difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 15 : 25,
      });
    });
  });
  
  return chords;
}

/**
 * Mapeia tipo de acorde para categoria
 */
function getCategoryFromType(chordType: string): Chord['category'] {
  if (chordType === 'major' || chordType === 'aug' || chordType === 'add9' || chordType === '6' || chordType === 'maj7' || chordType === 'maj9') {
    return 'major';
  }
  if (chordType === 'minor' || chordType === 'm7' || chordType === 'mM7' || chordType === 'm9' || chordType === 'madd9' || chordType === 'm6') {
    return 'minor';
  }
  if (chordType === '7' || chordType === '9' || chordType === 'm7b5') {
    return 'seventh';
  }
  if (chordType === 'sus2' || chordType === 'sus4') {
    return 'suspended';
  }
  if (chordType === 'dim' || chordType === 'dim7') {
    return 'diminished';
  }
  return 'major';
}

/**
 * Templates de acordes para geração automática
 */
export const CHORD_TEMPLATES = {
  major: {
    category: 'major' as Chord['category'],
    description: 'Acorde maior. Soa alegre e brilhante.',
    tips: ['Mantenha os dedos curvados', 'Pressione as cordas com a ponta dos dedos'],
  },
  minor: {
    category: 'minor' as Chord['category'],
    description: 'Acorde menor. Soa triste e melancólico.',
    tips: ['Similar ao maior, mas com 3ª menor', 'Som emotivo e expressivo'],
  },
  '7': {
    category: 'seventh' as Chord['category'],
    description: 'Acorde dominante. Cria tensão que resolve para tônica.',
    tips: ['Usado em blues e jazz', 'Resolve naturalmente para acorde maior'],
  },
  'maj7': {
    category: 'major' as Chord['category'],
    description: 'Acorde maior com sétima maior. Som sofisticado e jazzístico.',
    tips: ['Muito usado em jazz e bossa nova', 'Som suave e elegante'],
  },
  'm7': {
    category: 'minor' as Chord['category'],
    description: 'Acorde menor com sétima menor. Essencial para jazz.',
    tips: ['Base de progressões II-V-I', 'Som melancólico e sofisticado'],
  },
  'sus2': {
    category: 'suspended' as Chord['category'],
    description: 'Acorde suspenso com 2ª. Som flutuante e moderno.',
    tips: ['Cria tensão antes de resolver', 'Usado em pop e rock moderno'],
  },
  'sus4': {
    category: 'suspended' as Chord['category'],
    description: 'Acorde suspenso com 4ª. Som tenso que pede resolução.',
    tips: ['Resolve para acorde maior', 'Usado em intros e bridges'],
  },
  '9': {
    category: 'seventh' as Chord['category'],
    description: 'Acorde dominante com 9ª. Som rico e colorido.',
    tips: ['Muito usado em jazz', 'Adiciona cor harmônica'],
  },
  'maj9': {
    category: 'major' as Chord['category'],
    description: 'Acorde maior com 9ª. Som sofisticado e elegante.',
    tips: ['Essencial para bossa nova', 'Som suave e colorido'],
  },
  'm9': {
    category: 'minor' as Chord['category'],
    description: 'Acorde menor com 9ª. Som melancólico e sofisticado.',
    tips: ['Usado em jazz e MPB', 'Adiciona profundidade harmônica'],
  },
  '5': {
    category: 'major' as Chord['category'],
    description: 'Power chord. Som neutro e poderoso.',
    tips: ['Base do rock e metal', 'Apenas fundamental e 5ª'],
  },
};
