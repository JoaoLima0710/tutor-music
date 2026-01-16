import { motion } from 'framer-motion';

interface ScaleFretboardProps {
  scale: {
    name: string;
    root: string;
    intervals: number[];
    positions?: number[][];
  };
  position?: number;
  size?: 'sm' | 'md' | 'lg';
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const STRINGS = ['E', 'A', 'D', 'G', 'B', 'e'];
const STRING_NOTES = [4, 9, 2, 7, 11, 4]; // Starting notes for each string (E, A, D, G, B, e)

export function ScaleFretboard({ scale, position = 0, size = 'md' }: ScaleFretboardProps) {
  const sizes = {
    sm: { width: 400, height: 200, fretWidth: 50, stringSpacing: 30 },
    md: { width: 600, height: 280, fretWidth: 70, stringSpacing: 40 },
    lg: { width: 800, height: 360, fretWidth: 90, stringSpacing: 50 },
  };

  const { width, height, fretWidth, stringSpacing } = sizes[size];
  const numFrets = 12;
  const startX = 60;
  const startY = 40;

  // Get root note index
  const rootIndex = NOTES.indexOf(scale.root);

  // Calculate which notes are in the scale
  const scaleNotes = scale.intervals.map(interval => (rootIndex + interval) % 12);

  // Generate fretboard positions
  const fretboardPositions: Array<{
    string: number;
    fret: number;
    note: string;
    isRoot: boolean;
    interval: number;
  }> = [];

  for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
    const stringRoot = STRING_NOTES[stringIdx];
    for (let fret = 0; fret <= numFrets; fret++) {
      const noteIndex = (stringRoot + fret) % 12;
      if (scaleNotes.includes(noteIndex)) {
        const interval = scale.intervals[scaleNotes.indexOf(noteIndex)];
        fretboardPositions.push({
          string: stringIdx,
          fret,
          note: NOTES[noteIndex],
          isRoot: noteIndex === rootIndex,
          interval,
        });
      }
    }
  }

  // Get interval color
  const getIntervalColor = (interval: number) => {
    const colors: Record<number, string> = {
      0: '#06b6d4', // Root - Cyan
      2: '#8b5cf6', // Major 2nd - Purple
      4: '#ec4899', // Major 3rd - Pink
      5: '#f59e0b', // Perfect 4th - Amber
      7: '#10b981', // Perfect 5th - Green
      9: '#3b82f6', // Major 6th - Blue
      11: '#f97316', // Major 7th - Orange
    };
    return colors[interval] || '#9ca3af';
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] rounded-2xl border border-white/10 shadow-xl"
      >
        {/* Fretboard background */}
        <rect
          x={startX}
          y={startY}
          width={fretWidth * numFrets}
          height={stringSpacing * 5}
          fill="#3d2817"
          rx="8"
        />

        {/* Fret markers (dots) */}
        {[3, 5, 7, 9].map(fret => (
          <circle
            key={fret}
            cx={startX + fretWidth * (fret - 0.5)}
            cy={startY + (stringSpacing * 5) / 2}
            r="6"
            fill="#6b5544"
            opacity="0.5"
          />
        ))}
        <circle
          cx={startX + fretWidth * 11.5}
          cy={startY + stringSpacing * 1.5}
          r="6"
          fill="#6b5544"
          opacity="0.5"
        />
        <circle
          cx={startX + fretWidth * 11.5}
          cy={startY + stringSpacing * 3.5}
          r="6"
          fill="#6b5544"
          opacity="0.5"
        />

        {/* Strings */}
        {STRINGS.map((string, idx) => (
          <g key={`string-${idx}`}>
            <line
              x1={startX}
              y1={startY + idx * stringSpacing}
              x2={startX + fretWidth * numFrets}
              y2={startY + idx * stringSpacing}
              stroke="#d4d4d8"
              strokeWidth={idx === 0 ? 3 : idx === 5 ? 1.5 : 2}
            />
            <text
              x={startX - 30}
              y={startY + idx * stringSpacing + 5}
              fill="#9ca3af"
              fontSize="14"
              fontWeight="600"
            >
              {string}
            </text>
          </g>
        ))}

        {/* Frets */}
        {Array.from({ length: numFrets + 1 }).map((_, fret) => (
          <line
            key={`fret-${fret}`}
            x1={startX + fret * fretWidth}
            y1={startY}
            x2={startX + fret * fretWidth}
            y2={startY + stringSpacing * 5}
            stroke={fret === 0 ? '#ffffff' : '#6b7280'}
            strokeWidth={fret === 0 ? 4 : 2}
          />
        ))}

        {/* Fret numbers */}
        {Array.from({ length: numFrets }).map((_, fret) => (
          <text
            key={`fret-num-${fret}`}
            x={startX + fret * fretWidth + fretWidth / 2}
            y={startY + stringSpacing * 5 + 25}
            fill="#9ca3af"
            fontSize="12"
            fontWeight="600"
            textAnchor="middle"
          >
            {fret + 1}
          </text>
        ))}

        {/* Scale notes */}
        {fretboardPositions.map((pos, idx) => {
          const x =
            pos.fret === 0
              ? startX - 15
              : startX + pos.fret * fretWidth - fretWidth / 2;
          const y = startY + pos.string * stringSpacing;
          const color = getIntervalColor(pos.interval);

          return (
            <motion.g
              key={`note-${idx}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05, type: 'spring' }}
            >
              {/* Shadow */}
              <circle cx={x + 2} cy={y + 2} r={pos.isRoot ? 16 : 14} fill="rgba(0,0,0,0.3)" />
              
              {/* Note circle */}
              <circle
                cx={x}
                cy={y}
                r={pos.isRoot ? 16 : 14}
                fill={color}
                stroke={pos.isRoot ? '#ffffff' : color}
                strokeWidth={pos.isRoot ? 3 : 2}
                opacity="0.9"
              />
              
              {/* Note name */}
              <text
                x={x}
                y={y + 5}
                fill="#ffffff"
                fontSize={pos.isRoot ? 14 : 12}
                fontWeight="bold"
                textAnchor="middle"
              >
                {pos.note}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a2e]/60 border border-white/10">
          <div className="w-4 h-4 rounded-full bg-[#06b6d4] border-2 border-white" />
          <span className="text-xs text-gray-300 font-semibold">Tônica</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a2e]/60 border border-white/10">
          <div className="w-4 h-4 rounded-full bg-[#8b5cf6]" />
          <span className="text-xs text-gray-300 font-semibold">2ª</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a2e]/60 border border-white/10">
          <div className="w-4 h-4 rounded-full bg-[#ec4899]" />
          <span className="text-xs text-gray-300 font-semibold">3ª</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a2e]/60 border border-white/10">
          <div className="w-4 h-4 rounded-full bg-[#f59e0b]" />
          <span className="text-xs text-gray-300 font-semibold">4ª</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a2e]/60 border border-white/10">
          <div className="w-4 h-4 rounded-full bg-[#10b981]" />
          <span className="text-xs text-gray-300 font-semibold">5ª</span>
        </div>
      </div>
    </div>
  );
}
