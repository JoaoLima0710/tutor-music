import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Square } from 'lucide-react';
import { unifiedAudioService } from '@/services/UnifiedAudioService';
import { toast } from 'sonner';

/**
 * Calculate fretboard positions for any scale dynamically
 * This replaces the hardcoded C Major positions
 */
function calculateScalePositions(root: string, intervals: number[]): Array<{
  note: string;
  string: number;
  fret: number;
  sequence: number;
  color: string;
}> {
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const STRINGS = ['E', 'B', 'G', 'D', 'A', 'E']; // From high to low

  // Convert root to uppercase and find index
  const rootNote = root.toUpperCase();
  const rootIndex = NOTES.indexOf(rootNote);

  if (rootIndex === -1) {
    console.error('Invalid root note:', root);
    return [];
  }

  // Generate scale notes
  const scaleNotes = intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return NOTES[noteIndex];
  });

  // Add octave note
  scaleNotes.push(rootNote);

  console.log('🎼 Scale notes for', root, ':', scaleNotes);

  // Calculate positions using musical theory
  const positions: Array<{
    note: string;
    string: number;
    fret: number;
    sequence: number;
    color: string;
  }> = [];

  scaleNotes.forEach((note, sequence) => {
    // Find the best position for this note
    const position = findBestNotePosition(note, sequence, positions);
    if (position) {
      positions.push({
        ...position,
        sequence: sequence + 1,
        color: NOTE_COLORS[sequence % NOTE_COLORS.length]
      });
    }
  });

  return positions;
}

/**
 * Find the best position for a note on the fretboard
 */
function findBestNotePosition(note: string, sequence: number, existingPositions: any[]): any {
  const STRINGS = ['E', 'B', 'G', 'D', 'A', 'E']; // High to low
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Find all possible positions for this note
  const possiblePositions: Array<{string: number, fret: number, priority: number}> = [];

  STRINGS.forEach((stringNote, stringIndex) => {
    const stringRootIndex = NOTES.indexOf(stringNote);
    const targetIndex = NOTES.indexOf(note);

    if (stringRootIndex !== -1 && targetIndex !== -1) {
      // Calculate fret position
      let fret = (targetIndex - stringRootIndex + 12) % 12;

      // Also try octave up
      const fretOctave = fret + 12;

      // Calculate priority (prefer lower frets, avoid overlaps)
      const priority = calculatePositionPriority(fret, stringIndex, existingPositions);

      possiblePositions.push({
        string: stringIndex,
        fret: fret,
        priority: priority
      });

      // Add octave option with lower priority
      const octavePriority = calculatePositionPriority(fretOctave, stringIndex, existingPositions) - 10;
      possiblePositions.push({
        string: stringIndex,
        fret: fretOctave,
        priority: octavePriority
      });
    }
  });

  // Sort by priority and return best position
  possiblePositions.sort((a, b) => b.priority - a.priority);

  if (possiblePositions.length > 0) {
    const best = possiblePositions[0];
    return {
      note: note,
      string: best.string,
      fret: best.fret
    };
  }

  return null;
}

/**
 * Calculate priority for a position (higher = better)
 */
function calculatePositionPriority(fret: number, stringIndex: number, existingPositions: any[]): number {
  let priority = 100;

  // Prefer frets between 0-12 (easier to play)
  if (fret >= 0 && fret <= 12) {
    priority += 20;
  } else if (fret > 12 && fret <= 24) {
    priority += 10;
  } else {
    priority -= 10; // Penalize very high frets
  }

  // Prefer middle strings for better playability
  if (stringIndex >= 2 && stringIndex <= 4) {
    priority += 15;
  } else if (stringIndex === 1 || stringIndex === 5) {
    priority += 5;
  }

  // Avoid positions too close to existing ones (prevent crowding)
  existingPositions.forEach(existing => {
    if (existing.string === stringIndex) {
      const distance = Math.abs(existing.fret - fret);
      if (distance < 2) {
        priority -= 20; // Heavy penalty for very close positions
      } else if (distance < 4) {
        priority -= 10; // Moderate penalty
      }
    }
  });

  return priority;
}

interface ScaleFretboardProps {
  scaleName: string;
  scaleNotes: string[];
  tonic: string;
  intervals: number[];
}

const STRINGS = ['E', 'B', 'G', 'D', 'A', 'E'];
const NOTE_COLORS = [
  '#06b6d4', // cyan
  '#a855f7', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // green
  '#3b82f6', // blue
  '#ef4444', // red
  '#14b8a6', // teal
];

