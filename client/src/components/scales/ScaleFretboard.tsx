import React from 'react';
import { motion } from 'framer-motion';

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

// Cores por intervalo (grau da escala) - mais intuitivas
const INTERVAL_COLORS = {
  0: { bg: '#06b6d4', label: 'Tônica (1ª)', ring: '#0891b2', emoji: '🎯' }, // Cyan - Tônica
  2: { bg: '#8b5cf6', label: '2ª', ring: '#7c3aed', emoji: '2️⃣' }, // Purple
  3: { bg: '#ec4899', label: '3ª menor', ring: '#db2777', emoji: '3️⃣' }, // Pink
  4: { bg: '#f59e0b', label: '3ª maior', ring: '#d97706', emoji: '3️⃣' }, // Orange
  5: { bg: '#10b981', label: '4ª', ring: '#059669', emoji: '4️⃣' }, // Green
  7: { bg: '#3b82f6', label: '5ª', ring: '#2563eb', emoji: '5️⃣' }, // Blue
  8: { bg: '#ef4444', label: '6ª menor', ring: '#dc2626', emoji: '6️⃣' }, // Red
  9: { bg: '#14b8a6', label: '6ª maior', ring: '#0d9488', emoji: '6️⃣' }, // Teal
  10: { bg: '#f97316', label: '7ª menor', ring: '#ea580c', emoji: '7️⃣' }, // Orange-red
  11: { bg: '#a855f7', label: '7ª maior', ring: '#9333ea', emoji: '7️⃣' }, // Purple-pink
};

