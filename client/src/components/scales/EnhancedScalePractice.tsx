/**
 * 🎸 Enhanced Scale Practice Component
 * 
 * Treino de escalas e digitação com foco em coordenação, não velocidade.
 * 
 * Funcionalidades:
 * - Objetivos explícitos por exercício
 * - Força execução limpa antes de acelerar
 * - Pausas obrigatórias entre repetições
 * - Mensagens pedagógicas contextuais
 * 
 * REGRAS:
 * - NÃO altera serviços de áudio
 * - NÃO muda escalas existentes
 * - NÃO cria síntese sonora nova
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  X,
  TrendingUp,
  Volume2,
  Target,
  Lock,
  Unlock,
  Clock,
  Lightbulb,
  Hand,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/hooks/useAudio';
import { pitchDetectionService } from '@/services/PitchDetectionService';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { toast } from 'sonner';

interface Scale {
  id: string;
  name: string;
  notes: string[];
  intervals: string[];
  fretPositions: { string: number; fret: number; note: string }[];
}

interface EnhancedScalePracticeProps {
  scale: Scale;
  onComplete?: () => void;
}

type PracticeMode = 'ascending' | 'descending' | 'thirds' | 'fourths' | 'sequence';

// Objetivos explícitos por modo de prática
const PRACTICE_MODES = [
  {
    id: 'ascending' as PracticeMode,
    name: 'Ascendente',
    description: 'Toque as notas de baixo para cima',
    icon: '⬆️',
    objective: 'Desenvolver coordenação básica mão esquerda/direita',
    focus: 'Movimento suave e controlado',
    minAccuracy: 85,
    requiredRepetitions: 3,
  },
  {
    id: 'descending' as PracticeMode,
    name: 'Descendente',
    description: 'Toque as notas de cima para baixo',
    icon: '⬇️',
    objective: 'Coordenar movimento reverso com precisão',
    focus: 'Controle na descida, evitar tensão',
    minAccuracy: 85,
    requiredRepetitions: 3,
  },
  {
    id: 'thirds' as PracticeMode,
    name: 'Terças',
    description: 'Toque pulando uma nota (1-3-2-4-3-5...)',
    icon: '🎯',
    objective: 'Melhorar saltos entre notas distantes',
    focus: 'Antecipação e precisão nos saltos',
    minAccuracy: 80,
    requiredRepetitions: 4,
  },
  {
    id: 'fourths' as PracticeMode,
    name: 'Quartas',
    description: 'Toque pulando duas notas (1-4-2-5-3-6...)',
    icon: '🎪',
    objective: 'Desenvolver coordenação para intervalos maiores',
    focus: 'Movimento amplo e controlado',
    minAccuracy: 75,
    requiredRepetitions: 5,
  },
  {
    id: 'sequence' as PracticeMode,
    name: 'Sequência',
    description: 'Toque em padrões (1-2-3-2-3-4-3-4-5...)',
    icon: '🔄',
    objective: 'Coordenar padrões complexos de movimento',
    focus: 'Memória motora e fluidez',
    minAccuracy: 80,
    requiredRepetitions: 4,
  },
];

// Velocidades com travamento
const SPEEDS = [
  { bpm: 60, label: 'Lento', color: 'text-green-400', minAccuracy: 0 },
  { bpm: 80, label: 'Moderado', color: 'text-yellow-400', minAccuracy: 85 },
  { bpm: 100, label: 'Médio', color: 'text-orange-400', minAccuracy: 90 },
  { bpm: 120, label: 'Rápido', color: 'text-red-400', minAccuracy: 95 },
];

// Mensagens pedagógicas contextuais
const PEDAGOGICAL_MESSAGES = {
  start: 'Relaxe os ombros e mantenha os dedos curvados',
  during: 'Mantenha o pulso solto, evite tensão',
  pause: 'Aproveite a pausa para relaxar a mão',
  error: 'Respire e tente novamente com mais calma',
  success: 'Ótimo! Mantenha esse controle',
  speedLocked: 'Domine esta velocidade antes de acelerar',
  speedUnlocked: 'Você pode aumentar a velocidade agora',
};

export function EnhancedScalePractice({ scale, onComplete }: EnhancedScalePracticeProps) {
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('ascending');
  const [speed, setSpeed] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [practiceNotes, setPracticeNotes] = useState<string[]>([]);
  const [correctNotes, setCorrectNotes] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  
  // Sistema de coordenação
  const [currentRepetition, setCurrentRepetition] = useState(0);
  const [repetitionAccuracy, setRepetitionAccuracy] = useState<number[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseCountdown, setPauseCountdown] = useState(0);
  const [isSpeedLocked, setIsSpeedLocked] = useState(true);
  const [pedagogicalMessage, setPedagogicalMessage] = useState<string>('');
  const [consecutiveCleanReps, setConsecutiveCleanReps] = useState(0);
  
  const { addXP } = useGamificationStore();
  
  const currentMode = PRACTICE_MODES.find(m => m.id === practiceMode)!;
  const currentSpeed = SPEEDS.find(s => s.bpm === speed)!;

  // Gerar sequência de notas baseada no modo de prática
  useEffect(() => {
    const notes = scale.notes;
    let sequence: string[] = [];

    switch (practiceMode) {
      case 'ascending':
        sequence = [...notes];
        break;
      case 'descending':
        sequence = [...notes].reverse();
        break;
      case 'thirds':
        for (let i = 0; i < notes.length - 2; i++) {
          sequence.push(notes[i], notes[i + 2]);
        }
        sequence.push(notes[notes.length - 2], notes[notes.length - 1]);
        break;
      case 'fourths':
        for (let i = 0; i < notes.length - 3; i++) {
          sequence.push(notes[i], notes[i + 3]);
        }
        break;
      case 'sequence':
        for (let i = 0; i < notes.length - 2; i++) {
          sequence.push(notes[i], notes[i + 1], notes[i + 2]);
        }
        break;
    }

    setPracticeNotes(sequence);
    setCurrentNoteIndex(0);
    setCurrentRepetition(0);
    setRepetitionAccuracy([]);
    setConsecutiveCleanReps(0);
    setIsSpeedLocked(true);
  }, [practiceMode, scale]);

  // Verificar se pode desbloquear velocidade
  useEffect(() => {
    const mode = PRACTICE_MODES.find(m => m.id === practiceMode);
    if (!mode) return;
    
    if (repetitionAccuracy.length >= mode.requiredRepetitions) {
      const recentAccuracies = repetitionAccuracy.slice(-mode.requiredRepetitions);
      const avgAccuracy = recentAccuracies.reduce((sum, acc) => sum + acc, 0) / recentAccuracies.length;
      const allClean = recentAccuracies.every(acc => acc >= mode.minAccuracy);
      
      if (avgAccuracy >= mode.minAccuracy && allClean) {
        setIsSpeedLocked(false);
        setPedagogicalMessage(PEDAGOGICAL_MESSAGES.speedUnlocked);
        setConsecutiveCleanReps(mode.requiredRepetitions);
      } else {
        setIsSpeedLocked(true);
        setPedagogicalMessage(PEDAGOGICAL_MESSAGES.speedLocked);
      }
    } else {
      setIsSpeedLocked(true);
    }
  }, [repetitionAccuracy, practiceMode]);

  // Sistema de áudio: hook para tocar escala
  const { playNotes } = useAudio();
  const playScale = async () => {
    try {
      setIsPlaying(true);
      const interval = (60 / speed) * 1000;
      for (let i = 0; i < practiceNotes.length; i++) {
        setCurrentNoteIndex(i);
        await playNotes([practiceNotes[i] + '4'], { duration: 0.4 });
        await new Promise(resolve => setTimeout(resolve, interval));
      }
      setCurrentNoteIndex(0);
    } catch (error) {
      console.error('Erro ao tocar escala:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  // Iniciar prática com detecção de pitch
  const startPractice = async () => {
    try {
      const initialized = await pitchDetectionService.initialize();
      if (!initialized) {
        toast.error('Erro ao inicializar detecção de pitch.');
        return;
      }
      
      setIsPracticing(true);
      setCurrentNoteIndex(0);
      setCorrectNotes(0);
      setTotalAttempts(0);
      setCurrentRepetition(0);
      setRepetitionAccuracy([]);
      setConsecutiveCleanReps(0);
      setPedagogicalMessage(PEDAGOGICAL_MESSAGES.start);
      
      // Iniciar detecção com callback
      pitchDetectionService.start((result) => {
        if (result) {
          setDetectedNote(result.note);
          checkNote(result.note);
        }
      });
      
      toast.success('Prática iniciada! Foque em coordenação, não velocidade.');
    } catch (error) {
      toast.error('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  // Verificar se a nota tocada está correta
  const checkNote = (note: string) => {
    const expectedNote = practiceNotes[currentNoteIndex].replace(/\d+/, '');
    const detectedNoteClean = note.replace(/\d+/, '');

    if (detectedNoteClean === expectedNote) {
      setCorrectNotes(prev => prev + 1);
      setTotalAttempts(prev => prev + 1);
      setPedagogicalMessage(PEDAGOGICAL_MESSAGES.success);
      
      // Feedback tátil ao acertar
      import('@/services/HapticFeedbackService').then(({ hapticFeedbackService }) => {
        hapticFeedbackService.success();
      });
      
      // Avançar para próxima nota
      if (currentNoteIndex < practiceNotes.length - 1) {
        setCurrentNoteIndex(prev => prev + 1);
      } else {
        // Completou uma repetição
        completeRepetition();
      }
    } else {
      setTotalAttempts(prev => prev + 1);
      setPedagogicalMessage(PEDAGOGICAL_MESSAGES.error);
      
      toast.error(`❌ Esperado: ${expectedNote}, Tocado: ${detectedNoteClean}`, {
        duration: 1000,
      });
    }
  };

  // Completar uma repetição
  const completeRepetition = () => {
    const mode = PRACTICE_MODES.find(m => m.id === practiceMode);
    if (!mode) return;
    
    const repAccuracy = totalAttempts > 0
      ? Math.round((correctNotes / totalAttempts) * 100)
      : 0;
    
    setRepetitionAccuracy(prev => [...prev, repAccuracy]);
    setCurrentRepetition(prev => prev + 1);
    
    // Verificar se foi uma repetição limpa
    if (repAccuracy >= mode.minAccuracy) {
      setConsecutiveCleanReps(prev => prev + 1);
    } else {
      setConsecutiveCleanReps(0);
    }
    
    // Pausa obrigatória
    startPause();
  };

  // Iniciar pausa obrigatória
  const startPause = () => {
    setIsPaused(true);
    setPauseCountdown(5); // 5 segundos de pausa
    
    const interval = setInterval(() => {
      setPauseCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          endPause();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Finalizar pausa
  const endPause = () => {
    setIsPaused(false);
    setCurrentNoteIndex(0);
    setCorrectNotes(0);
    setTotalAttempts(0);
    setPedagogicalMessage(PEDAGOGICAL_MESSAGES.during);
  };

  // Completar prática completa
  const completePractice = () => {
    stopPractice();
    
    const finalAccuracy = repetitionAccuracy.length > 0
      ? Math.round(repetitionAccuracy.reduce((sum, acc) => sum + acc, 0) / repetitionAccuracy.length)
      : 0;
    
    const xpGained = Math.round(finalAccuracy * 2);
    addXP(xpGained);
    
    // Feedback tátil ao completar módulo
    import('@/services/HapticFeedbackService').then(({ hapticFeedbackService }) => {
      hapticFeedbackService.complete();
    });
    
    toast.success(`Parabéns! Você completou ${currentRepetition} repetições com ${finalAccuracy}% de precisão média!`);
    
    if (onComplete) {
      onComplete();
    }
  };

  // Parar prática
  const stopPractice = () => {
    setIsPracticing(false);
    setIsPaused(false);
    pitchDetectionService.stop();
    setDetectedNote(null);
  };

  // Resetar prática
  const reset = () => {
    stopPractice();
    setCurrentNoteIndex(0);
    setCorrectNotes(0);
    setTotalAttempts(0);
    setCurrentRepetition(0);
    setRepetitionAccuracy([]);
    setConsecutiveCleanReps(0);
    setIsSpeedLocked(true);
    setPedagogicalMessage('');
  };

  // Aumentar velocidade (se desbloqueado)
  const increaseSpeed = () => {
    if (isSpeedLocked) return;
    
    const currentIndex = SPEEDS.findIndex(s => s.bpm === speed);
    if (currentIndex < SPEEDS.length - 1) {
      const newSpeed = SPEEDS[currentIndex + 1];
      setSpeed(newSpeed.bpm);
      setIsSpeedLocked(true); // Travar novamente até atingir precisão na nova velocidade
      setConsecutiveCleanReps(0);
      setRepetitionAccuracy([]);
      setCurrentRepetition(0);
      setPedagogicalMessage(`Velocidade aumentada! Domine ${newSpeed.bpm} BPM antes de acelerar novamente.`);
      toast.info(`Velocidade aumentada para ${newSpeed.bpm} BPM. Domine esta velocidade antes de acelerar novamente.`);
    }
  };

  const accuracy = totalAttempts > 0 ? Math.round((correctNotes / totalAttempts) * 100) : 0;
  const avgAccuracy = repetitionAccuracy.length > 0
    ? Math.round(repetitionAccuracy.reduce((sum, acc) => sum + acc, 0) / repetitionAccuracy.length)
    : 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">🎸 Treino de Coordenação</h2>
        <p className="text-sm text-gray-400">Foco em coordenação e controle, não velocidade</p>
      </div>

      {/* Objetivo do Exercício */}
      <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">Objetivo: {currentMode.objective}</h3>
            <p className="text-sm text-gray-300 mb-2">{currentMode.focus}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>Precisão mínima: {currentMode.minAccuracy}%</span>
              <span>Repetições necessárias: {currentMode.requiredRepetitions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensagem Pedagógica */}
      <AnimatePresence>
        {pedagogicalMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-start gap-2"
          >
            <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-200 flex-1">{pedagogicalMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estatísticas */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl p-3 bg-white/5 border border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-1">Repetição</p>
          <p className="text-xl font-bold text-white">{currentRepetition}</p>
        </div>
        <div className="rounded-xl p-3 bg-white/5 border border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-1">Precisão Atual</p>
          <p className="text-xl font-bold text-cyan-400">{accuracy}%</p>
        </div>
        <div className="rounded-xl p-3 bg-white/5 border border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-1">Média</p>
          <p className="text-xl font-bold text-green-400">{avgAccuracy}%</p>
        </div>
        <div className="rounded-xl p-3 bg-white/5 border border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-1">Limpas</p>
          <p className="text-xl font-bold text-purple-400">{consecutiveCleanReps}/{currentMode.requiredRepetitions}</p>
        </div>
      </div>

      {/* Modo de Prática */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-3">Modo de Prática</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {PRACTICE_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                if (!isPracticing) {
                  setPracticeMode(mode.id);
                }
              }}
              disabled={isPracticing}
              className={`
                p-3 rounded-xl border-2 transition-all text-left
                ${practiceMode === mode.id
                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400'
                  : 'bg-white/5 border-white/10 hover:border-purple-400/50'
                }
                ${isPracticing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="text-xl mb-1">{mode.icon}</div>
              <p className="font-bold text-white text-xs">{mode.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Velocidade com Travamento */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">Velocidade (BPM)</h3>
          {isSpeedLocked ? (
            <Badge variant="outline" className="border-orange-500/50 text-orange-400 text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Bloqueado
            </Badge>
          ) : (
            <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs">
              <Unlock className="w-3 h-3 mr-1" />
              Desbloqueado
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {SPEEDS.map((s) => {
            const isLocked = s.minAccuracy > 0 && (avgAccuracy < s.minAccuracy || isSpeedLocked);
            const isCurrent = speed === s.bpm;
            
            return (
              <button
                key={s.bpm}
                onClick={() => {
                  if (!isLocked && !isPracticing) {
                    setSpeed(s.bpm);
                  }
                }}
                disabled={isLocked || isPracticing}
                className={`
                  p-3 rounded-xl border-2 transition-all relative
                  ${isCurrent
                    ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-400'
                    : isLocked
                    ? 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed'
                    : 'bg-white/5 border-white/10 hover:border-cyan-400/50'
                  }
                `}
                title={isLocked ? `Precisa de ${s.minAccuracy}% de precisão média` : ''}
              >
                {isLocked && (
                  <Lock className="w-4 h-4 text-gray-500 absolute top-1 right-1" />
                )}
                <p className={`text-2xl font-bold ${s.color}`}>{s.bpm}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </button>
            );
          })}
        </div>
        {!isSpeedLocked && currentRepetition >= currentMode.requiredRepetitions && (
          <Button
            onClick={increaseSpeed}
            size="sm"
            className="mt-2 w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Aumentar Velocidade
          </Button>
        )}
      </div>

      {/* Pausa Obrigatória */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-6 p-6 rounded-xl bg-blue-500/20 border-2 border-blue-500/50 text-center"
          >
            <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Pausa Obrigatória</h3>
            <p className="text-3xl font-bold text-blue-400 mb-2">{pauseCountdown}s</p>
            <p className="text-sm text-gray-300">{PEDAGOGICAL_MESSAGES.pause}</p>
            <p className="text-xs text-gray-400 mt-2">
              Relaxe a mão, respire e prepare-se para a próxima repetição
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modo Interativo - Destaque Visual */}
      {isPracticing && !isPaused && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 border-2 border-purple-400 rounded-3xl shadow-2xl mb-6"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">🎸 Toque Esta Nota:</h3>
            
            {/* Nota Atual */}
            <motion.div
              key={currentNoteIndex}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block"
            >
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_60px_rgba(6,182,212,0.6)] mb-6">
                <span className="text-7xl font-black text-white">
                  {practiceNotes[currentNoteIndex]}
                </span>
              </div>
            </motion.div>

            {/* Progresso */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="px-6 py-3 bg-white/10 rounded-xl">
                <p className="text-sm text-gray-400">Nota</p>
                <p className="text-2xl font-bold text-white">{currentNoteIndex + 1} / {practiceNotes.length}</p>
              </div>
              <div className="px-6 py-3 bg-green-500/20 rounded-xl border border-green-400/30">
                <p className="text-sm text-gray-400">Acertos</p>
                <p className="text-2xl font-bold text-green-400">{correctNotes}</p>
              </div>
            </div>

            {/* Nota Detectada */}
            <div className="flex items-center justify-center gap-3">
              <Volume2 className="w-6 h-6 text-purple-400 animate-pulse" />
              <span className="text-lg text-gray-300">Detectando:</span>
              <span className="text-2xl font-bold text-purple-400">
                {detectedNote || '---'}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sequência de Notas */}
      <div className="p-6 bg-[#1a1a2e]/60 backdrop-blur-xl rounded-2xl border border-white/10 mb-6">
        <h3 className="text-lg font-bold text-white mb-4">Sequência</h3>
        <div className="flex flex-wrap gap-2">
          {practiceNotes.map((note, index) => (
            <motion.div
              key={`${note}-${index}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: currentNoteIndex === index && isPracticing && !isPaused ? 1.2 : 1,
                opacity: 1,
              }}
              className={`
                px-4 py-2 rounded-lg font-bold transition-all
                ${currentNoteIndex === index && isPracticing && !isPaused
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                  : index < currentNoteIndex && isPracticing
                  ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                  : 'bg-white/5 text-gray-400'
                }
              `}
            >
              {note}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progresso de Repetições */}
      {currentRepetition > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Repetições Completas</span>
            <span>{currentRepetition} / {currentMode.requiredRepetitions} (mínimo)</span>
          </div>
          <Progress value={(currentRepetition / currentMode.requiredRepetitions) * 100} className="h-2" />
          <div className="flex gap-2 mt-2">
            {repetitionAccuracy.map((acc, index) => (
              <Badge
                key={index}
                variant={acc >= currentMode.minAccuracy ? 'default' : 'outline'}
                className={
                  acc >= currentMode.minAccuracy
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500/20 text-red-400 border-red-500/50'
                }
              >
                {acc}%
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={playScale}
          disabled={isPlaying || isPracticing}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Tocando...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Ouvir Demonstração
            </>
          )}
        </Button>

        {!isPracticing ? (
          <Button
            onClick={startPractice}
            disabled={isPlaying}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-6 font-bold"
          >
            <Play className="w-5 h-5 mr-2" />
            🎤 Iniciar Prática
          </Button>
        ) : (
          <Button
            onClick={stopPractice}
            variant="destructive"
            className="flex-1"
            disabled={isPaused}
          >
            <Pause className="w-4 h-4 mr-2" />
            Parar Prática
          </Button>
        )}

        <Button
          onClick={reset}
          variant="outline"
          className="bg-white/5 border-white/10 hover:bg-white/10"
          disabled={isPaused}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Resetar
        </Button>
      </div>

      {/* Dicas de Coordenação */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex items-start gap-2 text-sm text-gray-400">
          <Hand className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-300 mb-1">Dicas de Coordenação:</p>
            <ul className="space-y-1 text-xs">
              <li>• Mantenha os dedos curvados, não esticados</li>
              <li>• Relaxe o pulso e os ombros</li>
              <li>• Foque em precisão, não velocidade</li>
              <li>• Use as pausas para descansar e refletir</li>
              <li>• Domine cada velocidade antes de acelerar</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
