/**
 * Gerador Automático de Posições CAGED
 * Gera 5 posições CAGED para qualquer escala baseado em intervalos
 */

import { FretboardPosition, FretNote } from '@/data/scales';

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const GUITAR_STRINGS = ['E', 'A', 'D', 'G', 'B', 'E']; // Da corda 6 (grave) para corda 1 (aguda)
const STRING_OPEN_NOTES = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']; // Notas das cordas soltas

/**
 * Encontra o traste de uma nota em uma corda específica
 */
function findFretOnString(note: string, stringIndex: number): number | null {
  const stringNote = GUITAR_STRINGS[stringIndex];
  const stringNoteIndex = CHROMATIC_NOTES.indexOf(stringNote);
  const targetNoteIndex = CHROMATIC_NOTES.indexOf(note);
  
  if (targetNoteIndex === -1) return null;
  
  // Calcular diferença em semitons
  let semitones = targetNoteIndex - stringNoteIndex;
  if (semitones < 0) semitones += 12;
  
  return semitones;
}

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
 * Verifica se uma nota pertence à escala
 */
function isNoteInScale(note: string, root: string, intervals: number[]): boolean {
  const rootIndex = CHROMATIC_NOTES.indexOf(root);
  const noteIndex = CHROMATIC_NOTES.indexOf(note);
  
  return intervals.some(interval => {
    const scaleNoteIndex = (rootIndex + interval) % 12;
    return scaleNoteIndex === noteIndex;
  });
}

/**
 * Obtém o intervalo de uma nota em relação à tônica
 */
function getInterval(note: string, root: string, intervals: number[]): number {
  const rootIndex = CHROMATIC_NOTES.indexOf(root);
  const noteIndex = CHROMATIC_NOTES.indexOf(note);
  
  let semitones = noteIndex - rootIndex;
  if (semitones < 0) semitones += 12;
  
  // Encontrar intervalo correspondente
  for (const interval of intervals) {
    if (interval % 12 === semitones % 12) {
      return interval;
    }
  }
  
  return 0;
}

/**
 * Gera uma posição CAGED específica
 */
function generateCAGEDPosition(
  root: string,
  intervals: number[],
  shapeName: string,
  startFret: number,
  rootString: number,
  rootFret: number
): FretboardPosition | null {
  const fingering: FretNote[] = [];
  const scaleNotes: string[] = [];
  
  // Gerar notas da escala
  const rootIndex = CHROMATIC_NOTES.indexOf(root);
  intervals.forEach(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    scaleNotes.push(CHROMATIC_NOTES[noteIndex]);
  });
  
  // Definir range de trastes para esta posição (4-5 trastes)
  const endFret = startFret + 4;
  
  // Procurar notas da escala em todas as cordas dentro do range
  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    for (let fret = startFret; fret <= endFret && fret <= 12; fret++) {
      const note = getNoteAtPosition(stringIndex, fret);
      
      if (isNoteInScale(note, root, intervals)) {
        const interval = getInterval(note, root, intervals);
        const isRoot = note === root;
        
        // Determinar dedilhado (1-4, onde 1=indicador, 4=mindinho)
        // Simplificado: baseado na distância do traste inicial
        let finger = 1;
        if (fret === startFret) finger = 1;
        else if (fret === startFret + 1) finger = 2;
        else if (fret === startFret + 2) finger = 3;
        else if (fret >= startFret + 3) finger = 4;
        
        // Evitar duplicatas na mesma corda (preferir a mais próxima do root)
        const existingOnString = fingering.find(f => f.string === stringIndex);
        if (existingOnString) {
          // Se já existe uma nota nesta corda, manter a mais próxima do root
          const distanceToRoot = Math.abs(fret - rootFret);
          const existingDistance = Math.abs(existingOnString.fret - rootFret);
          if (distanceToRoot < existingDistance) {
            // Substituir
            const index = fingering.indexOf(existingOnString);
            fingering[index] = {
              string: stringIndex,
              fret,
              note,
              finger,
              isRoot,
              interval,
            };
          }
        } else {
          fingering.push({
            string: stringIndex,
            fret,
            note,
            finger,
            isRoot,
            interval,
          });
        }
      }
    }
  }
  
  // Ordenar por corda (6 para 1) e traste
  fingering.sort((a, b) => {
    if (a.string !== b.string) return b.string - a.string; // Corda 6 primeiro
    return a.fret - b.fret;
  });
  
  if (fingering.length === 0) return null;
  
  return {
    id: `${root.toLowerCase()}-${shapeName.toLowerCase()}-pos`,
    name: `Posição ${shapeName} (Casa ${startFret})`,
    startFret,
    endFret: Math.min(endFret, 12),
    fingering,
    shape: shapeName,
    difficulty: startFret === 0 ? 1 : startFret <= 3 ? 2 : 3,
    recommended: startFret <= 5,
  };
}

