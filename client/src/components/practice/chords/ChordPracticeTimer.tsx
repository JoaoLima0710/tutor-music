/**
 * Timer Obrigatório para Prática de Acordes
 * Só permite marcar como concluído após tempo mínimo (80% da duração sugerida)
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Play, Pause, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChordPracticeTimerProps {
  suggestedDuration: number; // minutos
  onComplete: () => void;
  onSkip?: () => void;
  chordName: string;
}

export function ChordPracticeTimer({
  suggestedDuration,
  onComplete,
  onSkip,
  chordName
}: ChordPracticeTimerProps) {
  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Tempo mínimo = 80% da duração sugerida (em segundos)
  const minDurationSeconds = Math.floor(suggestedDuration * 60 * 0.8);
  const suggestedDurationSeconds = suggestedDuration * 60;
  
  const progress = Math.min(100, (elapsedSeconds / minDurationSeconds) * 100);
  const canComplete = elapsedSeconds >= minDurationSeconds;
  const isComplete = elapsedSeconds >= suggestedDurationSeconds;

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleComplete = () => {
    if (canComplete) {
      setIsActive(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    onSkip?.();
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Timer de Prática - {chordName}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status */}
        {!isActive && elapsedSeconds === 0 && (
          <div className="text-center py-4">
            <p className="text-white/70 mb-4">
              Para marcar como concluído, pratique por pelo menos{' '}
              <strong className="text-white">{formatTime(minDurationSeconds)}</strong> minutos
            </p>
            <Button
              onClick={handleStart}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Iniciar Treino
            </Button>
          </div>
        )}

        {/* Timer Ativo */}
        {isActive && (
          <div className="space-y-4">
            {/* Tempo Decorrido */}
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {formatTime(elapsedSeconds)}
              </div>
              <p className="text-sm text-white/60">
                {isPaused ? 'Pausado' : 'Praticando...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/70">
                <span>Progresso mínimo</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-xs text-white/50">
                <span>Mínimo: {formatTime(minDurationSeconds)}</span>
                <span>Sugerido: {formatTime(suggestedDurationSeconds)}</span>
              </div>
            </div>

            {/* Controles */}
            <div className="flex gap-2">
              <Button
                onClick={handlePause}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Continuar
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleComplete}
                disabled={!canComplete}
                className={`flex-1 ${
                  canComplete
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                    : 'bg-white/10 text-white/50 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {canComplete ? 'Concluir' : `Faltam ${formatTime(minDurationSeconds - elapsedSeconds)}`}
              </Button>
            </div>

            {/* Aviso se não pode concluir */}
            {!canComplete && (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-300" />
                <p className="text-sm text-yellow-200">
                  Pratique por mais {formatTime(minDurationSeconds - elapsedSeconds)} para concluir
                </p>
              </div>
            )}

            {/* Opção de Pular (não conta para XP) */}
            {onSkip && (
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="w-full text-white/60 hover:text-white/80"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Pular (não conta para XP)
              </Button>
            )}
          </div>
        )}

        {/* Concluído */}
        {isComplete && !isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-green-500/20 border border-green-500/40 rounded-lg text-center"
          >
            <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-300 font-semibold">
              Parabéns! Você completou o tempo sugerido de prática!
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
