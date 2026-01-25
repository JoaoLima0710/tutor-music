/**
 * 🎸 Chord Practice Helpers
 * 
 * Funções auxiliares para converter dados de acordes para o formato
 * esperado pelos componentes de prática.
 */

import type { Chord } from '@/data/chords';

export interface ChordFinger {
  string: number;
  fret: number;
  finger: number;
}

/**
 * Converte um acorde do formato Chord para o formato esperado pelo EnhancedChordPractice
 */
export function convertChordToPracticeFormat(chord: Chord): {
  fingers: ChordFinger[];
  stringsToPlay: number[];
} {
  const fingers: ChordFinger[] = [];
  const stringsToPlay: number[] = [];

  // Converter frets e fingers para formato de dedos
  // frets[0] = corda 6 (mais grave), frets[5] = corda 1 (mais aguda)
  chord.frets.forEach((fret, index) => {
    const stringNum = 6 - index; // Inverter: frets[0] = corda 6
    const fingerNum = chord.fingers[index];

    // Se a corda deve ser tocada (não é 'x')
    if (fret !== 'x') {
      stringsToPlay.push(stringNum);

      // Se há um dedo pressionando (finger !== 0)
      if (fingerNum !== 0 && typeof fret === 'number' && fret > 0) {
        fingers.push({
          string: stringNum,
          fret: fret,
          finger: fingerNum,
        });
      }
    }
  });

  return { fingers, stringsToPlay };
}