/**
 * Gera todas as 5 posições CAGED para uma escala
 */
export function generateCAGEDPositions(
  root: string,
  intervals: number[]
): FretboardPosition[] {
  const positions: FretboardPosition[] = [];
  
  // Encontrar posições da tônica no braço
  const rootPositions: Array<{ string: number; fret: number }> = [];
  
  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    for (let fret = 0; fret <= 12; fret++) {
      const note = getNoteAtPosition(stringIndex, fret);
      if (note === root) {
        rootPositions.push({ string: stringIndex, fret });
      }
    }
  }
  
  // Ordenar posições da tônica por corda e traste
  rootPositions.sort((a, b) => {
    if (a.string !== b.string) return a.string - b.string;
    return a.fret - b.fret;
  });
  
  // Definir 5 posições CAGED baseadas nas posições da tônica
  const cagedShapes = [
    { name: 'C', preferredFret: 0, rootString: 5 }, // C shape - posição aberta
    { name: 'A', preferredFret: 2, rootString: 4 }, // A shape
    { name: 'G', preferredFret: 3, rootString: 3 }, // G shape
    { name: 'E', preferredFret: 0, rootString: 5 }, // E shape
    { name: 'D', preferredFret: 2, rootString: 2 }, // D shape
  ];
  
  // Gerar posições baseadas nas formas CAGED
  for (let i = 0; i < cagedShapes.length && i < 5; i++) {
    const shape = cagedShapes[i];
    
    // Encontrar a melhor posição da tônica para esta forma
    let bestRootPos = rootPositions.find(
      pos => pos.string === shape.rootString && pos.fret >= shape.preferredFret && pos.fret <= shape.preferredFret + 3
    );
    
    // Se não encontrou na string preferida, usar a primeira disponível
    if (!bestRootPos && rootPositions.length > 0) {
      bestRootPos = rootPositions[i % rootPositions.length];
    }
    
    if (bestRootPos) {
      const startFret = Math.max(0, bestRootPos.fret - 1);
      const position = generateCAGEDPosition(
        root,
        intervals,
        shape.name,
        startFret,
        bestRootPos.string,
        bestRootPos.fret
      );
      
      if (position) {
        positions.push(position);
      }
    }
  }
  
  // Se não gerou 5 posições, tentar preencher com posições alternativas
  if (positions.length < 5) {
    for (let fret = 0; fret <= 8 && positions.length < 5; fret += 2) {
      const existingAtFret = positions.find(p => p.startFret === fret);
      if (!existingAtFret) {
        // Usar primeira posição da tônica disponível
        const rootPos = rootPositions[0];
        if (rootPos) {
          const position = generateCAGEDPosition(
            root,
            intervals,
            `Pos${fret}`,
            fret,
            rootPos.string,
            rootPos.fret
          );
          if (position) {
            positions.push(position);
          }
        }
      }
    }
  }
  
  // Ordenar por traste inicial
  positions.sort((a, b) => a.startFret - b.startFret);
  
  return positions;
}

/**
 * Gera escala em todas as 12 tonalidades
 */
