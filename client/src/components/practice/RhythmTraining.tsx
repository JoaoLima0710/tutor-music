/**
 * 🥁 Rhythm Training Component
 * 
 * Treino rítmico para desenvolver pulso e subdivisão.
 * 
 * Funcionalidades:
 * - Exercícios guiados (palmas no 2 e 4, subdivisões)
 * - Sincronização visual com pulso do metrônomo
 * - Detecção de atraso lógico (tempo de clique do usuário)
 * - Feedback textual simples (ex: "atrasado ~120ms")
 * 
 * REGRAS:
 * - NÃO cria novos nodes de áudio
 * - NÃO altera lógica do metrônomo
 * - NÃO adiciona bibliotecas externas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Hand,
  Music,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { metronomeService } from '@/services/MetronomeService';

type ExerciseType = 'backbeat' | 'subdivision' | 'pulse';

interface RhythmTrainingProps {
  onComplete?: (accuracy: number, avgDelay: number) => void;
  onExit?: () => void;
}

interface TimingResult {
  expectedTime: number;
  actualTime: number;
  delay: number; // positivo = atrasado, negativo = adiantado
  beat: number;
}

const TIMING_TOLERANCE_MS = 50; // Tolerância para considerar "perfeito"
const EXERCISE_CONFIG = {
  backbeat: {
    name: 'Palmas no 2 e 4',
    description: 'Bata palmas nos tempos 2 e 4 (backbeat)',
    targetBeats: [1, 3], // Índices 0-based: 1 = 2º tempo, 3 = 4º tempo
    bpm: 80,
  },
  subdivision: {
    name: 'Subdivisões',
    description: 'Bata em todas as subdivisões (semínimas)',
    targetBeats: [0, 1, 2, 3], // Todos os tempos
    bpm: 100,
  },
  pulse: {
    name: 'Pulso Interno',
    description: 'Mantenha o pulso batendo em todos os tempos',
    targetBeats: [0, 1, 2, 3], // Todos os tempos
    bpm: 120,
  },
};

export function RhythmTraining({ onComplete, onExit }: RhythmTrainingProps) {
  // Estado principal
  const [exerciseType, setExerciseType] = useState<ExerciseType>('backbeat');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isDownbeat, setIsDownbeat] = useState(false);
  const [bpm, setBpm] = useState(80);
  
  // Exercício e resultados
  const [targetBeats, setTargetBeats] = useState<number[]>([]);
  const [timingResults, setTimingResults] = useState<TimingResult[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<string>('');
  const [feedbackColor, setFeedbackColor] = useState<'green' | 'yellow' | 'red' | 'gray'>('gray');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  // Refs
  const expectedBeatTimesRef = useRef<Map<number, number>>(new Map());
  const beatCallbackRef = useRef<((beat: number, isDownbeat: boolean) => void) | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exerciseStartTimeRef = useRef<number>(0);

  // Configurar exercício
  useEffect(() => {
    const config = EXERCISE_CONFIG[exerciseType];
    setBpm(config.bpm);
    setTargetBeats(config.targetBeats);
    setTimingResults([]);
    setScore(0);
    setAttempts(0);
    setCurrentFeedback('');
    setFeedbackColor('gray');
  }, [exerciseType]);

  // Configurar callback do metrônomo
  useEffect(() => {
    beatCallbackRef.current = (beat: number, isDownbeat: boolean) => {
      setCurrentBeat(beat);
      setIsDownbeat(isDownbeat);
      
      // Armazenar tempo esperado para este beat
      if (targetBeats.includes(beat)) {
        expectedBeatTimesRef.current.set(beat, Date.now());
      }
    };

    metronomeService.onBeat(beatCallbackRef.current);

    return () => {
      if (beatCallbackRef.current) {
        metronomeService.onBeat(() => {}); // Limpar callback
      }
    };
  }, [targetBeats]);

  // Limpar feedback após timeout
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  // Handler para quando usuário bate/clica
  const handleUserTap = useCallback(() => {
    if (!isPlaying) return;

    const actualTime = Date.now();
    const currentExpectedTime = expectedBeatTimesRef.current.get(currentBeat);
    
    if (currentExpectedTime === undefined) {
      // Usuário bateu em tempo que não deveria
      setCurrentFeedback('Espere o tempo correto!');
      setFeedbackColor('red');
      setAttempts((prev) => prev + 1);
      
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      feedbackTimeoutRef.current = setTimeout(() => {
        setCurrentFeedback('');
        setFeedbackColor('gray');
      }, 1500);
      return;
    }

    const delay = actualTime - currentExpectedTime;
    const absDelay = Math.abs(delay);

    // Verificar se é um beat alvo
    if (!targetBeats.includes(currentBeat)) {
      setCurrentFeedback('Este não é o tempo correto!');
      setFeedbackColor('red');
      setAttempts((prev) => prev + 1);
      
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      feedbackTimeoutRef.current = setTimeout(() => {
        setCurrentFeedback('');
        setFeedbackColor('gray');
      }, 1500);
      return;
    }

    // Registrar resultado
    const result: TimingResult = {
      expectedTime: currentExpectedTime,
      actualTime,
      delay,
      beat: currentBeat,
    };

    setTimingResults((prev) => [...prev.slice(-19), result]); // Manter últimas 20
    setAttempts((prev) => prev + 1);

    // Calcular feedback
    let feedback = '';
    let color: 'green' | 'yellow' | 'red' | 'gray' = 'gray';

    if (absDelay <= TIMING_TOLERANCE_MS) {
      feedback = 'Perfeito! 🎯';
      color = 'green';
      setScore((prev) => prev + 1);
    } else if (delay > 0) {
      // Atrasado
      feedback = `Atrasado ~${Math.round(delay)}ms`;
      color = delay < 100 ? 'yellow' : 'red';
    } else {
      // Adiantado
      feedback = `Adiantado ~${Math.round(absDelay)}ms`;
      color = absDelay < 100 ? 'yellow' : 'red';
    }

    setCurrentFeedback(feedback);
    setFeedbackColor(color);

    // Limpar feedback após 1.5s
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = setTimeout(() => {
      setCurrentFeedback('');
      setFeedbackColor('gray');
    }, 1500);
  }, [isPlaying, currentBeat, targetBeats]);

  // Iniciar exercício
  const handleStart = async () => {
    try {
      await metronomeService.initialize();
      await metronomeService.start(bpm, '4/4');
      setIsPlaying(true);
      setTimingResults([]);
      setScore(0);
      setAttempts(0);
      setCurrentFeedback('');
      setFeedbackColor('gray');
      expectedBeatTimesRef.current.clear();
      exerciseStartTimeRef.current = Date.now();
    } catch (error) {
      console.error('Erro ao iniciar metrônomo:', error);
    }
  };

  // Pausar exercício
  const handlePause = () => {
    metronomeService.stop();
    setIsPlaying(false);
  };

  // Parar e resetar
  const handleReset = () => {
    metronomeService.stop();
    setIsPlaying(false);
    setCurrentBeat(0);
    setTimingResults([]);
    setScore(0);
    setAttempts(0);
    setCurrentFeedback('');
    setFeedbackColor('gray');
    expectedBeatTimesRef.current.clear();
  };

  // Calcular estatísticas
  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  const avgDelay = timingResults.length > 0
    ? Math.round(
        timingResults.reduce((sum, r) => sum + Math.abs(r.delay), 0) / timingResults.length
      )
    : 0;

  const config = EXERCISE_CONFIG[exerciseType];

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">🥁 Treino Rítmico</h2>
          {onExit && (
            <Button onClick={onExit} variant="ghost" size="sm" className="text-gray-400">
              Sair
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-400">Desenvolva seu pulso interno e precisão rítmica</p>
      </div>

      {/* Seletor de Exercício */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-2">Escolha o exercício:</p>
        <div className="grid grid-cols-3 gap-2">
          {(['backbeat', 'subdivision', 'pulse'] as ExerciseType[]).map((type) => {
            const exConfig = EXERCISE_CONFIG[type];
            return (
              <Button
                key={type}
                onClick={() => {
                  if (!isPlaying) {
                    setExerciseType(type);
                  }
                }}
                disabled={isPlaying}
                variant={exerciseType === type ? 'default' : 'outline'}
                className={
                  exerciseType === type
                    ? 'bg-purple-500 text-white'
                    : 'bg-transparent border-white/20 text-gray-300 hover:bg-white/5'
                }
                size="sm"
              >
                {exConfig.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Descrição do Exercício */}
      <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Music className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white">{config.name}</h3>
        </div>
        <p className="text-sm text-gray-300">{config.description}</p>
        <p className="text-xs text-gray-400 mt-2">
          Bata nos tempos: {config.targetBeats.map(b => b + 1).join(', ')}
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl p-3 bg-white/5 border border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-1">Precisão</p>
          <p className="text-xl font-bold text-cyan-400">{accuracy}%</p>
        </div>
        <div className="rounded-xl p-3 bg-white/5 border border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-1">Atraso Médio</p>
          <p className="text-xl font-bold text-yellow-400">{avgDelay}ms</p>
        </div>
        <div className="rounded-xl p-3 bg-white/5 border border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-1">Tentativas</p>
          <p className="text-xl font-bold text-white">{attempts}</p>
        </div>
      </div>

      {/* Indicadores de Compasso */}
      <div className="mb-6">
        <div className="flex justify-center gap-2 mb-4">
          {[0, 1, 2, 3].map((beat) => {
            const isTarget = targetBeats.includes(beat);
            const isActive = currentBeat === beat && isPlaying;
            
            return (
              <div
                key={beat}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? beat === 0
                      ? 'bg-orange-500 scale-125 shadow-lg shadow-orange-500/50'
                      : 'bg-purple-500 scale-110'
                    : isTarget
                    ? 'bg-purple-500/30 border-2 border-purple-500'
                    : 'bg-gray-700'
                }`}
              >
                <span className="text-white font-bold">{beat + 1}</span>
                {isTarget && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Hand className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Instrução visual */}
        <p className="text-center text-sm text-gray-400">
          {isPlaying
            ? `Bata quando o tempo ${targetBeats.map(b => b + 1).join(' ou ')} estiver ativo`
            : 'Clique em "Iniciar" para começar'}
        </p>
      </div>

      {/* Feedback de Timing */}
      <AnimatePresence>
        {currentFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 p-4 rounded-lg text-center ${
              feedbackColor === 'green'
                ? 'bg-green-500/20 border border-green-500/50'
                : feedbackColor === 'yellow'
                ? 'bg-yellow-500/20 border border-yellow-500/50'
                : feedbackColor === 'red'
                ? 'bg-red-500/20 border border-red-500/50'
                : 'bg-gray-500/20 border border-gray-500/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {feedbackColor === 'green' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
              {feedbackColor === 'yellow' && <TrendingUp className="w-5 h-5 text-yellow-400" />}
              {feedbackColor === 'red' && <TrendingDown className="w-5 h-5 text-red-400" />}
              <span
                className={`text-lg font-semibold ${
                  feedbackColor === 'green'
                    ? 'text-green-400'
                    : feedbackColor === 'yellow'
                    ? 'text-yellow-400'
                    : feedbackColor === 'red'
                    ? 'text-red-400'
                    : 'text-gray-400'
                }`}
              >
                {currentFeedback}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progresso */}
      {attempts > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progresso</span>
            <span>{score}/{attempts}</span>
          </div>
          <Progress value={accuracy} className="h-2" />
        </div>
      )}

      {/* Gráfico de Timing (últimos resultados) */}
      {timingResults.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-gray-400 mb-2">Últimos timings (ms):</p>
          <div className="flex items-end gap-1 h-20">
            {timingResults.slice(-10).map((result, index) => {
              const absDelay = Math.abs(result.delay);
              const maxDelay = 200; // Escala máxima
              const height = Math.min(100, (absDelay / maxDelay) * 100);
              const isLate = result.delay > 0;
              
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center justify-end"
                  title={`${isLate ? '+' : '-'}${Math.round(absDelay)}ms`}
                >
                  <div
                    className={`w-full rounded-t transition-all ${
                      absDelay <= TIMING_TOLERANCE_MS
                        ? 'bg-green-500'
                        : absDelay < 100
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="space-y-3">
        {!isPlaying ? (
          <Button
            onClick={handleStart}
            size="lg"
            className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] text-white font-bold"
          >
            <Play className="w-5 h-5 mr-2" />
            Iniciar Exercício
          </Button>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handlePause}
                size="lg"
                variant="outline"
                className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pausar
              </Button>
              <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Resetar
              </Button>
            </div>
            
            <Button
              onClick={handleUserTap}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg py-6"
            >
              <Hand className="w-6 h-6 mr-2" />
              BATER / PALMAS
            </Button>
          </>
        )}
      </div>

      {/* Dicas */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex items-start gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-300 mb-1">Dicas:</p>
            <ul className="space-y-1 text-xs">
              <li>• Ouça o metrônomo antes de bater</li>
              <li>• Tente sentir o pulso internamente</li>
              <li>• Mantenha consistência, não velocidade</li>
              <li>• O feedback mostra se você está adiantado ou atrasado</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
