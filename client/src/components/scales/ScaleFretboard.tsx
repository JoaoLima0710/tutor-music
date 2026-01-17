import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, StopCircle, Volume2 } from 'lucide-react';
import { unifiedAudioService } from '@/services/UnifiedAudioService';

interface Scale {
  id: string;
  name: string;
  root: string;
  intervals: number[];
  difficulty: string;
  description: string;
}

interface ScaleFretboardProps {
  scale: Scale;
  size?: 'sm' | 'md' | 'lg';
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Cores por intervalo
const INTERVAL_COLORS = {
  0: { bg: '#06b6d4', label: 'Tônica (1ª)', ring: '#0891b2' },
  2: { bg: '#8b5cf6', label: '2ª', ring: '#7c3aed' },
  3: { bg: '#ec4899', label: '3ª menor', ring: '#db2777' },
  4: { bg: '#f59e0b', label: '3ª maior', ring: '#d97706' },
  5: { bg: '#10b981', label: '4ª', ring: '#059669' },
  7: { bg: '#3b82f6', label: '5ª', ring: '#2563eb' },
  8: { bg: '#ef4444', label: '6ª menor', ring: '#dc2626' },
  9: { bg: '#14b8a6', label: '6ª maior', ring: '#0d9488' },
  10: { bg: '#f97316', label: '7ª menor', ring: '#ea580c' },
  11: { bg: '#a855f7', label: '7ª maior', ring: '#9333ea' },
};

export function ScaleFretboard({ scale, size = 'md' }: ScaleFretboardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number | null>(null);

  const dimensions = {
    sm: { width: 700, height: 260, fretWidth: 85, stringSpacing: 32, noteRadius: 14 },
    md: { width: 900, height: 340, fretWidth: 110, stringSpacing: 45, noteRadius: 18 },
    lg: { width: 1100, height: 420, fretWidth: 135, stringSpacing: 56, noteRadius: 22 },
  };

  const { width, height, fretWidth, stringSpacing, noteRadius } = dimensions[size];
  const numFrets = 7;
  const numStrings = 6;
  const startX = 80;
  const startY = 60;

  const stringTuning = ['E', 'B', 'G', 'D', 'A', 'E'];

  // Calcular notas da escala
  const rootIndex = NOTE_NAMES.indexOf(scale.root);
  const scaleNotes = scale.intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return { note: NOTE_NAMES[noteIndex], interval };
  });

  // Gerar posições das notas no braço (padrão ascendente otimizado)
  const notePositions: Array<{
    string: number;
    fret: number;
    note: string;
    interval: number;
    finger: number;
    sequence: number;
  }> = [];

  // Criar sequência ascendente (uma oitava completa)
  let sequence = 1;
  
  // Começar pela tônica mais grave possível
  for (let string = numStrings - 1; string >= 0; string--) {
    const openStringNote = stringTuning[string];
    const openStringIndex = NOTE_NAMES.indexOf(openStringNote);

    for (let fret = 0; fret <= numFrets; fret++) {
      const noteIndex = (openStringIndex + fret) % 12;
      const noteName = NOTE_NAMES[noteIndex];
      const scaleNote = scaleNotes.find(sn => sn.note === noteName);
      
      if (scaleNote && sequence <= scale.intervals.length + 1) {
        let finger = 0;
        if (fret === 0) finger = 0;
        else if (fret === 1) finger = 1;
        else if (fret === 2) finger = 2;
        else if (fret === 3) finger = 3;
        else if (fret === 4) finger = 4;
        else finger = (fret - 1) % 4 + 1;

        notePositions.push({
          string,
          fret,
          note: noteName,
          interval: scaleNote.interval,
          finger,
          sequence: sequence++,
        });
      }
    }
  }

  // Ordenar por sequência para garantir ordem correta
  notePositions.sort((a, b) => a.sequence - b.sequence);

  // Função para tocar a escala com animação
  const playScaleSequence = async () => {
    setIsPlaying(true);
    
    for (let i = 0; i < notePositions.length; i++) {
      setCurrentNoteIndex(i);
      const pos = notePositions[i];
      
      // Tocar a nota
      await unifiedAudioService.playNote(pos.note, 0.5);
      
      // Aguardar 500ms antes da próxima nota
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setCurrentNoteIndex(null);
    setIsPlaying(false);
  };

  const stopPlaying = () => {
    unifiedAudioService.stopAll();
    setIsPlaying(false);
    setCurrentNoteIndex(null);
  };

  return (
    <div className="w-full">
      {/* Título e controles */}
      <div className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h3 className="text-xl font-bold text-white mb-1">
            🎸 Como tocar {scale.name}
          </h3>
          <p className="text-sm text-gray-400">
            Siga os números na ordem. Comece pelo 1️⃣ e vá até o final.
          </p>
        </div>
        
        <div className="flex gap-2">
          {!isPlaying ? (
            <Button
              onClick={playScaleSequence}
              className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#06b6d4] text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Tocar Sequência
            </Button>
          ) : (
            <Button
              onClick={stopPlaying}
              variant="destructive"
            >
              <StopCircle className="w-4 h-4 mr-2" />
              Parar
            </Button>
          )}
        </div>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto drop-shadow-2xl"
      >
        {/* Fundo do braço */}
        <defs>
          <linearGradient id="fretboard-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3d2817" />
            <stop offset="50%" stopColor="#4a3520" />
            <stop offset="100%" stopColor="#3d2817" />
          </linearGradient>
          
          {/* Gradiente para nota ativa */}
          <radialGradient id="active-glow">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect
          x={startX}
          y={startY - 10}
          width={numFrets * fretWidth}
          height={(numStrings - 1) * stringSpacing + 20}
          fill="url(#fretboard-gradient)"
          rx="12"
        />

        {/* Marcadores de posição */}
        <circle
          cx={startX + 2.5 * fretWidth}
          cy={startY + ((numStrings - 1) * stringSpacing) / 2}
          r="8"
          fill="#6b5544"
          opacity="0.4"
        />

        {/* Trastes */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={startX + i * fretWidth}
            y1={startY}
            x2={startX + i * fretWidth}
            y2={startY + (numStrings - 1) * stringSpacing}
            stroke={i === 0 ? '#e5e7eb' : '#9ca3af'}
            strokeWidth={i === 0 ? 5 : 3}
          />
        ))}

        {/* Números dos trastes */}
        {Array.from({ length: numFrets }).map((_, i) => (
          <text
            key={`fret-num-${i}`}
            x={startX + i * fretWidth + fretWidth / 2}
            y={startY + (numStrings - 1) * stringSpacing + 30}
            textAnchor="middle"
            fill="#d1d5db"
            fontSize={size === 'sm' ? '12' : size === 'md' ? '14' : '16'}
            fontWeight="700"
          >
            {i + 1}
          </text>
        ))}

        {/* Cordas */}
        {Array.from({ length: numStrings }).map((_, i) => {
          const thickness = 1.5 + (numStrings - i - 1) * 0.5;
          return (
            <g key={`string-${i}`}>
              <line
                x1={startX}
                y1={startY + i * stringSpacing}
                x2={startX + numFrets * fretWidth}
                y2={startY + i * stringSpacing}
                stroke="#d4d4d8"
                strokeWidth={thickness}
              />
              <text
                x={startX - 35}
                y={startY + i * stringSpacing + 6}
                textAnchor="middle"
                fill="#f3f4f6"
                fontSize={size === 'sm' ? '14' : size === 'md' ? '16' : '18'}
                fontWeight="bold"
              >
                {stringTuning[i]}
              </text>
            </g>
          );
        })}

        {/* Setas conectando as notas */}
        {notePositions.map((pos, idx) => {
          if (idx === notePositions.length - 1) return null;
          
          const nextPos = notePositions[idx + 1];
          const x1 = pos.fret === 0 ? startX - 25 : startX + pos.fret * fretWidth - fretWidth / 2;
          const y1 = startY + pos.string * stringSpacing;
          const x2 = nextPos.fret === 0 ? startX - 25 : startX + nextPos.fret * fretWidth - fretWidth / 2;
          const y2 = startY + nextPos.string * stringSpacing;
          
          return (
            <g key={`arrow-${idx}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#4ade80"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.4"
              />
            </g>
          );
        })}

        {/* Notas da escala */}
        {notePositions.map((pos, idx) => {
          const x = pos.fret === 0 
            ? startX - 25
            : startX + pos.fret * fretWidth - fretWidth / 2;
          const y = startY + pos.string * stringSpacing;
          const color = INTERVAL_COLORS[pos.interval as keyof typeof INTERVAL_COLORS] || INTERVAL_COLORS[0];
          const isRoot = pos.interval === 0;
          const isActive = currentNoteIndex === idx;
          const isFirst = idx === 0;

          return (
            <g key={`note-${idx}`}>
              {/* Glow para nota ativa */}
              {isActive && (
                <circle
                  cx={x}
                  cy={y}
                  r={noteRadius + 15}
                  fill="url(#active-glow)"
                >
                  <animate
                    attributeName="r"
                    from={noteRadius + 10}
                    to={noteRadius + 25}
                    dur="0.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              
              {/* Sombra */}
              <circle
                cx={x + 2}
                cy={y + 3}
                r={isRoot ? noteRadius + 4 : noteRadius}
                fill="rgba(0,0,0,0.4)"
              />
              
              {/* Círculo da nota */}
              <motion.circle
                cx={x}
                cy={y}
                r={isRoot ? noteRadius + 4 : noteRadius}
                fill={color.bg}
                stroke={isRoot ? '#ffffff' : isActive ? '#fbbf24' : color.ring}
                strokeWidth={isRoot ? 4 : isActive ? 5 : 3}
                initial={{ scale: 0 }}
                animate={{ scale: isActive ? 1.3 : 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              />
              
              {/* Nome da nota */}
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fff"
                fontSize={size === 'sm' ? '11' : size === 'md' ? '13' : '15'}
                fontWeight="bold"
              >
                {pos.note}
              </text>
              
              {/* Número da sequência (GRANDE e destacado) */}
              <g>
                <circle
                  cx={x + noteRadius + 8}
                  cy={y - noteRadius - 8}
                  r="14"
                  fill={isFirst ? '#10b981' : '#1a1a2e'}
                  stroke={isFirst ? '#ffffff' : color.bg}
                  strokeWidth="2"
                />
                <text
                  x={x + noteRadius + 8}
                  y={y - noteRadius - 8 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isFirst ? '#ffffff' : color.bg}
                  fontSize={size === 'sm' ? '12' : size === 'md' ? '14' : '16'}
                  fontWeight="bold"
                >
                  {pos.sequence}
                </text>
              </g>
              
              {/* Indicador "COMECE AQUI" */}
              {isFirst && (
                <text
                  x={x}
                  y={y - noteRadius - 35}
                  textAnchor="middle"
                  fill="#10b981"
                  fontSize={size === 'sm' ? '10' : size === 'md' ? '12' : '14'}
                  fontWeight="bold"
                >
                  ▼ COMECE AQUI
                </text>
              )}
              
              {/* Número do dedo */}
              {pos.finger > 0 && (
                <g>
                  <circle
                    cx={x}
                    cy={y + noteRadius + 18}
                    r="11"
                    fill="#1a1a2e"
                    stroke={color.bg}
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y + noteRadius + 19}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={color.bg}
                    fontSize={size === 'sm' ? '10' : size === 'md' ? '12' : '14'}
                    fontWeight="bold"
                  >
                    {pos.finger}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legenda melhorada */}
      <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-[#1a1a2e]/80 to-[#2a2a3e]/60 border border-white/20 shadow-xl">
        <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <span>📖</span>
          <span>Como ler o diagrama</span>
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30">
            <span className="text-2xl">1️⃣</span>
            <div>
              <p className="text-sm font-bold text-[#10b981] mb-1">Siga os números na ordem</p>
              <p className="text-xs text-gray-300">
                Os números grandes mostram a sequência. Comece no 1 e vá até o último número.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[#4ade80]/10 border border-[#4ade80]/30">
            <span className="text-2xl">➡️</span>
            <div>
              <p className="text-sm font-bold text-[#4ade80] mb-1">Linhas pontilhadas mostram o caminho</p>
              <p className="text-xs text-gray-300">
                As setas verdes conectam uma nota à próxima. Siga o caminho!
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/30">
            <span className="text-2xl">👆</span>
            <div>
              <p className="text-sm font-bold text-[#06b6d4] mb-1">Números pequenos = dedos</p>
              <p className="text-xs text-gray-300">
                1=indicador, 2=médio, 3=anelar, 4=mínimo. Use o dedo indicado!
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30">
            <span className="text-2xl">🔊</span>
            <div>
              <p className="text-sm font-bold text-[#f59e0b] mb-1">Clique em "Tocar Sequência"</p>
              <p className="text-xs text-gray-300">
                Ouça como a escala soa! A nota atual fica destacada em amarelo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