export function ScaleFretboard({ scaleName, scaleNotes, tonic, intervals }: ScaleFretboardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number | null>(null);

  // Calcular posições dinâmicas da escala
  const scalePattern = calculateScalePositions(tonic, intervals);

  console.log('🎸 Scale positions calculated:', scalePattern);

  // Função para tocar a escala com animação - CORRIGIDA
  const playScaleSequence = async () => {
    if (scalePattern.length === 0) {
      toast.error('Não foi possível calcular as posições da escala');
      return;
    }

    setIsPlaying(true);

    try {
      // Garantir que o audio service está inicializado
      await unifiedAudioService.initialize();
      
      console.log('🎵 Tocando escala com', scalePattern.length, 'notas');

      for (let i = 0; i < scalePattern.length; i++) {
        setCurrentNoteIndex(i);

        // Usar o audio service para tocar a nota correta
        // Adicionar oitava se não tiver (padrão: 4)
        let noteToPlay = scalePattern[i].note;
        if (!/\d/.test(noteToPlay)) {
          noteToPlay = noteToPlay + '4';
        }

        console.log('🎼 Tocando nota:', noteToPlay, 'na posição', scalePattern[i].string, scalePattern[i].fret);

        // Tocar nota com delay entre notas
        await unifiedAudioService.playNote(noteToPlay, 0.5);
        
        // Aguardar antes da próxima nota (ajustado para melhor timing)
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setCurrentNoteIndex(null);
      setIsPlaying(false);
      toast.success('🎵 Sequência completa!');

    } catch (error) {
      console.error('❌ Erro ao tocar escala:', error);
      setIsPlaying(false);
      setCurrentNoteIndex(null);
      toast.error('Erro ao tocar a escala. Verifique se o áudio está habilitado.');
    }
  };

  const stopPlaying = () => {
    unifiedAudioService.stopAll();
    setIsPlaying(false);
    setCurrentNoteIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Título e Botão - MELHORADO */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          <h3 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <span className="text-4xl">🎸</span>
            <span>Diagrama da Escala</span>
          </h3>
          <p className="text-sm md:text-base text-gray-400">
            Siga os números na ordem. As setas verdes mostram o caminho. A nota com ⭐ é a tônica.
          </p>
        </div>
        
        <div className="flex gap-3">
          {!isPlaying ? (
            <Button
              onClick={playScaleSequence}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-3 text-base shadow-lg hover:shadow-xl transition-all"
            >
              <Play className="w-5 h-5 mr-2" />
              Tocar Sequência
            </Button>
          ) : (
            <Button
              onClick={stopPlaying}
              variant="destructive"
              className="px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Square className="w-5 h-5 mr-2" />
              Parar
            </Button>
          )}
        </div>
      </div>

      {/* Indicador de Progresso */}
      <AnimatePresence>
        {isPlaying && currentNoteIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-4 text-center"
          >
            <p className="text-cyan-400 font-semibold text-lg">
              Tocando nota {currentNoteIndex + 1} de {scalePattern.length}: <span className="text-white text-2xl ml-2">{scalePattern[currentNoteIndex].note}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diagrama do Braço do Violão - MELHORADO */}
      <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl">
        <svg
          viewBox="0 0 700 450"
          className="w-full h-auto"
          style={{ maxHeight: '550px' }}
        >
          {/* Fundo do braço - mais realista */}
          <defs>
            <linearGradient id="fretboardGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a3a2a" />
              <stop offset="50%" stopColor="#3d2817" />
              <stop offset="100%" stopColor="#2a1810" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            {/* Gradientes para notas */}
            {scalePattern.map((note, index) => (
              <linearGradient key={`grad-${index}`} id={`noteGradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={note.color} stopOpacity="1" />
                <stop offset="100%" stopColor={note.color} stopOpacity="0.7" />
              </linearGradient>
            ))}
          </defs>
          
          <rect
            x="120"
            y="50"
            width="550"
            height="320"
            rx="10"
            fill="url(#fretboardGradient)"
            stroke="#5a4a3a"
            strokeWidth="2"
          />

          {/* Cordas (6 linhas horizontais) - mais visíveis */}
          {STRINGS.map((_, index) => (
            <line
              key={`string-${index}`}
              x1="120"
              y1={80 + index * 50}
              x2="670"
              y2={80 + index * 50}
              stroke="#f4d03f"
              strokeWidth={index === 0 || index === 5 ? "3" : "2.5"}
              opacity="0.8"
              filter="url(#glow)"
            />
          ))}

          {/* Trastes (linhas verticais) - mais realistas */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((fret) => (
            <g key={`fret-${fret}`}>
              {/* Sombra do traste */}
              <line
                x1={120 + fret * 70 + 1}
                y1="50"
                x2={120 + fret * 70 + 1}
                y2="370"
                stroke="#1a1a1a"
                strokeWidth="2"
                opacity="0.5"
              />
              {/* Traste principal */}
              <line
                x1={120 + fret * 70}
                y1="50"
                x2={120 + fret * 70}
                y2="370"
                stroke="#c9a961"
                strokeWidth="3"
              />
            </g>
          ))}

          {/* Números dos trastes */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((fret) => (
            <text
              key={`fret-label-${fret}`}
              x={120 + fret * 70 - 35}
              y="380"
              fill="#9ca3af"
              fontSize="18"
              fontWeight="600"
              textAnchor="middle"
            >
              {fret}
            </text>
          ))}

          {/* Nomes das cordas (à esquerda) */}
          {STRINGS.map((string, index) => (
            <text
              key={`string-label-${index}`}
              x="90"
              y={85 + index * 50}
              fill="#d1d5db"
              fontSize="20"
              fontWeight="bold"
              textAnchor="end"
            >
              {string}
            </text>
          ))}

          {/* Setas conectando as notas */}
          {scalePattern.slice(0, -1).map((note, index) => {
            const nextNote = scalePattern[index + 1];
            const x1 = 120 + note.fret * 70 - 35;
            const y1 = 80 + note.string * 50;
            const x2 = 120 + nextNote.fret * 70 - 35;
            const y2 = 80 + nextNote.string * 50;

            return (
              <g key={`arrow-${index}`}>
                <defs>
                  <marker
                    id={`arrowhead-${index}`}
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3, 0 6"
                      fill="#10b981"
                    />
                  </marker>
                </defs>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  markerEnd={`url(#arrowhead-${index})`}
                  opacity="0.7"
                />
              </g>
            );
          })}

          {/* Notas da escala (círculos coloridos com números) - MELHORADO */}
          {scalePattern.map((note, index) => {
            const x = 120 + note.fret * 70 - 35;
            const y = 80 + note.string * 50;
            const isPlaying = currentNoteIndex === index;
            const isFirst = index === 0;
            const isRoot = note.note === tonic;

            return (
              <g key={`note-${index}`} filter={isPlaying ? "url(#glow)" : undefined}>
                {/* Sombra do círculo */}
                <circle
                  cx={x + 2}
                  cy={y + 2}
                  r={isPlaying ? 30 : isRoot ? 28 : 26}
                  fill="rgba(0,0,0,0.4)"
                />
                
                {/* Círculo da nota - com gradiente */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r={isPlaying ? 28 : isRoot ? 26 : 24}
                  fill={isPlaying ? '#fbbf24' : (isRoot ? `url(#noteGradient-${index})` : note.color)}
                  stroke={isRoot ? "#fbbf24" : (isPlaying ? "#fff" : "white")}
                  strokeWidth={isRoot ? "4" : (isPlaying ? "4" : "3")}
                  animate={{
                    scale: isPlaying ? [1, 1.3, 1] : 1,
                    opacity: isPlaying ? [1, 0.8, 1] : 1,
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: isPlaying ? Infinity : 0,
                  }}
                />

                {/* Número da sequência - mais legível */}
                <text
                  x={x}
                  y={y + 9}
                  fill="white"
                  fontSize="22"
                  fontWeight="900"
                  textAnchor="middle"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="1"
                >
                  {note.sequence}
                </text>

                {/* Nome da nota (abaixo do círculo) - melhorado */}
                <text
                  x={x}
                  y={y + 48}
                  fill={isPlaying ? "#fbbf24" : note.color}
                  fontSize="16"
                  fontWeight="bold"
                  textAnchor="middle"
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth="0.5"
                >
                  {note.note}
                </text>
                
                {/* Indicador de tônica */}
                {isRoot && !isPlaying && (
                  <text
                    x={x}
                    y={y - 35}
                    fill="#fbbf24"
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    ⭐ Tônica
                  </text>
                )}

                {/* Ícone de mão apontando para a primeira nota */}
                {isFirst && (
                  <g>
                    <text
                      x={x - 50}
                      y={y + 5}
                      fontSize="32"
                    >
                      👉
                    </text>
                    <text
                      x={x - 90}
                      y={y - 15}
                      fill="#10b981"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      COMECE
                    </text>
                    <text
                      x={x - 90}
                      y={y + 5}
                      fill="#10b981"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      AQUI
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legenda: Como Ler Este Diagrama */}
      <div className="bg-gradient-to-br from-[#1a1a2e]/80 to-[#16162a]/60 rounded-2xl p-6 border border-white/10">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          📖 Como Ler Este Diagrama
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              1
            </div>
            <div>
              <p className="text-white font-semibold">Comece pela primeira nota</p>
              <p className="text-gray-400 text-sm">Procure o círculo com o número ① e a mão apontando 👉</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              2
            </div>
            <div>
              <p className="text-white font-semibold">Siga as setas verdes</p>
              <p className="text-gray-400 text-sm">As setas tracejadas mostram o caminho de uma nota para a próxima</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              3
            </div>
            <div>
              <p className="text-white font-semibold">Toque na ordem dos números</p>
              <p className="text-gray-400 text-sm">① → ② → ③ → ④... até completar a escala</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              4
            </div>
            <div>
              <p className="text-white font-semibold">Use o botão "Tocar Sequência"</p>
              <p className="text-gray-400 text-sm">Ouça como deve soar e veja as notas acenderem em amarelo</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-gray-400">
            💡 <span className="font-semibold text-gray-300">Dica:</span> As letras à esquerda (E, B, G, D, A, E) são os nomes das cordas. Os números embaixo (1, 2, 3...) são os trastes do violão.
          </p>
        </div>
      </div>
    </div>
  );
}