export function ScaleFretboard({ scale, size = 'md' }: ScaleFretboardProps) {
  // Dimensões baseadas no tamanho
  const dimensions = {
    sm: { width: 700, height: 240, fretWidth: 85, stringSpacing: 32, noteRadius: 14 },
    md: { width: 900, height: 320, fretWidth: 110, stringSpacing: 45, noteRadius: 18 },
    lg: { width: 1100, height: 400, fretWidth: 135, stringSpacing: 56, noteRadius: 22 },
  };

  const { width, height, fretWidth, stringSpacing, noteRadius } = dimensions[size];
  const numFrets = 7; // Mostrar 7 trastes (uma oitava completa)
  const numStrings = 6;
  const startX = 80;
  const startY = 50;

  // Afinação padrão do violão (de cima para baixo no diagrama)
  const stringTuning = ['E', 'B', 'G', 'D', 'A', 'E']; // Invertido para visualização

  // Calcular notas da escala
  const rootIndex = NOTE_NAMES.indexOf(scale.root);
  const scaleNotes = scale.intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return { note: NOTE_NAMES[noteIndex], interval };
  });

  // Gerar posições das notas no braço (apenas primeira posição/padrão)
  const notePositions: Array<{
    string: number;
    fret: number;
    note: string;
    interval: number;
    finger: number;
  }> = [];

  // Para cada corda
  for (let string = 0; string < numStrings; string++) {
    const openStringNote = stringTuning[string];
    const openStringIndex = NOTE_NAMES.indexOf(openStringNote);

    // Para cada traste (0-7)
    for (let fret = 0; fret <= numFrets; fret++) {
      const noteIndex = (openStringIndex + fret) % 12;
      const noteName = NOTE_NAMES[noteIndex];

      // Verificar se esta nota está na escala
      const scaleNote = scaleNotes.find(sn => sn.note === noteName);
      if (scaleNote) {
        // Determinar dedo sugerido
        let finger = 0;
        if (fret === 0) finger = 0; // Corda solta
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
        });
      }
    }
  }

  return (
    <div className="w-full">
      {/* Título e instruções */}
      <div className="mb-4 text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          🎸 Como tocar {scale.name}
        </h3>
        <p className="text-sm text-gray-400">
          Círculos coloridos mostram onde colocar os dedos. Números indicam qual dedo usar.
        </p>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto drop-shadow-2xl"
      >
        {/* Fundo do braço do violão */}
        <defs>
          <linearGradient id="fretboard-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3d2817" />
            <stop offset="50%" stopColor="#4a3520" />
            <stop offset="100%" stopColor="#3d2817" />
          </linearGradient>
        </defs>

        <rect
          x={startX}
          y={startY - 10}
          width={numFrets * fretWidth}
          height={(numStrings - 1) * stringSpacing + 20}
          fill="url(#fretboard-gradient)"
          rx="12"
        />

        {/* Marcadores de posição (dots) */}
        <circle
          cx={startX + 2.5 * fretWidth}
          cy={startY + ((numStrings - 1) * stringSpacing) / 2}
          r="8"
          fill="#6b5544"
          opacity="0.4"
        />
        <circle
          cx={startX + 4.5 * fretWidth}
          cy={startY + ((numStrings - 1) * stringSpacing) / 2}
          r="8"
          fill="#6b5544"
          opacity="0.4"
        />

        {/* Desenhar trastes (linhas verticais) */}
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

        {/* Desenhar cordas (linhas horizontais) */}
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
              {/* Nome da corda */}
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

        {/* Desenhar notas da escala */}
        {notePositions.map((pos, idx) => {
          const x = pos.fret === 0 
            ? startX - 25 // Corda solta à esquerda
            : startX + pos.fret * fretWidth - fretWidth / 2;
          const y = startY + pos.string * stringSpacing;
          const color = INTERVAL_COLORS[pos.interval as keyof typeof INTERVAL_COLORS] || INTERVAL_COLORS[0];
          const isRoot = pos.interval === 0;

          return (
            <motion.g
              key={`note-${idx}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.08, type: 'spring', stiffness: 200 }}
            >
              {/* Sombra */}
              <circle
                cx={x + 2}
                cy={y + 3}
                r={isRoot ? noteRadius + 4 : noteRadius}
                fill="rgba(0,0,0,0.4)"
              />
              {/* Círculo da nota */}
              <circle
                cx={x}
                cy={y}
                r={isRoot ? noteRadius + 4 : noteRadius}
                fill={color.bg}
                stroke={isRoot ? '#ffffff' : color.ring}
                strokeWidth={isRoot ? 4 : 3}
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
              {/* Número do dedo (abaixo da nota) */}
              {pos.finger > 0 && (
                <g>
                  <circle
                    cx={x}
                    cy={y + noteRadius + 16}
                    r="10"
                    fill="#1a1a2e"
                    stroke={color.bg}
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y + noteRadius + 17}
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
            </motion.g>
          );
        })}
      </svg>

      {/* Legenda melhorada */}
      <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-[#1a1a2e]/80 to-[#2a2a3e]/60 border border-white/20 shadow-xl">
        <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <span>📖</span>
          <span>Entenda o diagrama</span>
        </h4>
        
        {/* Legenda de cores */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          {scale.intervals.map((interval) => {
            const color = INTERVAL_COLORS[interval as keyof typeof INTERVAL_COLORS] || INTERVAL_COLORS[0];
            const rootIndex = NOTE_NAMES.indexOf(scale.root);
            const noteIndex = (rootIndex + interval) % 12;
            const noteName = NOTE_NAMES[noteIndex];
            
            return (
              <div key={interval} className="flex items-center gap-2 p-2 rounded-lg bg-[#0f0f1a]/50">
                <div
                  className="w-8 h-8 rounded-full border-3 flex items-center justify-center"
                  style={{
                    backgroundColor: color.bg,
                    borderColor: interval === 0 ? '#ffffff' : color.ring,
                    borderWidth: interval === 0 ? '3px' : '2px',
                  }}
                >
                  <span className="text-white font-bold text-xs">{noteName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{color.label}</span>
                  {interval === 0 && (
                    <span className="text-[10px] text-cyan-400">Nota principal</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Instruções */}
        <div className="space-y-2 pt-3 border-t border-white/10">
          <div className="flex items-start gap-3">
            <span className="text-2xl">👆</span>
            <p className="text-sm text-gray-300">
              <span className="font-bold text-white">Números nos círculos pequenos</span> mostram qual dedo usar: 
              <span className="text-cyan-400"> 1=indicador, 2=médio, 3=anelar, 4=mínimo</span>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <p className="text-sm text-gray-300">
              <span className="font-bold text-white">Círculos maiores com borda branca</span> são a 
              <span className="text-cyan-400"> tônica (nota principal)</span> da escala
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎸</span>
            <p className="text-sm text-gray-300">
              <span className="font-bold text-white">Notas à esquerda do braço</span> são 
              <span className="text-green-400"> cordas soltas</span> (não pressione nenhum traste)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
