/**
 * 🏃 Motor Coordination Exercises Component
 * 
 * Exercícios de coordenação motora explícitos, sem áudio.
 * 
 * Funcionalidades:
 * - Exercícios silenciosos (digitação muda)
 * - Exercícios só de mão direita (batidas/palmas)
 * - Sessões curtas com pausa obrigatória
 * - Feedback de fadiga (texto simples)
 * 
 * REGRAS:
 * - NÃO reproduz som
 * - NÃO acessa AudioContext
 * - NÃO cria dependências
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Hand,
  Target,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle2,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

type ExerciseType = 'silent-fingering' | 'right-hand-only' | 'alternating-hands';

interface MotorCoordinationExercisesProps {
  onComplete?: (totalSessions: number, avgFatigue: number) => void;
  onExit?: () => void;
}

interface ExerciseConfig {
  id: ExerciseType;
  name: string;
  description: string;
  icon: string;
  duration: number; // segundos
  restDuration: number; // segundos
  pattern: string[]; // padrão de movimento
}

const EXERCISE_CONFIGS: Record<ExerciseType, ExerciseConfig> = {
  'silent-fingering': {
    id: 'silent-fingering',
    name: 'Digitação Muda',
    description: 'Toque os padrões no braço do violão sem fazer som',
    icon: '🤫',
    duration: 30,
    restDuration: 15,
    pattern: ['1', '2', '3', '4', '1', '2', '3', '4'], // dedos 1-4
  },
  'right-hand-only': {
    id: 'right-hand-only',
    name: 'Mão Direita',
    description: 'Bata palmas ou batidas rítmicas apenas com a mão direita',
    icon: '👋',
    duration: 30,
    restDuration: 15,
    pattern: ['BAT', 'BAT', 'BAT', 'BAT'], // batidas
  },
  'alternating-hands': {
    id: 'alternating-hands',
    name: 'Mãos Alternadas',
    description: 'Coordene movimentos alternados entre mãos',
    icon: '🤝',
    duration: 20,
    restDuration: 20,
    pattern: ['E', 'D', 'E', 'D', 'E', 'D'], // Esquerda, Direita
  },
};

type FatigueLevel = 'none' | 'low' | 'medium' | 'high';

const FATIGUE_MESSAGES: Record<FatigueLevel, string> = {
  none: 'Mãos relaxadas',
  low: 'Leve tensão detectada - respire',
  medium: 'Fadiga moderada - descanse mais',
  high: 'Fadiga alta - pare e descanse',
};

export function MotorCoordinationExercises({
  onComplete,
  onExit,
}: MotorCoordinationExercisesProps) {
  const [exerciseType, setExerciseType] = useState<ExerciseType>('silent-fingering');
  const [isActive, setIsActive] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [fatigueLevel, setFatigueLevel] = useState<FatigueLevel>('none');
  const [fatigueHistory, setFatigueHistory] = useState<FatigueLevel[]>([]);
  const [userTaps, setUserTaps] = useState<number[]>([]); // timestamps dos toques
  const [missedTaps, setMissedTaps] = useState(0);
  const [completedPatterns, setCompletedPatterns] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<Array<{
    sessionNumber: number;
    avgTime: number;
    consistency: number;
    commonError: string;
    timestamp: number;
  }>>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTimeRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);

  const config = EXERCISE_CONFIGS[exerciseType];

  // Calcular fadiga baseado em padrão de resposta
  const calculateFatigue = useCallback(() => {
    if (userTaps.length < 3) return 'none';

    const recentTaps = userTaps.slice(-10);
    if (recentTaps.length < 3) return 'none';

    // Calcular intervalos entre toques
    const intervals: number[] = [];
    for (let i = 1; i < recentTaps.length; i++) {
      intervals.push(recentTaps[i] - recentTaps[i - 1]);
    }

    // Se intervalos estão aumentando (mais lentos), há fadiga
    const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
    const firstHalf = intervals.slice(0, Math.floor(intervals.length / 2));
    const secondHalf = intervals.slice(Math.floor(intervals.length / 2));
    const firstAvg = firstHalf.reduce((sum, int) => sum + int, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, int) => sum + int, 0) / secondHalf.length;

    // Se segunda metade é 30% mais lenta, há fadiga
    const slowdown = (secondAvg - firstAvg) / firstAvg;

    if (slowdown > 0.5) return 'high';
    if (slowdown > 0.3) return 'medium';
    if (slowdown > 0.15) return 'low';
    return 'none';
  }, [userTaps]);

  // Atualizar fadiga periodicamente
  useEffect(() => {
    if (!isActive) return;

    const fatigueInterval = setInterval(() => {
      const level = calculateFatigue();
      setFatigueLevel(level);
      setFatigueHistory(prev => [...prev.slice(-9), level]);
    }, 5000); // A cada 5 segundos

    return () => clearInterval(fatigueInterval);
  }, [isActive, calculateFatigue]);

  // Timer da sessão ativa
  useEffect(() => {
    if (!isActive || isResting) return;

    intervalRef.current = setInterval(() => {
      setSessionTime(prev => {
        const newTime = prev + 1;
        if (newTime >= config.duration) {
          // Finalizar sessão e iniciar pausa
          endSession();
          return config.duration;
        }
        return newTime;
      });

      // Avançar padrão a cada 2 segundos
      setCurrentPatternIndex(prev => (prev + 1) % config.pattern.length);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isResting, config]);

  // Timer da pausa
  useEffect(() => {
    if (!isResting) return;

    restIntervalRef.current = setInterval(() => {
      setRestTime(prev => {
        const newTime = prev + 1;
        if (newTime >= config.restDuration) {
          endRest();
          return config.restDuration;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, [isResting, config]);

  // Iniciar exercício
  const startExercise = () => {
    setIsActive(true);
    setIsResting(false);
    setSessionTime(0);
    setRestTime(0);
    setCurrentPatternIndex(0);
    setUserTaps([]);
    setMissedTaps(0);
    setCompletedPatterns(0);
    setFatigueLevel('none');
    setFatigueHistory([]);
    sessionStartTimeRef.current = Date.now();
  };

  // Finalizar sessão e iniciar pausa
  const endSession = () => {
    setIsActive(false);
    setIsResting(true);
    setTotalSessions(prev => prev + 1);
    setRestTime(0);
    // Salvar histórico da sessão
    setTimeout(() => {
      saveSessionHistory();
    }, 100);
  };

  // Finalizar pausa
  const endRest = () => {
    setIsResting(false);
    setRestTime(0);
    // Opcional: reiniciar automaticamente ou esperar ação do usuário
  };

  // Parar exercício
  const stopExercise = () => {
    setIsActive(false);
    setIsResting(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
  };

  // Resetar
  const reset = () => {
    stopExercise();
    setSessionTime(0);
    setRestTime(0);
    setTotalSessions(0);
    setCurrentPatternIndex(0);
    setUserTaps([]);
    setMissedTaps(0);
    setCompletedPatterns(0);
    setFatigueLevel('none');
    setFatigueHistory([]);
    setSessionHistory([]);
  };

  // Handler para quando usuário toca/bate
  const handleUserTap = useCallback(() => {
    if (!isActive || isResting) return;

    const now = Date.now();
    setUserTaps(prev => [...prev.slice(-19), now]); // Manter últimas 20
    lastTapTimeRef.current = now;

    // Verificar se está sincronizado com o padrão
    setCompletedPatterns(prev => prev + 1);
  }, [isActive, isResting]);

  // Calcular tempo médio entre toques (em ms)
  const calculateAvgTime = useCallback(() => {
    if (userTaps.length < 2) return 0;
    const intervals: number[] = [];
    for (let i = 1; i < userTaps.length; i++) {
      intervals.push(userTaps[i] - userTaps[i - 1]);
    }
    return Math.round(intervals.reduce((sum, int) => sum + int, 0) / intervals.length);
  }, [userTaps]);

  // Calcular consistência (coeficiente de variação - menor = mais consistente)
  const calculateConsistency = useCallback(() => {
    if (userTaps.length < 3) return 100; // Inconsistente por padrão se poucos dados
    
    const intervals: number[] = [];
    for (let i = 1; i < userTaps.length; i++) {
      intervals.push(userTaps[i] - userTaps[i - 1]);
    }
    
    const avg = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
    const variance = intervals.reduce((sum, int) => sum + Math.pow(int - avg, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / avg) * 100; // Coeficiente de variação em %
    
    // Converter para escala 0-100 onde 100 = perfeito (0% variação)
    return Math.max(0, Math.min(100, Math.round(100 - cv)));
  }, [userTaps]);

  // Detectar erro mais comum
  const detectCommonError = useCallback(() => {
    if (userTaps.length < 3) return null;

    const intervals: number[] = [];
    for (let i = 1; i < userTaps.length; i++) {
      intervals.push(userTaps[i] - userTaps[i - 1]);
    }

    const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
    const expectedInterval = 2000; // 2 segundos por padrão (ajustar conforme necessário)
    
    // Verificar padrões de erro
    const tooFast = intervals.filter(int => int < expectedInterval * 0.7).length;
    const tooSlow = intervals.filter(int => int > expectedInterval * 1.5).length;
    const inconsistent = calculateConsistency() < 60;

    if (tooFast > intervals.length * 0.4) {
      return 'muito-rapido';
    } else if (tooSlow > intervals.length * 0.4) {
      return 'muito-lento';
    } else if (inconsistent) {
      return 'irregular';
    } else if (avgInterval < expectedInterval * 0.8) {
      return 'acelerando';
    } else if (avgInterval > expectedInterval * 1.3) {
      return 'desacelerando';
    }
    
    return null;
  }, [userTaps, calculateConsistency]);

  // Mensagens pedagógicas para erros
  const getErrorMessage = (error: string | null): string => {
    if (!error) return '';
    
    const messages: Record<string, string> = {
      'muito-rapido': 'Você está indo muito rápido. Diminua o ritmo para ganhar mais controle.',
      'muito-lento': 'Você está indo muito devagar. Tente manter um ritmo mais constante.',
      'irregular': 'Seu ritmo está irregular. Foque em manter o mesmo tempo entre cada movimento.',
      'acelerando': 'Você está acelerando. Mantenha o mesmo ritmo do início ao fim.',
      'desacelerando': 'Você está desacelerando. Isso pode indicar fadiga - descanse mais.',
    };
    
    return messages[error] || '';
  };

  // Salvar histórico da sessão ao finalizar
  const saveSessionHistory = useCallback(() => {
    if (userTaps.length < 2) return;
    
    const avgTime = calculateAvgTime();
    const consistency = calculateConsistency();
    const commonError = detectCommonError();
    
    setSessionHistory(prev => [
      ...prev.slice(-9), // Manter últimas 10 sessões
      {
        sessionNumber: totalSessions + 1,
        avgTime,
        consistency,
        commonError: commonError || 'nenhum',
        timestamp: Date.now(),
      },
    ]);
  }, [userTaps, totalSessions, calculateAvgTime, calculateConsistency, detectCommonError]);

  // Calcular estatísticas
  const sessionProgress = config.duration > 0 ? (sessionTime / config.duration) * 100 : 0;
  const restProgress = config.restDuration > 0 ? (restTime / config.restDuration) * 100 : 0;
  const avgFatigue = fatigueHistory.length > 0
    ? fatigueHistory.reduce((sum, level) => {
        const value = level === 'high' ? 3 : level === 'medium' ? 2 : level === 'low' ? 1 : 0;
        return sum + value;
      }, 0) / fatigueHistory.length
    : 0;
  
  const avgTime = calculateAvgTime();
  const consistency = calculateConsistency();
  const commonError = detectCommonError();
  const errorMessage = getErrorMessage(commonError);

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">🏃 Coordenação Motora</h2>
          {onExit && (
            <Button onClick={onExit} variant="ghost" size="sm" className="text-gray-400">
              Sair
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-400">Exercícios silenciosos para desenvolver independência das mãos</p>
      </div>

      {/* Seletor de Exercício */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-2">Escolha o exercício:</p>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(EXERCISE_CONFIGS).map((ex) => (
            <Button
              key={ex.id}
              onClick={() => {
                if (!isActive && !isResting) {
                  setExerciseType(ex.id);
                  reset();
                }
              }}
              disabled={isActive || isResting}
              variant={exerciseType === ex.id ? 'default' : 'outline'}
              className={
                exerciseType === ex.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-transparent border-white/20 text-gray-300 hover:bg-white/5'
              }
              size="sm"
            >
              <span className="mr-2">{ex.icon}</span>
              {ex.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Descrição do Exercício */}
      <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white">{config.name}</h3>
        </div>
        <p className="text-sm text-gray-300 mb-2">{config.description}</p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>Duração: {config.duration}s</span>
          <span>Pausa: {config.restDuration}s</span>
        </div>
      </div>

      {/* Feedback de Fadiga */}
      <AnimatePresence>
        {fatigueLevel !== 'none' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              fatigueLevel === 'high'
                ? 'bg-red-500/20 border border-red-500/50'
                : fatigueLevel === 'medium'
                ? 'bg-orange-500/20 border border-orange-500/50'
                : 'bg-yellow-500/20 border border-yellow-500/50'
            }`}
          >
            {fatigueLevel === 'high' && <AlertCircle className="w-5 h-5 text-red-400" />}
            {fatigueLevel === 'medium' && <Activity className="w-5 h-5 text-orange-400" />}
            {fatigueLevel === 'low' && <Activity className="w-5 h-5 text-yellow-400" />}
            <p className="text-sm text-gray-200 flex-1">{FATIGUE_MESSAGES[fatigueLevel]}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl p-3 bg-white/5 border border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-1">Sessões</p>
          <p className="text-xl font-bold text-white">{totalSessions}</p>
        </div>
        <div className="rounded-xl p-3 bg-white/5 border border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-1">Padrões</p>
          <p className="text-xl font-bold text-cyan-400">{completedPatterns}</p>
        </div>
        <div className="rounded-xl p-3 bg-white/5 border border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-1">Ritmo</p>
          <p className="text-xl font-bold text-green-400">
            {avgTime > 0 ? `${(avgTime / 1000).toFixed(1)}s` : '--'}
          </p>
        </div>
        <div className="rounded-xl p-3 bg-white/5 border border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-1">Regularidade</p>
          <p className="text-xl font-bold text-purple-400">
            {consistency > 0 ? `${consistency}%` : '--'}
          </p>
        </div>
      </div>

      {/* Métricas Detalhadas */}
      {isActive && userTaps.length >= 2 && (
        <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-sm">Como você está indo:</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Tempo entre movimentos:</p>
              <p className="text-white font-semibold">
                {avgTime > 0 ? `${(avgTime / 1000).toFixed(1)} segundos` : 'Aguardando...'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Regularidade:</p>
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold">{consistency}%</p>
                {consistency >= 80 && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                {consistency >= 60 && consistency < 80 && <TrendingUp className="w-4 h-4 text-yellow-400" />}
                {consistency < 60 && <TrendingDown className="w-4 h-4 text-orange-400" />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Erro Mais Comum */}
      <AnimatePresence>
        {errorMessage && isActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 rounded-lg bg-orange-500/20 border border-orange-500/50 flex items-start gap-3"
          >
            <Lightbulb className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-orange-300 mb-1 text-sm">Dica para melhorar:</p>
              <p className="text-sm text-gray-200">{errorMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de Padrão Atual */}
      {isActive && !isResting && (
        <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400 text-center">
          <p className="text-sm text-gray-400 mb-2">Siga este padrão:</p>
          <div className="flex justify-center gap-3 mb-4">
            {config.pattern.map((item, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{
                  scale: currentPatternIndex === index ? 1.3 : 1,
                  opacity: currentPatternIndex === index ? 1 : 0.5,
                }}
                className={`
                  w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg
                  ${currentPatternIndex === index
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-gray-700 text-gray-400'
                  }
                `}
              >
                {item}
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            {exerciseType === 'silent-fingering' && 'Toque os dedos no braço sem fazer som'}
            {exerciseType === 'right-hand-only' && 'Bata palmas ou batidas rítmicas'}
            {exerciseType === 'alternating-hands' && 'E = Esquerda, D = Direita'}
          </p>
        </div>
      )}

      {/* Pausa Obrigatória */}
      <AnimatePresence>
        {isResting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-6 p-6 rounded-xl bg-blue-500/20 border-2 border-blue-500/50 text-center"
          >
            <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Pausa Obrigatória</h3>
            <p className="text-3xl font-bold text-blue-400 mb-2">{config.restDuration - restTime}s</p>
            <p className="text-sm text-gray-300 mb-2">Relaxe as mãos e respire</p>
            <Progress value={restProgress} className="h-2 mt-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progresso da Sessão */}
      {isActive && !isResting && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progresso da Sessão</span>
            <span>{sessionTime}s / {config.duration}s</span>
          </div>
          <Progress value={sessionProgress} className="h-2" />
        </div>
      )}

      {/* Controles */}
      <div className="space-y-3">
        {!isActive && !isResting ? (
          <Button
            onClick={startExercise}
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
                onClick={stopExercise}
                size="lg"
                variant="outline"
                className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pausar
              </Button>
              <Button
                onClick={reset}
                size="lg"
                variant="outline"
                className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Resetar
              </Button>
            </div>

            {isActive && !isResting && (
              <Button
                onClick={handleUserTap}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg py-6"
              >
                <Hand className="w-6 h-6 mr-2" />
                TOCAR / BATER
              </Button>
            )}
          </>
        )}
      </div>

      {/* Histórico de Sessões */}
      {sessionHistory.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white text-sm">Últimas Sessões:</h3>
          </div>
          <div className="space-y-2">
            {sessionHistory.slice(-5).reverse().map((session, index) => (
              <div
                key={session.timestamp}
                className="p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Sessão {session.sessionNumber}</span>
                  <Badge
                    variant="outline"
                    className={
                      session.consistency >= 80
                        ? 'border-green-500/50 text-green-400'
                        : session.consistency >= 60
                        ? 'border-yellow-500/50 text-yellow-400'
                        : 'border-orange-500/50 text-orange-400'
                    }
                  >
                    {session.consistency}% regular
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Ritmo: </span>
                    <span className="text-white font-semibold">{(session.avgTime / 1000).toFixed(1)}s</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Dica: </span>
                    <span className="text-gray-300 text-[10px]">
                      {session.commonError === 'nenhum'
                        ? 'Muito bom!'
                        : session.commonError === 'muito-rapido'
                        ? 'Mais devagar'
                        : session.commonError === 'muito-lento'
                        ? 'Mais rápido'
                        : session.commonError === 'irregular'
                        ? 'Mais regular'
                        : 'Mantenha ritmo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {sessionHistory.length > 5 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Mostrando últimas 5 de {sessionHistory.length} sessões
            </p>
          )}
        </div>
      )}

      {/* Dicas */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex items-start gap-2 text-sm text-gray-400">
          <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-300 mb-1">Dicas de Coordenação:</p>
            <ul className="space-y-1 text-xs">
              <li>• Mantenha movimentos suaves e controlados</li>
              <li>• Respire naturalmente durante o exercício</li>
              <li>• Pare se sentir fadiga alta</li>
              <li>• Use as pausas para relaxar completamente</li>
              <li>• Foque em precisão, não velocidade</li>
              <li>• Observe o histórico para ver seu progresso</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
