/**
 * Exercício Interativo de Acordes
 * Implementa feedback imediato (< 3 segundos)
 * 80% prática, 20% teoria
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  PlayCircle,
  RotateCcw,
  Volume2,
  Timer,
  Target,
  Zap,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useProgressionStore } from '@/stores/useProgressionStore';

interface ChordFinger {
  string: number;
  fret: number;
  finger: number;
}

interface ChordExerciseProps {
  chord: string;
  fingers: ChordFinger[];
  stringsToPlay: number[];
  onComplete: (accuracy: number, time: number) => void;
  targetRepetitions?: number;
}

// Cores para cada dedo
const fingerColors: Record<number, string> = {
  1: 'bg-blue-500',    // Indicador
  2: 'bg-green-500',   // Médio
  3: 'bg-yellow-500',  // Anelar
  4: 'bg-red-500',     // Mindinho
};

const fingerNames: Record<number, string> = {
  1: 'Indicador',
  2: 'Médio',
  3: 'Anelar',
  4: 'Mindinho',
};

export function InteractiveChordExercise({
  chord,
  fingers,
  stringsToPlay,
  onComplete,
  targetRepetitions = 5,
}: ChordExerciseProps) {
  const [phase, setPhase] = useState<'learn' | 'practice' | 'complete'>('learn');
  const [currentRep, setCurrentRep] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [timer, setTimer] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { addXP } = useGamificationStore();
  const { updateSkillProgress } = useProgressionStore();

  // Iniciar timer quando em modo prática
  useEffect(() => {
    if (phase === 'practice') {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 100);
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Limpar timeout de feedback
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  // Simular detecção de acorde (pode integrar com detecção real depois)
  const handleChordAttempt = useCallback((correct: boolean) => {
    // Feedback imediato (< 3 segundos é instantâneo aqui)
    setFeedback(correct ? 'correct' : 'incorrect');
    
    if (correct) {
      // Feedback tátil ao acertar
      import('@/services/HapticFeedbackService').then(({ hapticFeedbackService }) => {
        hapticFeedbackService.success();
      });
      
      setStreak(s => s + 1);
      setCurrentRep(r => r + 1);
      
      // Atualizar melhor tempo
      if (!bestTime || timer < bestTime) {
        setBestTime(timer);
      }
      
      // Dar XP
      const baseXP = 10;
      const streakBonus = Math.min(streak, 5) * 2;
      addXP(baseXP + streakBonus);
      
      // Verificar conclusão
      if (currentRep + 1 >= targetRepetitions) {
        const finalAccuracy = Math.round(((targetRepetitions - errors) / targetRepetitions) * 100);
        setAccuracy(finalAccuracy);
        setPhase('complete');
        
        // Feedback tátil ao completar módulo
        import('@/services/HapticFeedbackService').then(({ hapticFeedbackService }) => {
          hapticFeedbackService.complete();
        });
        
        // Atualizar progresso da habilidade
        const skillId = `chord-${chord.toLowerCase()}`;
        const progress = Math.min(100, finalAccuracy);
        updateSkillProgress(skillId, progress, finalAccuracy);
        
        onComplete(finalAccuracy, timer);
      }
    } else {
      setStreak(0);
      setErrors(e => e + 1);
    }
    
    // Limpar feedback após 1.5 segundos
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
      setTimer(0);
    }, 1500);
  }, [timer, bestTime, streak, currentRep, targetRepetitions, errors, chord, addXP, updateSkillProgress, onComplete]);

  // Tocar som do acorde
  const playChordSound = () => {
    // Integrar com serviço de áudio
    console.log(`Playing ${chord} chord`);
  };

  // Reiniciar exercício
  const restart = () => {
    setPhase('learn');
    setCurrentRep(0);
    setFeedback(null);
    setShowHint(true);
    setTimer(0);
    setBestTime(null);
    setStreak(0);
    setAccuracy(100);
    setErrors(0);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      {/* Header com informações */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Acorde {chord}</h2>
          <p className="text-gray-400 text-sm">
            {phase === 'learn' ? 'Aprenda o posicionamento' : 
             phase === 'practice' ? `${currentRep}/${targetRepetitions} repetições` :
             'Exercício Completo!'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {streak > 1 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-bold">{streak}x</span>
            </motion.div>
          )}
          
          {phase === 'practice' && (
            <div className="flex items-center gap-1 text-gray-400">
              <Timer className="w-4 h-4" />
              <span className="text-sm font-mono">{(timer / 1000).toFixed(1)}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Diagrama do Acorde */}
      <div className="relative mb-6">
        {/* Braço do violão */}
        <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-700/30">
          {/* Trastes */}
          <div className="grid grid-cols-5 gap-0">
            {/* Nut (pestana) */}
            <div className="col-span-5 h-2 bg-amber-200/50 rounded mb-2" />
            
            {/* 4 trastes */}
            {[1, 2, 3, 4].map(fret => (
              <div key={fret} className="col-span-5 border-b border-amber-600/30 py-3 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-amber-500/50 pr-2">
                  {fret}
                </div>
                
                {/* Cordas e dedos */}
                <div className="flex justify-between px-4">
                  {[6, 5, 4, 3, 2, 1].map(string => {
                    const finger = fingers.find(f => f.string === string && f.fret === fret);
                    
                    return (
                      <div key={string} className="relative">
                        {/* Corda */}
                        <div className="w-0.5 h-12 bg-amber-400/60 mx-auto" />
                        
                        {/* Dedo */}
                        {finger && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                              w-8 h-8 rounded-full ${fingerColors[finger.finger]} 
                              flex items-center justify-center text-white text-sm font-bold
                              shadow-lg ${showHint ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}`}
                          >
                            {finger.finger}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Números das cordas */}
          <div className="flex justify-between px-4 mt-2 text-xs text-amber-400/70">
            {[6, 5, 4, 3, 2, 1].map(string => (
              <span key={string} className={stringsToPlay.includes(string) ? 'text-green-400' : 'text-red-400/50'}>
                {stringsToPlay.includes(string) ? string : 'X'}
              </span>
            ))}
          </div>
        </div>

        {/* Feedback Visual */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute inset-0 flex items-center justify-center rounded-lg
                ${feedback === 'correct' ? 'bg-green-500/20' : 'bg-red-500/20'}`}
            >
              {feedback === 'correct' ? (
                <CheckCircle2 className="w-20 h-20 text-green-400" />
              ) : (
                <XCircle className="w-20 h-20 text-red-400" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legenda dos dedos */}
      {phase === 'learn' && (
        <div className="flex flex-wrap gap-3 mb-6 p-3 rounded-lg bg-white/5">
          {fingers.map(f => (
            <div key={`${f.string}-${f.fret}`} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${fingerColors[f.finger]} flex items-center justify-center text-white text-xs font-bold`}>
                {f.finger}
              </div>
              <span className="text-sm text-gray-300">
                {fingerNames[f.finger]}: {f.string}ª corda, {f.fret}º traste
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Progresso */}
      {phase === 'practice' && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progresso</span>
            <span>{currentRep}/{targetRepetitions}</span>
          </div>
          <Progress value={(currentRep / targetRepetitions) * 100} className="h-2" />
        </div>
      )}

      {/* Resultado Final */}
      {phase === 'complete' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-10 h-10 text-yellow-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Parabéns!</h3>
              <p className="text-gray-300">Você dominou o acorde {chord}!</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">{accuracy}%</p>
              <p className="text-xs text-gray-400">Precisão</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-400">{(timer / 1000).toFixed(1)}s</p>
              <p className="text-xs text-gray-400">Tempo Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">+{(targetRepetitions - errors) * 10 + streak * 2}</p>
              <p className="text-xs text-gray-400">XP Ganho</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Ações */}
      <div className="flex gap-3">
        {phase === 'learn' && (
          <>
            <Button
              onClick={playChordSound}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Ouvir Som
            </Button>
            <Button
              onClick={() => {
                setPhase('practice');
                setShowHint(false);
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Começar Prática
            </Button>
          </>
        )}
        
        {phase === 'practice' && (
          <>
            <Button
              onClick={() => setShowHint(!showHint)}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {showHint ? 'Esconder Dica' : 'Mostrar Dica'}
            </Button>
            <Button
              onClick={() => handleChordAttempt(true)}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Acertei!
            </Button>
            <Button
              onClick={() => handleChordAttempt(false)}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Errei
            </Button>
          </>
        )}
        
        {phase === 'complete' && (
          <>
            <Button
              onClick={restart}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Praticar Mais
            </Button>
            <Button
              onClick={() => onComplete(accuracy, timer)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              <Target className="w-4 h-4 mr-2" />
              Próximo Exercício
            </Button>
          </>
        )}
      </div>

      {/* Dica de feedback rápido */}
      {phase === 'practice' && (
        <p className="text-center text-xs text-gray-500 mt-4">
          Toque o acorde e clique em "Acertei" se o som estiver limpo, ou "Errei" se houver zumbido
        </p>
      )}
    </Card>
  );
}
