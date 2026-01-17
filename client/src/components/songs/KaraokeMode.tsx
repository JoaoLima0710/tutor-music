import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Play, Pause, RotateCcw, Plus, Minus, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KaraokeModeProps {
  chordSheet: string;
  bpm: number;
  title: string;
  artist: string;
  onClose: () => void;
}

export function KaraokeMode({ chordSheet, bpm, title, artist, onClose }: KaraokeModeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Parse chord sheet into lines
  const lines = chordSheet.split('\n').filter(line => line.trim() !== '');

  // Calculate time per line based on BPM and speed
  const timePerLine = (60 / bpm) * 4 * (1 / speed);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          const newLineIndex = Math.floor(newTime / timePerLine);
          
          if (newLineIndex >= lines.length) {
            setIsPlaying(false);
            setCurrentTime(0);
            setCurrentLineIndex(0);
            return 0;
          }
          
          setCurrentLineIndex(newLineIndex);
          return newTime;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, timePerLine, lines.length]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentLineIndex(0);
  };

  const handleSpeedChange = (delta: number) => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5];
    const currentIndex = speeds.indexOf(speed);
    const newIndex = Math.max(0, Math.min(speeds.length - 1, currentIndex + delta));
    setSpeed(speeds[newIndex]);
  };

  const isChordLine = (line: string) => {
    return line.includes('[') && line.includes(']');
  };

  const renderLine = (line: string, index: number) => {
    const isActive = index === currentLineIndex && isPlaying;
    const isNext = index === currentLineIndex + 1 && isPlaying;
    const isChord = isChordLine(line);

    // Don't render section markers in karaoke mode
    if (line.startsWith('[') && line.endsWith(']')) {
      return null;
    }

    // Parse chords and lyrics
    if (isChord) {
      const parts = line.split(/(\[[^\]]+\])/g);
      return (
        <motion.div
          key={index}
          className={`text-center py-6 px-8 rounded-3xl transition-all duration-500 ${
            isActive
              ? 'scale-110 bg-gradient-to-r from-[#06b6d4]/40 to-[#0891b2]/30'
              : isNext
              ? 'scale-105 opacity-70'
              : 'opacity-40 scale-95'
          }`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ 
            opacity: isActive ? 1 : isNext ? 0.7 : 0.4,
            y: 0,
            scale: isActive ? 1.1 : isNext ? 1.05 : 0.95
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-wrap justify-center items-baseline gap-3">
            {parts.map((part, i) => {
              if (part.match(/\[[^\]]+\]/)) {
                // Chord
                const chord = part.replace(/[\[\]]/g, '');
                return (
                  <span
                    key={i}
                    className={`font-black px-4 py-2 rounded-xl ${
                      isActive
                        ? 'text-4xl md:text-5xl text-cyan-300 bg-cyan-900/50 shadow-2xl shadow-cyan-500/50'
                        : isNext
                        ? 'text-3xl md:text-4xl text-cyan-400 bg-cyan-900/30'
                        : 'text-2xl md:text-3xl text-cyan-500 bg-cyan-900/20'
                    }`}
                  >
                    {chord}
                  </span>
                );
              } else if (part.trim()) {
                // Lyrics
                return (
                  <span
                    key={i}
                    className={`font-semibold ${
                      isActive
                        ? 'text-4xl md:text-5xl text-white'
                        : isNext
                        ? 'text-3xl md:text-4xl text-gray-200'
                        : 'text-2xl md:text-3xl text-gray-400'
                    }`}
                  >
                    {part}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </motion.div>
      );
    } else {
      // Regular text line
      return (
        <motion.div
          key={index}
          className={`text-center py-6 px-8 rounded-3xl transition-all duration-500 ${
            isActive
              ? 'scale-110 bg-gradient-to-r from-[#06b6d4]/40 to-[#0891b2]/30'
              : isNext
              ? 'scale-105 opacity-70'
              : 'opacity-40 scale-95'
          }`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ 
            opacity: isActive ? 1 : isNext ? 0.7 : 0.4,
            y: 0,
            scale: isActive ? 1.1 : isNext ? 1.05 : 0.95
          }}
          transition={{ duration: 0.5 }}
        >
          <span className={`font-semibold ${
            isActive
              ? 'text-4xl md:text-5xl text-white'
              : isNext
              ? 'text-3xl md:text-4xl text-gray-200'
              : 'text-2xl md:text-3xl text-gray-400'
          }`}>
            {line}
          </span>
        </motion.div>
      );
    }
  };

  // Get visible lines (current, next 2, previous 2)
  const getVisibleLines = () => {
    const start = Math.max(0, currentLineIndex - 2);
    const end = Math.min(lines.length, currentLineIndex + 3);
    return lines.slice(start, end).map((line, i) => ({
      line,
      index: start + i
    }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#1a1a2e]/90 to-[#2a2a3e]/80 backdrop-blur-xl border-b border-white/10">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">{title}</h1>
            <p className="text-lg text-gray-400">{artist}</p>
          </div>
          
          <Button
            onClick={onClose}
            variant="outline"
            size="lg"
            className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-500"
          >
            <X size={24} />
            <span className="ml-2">Sair</span>
          </Button>
        </div>

        {/* Lyrics Display */}
        <div className="flex-1 flex items-center justify-center overflow-hidden py-12">
          <div className="w-full max-w-5xl px-8 space-y-8">
            {getVisibleLines().map(({ line, index }) => renderLine(line, index))}
          </div>
        </div>

        {/* Controls Footer */}
        <div className="p-6 bg-gradient-to-r from-[#1a1a2e]/90 to-[#2a2a3e]/80 backdrop-blur-xl border-t border-white/10">
          <div className="flex items-center justify-between gap-6 max-w-4xl mx-auto">
            {/* Play/Pause and Reset */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handlePlayPause}
                size="lg"
                className={`${
                  isPlaying
                    ? 'bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#dc2626] hover:to-[#ef4444]'
                    : 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#06b6d4]'
                } text-white font-bold px-8 text-lg`}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                <span className="ml-2">{isPlaying ? 'Pausar' : 'Tocar'}</span>
              </Button>
              
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="bg-[#1a1a2e]/60 border-white/20 text-gray-300 hover:bg-white/10"
              >
                <RotateCcw size={24} />
              </Button>
            </div>

            {/* Progress */}
            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span className="font-semibold">Linha {currentLineIndex + 1}</span>
                <span className="font-semibold">{lines.length} linhas</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentLineIndex + 1) / lines.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 font-semibold">Velocidade:</span>
              <Button
                onClick={() => handleSpeedChange(-1)}
                variant="outline"
                size="sm"
                className="bg-[#1a1a2e]/60 border-white/20 text-gray-300 hover:bg-white/10"
                disabled={speed === 0.5}
              >
                <Minus size={20} />
              </Button>
              <span className="text-xl font-black text-cyan-400 min-w-[70px] text-center">
                {speed}x
              </span>
              <Button
                onClick={() => handleSpeedChange(1)}
                variant="outline"
                size="sm"
                className="bg-[#1a1a2e]/60 border-white/20 text-gray-300 hover:bg-white/10"
                disabled={speed === 1.5}
              >
                <Plus size={20} />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