export function generateAllKeys(
  scaleTemplate: Omit<import('@/data/scales').MusicalScale, 'id' | 'name' | 'shortName' | 'root' | 'notes' | 'positions'>
): import('@/data/scales').MusicalScale[] {
  const scales: import('@/data/scales').MusicalScale[] = [];
  
  CHROMATIC_NOTES.forEach((root) => {
    // Gerar notas da escala
    const rootIndex = CHROMATIC_NOTES.indexOf(root);
    const notes: string[] = [];
    scaleTemplate.intervals.forEach(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      notes.push(CHROMATIC_NOTES[noteIndex]);
    });
    
    // Gerar posições CAGED
    const positions = generateCAGEDPositions(root, scaleTemplate.intervals);
    
    // Determinar nome baseado na categoria e template key (se disponível)
    let name = '';
    let shortName = '';
    let idSuffix = '';
    
    // Usar _templateKey se disponível para IDs mais específicos
    const templateKey = (scaleTemplate as any)._templateKey;
    
    if (scaleTemplate.category === 'major') {
      name = `${root} Maior`;
      shortName = `${root} Major`;
      idSuffix = templateKey || 'major';
    } else if (scaleTemplate.category === 'minor') {
      if (templateKey === 'harmonicMinor') {
        name = `${root} Menor Harmônica`;
        shortName = `${root} Harm Min`;
        idSuffix = 'harmonic-minor';
      } else if (templateKey === 'melodicMinor') {
        name = `${root} Menor Melódica`;
        shortName = `${root} Mel Min`;
        idSuffix = 'melodic-minor';
      } else {
        name = `${root} Menor`;
        shortName = `${root} Minor`;
        idSuffix = templateKey || 'minor';
      }
    } else if (scaleTemplate.category === 'pentatonic') {
      if (templateKey === 'pentatonicMinor') {
        name = `${root} Menor Pentatônica`;
        shortName = `${root} Min Pent`;
        idSuffix = 'minor-pentatonic';
      } else if (templateKey === 'pentatonicMajor') {
        name = `${root} Maior Pentatônica`;
        shortName = `${root} Maj Pent`;
        idSuffix = 'major-pentatonic';
      } else {
        name = `${root} Pentatônica`;
        shortName = `${root} Pent`;
        idSuffix = templateKey || 'pentatonic';
      }
    } else if (scaleTemplate.category === 'mode') {
      // Identificar modo específico pelo template key
      const modeNames: Record<string, { name: string; shortName: string }> = {
        dorian: { name: `${root} Dórico`, shortName: `${root} Dorian` },
        mixolydian: { name: `${root} Mixolídio`, shortName: `${root} Mixolydian` },
        phrygian: { name: `${root} Frígio`, shortName: `${root} Phrygian` },
        lydian: { name: `${root} Lídio`, shortName: `${root} Lydian` },
        locrian: { name: `${root} Lócrio`, shortName: `${root} Locrian` },
      };
      
      if (templateKey && modeNames[templateKey]) {
        name = modeNames[templateKey].name;
        shortName = modeNames[templateKey].shortName;
        idSuffix = templateKey;
      } else {
        name = `${root} ${scaleTemplate.category}`;
        shortName = `${root} ${scaleTemplate.category}`;
        idSuffix = templateKey || 'mode';
      }
    } else if (scaleTemplate.category === 'blues') {
      name = `${root} Blues`;
      shortName = `${root} Blues`;
      idSuffix = templateKey || 'blues';
    } else if (scaleTemplate.category === 'exotic') {
      if (templateKey === 'wholeTone') {
        name = `${root} Tons Inteiros`;
        shortName = `${root} Whole Tone`;
        idSuffix = 'whole-tone';
      } else if (templateKey === 'diminished') {
        name = `${root} Diminuta`;
        shortName = `${root} Diminished`;
        idSuffix = 'diminished';
      } else {
        name = `${root} ${scaleTemplate.category}`;
        shortName = `${root} ${scaleTemplate.category}`;
        idSuffix = templateKey || 'exotic';
      }
    } else {
      name = `${root} ${scaleTemplate.category}`;
      shortName = `${root} ${scaleTemplate.category}`;
      idSuffix = templateKey || scaleTemplate.category;
    }
    
    // Normalizar root para ID (C# vira c-sharp, etc)
    const rootId = root.toLowerCase().replace('#', '-sharp');
    
    scales.push({
      ...scaleTemplate,
      id: `${rootId}-${idSuffix}`,
      name,
      shortName,
      root,
      notes,
      positions,
    });
  });
  
  return scales;
}
