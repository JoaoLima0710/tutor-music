/**
 * 🎸 Full Fretboard View Component
 * 
 * Inspirado em https://f2k.mjgibson.com/
 * Mostra TODAS as notas da escala em TODO o braço do violão
 * Com funcionalidade de tocar notas do GuitarSet ao clicar
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Info, Volume2 } from 'lucide-react';
import { unifiedAudioService } from '@/services/UnifiedAudioService';
import { toast } from 'sonner';

interface FullFretboardViewProps {
  scaleName: string;
  root: string;
  intervals: number[];
}

const STRINGS = ['E', 'B', 'G', 'D', 'A', 'E']; // Da corda mais aguda (1) para mais grave (6)
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MAX_FRETS = 24; // Mostrar até o traste 24

// Oitavas padrão para cada corda (corda aberta)
// Corda 1 (E agudo): E4, Corda 2 (B): B3, Corda 3 (G): G3, Corda 4 (D): D3, Corda 5 (A): A2, Corda 6 (E grave): E2
const STRING_OCTAVES = [4, 3, 3, 3, 2, 2];

export function FullFretboardView({ scaleName, root, intervals }: FullFretboardViewProps) {
  const [showAllFrets, setShowAllFrets] = useState(false);
  const [highlightRoot, setHighlightRoot] = useState(true);
  const [playingNote, setPlayingNote] = useState<string | null>(null);

  // Gerar todas as notas da escala
  const rootIndex = NOTES.indexOf(root.toUpperCase());
  const scaleNotes: string[] = [];
  intervals.forEach(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    scaleNotes.push(NOTES[noteIndex]);
  });
  scaleNotes.push(root.toUpperCase()); // Adicionar oitava

  // Função para obter a nota em uma posição específica (CORRIGIDA)
  const getNoteAtPosition = (stringIndex: number, fret: number): { note: string; octave: number } => {
    const stringNote = STRINGS[stringIndex];
    const stringRootIndex = NOTES.indexOf(stringNote);
    const noteIndex = (stringRootIndex + fret) % 12;
    const note = NOTES[noteIndex];
    
    // Calcular oitava correta baseada na corda e traste
    // Cada 12 trastes = +1 oitava
    const octaveOffset = Math.floor((stringRootIndex + fret) / 12);
    const baseOctave = STRING_OCTAVES[stringIndex];
    const octave = baseOctave + octaveOffset;
    
    return { note, octave };
  };

  // Verificar se uma nota pertence à escala
  const isScaleNote = (note: string): boolean => {
    return scaleNotes.includes(note);
  };

  // Verificar se é a tônica
  const isRootNote = (note: string): boolean => {
    return note === root.toUpperCase();
  };

  // Tocar nota do GuitarSet
  const playNote = async (stringIndex: number, fret: number) => {
    try {
      const { note, octave } = getNoteAtPosition(stringIndex, fret);
      const noteWithOctave = `${note}${octave}`;
      
      setPlayingNote(`${stringIndex}-${fret}`);
      
      await unifiedAudioService.initialize();
      await unifiedAudioService.playNote(noteWithOctave, 0.8);
      
      setTimeout(() => setPlayingNote(null), 800);
    } catch (error) {
      console.error('Erro ao tocar nota:', error);
      toast.error('Erro ao tocar nota');
      setPlayingNote(null);
    }
  };

  const displayFrets = showAllFrets ? MAX_FRETS : 12;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a2e]/80 to-[#2a2a3e]/60 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Maximize2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">🎸 Visualização Completa do Braço</h3>
              <p className="text-sm text-gray-400">Todas as notas da escala {scaleName} em todo o braço</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAllFrets(!showAllFrets)}
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10"
            >
              {showAllFrets ? (
                <>
                  <Minimize2 className="w-4 h-4 mr-2" />
                  Mostrar 12 trastes
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Mostrar 24 trastes
                </>
              )}
            </Button>
            
            <Button
              onClick={() => setHighlightRoot(!highlightRoot)}
              variant="outline"
              size="sm"
              className={highlightRoot 
                ? 'bg-emerald-500/20 border-emerald-400' 
                : 'bg-white/5 border-white/10'
              }
            >
              {highlightRoot ? '⭐ Tônica' : 'Tônica'}
            </Button>
          </div>
        </div>

        <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div className="text-sm text-emerald-300">
              <p className="font-semibold mb-1">Como usar esta visualização:</p>
              <ul className="list-disc list-inside space-y-1 text-emerald-200">
                <li><span className="font-bold text-white">Clique em qualquer nota</span> para tocar com o GuitarSet</li>
                <li>Notas <span className="font-bold text-emerald-400">verdes</span> = pertencem à escala</li>
                <li>Notas <span className="font-bold text-gray-500">cinzas</span> = não pertencem à escala</li>
                {highlightRoot && (
                  <li>Notas <span className="font-bold text-yellow-400">amarelas</span> = tônica ({root})</li>
                )}
                <li>Use esta visualização para encontrar todas as posições possíveis de cada nota</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Fretboard */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="bg-gradient-to-br from-[#2a1a0e] to-[#1a0f05] rounded-xl p-4 border-2 border-amber-800/50">
              {/* Header com números dos trastes */}
              <div className="flex mb-2">
                <div className="w-16 flex-shrink-0"></div>
                {Array.from({ length: displayFrets }, (_, i) => i + 1).map((fret) => (
                  <div
                    key={fret}
                    className="flex-1 text-center text-xs font-bold text-amber-200 min-w-[40px]"
                  >
                    {fret}
                  </div>
                ))}
              </div>

              {/* Cordas */}
              {STRINGS.map((stringNote, stringIndex) => (
                <div key={stringIndex} className="flex items-center mb-1">
                  {/* Nome da corda */}
                  <div className="w-16 flex-shrink-0 text-center">
                    <div className="text-lg font-bold text-amber-300 bg-amber-900/30 px-2 py-1 rounded">
                      {stringNote}
                    </div>
                  </div>

                  {/* Traste 0 (casa aberta) */}
                  <div className="flex-1 min-w-[40px] text-center">
                    <div
                      onClick={() => playNote(stringIndex, 0)}
                      className={`
                        mx-1 py-2 rounded text-sm font-bold transition-all
                        ${isRootNote(stringNote) && highlightRoot
                          ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.6)]'
                          : isScaleNote(stringNote)
                          ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                          : 'bg-gray-700/50 text-gray-400'
                        }
                        hover:scale-110 cursor-pointer active:scale-95
                        ${playingNote === `${stringIndex}-0` ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#2a1a0e]' : ''}
                      `}
                      title={`${stringNote}${STRING_OCTAVES[stringIndex]} - Clique para tocar${isScaleNote(stringNote) ? ' (Pertence à escala)' : ''}${isRootNote(stringNote) ? ' (Tônica)' : ''}`}
                    >
                      {playingNote === `${stringIndex}-0` ? (
                        <Volume2 className="w-4 h-4 mx-auto animate-pulse" />
                      ) : (
                        stringNote
                      )}
                    </div>
                  </div>

                  {/* Trastes 1-24 */}
                  {Array.from({ length: displayFrets }, (_, i) => i + 1).map((fret) => {
                    const { note, octave } = getNoteAtPosition(stringIndex, fret);
                    const isScale = isScaleNote(note);
                    const isRoot = isRootNote(note);
                    const noteKey = `${stringIndex}-${fret}`;

                    return (
                      <div key={fret} className="flex-1 min-w-[40px] text-center">
                        <div
                          onClick={() => playNote(stringIndex, fret)}
                          className={`
                            mx-1 py-2 rounded text-sm font-bold transition-all
                            ${isRoot && highlightRoot
                              ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.6)]'
                              : isScale
                              ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                              : 'bg-gray-700/50 text-gray-400'
                            }
                            hover:scale-110 cursor-pointer active:scale-95
                            ${playingNote === noteKey ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#2a1a0e]' : ''}
                          `}
                          title={`${note}${octave} - Clique para tocar${isScale ? ' (Pertence à escala)' : ''}${isRoot ? ' (Tônica)' : ''}`}
                        >
                          {playingNote === noteKey ? (
                            <Volume2 className="w-4 h-4 mx-auto animate-pulse" />
                          ) : (
                            note
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-emerald-500"></div>
              <span className="text-sm font-bold text-white">Notas da Escala</span>
            </div>
            <p className="text-xs text-gray-400">
              Todas as notas que pertencem à escala {scaleName}
            </p>
          </div>

          {highlightRoot && (
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-400/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-yellow-500"></div>
                <span className="text-sm font-bold text-white">Tônica ({root})</span>
              </div>
              <p className="text-xs text-gray-400">
                Nota fundamental da escala - onde a escala resolve
              </p>
            </div>
          )}

          <div className="p-4 rounded-xl bg-gray-700/20 border border-gray-600/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-gray-700"></div>
              <span className="text-sm font-bold text-white">Outras Notas</span>
            </div>
            <p className="text-xs text-gray-400">
              Notas que não pertencem à escala
            </p>
          </div>
        </div>

        {/* Notas da Escala */}
        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <h4 className="text-sm font-bold text-white mb-2">Notas da Escala {scaleName}:</h4>
          <div className="flex flex-wrap gap-2">
            {scaleNotes.map((note, index) => (
              <span
                key={`${note}-${index}`}
                className={`
                  px-3 py-1 rounded-lg font-bold text-sm
                  ${note === root
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                  }
                `}
              >
                {note}
                {note === root && ' ⭐'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
