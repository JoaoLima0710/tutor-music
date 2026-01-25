/**
 * AdvancedSongPlayer
 * 
 * Player avançado de músicas com sincronização precisa de tabs/cifras,
 * reprodução de acordes em tempo real, e controles completos.
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward,
  Repeat,
  Volume2,
  Maximize2,
  Minimize2,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { songPlayerService, type SongLine, type PlayerState } from '@/services/SongPlayerService';
import { unifiedAudioService } from '@/services/UnifiedAudioService';

interface AdvancedSongPlayerProps {
  chordSheet: string;
  bpm: number;
  title: string;
  artist?: string;
  onLineChange?: (lineIndex: number, line: SongLine) => void;
}

export function AdvancedSongPlayer({ 
  chordSheet, 
  bpm, 
  title,
  artist,
  onLineChange 
}: AdvancedSongPlayerProps) {
  const [state, setState] = useState<PlayerState>('idle');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);
  const [playChords, setPlayChords] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lines, setLines] = useState<SongLine[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize player
  useEffect(() => {
    songPlayerService.initialize(chordSheet, {
      bpm,
      speed,
      loop,
      playChords,
    });

    const parsedLines = songPlayerService.getLines();
    setLines(parsedLines);

    // Set up callbacks
    songPlayerService.setOnLineChange((lineIndex, line) => {
      setCurrentLineIndex(lineIndex);
      onLineChange?.(lineIndex, line);
      
      // Auto-scroll to current line
      if (lineRefs.current[lineIndex]) {
        lineRefs.current[lineIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    });

    songPlayerService.setOnStateChange((newState) => {
      setState(newState);
    });

    songPlayerService.setOnTimeUpdate((time) => {
      setCurrentTime(time);
    });

    return () => {
      songPlayerService.dispose();
    };
  }, [chordSheet, bpm, onLineChange]);

  // Update speed when changed
  useEffect(() => {
    songPlayerService.setSpeed(speed);
  }, [speed]);

  // Update loop when changed
  useEffect(() => {
    songPlayerService.setLoop(loop);
  }, [loop]);

  // Update playChords when changed
  useEffect(() => {
    const config = songPlayerService.getConfig();
    songPlayerService.initialize(chordSheet, {
      ...config,
      playChords,
    });
  }, [playChords, chordSheet]);

  // Handle play/pause
  const handlePlayPause = async () => {
    if (state === 'playing') {
      songPlayerService.pause();
    } else {
      await unifiedAudioService.ensureInitialized();
      songPlayerService.play();
    }
  };

  // Handle stop
  const handleStop = () => {
    songPlayerService.stop();
    unifiedAudioService.stopAll();
  };

  // Handle reset
  const handleReset = () => {
    songPlayerService.reset();
    unifiedAudioService.stopAll();
  };

  // Handle seek
  const handleSeek = (lineIndex: number) => {
    songPlayerService.seekToLine(lineIndex);
  };

  // Handle speed change
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(Math.max(0.5, Math.min(2, newSpeed)));
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if line is chord line
  const isChordLine = (line: SongLine) => {
    return line.chords && line.chords.length > 0;
  };

  // Render line
  const renderLine = (line: SongLine, index: number) => {
    const isActive = index === currentLineIndex && state === 'playing';
    const isChord = isChordLine(line);

    if (line.isSection) {
      return (
        <div
          key={index}
          ref={el => { lineRefs.current[index] = el; }}
          className="mt-8 mb-4"
        >
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] text-white font-bold text-sm">
            {line.text.replace(/[\[\]]/g, '')}
          </div>
        </div>
      );
    }

    if (isChord) {
      // Parse chord and lyrics
      const parts = line.text.split(/(\[[^\]]+\])/g);
      
      return (
        <motion.div
          key={index}
          ref={el => { lineRefs.current[index] = el; }}
          className={`py-3 px-4 rounded-lg transition-all duration-300 cursor-pointer ${
            isActive
              ? 'bg-gradient-to-r from-[#06b6d4]/40 to-[#0891b2]/30 border-l-4 border-cyan-400 scale-[1.02] shadow-lg shadow-cyan-500/20'
              : 'hover:bg-white/5 border-l-4 border-transparent'
          }`}
          onClick={() => handleSeek(index)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.01 }}
        >
          <div className="flex flex-wrap items-baseline gap-1.5">
            {parts.map((part, i) => {
              if (part.match(/\[[^\]]+\]/)) {
                const chord = part.replace(/[\[\]]/g, '');
                return (
                  <span
                    key={i}
                    className={`font-bold text-sm px-2 py-1 rounded transition-all ${
                      isActive
                        ? 'text-cyan-200 bg-cyan-900/40 shadow-md'
                        : 'text-cyan-400 bg-cyan-900/20'
                    }`}
                  >
                    {chord}
                  </span>
                );
              } else if (part.trim()) {
                return (
                  <span
                    key={i}
                    className={`text-base transition-all ${
                      isActive ? 'text-white font-semibold' : 'text-gray-300'
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
    }

    // Regular text line
    return (
      <motion.div
        key={index}
        ref={el => { lineRefs.current[index] = el; }}
        className={`py-2 px-4 rounded-lg transition-all duration-300 cursor-pointer ${
          isActive
            ? 'bg-gradient-to-r from-[#06b6d4]/30 to-[#0891b2]/20 border-l-4 border-cyan-400 scale-[1.01]'
            : 'hover:bg-white/5 border-l-4 border-transparent'
        }`}
        onClick={() => handleSeek(index)}
      >
        <span className={`text-base transition-all ${
          isActive ? 'text-white font-semibold' : 'text-gray-300'
        }`}>
          {line.text}
        </span>
      </motion.div>
    );
  };

  const totalDuration = songPlayerService.getTotalDuration();
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      className="space-y-4"
    >
      {/* Player Controls */}
      <div className="sticky top-0 z-20 p-4 rounded-2xl bg-gradient-to-br from-[#1a1a2e]/95 to-[#2a2a3e]/90 backdrop-blur-xl border border-white/20 shadow-2xl">
        {/* Title and Artist */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          {artist && <p className="text-sm text-gray-400">{artist}</p>}
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="bg-[#1a1a2e]/60 border-white/20 text-gray-300 hover:bg-white/10"
            >
              <RotateCcw size={18} />
            </Button>
            
            <Button
              onClick={() => handleSeek(Math.max(0, currentLineIndex - 1))}
              variant="outline"
              size="sm"
              className="bg-[#1a1a2e]/60 border-white/20 text-gray-300 hover:bg-white/10"
            >
              <SkipBack size={18} />
            </Button>
            
            <Button
              onClick={handlePlayPause}
              className={`${
                state === 'playing'
                  ? 'bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#dc2626] hover:to-[#ef4444]'
                  : 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#06b6d4]'
              } text-white font-semibold px-6`}
            >
              {state === 'playing' ? <Pause size={20} /> : <Play size={20} />}
              <span className="ml-2">{state === 'playing' ? 'Pausar' : 'Tocar'}</span>
            </Button>
            
            <Button
              onClick={() => handleSeek(Math.min(lines.length - 1, currentLineIndex + 1))}
              variant="outline"
              size="sm"
              className="bg-[#1a1a2e]/60 border-white/20 text-gray-300 hover:bg-white/10"
            >
              <SkipForward size={18} />
            </Button>
            
            <Button
              onClick={handleStop}
              variant="outline"
              size="sm"
              className="bg-[#1a1a2e]/60 border-white/20 text-gray-300 hover:bg-white/10"
            >
              <RotateCcw size={18} className="rotate-180" />
            </Button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-3">
            <Gauge size={18} className="text-gray-400" />
            <span className="text-sm text-gray-400 font-semibold">Velocidade:</span>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleSpeedChange(speed - 0.25)}
                variant="outline"
                size="sm"
                className="bg-[#1a1a2e]/60 border-white/20 text-gray-300 hover:bg-white/10"
                disabled={speed <= 0.5}
              >
                -
              </Button>
              <span className="text-lg font-bold text-cyan-400 min-w-[60px] text-center">
                {speed.toFixed(2)}x
              </span>
              <Button
                onClick={() => handleSpeedChange(speed + 0.25)}
                variant="outline"
                size="sm"
                className="bg-[#1a1a2e]/60 border-white/20 text-gray-300 hover:bg-white/10"
                disabled={speed >= 2}
              >
                +
              </Button>
            </div>
          </div>

          {/* Loop Toggle */}
          <Button
            onClick={() => setLoop(!loop)}
            variant="outline"
            size="sm"
            className={`${
              loop
                ? 'bg-cyan-900/30 border-cyan-400 text-cyan-300'
                : 'bg-[#1a1a2e]/60 border-white/20 text-gray-300'
            } hover:bg-white/10`}
          >
            <Repeat size={18} className={loop ? 'text-cyan-400' : ''} />
          </Button>

          {/* Fullscreen */}
          <Button
            onClick={handleFullscreen}
            variant="outline"
            size="sm"
            className="bg-[#1a1a2e]/60 border-white/20 text-gray-300 hover:bg-white/10"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
          <Slider
            value={[progress]}
            onValueChange={(value) => {
              const newTime = (value[0] / 100) * totalDuration;
              songPlayerService.seekToTime(newTime);
            }}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Linha {currentLineIndex + 1} de {lines.length}</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={playChords}
                  onChange={(e) => setPlayChords(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Reproduzir acordes</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Chord Sheet */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a2e]/80 to-[#2a2a3e]/60 border border-white/20 shadow-xl">
        <div className="space-y-1 font-mono text-sm max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-600 scrollbar-track-transparent">
          <AnimatePresence>
            {lines.map((line, index) => renderLine(line, index))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
