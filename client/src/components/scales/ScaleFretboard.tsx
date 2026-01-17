import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Square } from 'lucide-react';
import { unifiedAudioService } from '@/services/UnifiedAudioService';
import { toast } from 'sonner';

interface ScaleFretboardProps {
  scaleName: string;
  scaleNotes: string[];
  tonic: string;
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

export function ScaleFretboard({ scaleName, scaleNotes, tonic }: ScaleFretboardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number | null>(null);

  // Adicionar a oitava (repetir a primeira nota)
  const fullScale = [...scaleNotes, scaleNotes[0]];

  // Definir UMA posição clara e simples da escala
  // Padrão de 1 oitava começando na corda E grave (6ª corda)
  // Layout otimizado para C Major (Dó Maior)
  const scalePattern = fullScale.map((note, index) => {
    let stringIndex, fret;
    
    // Padrão específico para escala de Dó Maior
    // Distribuição natural pelo braço do violão
    if (index === 0) {
      stringIndex = 4; fret = 3; // C na corda A, 3º traste
    } else if (index === 1) {
      stringIndex = 4; fret = 5; // D na corda A, 5º traste
    } else if (index === 2) {
      stringIndex = 3; fret = 2; // E na corda D, 2º traste
    } else if (index === 3) {
      stringIndex = 3; fret = 3; // F na corda D, 3º traste
    } else if (index === 4) {
      stringIndex = 3; fret = 5; // G na corda D, 5º traste
    } else if (index === 5) {
      stringIndex = 2; fret = 2; // A na corda G, 2º traste
    } else if (index === 6) {
      stringIndex = 2; fret = 4; // B na corda G, 4º traste
    } else if (index === 7) {
      stringIndex = 2; fret = 5; // C (oitava) na corda G, 5º traste
    } else {
      // Fallback
      stringIndex = 4 - Math.floor(index / 3);
      fret = 3 + (index % 3) * 2;
    }
    
    return {
      note,
      string: stringIndex,
      fret: fret,
      sequence: index + 1,
      color: NOTE_COLORS[index % NOTE_COLORS.length],
    };
  });

  // Função para tocar a escala com animação
  const playScaleSequence = async () => {
    setIsPlaying(true);
    
    for (let i = 0; i < scalePattern.length; i++) {
      setCurrentNoteIndex(i);
      const noteToPlay = scalePattern[i].note + '4'; // Add octave
      await unifiedAudioService.playNote(noteToPlay, 0.6);
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    setCurrentNoteIndex(null);
    setIsPlaying(false);
    toast.success('Sequência completa!');
  };

  const stopPlaying = () => {
    unifiedAudioService.stopAll();
    setIsPlaying(false);
    setCurrentNoteIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Título e Botão */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            🎸 Diagrama da Escala
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Siga os números de ① a ⑧. As setas mostram o caminho.
          </p>
        </div>
        
        {!isPlaying ? (
          <Button
            onClick={playScaleSequence}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-3 text-base"
          >
            <Play className="w-5 h-5 mr-2" />
            Tocar Sequência
          </Button>
        ) : (
          <Button
            onClick={stopPlaying}
            variant="destructive"
            className="px-6 py-3 text-base font-semibold"
          >
            <Square className="w-5 h-5 mr-2" />
            Parar
          </Button>
        )}
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

      {/* Diagrama do Braço do Violão */}
      <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-2xl p-8 border border-white/10">
        <svg
          viewBox="0 0 700 400"
          className="w-full h-auto"
          style={{ maxHeight: '500px' }}
        >
          {/* Fundo do braço */}
          <rect
            x="120"
            y="50"
            width="550"
            height="300"
            rx="8"
            fill="#3d2817"
            stroke="#2a1810"
            strokeWidth="3"
          />

          {/* Cordas (6 linhas horizontais) */}
          {STRINGS.map((_, index) => (
            <line
              key={`string-${index}`}
              x1="120"
              y1={80 + index * 50}
              x2="670"
              y2={80 + index * 50}
              stroke="#d4af37"
              strokeWidth="2"
              opacity="0.6"
            />
          ))}

          {/* Trastes (linhas verticais) */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((fret) => (
            <line
              key={`fret-${fret}`}
              x1={120 + fret * 70}
              y1="50"
              x2={120 + fret * 70}
              y2="350"
              stroke="#8b7355"
              strokeWidth="4"
            />
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

          {/* Notas da escala (círculos coloridos com números) */}
          {scalePattern.map((note, index) => {
            const x = 120 + note.fret * 70 - 35;
            const y = 80 + note.string * 50;
            const isPlaying = currentNoteIndex === index;
            const isFirst = index === 0;

            return (
              <g key={`note-${index}`}>
                {/* Círculo da nota */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r={isPlaying ? 28 : 24}
                  fill={isPlaying ? '#fbbf24' : note.color}
                  stroke="white"
                  strokeWidth="3"
                  animate={{
                    scale: isPlaying ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: isPlaying ? Infinity : 0,
                  }}
                />

                {/* Número da sequência */}
                <text
                  x={x}
                  y={y + 8}
                  fill="white"
                  fontSize="24"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {note.sequence}
                </text>

                {/* Nome da nota (abaixo do círculo) */}
                <text
                  x={x}
                  y={y + 45}
                  fill={note.color}
                  fontSize="18"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {note.note}
                </text>

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
