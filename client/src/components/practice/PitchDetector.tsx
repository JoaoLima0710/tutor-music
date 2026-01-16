import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pitchDetectionService, PitchDetectionResult } from '@/services/PitchDetectionService';
import { toast } from 'sonner';

interface PitchDetectorProps {
  targetNote?: string;
  targetChord?: string;
  onNoteDetected?: (result: PitchDetectionResult) => void;
  onMatch?: (isMatch: boolean) => void;
}

export function PitchDetector({ targetNote, targetChord, onNoteDetected, onMatch }: PitchDetectorProps) {
  const [isActive, setIsActive] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPitch, setCurrentPitch] = useState<PitchDetectionResult | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [detectedNotes, setDetectedNotes] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    return () => {
      pitchDetectionService.dispose();
    };
  }, []);
  
  useEffect(() => {
    if (currentPitch && onNoteDetected) {
      onNoteDetected(currentPitch);
    }
  }, [currentPitch, onNoteDetected]);
  
  useEffect(() => {
    if (!currentPitch) return;
    
    let match = false;
    
    if (targetNote) {
      match = pitchDetectionService.isNoteMatch(currentPitch, targetNote);
    } else if (targetChord) {
      const chordNotes = pitchDetectionService.getChordNotes(targetChord);
      match = chordNotes.includes(currentPitch.note);
      
      // Track detected notes for chord completion
      if (match) {
        setDetectedNotes(prev => {
          const newSet = new Set(prev);
          newSet.add(currentPitch.note);
          return newSet;
        });
      }
    }
    
    setIsMatching(match);
    
    if (onMatch) {
      onMatch(match);
    }
  }, [currentPitch, targetNote, targetChord, onMatch]);
  
  const handleToggle = async () => {
    if (isActive) {
      pitchDetectionService.stop();
      setIsActive(false);
      setCurrentPitch(null);
      setDetectedNotes(new Set());
    } else {
      if (!isInitialized) {
        const initialized = await pitchDetectionService.initialize();
        if (!initialized) {
          toast.error('Não foi possível acessar o microfone');
          return;
        }
        setIsInitialized(true);
      }
      
      pitchDetectionService.start((result) => {
        setCurrentPitch(result);
      });
      
      setIsActive(true);
      toast.success('Detecção de pitch ativada');
    }
  };
  
  const getCentsColor = (cents: number): string => {
    const absCents = Math.abs(cents);
    if (absCents <= 10) return '#10b981'; // Green - in tune
    if (absCents <= 25) return '#eab308'; // Yellow - slightly off
    return '#ef4444'; // Red - out of tune
  };
  
  const getTuningIndicator = (cents: number): string => {
    if (cents < -10) return '♭♭';
    if (cents < -5) return '♭';
    if (cents > 10) return '♯♯';
    if (cents > 5) return '♯';
    return '✓';
  };
  
  const chordNotes = targetChord ? pitchDetectionService.getChordNotes(targetChord) : [];
  const chordProgress = targetChord 
    ? `${detectedNotes.size}/${chordNotes.length}`
    : null;
  
  return (
    <div className="rounded-3xl p-8 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Detector de Pitch</h3>
        <p className="text-gray-400">
          {targetNote && `Toque a nota: ${targetNote}`}
          {targetChord && `Toque o acorde: ${targetChord}`}
          {!targetNote && !targetChord && 'Toque qualquer nota'}
        </p>
      </div>
      
      {/* Pitch Display */}
      <AnimatePresence mode="wait">
        {isActive && currentPitch && (
          <motion.div
            key="pitch-display"
            className="mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            {/* Main Note Display */}
            <div className="relative mb-6">
              <div
                className={`
                  mx-auto w-48 h-48 rounded-full flex flex-col items-center justify-center
                  transition-all duration-300
                  ${isMatching 
                    ? 'bg-gradient-to-br from-[#10b981] to-[#059669] shadow-lg shadow-[#10b981]/50 scale-110' 
                    : 'bg-gradient-to-br from-[#06b6d4] to-[#0891b2] shadow-lg shadow-[#06b6d4]/30'
                  }
                `}
              >
                <span className="text-6xl font-bold text-white font-mono">
                  {currentPitch.note}
                </span>
                <span className="text-2xl text-white/80 font-semibold">
                  {currentPitch.octave}
                </span>
              </div>
              
              {/* Match Indicator */}
              <AnimatePresence>
                {isMatching && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-16 h-16 rounded-full bg-[#10b981] flex items-center justify-center shadow-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                  >
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Frequency & Clarity */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl p-4 bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-gray-400 mb-1">Frequência</p>
                <p className="text-xl font-bold text-white">
                  {currentPitch.frequency.toFixed(1)} Hz
                </p>
              </div>
              <div className="rounded-2xl p-4 bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-gray-400 mb-1">Clareza</p>
                <p className="text-xl font-bold text-white">
                  {(currentPitch.clarity * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            
            {/* Tuning Meter */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Afinação</span>
                <span 
                  className="font-bold font-mono"
                  style={{ color: getCentsColor(currentPitch.cents) }}
                >
                  {currentPitch.cents > 0 ? '+' : ''}{currentPitch.cents} cents
                </span>
              </div>
              
              {/* Visual Tuner */}
              <div className="relative h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                {/* Center Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50 z-10"></div>
                
                {/* Cents Indicator */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-8 rounded-full"
                  style={{
                    backgroundColor: getCentsColor(currentPitch.cents),
                    left: `calc(50% + ${currentPitch.cents}%)`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                  }}
                />
                
                {/* Tuning Indicator Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span 
                    className="text-3xl font-bold"
                    style={{ color: getCentsColor(currentPitch.cents) }}
                  >
                    {getTuningIndicator(currentPitch.cents)}
                  </span>
                </div>
              </div>
              
              {/* Scale Labels */}
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-50</span>
                <span>0</span>
                <span>+50</span>
              </div>
            </div>
            
            {/* Chord Progress */}
            {targetChord && (
              <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Notas do Acorde</span>
                  <span className="text-sm font-bold text-[#06b6d4]">{chordProgress}</span>
                </div>
                <div className="flex gap-2">
                  {chordNotes.map((note, index) => (
                    <div
                      key={index}
                      className={`
                        flex-1 h-10 rounded-lg flex items-center justify-center font-bold
                        transition-all duration-300
                        ${detectedNotes.has(note)
                          ? 'bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-lg'
                          : 'bg-white/5 text-gray-500'
                        }
                      `}
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        {isActive && !currentPitch && (
          <motion.div
            key="listening"
            className="mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="inline-block"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <Mic className="w-16 h-16 text-[#06b6d4] mb-4" />
            </motion.div>
            <p className="text-gray-400">Aguardando som...</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Control Button */}
      <Button
        onClick={handleToggle}
        size="lg"
        className={`
          w-full h-14 text-lg font-bold
          ${isActive
            ? 'bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#f87171] hover:to-[#ef4444]'
            : 'bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981]'
          }
          text-white
        `}
      >
        {isActive ? (
          <>
            <MicOff className="w-5 h-5 mr-2" />
            Parar Detecção
          </>
        ) : (
          <>
            <Mic className="w-5 h-5 mr-2" />
            Iniciar Detecção
          </>
        )}
      </Button>
    </div>
  );
}
