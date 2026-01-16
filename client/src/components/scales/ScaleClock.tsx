import { useState } from 'react';
import { motion } from 'framer-motion';

interface ScaleClockProps {
  scaleName: string;
  intervals: number[]; // Array of semitones from root
  root?: string;
  size?: number;
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const INTERVAL_COLORS: Record<number, string> = {
  0: '#06b6d4', // Root - Cyan
  1: '#64748b', // Minor 2nd - Slate
  2: '#10b981', // Major 2nd - Green
  3: '#f97316', // Minor 3rd - Orange
  4: '#eab308', // Major 3rd - Yellow
  5: '#a855f7', // Perfect 4th - Purple
  6: '#ef4444', // Tritone - Red
  7: '#22d3ee', // Perfect 5th - Cyan Light
  8: '#84cc16', // Minor 6th - Lime
  9: '#06b6d4', // Major 6th - Cyan
  10: '#f97316', // Minor 7th - Orange
  11: '#eab308', // Major 7th - Yellow
  12: '#06b6d4', // Octave - Cyan
};

const INTERVAL_NAMES: Record<number, string> = {
  0: 'Tônica',
  1: '2ª menor',
  2: '2ª maior',
  3: '3ª menor',
  4: '3ª maior',
  5: '4ª justa',
  6: 'Trítono',
  7: '5ª justa',
  8: '6ª menor',
  9: '6ª maior',
  10: '7ª menor',
  11: '7ª maior',
  12: 'Oitava',
};

export function ScaleClock({ scaleName, intervals, root = 'C', size = 400 }: ScaleClockProps) {
  const [rotation, setRotation] = useState(0);
  const [hoveredNote, setHoveredNote] = useState<number | null>(null);
  
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  const dotRadius = size * 0.045;
  
  // Get root note index
  const rootIndex = NOTES.indexOf(root);
  
  // Calculate positions for all 12 notes
  const notePositions = NOTES.map((note, index) => {
    const angle = (index * 30 - 90 + rotation) * (Math.PI / 180);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    // Calculate actual note based on rotation
    const actualIndex = (index - Math.round(rotation / 30) + 12) % 12;
    const actualNote = NOTES[actualIndex];
    
    // Check if this note is in the scale
    const noteOffset = (actualIndex - rootIndex + 12) % 12;
    const isInScale = intervals.includes(noteOffset);
    const intervalIndex = intervals.indexOf(noteOffset);
    
    return {
      note: actualNote,
      x,
      y,
      isInScale,
      interval: noteOffset,
      intervalIndex,
      angle: index * 30,
    };
  });
  
  const handleDrag = (event: any, info: any) => {
    const newRotation = rotation + info.offset.x * 0.5;
    setRotation(newRotation % 360);
  };
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold text-white mb-2">{scaleName}</h3>
        <p className="text-gray-400">Arraste para girar e mudar a fundamental</p>
      </div>
      
      <motion.div
        className="relative select-none cursor-grab active:cursor-grabbing"
        style={{ width: size, height: size }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDrag={handleDrag}
      >
        <svg width={size} height={size} className="overflow-visible">
          {/* Background Circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius + 40}
            fill="#1a1a2e"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
          />
          
          {/* Clock Lines */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x1 = centerX + (radius - 20) * Math.cos(angle);
            const y1 = centerY + (radius - 20) * Math.sin(angle);
            const x2 = centerX + (radius + 20) * Math.cos(angle);
            const y2 = centerY + (radius + 20) * Math.sin(angle);
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Connection Lines between scale notes */}
          {notePositions.map((pos, i) => {
            if (!pos.isInScale) return null;
            
            const nextInScale = notePositions.find(
              (p, idx) => idx > i && p.isInScale
            );
            
            if (!nextInScale) {
              // Connect last to first
              const firstInScale = notePositions.find(p => p.isInScale);
              if (firstInScale) {
                return (
                  <line
                    key={`line-${i}`}
                    x1={pos.x}
                    y1={pos.y}
                    x2={firstInScale.x}
                    y2={firstInScale.y}
                    stroke={INTERVAL_COLORS[pos.interval]}
                    strokeWidth="3"
                    opacity="0.3"
                  />
                );
              }
            } else {
              return (
                <line
                  key={`line-${i}`}
                  x1={pos.x}
                  y1={pos.y}
                  x2={nextInScale.x}
                  y2={nextInScale.y}
                  stroke={INTERVAL_COLORS[pos.interval]}
                  strokeWidth="3"
                  opacity="0.3"
                />
              );
            }
            return null;
          })}
          
          {/* Notes */}
          {notePositions.map((pos, i) => (
            <g
              key={i}
              onMouseEnter={() => setHoveredNote(i)}
              onMouseLeave={() => setHoveredNote(null)}
            >
              {/* Shadow */}
              {pos.isInScale && (
                <circle
                  cx={pos.x}
                  cy={pos.y + 3}
                  r={dotRadius}
                  fill="rgba(0,0,0,0.3)"
                />
              )}
              
              {/* Note Circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={dotRadius}
                fill={pos.isInScale ? INTERVAL_COLORS[pos.interval] : '#2a2a3e'}
                stroke={pos.isInScale ? '#ffffff' : 'rgba(255,255,255,0.2)'}
                strokeWidth={pos.isInScale ? '3' : '1'}
                opacity={hoveredNote === i ? 1 : pos.isInScale ? 0.9 : 0.4}
                className="transition-opacity"
              />
              
              {/* Note Label */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={pos.isInScale ? '#ffffff' : '#6b7280'}
                fontSize={size * 0.04}
                fontWeight="bold"
                fontFamily="Inter, sans-serif"
                className="pointer-events-none"
              >
                {pos.note}
              </text>
              
              {/* Interval Label (outside) */}
              {pos.isInScale && (
                <text
                  x={pos.x + (pos.x - centerX) * 0.4}
                  y={pos.y + (pos.y - centerY) * 0.4}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#9ca3af"
                  fontSize={size * 0.03}
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                  className="pointer-events-none"
                >
                  {pos.intervalIndex + 1}
                </text>
              )}
            </g>
          ))}
          
          {/* Center Label */}
          <circle
            cx={centerX}
            cy={centerY}
            r={size * 0.08}
            fill="#1a1a2e"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#ffffff"
            fontSize={size * 0.06}
            fontWeight="bold"
            fontFamily="Inter, sans-serif"
          >
            {NOTES[(rootIndex - Math.round(rotation / 30) + 12) % 12]}
          </text>
        </svg>
        
        {/* Hover Tooltip */}
        {hoveredNote !== null && notePositions[hoveredNote].isInScale && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-4 px-4 py-2 rounded-lg bg-[#1a1a2e] border border-white/20 text-white text-sm font-semibold whitespace-nowrap"
          >
            {INTERVAL_NAMES[notePositions[hoveredNote].interval]}
          </motion.div>
        )}
      </motion.div>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#06b6d4] border-2 border-white"></div>
          <span className="text-gray-300">Tônica</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#10b981] border-2 border-white"></div>
          <span className="text-gray-300">2ª maior</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#eab308] border-2 border-white"></div>
          <span className="text-gray-300">3ª maior</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#a855f7] border-2 border-white"></div>
          <span className="text-gray-300">4ª justa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#22d3ee] border-2 border-white"></div>
          <span className="text-gray-300">5ª justa</span>
        </div>
      </div>
    </div>
  );
}
