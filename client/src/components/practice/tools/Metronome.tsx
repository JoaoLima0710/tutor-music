import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { metronomeService, TimeSignature } from '@/services/MetronomeService';

interface MetronomeProps {
  defaultBpm?: number;
  defaultTimeSignature?: TimeSignature;
}

export function Metronome({ defaultBpm = 120, defaultTimeSignature = '4/4' }: MetronomeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(defaultBpm);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>(defaultTimeSignature);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isDownbeat, setIsDownbeat] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  
  useEffect(() => {
    metronomeService.onBeat((beat, downbeat) => {
      setCurrentBeat(beat);
      setIsDownbeat(downbeat);
    });
    
    return () => {
      metronomeService.stop();
    };
  }, []);
  
  const handlePlayPause = async () => {
    if (isPlaying) {
      metronomeService.stop();
      setIsPlaying(false);
      setCurrentBeat(0);
    } else {
      await metronomeService.start(bpm, timeSignature);
      setIsPlaying(true);
    }
  };
  
  const handleBpmChange = (delta: number) => {
    const newBpm = Math.max(40, Math.min(240, bpm + delta));
    setBpm(newBpm);
    metronomeService.setBpm(newBpm);
  };
  
  const handleTimeSignatureChange = (newTimeSignature: TimeSignature) => {
    setTimeSignature(newTimeSignature);
    metronomeService.setTimeSignature(newTimeSignature);
    setCurrentBeat(0);
  };
  
  const handleTap = () => {
    const newBpm = metronomeService.tap();
    setTapCount(prev => prev + 1);
    
    if (newBpm !== null) {
      setBpm(newBpm);
      if (isPlaying) {
        metronomeService.setBpm(newBpm);
      }
    }
    
    // Reset tap count after 2 seconds of inactivity
    setTimeout(() => {
      setTapCount(0);
      metronomeService.resetTap();
    }, 2000);
  };
  
  const getBeatsArray = (): number[] => {
    const beatsMap: Record<TimeSignature, number> = {
      '4/4': 4,
      '3/4': 3,
      '6/8': 6,
      '2/4': 2,
    };
    return Array.from({ length: beatsMap[timeSignature] }, (_, i) => i);
  };
  
  const beats = getBeatsArray();
  
  return (
    <div className="rounded-3xl p-8 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-white/10 shadow-2xl">
      {/* BPM Display */}
      <div className="text-center mb-8">
        <div className="inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] mb-3">
          <span className="text-sm font-semibold text-white/80">BPM</span>
        </div>
        <div className="text-7xl font-bold text-white mb-2 font-mono">{bpm}</div>
        <p className="text-gray-400 text-sm">Batidas por minuto</p>
      </div>
      
      {/* BPM Controls */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <Button
          onClick={() => handleBpmChange(-10)}
          size="lg"
          className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <Minus className="w-6 h-6" />
        </Button>
        
        <Button
          onClick={() => handleBpmChange(-1)}
          size="lg"
          className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <Minus className="w-4 h-4" />
        </Button>
        
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => handleBpmChange(10)}
            size="sm"
            className="w-20 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs"
          >
            +10
          </Button>
          <Button
            onClick={() => handleBpmChange(1)}
            size="sm"
            className="w-20 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs"
          >
            +1
          </Button>
        </div>
      </div>
      
      {/* Visual Beat Indicator */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {beats.map((beat) => (
          <motion.div
            key={beat}
            className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-xl ${
              currentBeat === beat && isPlaying
                ? beat === 0
                  ? 'bg-gradient-to-br from-[#06b6d4] to-[#0891b2] border-[#22d3ee] text-white shadow-lg shadow-[#06b6d4]/50'
                  : 'bg-gradient-to-br from-[#a855f7] to-[#8b5cf6] border-[#c084fc] text-white shadow-lg shadow-[#a855f7]/50'
                : 'bg-[#1a1a2e] border-white/20 text-gray-500'
            }`}
            animate={
              currentBeat === beat && isPlaying
                ? {
                    scale: [1, 1.2, 1],
                    transition: { duration: 0.15 },
                  }
                : { scale: 1 }
            }
          >
            {beat + 1}
          </motion.div>
        ))}
      </div>
      
      {/* Time Signature Selector */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {(['4/4', '3/4', '6/8', '2/4'] as TimeSignature[]).map((ts) => (
          <Button
            key={ts}
            onClick={() => handleTimeSignatureChange(ts)}
            variant={timeSignature === ts ? 'default' : 'outline'}
            className={
              timeSignature === ts
                ? 'bg-gradient-to-r from-[#a855f7] to-[#8b5cf6] text-white font-bold'
                : 'bg-transparent border-white/20 text-gray-300 hover:bg-white/5'
            }
          >
            {ts}
          </Button>
        ))}
      </div>
      
      {/* Play/Pause Button */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={handlePlayPause}
          size="lg"
          className={`w-full h-16 text-lg font-bold rounded-2xl ${
            isPlaying
              ? 'bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#f87171] hover:to-[#ef4444]'
              : 'bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981]'
          } text-white shadow-lg`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-6 h-6 mr-2" />
              Parar
            </>
          ) : (
            <>
              <Play className="w-6 h-6 mr-2" />
              Iniciar
            </>
          )}
        </Button>
        
        {/* Tap Tempo Button */}
        <Button
          onClick={handleTap}
          size="lg"
          className="w-full h-14 text-base font-semibold rounded-2xl bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#fb923c] hover:to-[#f97316] text-white shadow-lg"
        >
          Tap Tempo {tapCount > 0 && `(${tapCount})`}
        </Button>
      </div>
      
      {/* Presets */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-sm font-semibold text-gray-400 mb-3 text-center">Presets Comuns</p>
        <div className="grid grid-cols-4 gap-2">
          {[60, 80, 100, 120, 140, 160, 180, 200].map((presetBpm) => (
            <Button
              key={presetBpm}
              onClick={() => {
                setBpm(presetBpm);
                if (isPlaying) {
                  metronomeService.setBpm(presetBpm);
                }
              }}
              size="sm"
              variant="outline"
              className={`${
                bpm === presetBpm
                  ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white border-transparent'
                  : 'bg-transparent border-white/20 text-gray-300 hover:bg-white/5'
              }`}
            >
              {presetBpm}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
