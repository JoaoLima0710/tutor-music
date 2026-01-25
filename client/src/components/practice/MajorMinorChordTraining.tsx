/**
 * Treino Auditivo de Reconhecimento de Acordes Maior x Menor
 * Desenvolve reconhecimento harmônico básico através de comparação
 * Sem nomenclatura técnica - apenas identificação de clima musical
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Smile, Frown, CheckCircle2, XCircle, Volume2, Award, RefreshCw, TrendingUp, TrendingDown, BarChart3, Guitar } from 'lucide-react';
import { unifiedAudioService } from '@/services/UnifiedAudioService';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { chords } from '@/data/chords';

// Níveis de progressão
type ProgressionLevel = 'iniciante' | 'iniciante-avancado' | 'intermediario';

const LEVEL_CONFIG: Record<ProgressionLevel, { contrastRatio: number; sameTypeRatio: number; name: string }> = {
  'iniciante': { contrastRatio: 0.9, sameTypeRatio: 0.1, name: 'Iniciante' }, // 90% contraste claro, 10% igualdade
  'iniciante-avancado': { contrastRatio: 0.7, sameTypeRatio: 0.3, name: 'Iniciante Avançado' }, // 70% contraste, 30% igualdade
  'intermediario': { contrastRatio: 0.5, sameTypeRatio: 0.5, name: 'Intermediário' }, // 50% cada (mais desafiador)
};

const CONSISTENCY_REQUIREMENT = 0.7; // 70% de acerto
const CONSISTENCY_WINDOW = 5; // Últimos 5 exercícios

// Acordes básicos para treino (maiores e menores)
const BASIC_CHORDS = {
  major: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  minor: ['Am', 'Dm', 'Em', 'Fm', 'Gm', 'Bm'],
};

interface Exercise {
  firstChord: string;
  secondChord: string;
  firstType: 'major' | 'minor';
  secondType: 'major' | 'minor';
  correctAnswer: 'first-happier' | 'second-happier' | 'same';
  description: string;
}

export function MajorMinorChordTraining() {
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userAnswer, setUserAnswer] = useState<'first-happier' | 'second-happier' | 'same' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [progressionLevel, setProgressionLevel] = useState<ProgressionLevel>('iniciante');
  const [recentResults, setRecentResults] = useState<boolean[]>([]);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [showGuitarPractice, setShowGuitarPractice] = useState(false); // Mostrar etapa de prática no violão
  
  // Rastreamento de tipos de erro para métricas
  const [errorTypes, setErrorTypes] = useState<{
    confusedOrder: number; // Confundiu qual acorde é mais alegre
    confusedWithSame: number; // Confundiu com mesmo clima
    other: number;
  }>({
    confusedOrder: 0,
    confusedWithSame: 0,
    other: 0,
  });
  
  // Histórico de sessão (últimos 10 exercícios para mostrar evolução)
  const [sessionHistory, setSessionHistory] = useState<boolean[]>([]);

  // Gerar exercício baseado no nível de progressão
  const generateExercise = (): Exercise => {
    const levelConfig = LEVEL_CONFIG[progressionLevel];
    // Usar ratio do nível atual
    const shouldHaveContrast = Math.random() > levelConfig.sameTypeRatio;
    
    let firstChord: string;
    let secondChord: string;
    let firstType: 'major' | 'minor';
    let secondType: 'major' | 'minor';
    
    if (shouldHaveContrast) {
      // Um maior e um menor (contraste claro)
      const majorChord = BASIC_CHORDS.major[Math.floor(Math.random() * BASIC_CHORDS.major.length)];
      const minorChord = BASIC_CHORDS.minor[Math.floor(Math.random() * BASIC_CHORDS.minor.length)];
      
      // Aleatorizar ordem
      if (Math.random() > 0.5) {
        firstChord = majorChord;
        secondChord = minorChord;
        firstType = 'major';
        secondType = 'minor';
      } else {
        firstChord = minorChord;
        secondChord = majorChord;
        firstType = 'minor';
        secondType = 'major';
      }
    } else {
      // Ambos do mesmo tipo (teste de igualdade)
      const sameType = Math.random() > 0.5 ? 'major' : 'minor';
      const chordList = sameType === 'major' ? BASIC_CHORDS.major : BASIC_CHORDS.minor;
      
      // Escolher dois acordes diferentes do mesmo tipo
      const shuffled = [...chordList].sort(() => Math.random() - 0.5);
      firstChord = shuffled[0];
      secondChord = shuffled[1] || shuffled[0]; // Fallback se só tiver um
      firstType = sameType;
      secondType = sameType;
    }
    
    // Determinar resposta correta
    let correctAnswer: 'first-happier' | 'second-happier' | 'same';
    let description: string;
    
    if (firstType === secondType) {
      correctAnswer = 'same';
      description = firstType === 'major' 
        ? 'Ambos são acordes maiores (alegres)'
        : 'Ambos são acordes menores (tristes)';
    } else if (firstType === 'major' && secondType === 'minor') {
      correctAnswer = 'first-happier';
      description = 'O primeiro acorde é maior (mais alegre), o segundo é menor (mais triste)';
    } else {
      correctAnswer = 'second-happier';
      description = 'O primeiro acorde é menor (mais triste), o segundo é maior (mais alegre)';
    }
    
    return {
      firstChord,
      secondChord,
      firstType,
      secondType,
      correctAnswer,
      description,
    };
  };

  // Tocar exercício
  const playExercise = async (exercise?: Exercise) => {
    const exerciseToPlay = exercise || currentExercise;
    if (!exerciseToPlay || isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      await unifiedAudioService.ensureInitialized();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Duração otimizada para comparação harmônica
      const chordDuration = 1.5;
      const delayBetweenChords = 800; // Delay suficiente para processar cada acorde
      
      console.log('🎵 [Acordes Maior/Menor] Tocando:', exerciseToPlay.firstChord, '→', exerciseToPlay.secondChord);
      
      // Tocar primeiro acorde
      await unifiedAudioService.playChord(exerciseToPlay.firstChord, chordDuration);
      await new Promise(resolve => setTimeout(resolve, delayBetweenChords));
      
      // Tocar segundo acorde
      await unifiedAudioService.playChord(exerciseToPlay.secondChord, chordDuration);
      
      console.log('✅ [Acordes Maior/Menor] Exercício tocado');
    } catch (error) {
      console.error('❌ Erro ao tocar exercício:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  // Verificar resposta
  const checkAnswer = (answer: 'first-happier' | 'second-happier' | 'same') => {
    if (!currentExercise || showResult) return;
    
    setUserAnswer(answer);
    
    const isCorrect = answer === currentExercise.correctAnswer;
    
    // Delay antes de mostrar feedback (não instantâneo)
    setTimeout(() => {
      setShowResult(true);
      
      // Atualizar score
      setScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));
      
      // Adicionar resultado recente
      setRecentResults(prev => {
        const updated = [...prev, isCorrect];
        return updated.slice(-CONSISTENCY_WINDOW);
      });
      
      // Adicionar ao histórico de sessão (últimos 10)
      setSessionHistory(prev => {
        const updated = [...prev, isCorrect];
        return updated.slice(-10);
      });
      
      // Rastrear tipo de erro (apenas quando errado)
      if (!isCorrect && currentExercise && userAnswer) {
        const correct = currentExercise.correctAnswer;
        const user = userAnswer;
        
        // Confundiu ordem (qual é mais alegre)
        if ((correct === 'first-happier' && user === 'second-happier') || 
            (correct === 'second-happier' && user === 'first-happier')) {
          setErrorTypes(prev => ({ ...prev, confusedOrder: prev.confusedOrder + 1 }));
        }
        // Confundiu com mesmo clima
        else if (correct !== 'same' && user === 'same') {
          setErrorTypes(prev => ({ ...prev, confusedWithSame: prev.confusedWithSame + 1 }));
        }
        // Outros erros
        else {
          setErrorTypes(prev => ({ ...prev, other: prev.other + 1 }));
        }
      }
      
      // Verificar se pode avançar de nível
      checkProgression();
      
      // Mostrar etapa de prática no violão após um pequeno delay
      setTimeout(() => {
        setShowGuitarPractice(true);
      }, 1000);
    }, 300); // Pequeno delay para processar a resposta
  };

  // Encontrar posição do acorde no violão
  const getChordPosition = (chordName: string) => {
    const chord = chords.find(c => c.name === chordName || c.id === chordName);
    if (!chord) return null;
    
    return {
      name: chord.name,
      frets: chord.frets,
      fingers: chord.fingers,
      description: chord.description,
    };
  };

  // Obter mensagem explicativa específica
  const getExplanationMessage = (): string => {
    if (!currentExercise || !userAnswer) return '';
    
    const isCorrect = userAnswer === currentExercise.correctAnswer;
    if (isCorrect) return '';
    
    // Mensagens específicas baseadas no erro
    if (currentExercise.correctAnswer === 'same' && userAnswer !== 'same') {
      return 'Ambos os acordes tinham o mesmo clima (ambos maiores ou ambos menores). Acordes do mesmo tipo soam com a mesma "energia".';
    }
    
    if (currentExercise.correctAnswer === 'first-happier' && userAnswer === 'second-happier') {
      return `O primeiro acorde (${currentExercise.firstChord}) era maior (mais alegre) e o segundo (${currentExercise.secondChord}) era menor (mais triste). Acordes maiores soam mais brilhantes e abertos.`;
    }
    
    if (currentExercise.correctAnswer === 'second-happier' && userAnswer === 'first-happier') {
      return `O segundo acorde (${currentExercise.secondChord}) era maior (mais alegre) e o primeiro (${currentExercise.firstChord}) era menor (mais triste). Acordes maiores soam mais brilhantes e abertos.`;
    }
    
    if (currentExercise.correctAnswer === 'first-happier' && userAnswer === 'same') {
      return `O primeiro acorde era maior (alegre) e o segundo menor (triste) - há diferença de clima. Acordes maiores soam mais brilhantes, menores mais melancólicos.`;
    }
    
    if (currentExercise.correctAnswer === 'second-happier' && userAnswer === 'same') {
      return `O segundo acorde era maior (alegre) e o primeiro menor (triste) - há diferença de clima. Acordes maiores soam mais brilhantes, menores mais melancólicos.`;
    }
    
    return 'Compare o sentimento: acordes maiores soam mais alegres e brilhantes, menores mais tristes e melancólicos.';
  };

  // Tocar resposta correta para comparação
  const playCorrectAnswer = async () => {
    if (!currentExercise) return;
    
    setIsPlaying(true);
    try {
      await unifiedAudioService.ensureInitialized();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const chordDuration = 1.5;
      const delayBetweenChords = 800;
      
      // Tocar novamente os acordes na ordem correta
      await unifiedAudioService.playChord(currentExercise.firstChord, chordDuration);
      await new Promise(resolve => setTimeout(resolve, delayBetweenChords));
      await unifiedAudioService.playChord(currentExercise.secondChord, chordDuration);
    } catch (error) {
      console.error('❌ Erro ao tocar resposta correta:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  // Verificar se pode avançar de nível
  const checkProgression = () => {
    if (recentResults.length < CONSISTENCY_WINDOW - 1) return;
    
    const lastFive = [...recentResults, true].slice(-CONSISTENCY_WINDOW);
    const correctCount = lastFive.filter(r => r).length;
    const consistency = correctCount / CONSISTENCY_WINDOW;
    
    if (consistency >= CONSISTENCY_REQUIREMENT && progressionLevel !== 'intermediario') {
      const nextLevel: ProgressionLevel = progressionLevel === 'iniciante' 
        ? 'iniciante-avancado' 
        : 'intermediario';
      
      setProgressionLevel(nextLevel);
      setJustLeveledUp(true);
      setRecentResults([]);
      
      setTimeout(() => setJustLeveledUp(false), 3000);
    }
  };

  // Próximo exercício
  const nextExercise = () => {
    const newExercise = generateExercise();
    setCurrentExercise(newExercise);
    setUserAnswer(null);
    setShowResult(false);
    setShowGuitarPractice(false);
    // Tocar automaticamente
    setTimeout(() => playExercise(newExercise), 300);
  };

  // Inicializar primeiro exercício
  useEffect(() => {
    const exercise = generateExercise();
    setCurrentExercise(exercise);
    // Tocar automaticamente após um pequeno delay
    const timer = setTimeout(() => {
      playExercise(exercise);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressionLevel]);

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  const currentLevelConfig = LEVEL_CONFIG[progressionLevel];
  
  // Calcular progresso para próximo nível
  const recentAccuracy = recentResults.length > 0
    ? Math.round((recentResults.filter(r => r).length / recentResults.length) * 100)
    : 0;
  const progressToNextLevel = recentResults.length >= CONSISTENCY_WINDOW - 1
    ? Math.min((recentAccuracy / (CONSISTENCY_REQUIREMENT * 100)) * 100, 100)
    : (recentResults.length / CONSISTENCY_WINDOW) * 100;
  const canAdvance = progressionLevel !== 'intermediario' && recentAccuracy >= CONSISTENCY_REQUIREMENT * 100 && recentResults.length >= CONSISTENCY_WINDOW;
  
  // Calcular métricas de evolução
  const totalErrors = errorTypes.confusedOrder + errorTypes.confusedWithSame + errorTypes.other;
  const mostCommonError = totalErrors > 0
    ? errorTypes.confusedOrder >= errorTypes.confusedWithSame && errorTypes.confusedOrder >= errorTypes.other
      ? 'confusedOrder'
      : errorTypes.confusedWithSame >= errorTypes.other
      ? 'confusedWithSame'
      : 'other'
    : null;
  
  // Evolução recente (últimos 5 vs anteriores 5)
  const recent5 = sessionHistory.slice(-5);
  const previous5 = sessionHistory.slice(-10, -5);
  const recent5Accuracy = recent5.length > 0 ? Math.round((recent5.filter(r => r).length / recent5.length) * 100) : 0;
  const previous5Accuracy = previous5.length > 0 ? Math.round((previous5.filter(r => r).length / previous5.length) * 100) : 0;
  const isImproving = recent5.length === 5 && previous5.length === 5 && recent5Accuracy > previous5Accuracy;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-yellow-400" />
            Acordes: Alegre x Triste
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Desenvolva seu reconhecimento harmônico - identifique o clima dos acordes
          </p>
        </div>
        
        {/* Estatísticas */}
        {score.total > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{score.correct}/{score.total}</div>
            <div className="text-sm text-gray-400">{accuracy}% de acertos</div>
          </div>
        )}
      </div>

      {/* Métricas de Evolução */}
      {score.total > 0 && (
        <Card className="p-4 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            <h4 className="text-lg font-bold text-white">Sua Evolução</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* % de Acertos */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Taxa de Acertos</p>
              <p className="text-2xl font-bold text-white">{accuracy}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {score.correct} de {score.total} exercícios
              </p>
            </div>
            
            {/* Evolução Recente */}
            {sessionHistory.length >= 5 && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-gray-400 mb-1">Últimos Exercícios</p>
                <div className="flex items-center gap-2">
                  {isImproving ? (
                    <>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <p className="text-lg font-bold text-green-400">Melhorando!</p>
                    </>
                  ) : recent5Accuracy === previous5Accuracy ? (
                    <>
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      <p className="text-lg font-bold text-blue-400">Estável</p>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-5 h-5 text-yellow-400" />
                      <p className="text-lg font-bold text-yellow-400">Continue</p>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {recent5Accuracy}% nos últimos 5
                </p>
              </div>
            )}
          </div>
          
          {/* Tipo de Erro Mais Comum */}
          {totalErrors > 0 && mostCommonError && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-xs text-blue-300 mb-1">
                💡 <strong>Dica para melhorar:</strong>
              </p>
              <p className="text-xs text-blue-200">
                {mostCommonError === 'confusedOrder'
                  ? 'Você às vezes confunde qual acorde é mais alegre. Acordes maiores soam mais brilhantes e abertos, menores mais melancólicos e fechados.'
                  : mostCommonError === 'confusedWithSame'
                  ? 'Você às vezes não percebe quando os acordes têm o mesmo clima. Preste atenção: acordes do mesmo tipo (ambos maiores ou ambos menores) soam com a mesma "energia".'
                  : 'Continue praticando para identificar melhor o clima dos acordes.'}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Indicador de Nível e Progressão */}
      <Card className="p-4 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={
                progressionLevel === 'iniciante'
                  ? 'border-green-500/50 text-green-400 bg-green-500/10'
                  : progressionLevel === 'iniciante-avancado'
                  ? 'border-blue-500/50 text-blue-400 bg-blue-500/10'
                  : 'border-purple-500/50 text-purple-400 bg-purple-500/10'
              }
            >
              {currentLevelConfig.name}
            </Badge>
            {justLeveledUp && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 text-green-400"
              >
                <Award className="w-5 h-5" />
                <span className="text-sm font-semibold">Nível Avançado! 🎉</span>
              </motion.div>
            )}
          </div>
          {progressionLevel !== 'intermediario' && (
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">
                Progresso para próximo nível
              </div>
              <div className="text-sm text-white font-semibold">
                {recentResults.length}/{CONSISTENCY_WINDOW} exercícios
              </div>
            </div>
          )}
        </div>
        
        {progressionLevel !== 'intermediario' && (
          <div className="space-y-2">
            <Progress value={progressToNextLevel} className="h-2" />
            <div className="flex justify-between text-xs text-gray-400">
              <span>
                Consistência recente: {recentAccuracy}% 
                {recentResults.length < CONSISTENCY_WINDOW && ` (${recentResults.length}/${CONSISTENCY_WINDOW})`}
              </span>
              <span>
                Requerido: {CONSISTENCY_REQUIREMENT * 100}% em {CONSISTENCY_WINDOW} exercícios
              </span>
            </div>
            {canAdvance && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2 rounded-lg bg-green-500/20 border border-green-500/50"
              >
                <p className="text-xs text-green-300 text-center">
                  ✨ Você está pronto para avançar! Continue praticando para desbloquear o próximo nível.
                </p>
              </motion.div>
            )}
          </div>
        )}
      </Card>

      {/* Exercício Atual */}
      {currentExercise && (
        <Card className="p-6 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10">
          {/* Instruções */}
          <div className="text-center mb-6">
            <h4 className="text-lg font-bold text-white mb-2">
              Ouça os dois acordes e compare o clima:
            </h4>
            <p className="text-gray-300 text-sm">
              Qual acorde soa <strong className="text-yellow-400">mais alegre</strong> ou 
              <strong className="text-blue-400"> mais triste</strong>? Ou são 
              <strong className="text-white"> iguais</strong>?
            </p>
          </div>

          {/* Botão de Tocar */}
          <div className="flex justify-center mb-6">
            <Button
              onClick={() => playExercise()}
              disabled={isPlaying}
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            >
              <Play className="w-5 h-5 mr-2" />
              {isPlaying ? 'Tocando...' : 'Ouvir Novamente'}
            </Button>
          </div>

          {/* Opções de Resposta */}
          {!showResult ? (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Button
                onClick={() => checkAnswer('first-happier')}
                disabled={isPlaying}
                className="h-auto py-6 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white"
              >
                <Smile className="w-6 h-6 mb-2" />
                <div className="text-sm font-semibold">1º Mais Alegre</div>
                <div className="text-xs opacity-80">(Primeiro)</div>
              </Button>
              
              <Button
                onClick={() => checkAnswer('same')}
                disabled={isPlaying}
                className="h-auto py-6 bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white"
              >
                <CheckCircle2 className="w-6 h-6 mb-2" />
                <div className="text-sm font-semibold">Mesmo Clima</div>
                <div className="text-xs opacity-80">(Iguais)</div>
              </Button>
              
              <Button
                onClick={() => checkAnswer('second-happier')}
                disabled={isPlaying}
                className="h-auto py-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              >
                <Smile className="w-6 h-6 mb-2" />
                <div className="text-sm font-semibold">2º Mais Alegre</div>
                <div className="text-xs opacity-80">(Segundo)</div>
              </Button>
            </div>
          ) : (
            /* Resultado */
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Feedback */}
                <div className={`p-4 rounded-lg border-2 ${
                  userAnswer === currentExercise.correctAnswer
                    ? 'bg-green-500/20 border-green-500/50'
                    : 'bg-red-500/20 border-red-500/50'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {userAnswer === currentExercise.correctAnswer ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                        <span className="text-xl font-bold text-green-400">Correto! 🎉</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-red-400" />
                        <span className="text-xl font-bold text-red-400">Não foi dessa vez</span>
                      </>
                    )}
                  </div>
                  
                  <div className="text-center text-gray-300 text-sm space-y-2">
                    <div>
                      <p className="mb-1">
                        <strong className="text-white">Sua resposta:</strong>{' '}
                        <span className={userAnswer === currentExercise.correctAnswer ? 'text-green-400' : 'text-red-400'}>
                          {userAnswer === 'first-happier' ? '1º Mais Alegre' : 
                           userAnswer === 'second-happier' ? '2º Mais Alegre' : 'Mesmo Clima'}
                        </span>
                      </p>
                      <p>
                        <strong className="text-white">Resposta correta:</strong>{' '}
                        <span className="text-green-400">
                          {currentExercise.correctAnswer === 'first-happier' ? '1º Mais Alegre' : 
                           currentExercise.correctAnswer === 'second-happier' ? '2º Mais Alegre' : 'Mesmo Clima'}
                        </span>
                      </p>
                    </div>
                    
                    {/* Mensagem explicativa quando errado */}
                    {userAnswer !== currentExercise.correctAnswer && (
                      <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <p className="text-xs text-blue-300 text-left">
                          💡 {getExplanationMessage()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Replay Comparativo */}
                {userAnswer !== currentExercise.correctAnswer && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-300 text-center mb-3">
                      <strong className="text-white">Ouça novamente os acordes na ordem correta:</strong>
                    </p>
                    <div className="flex justify-center">
                      <Button
                        onClick={playCorrectAnswer}
                        disabled={isPlaying}
                        size="sm"
                        variant="outline"
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {isPlaying ? 'Tocando...' : 'Ouvir Resposta Correta'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Explicação Simples */}
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-gray-300 text-center mb-2">
                    <strong className="text-white">Acordes tocados:</strong>{' '}
                    <span className="text-yellow-400">{currentExercise.firstChord}</span>
                    {' → '}
                    <span className="text-blue-400">{currentExercise.secondChord}</span>
                  </p>
                  <div className="text-center text-gray-300 text-sm space-y-1">
                    <p>
                      <strong className="text-white">1º Acorde ({currentExercise.firstChord}):</strong>{' '}
                      {currentExercise.firstType === 'major' 
                        ? <span className="text-yellow-400">Maior (alegre)</span>
                        : <span className="text-blue-400">Menor (triste)</span>}
                    </p>
                    <p>
                      <strong className="text-white">2º Acorde ({currentExercise.secondChord}):</strong>{' '}
                      {currentExercise.secondType === 'major' 
                        ? <span className="text-yellow-400">Maior (alegre)</span>
                        : <span className="text-blue-400">Menor (triste)</span>}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-3 italic">
                    {currentExercise.description}
                  </p>
                </div>

                {/* Prática no Violão */}
                {showGuitarPractice && currentExercise && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Guitar className="w-5 h-5 text-amber-400" />
                      <h5 className="text-lg font-bold text-white">Agora toque no violão</h5>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-4">
                      Você ouviu dois acordes. Agora toque-os no violão para sentir a diferença de clima:
                    </p>
                    
                    <div className="space-y-3 mb-4">
                      {/* Primeiro Acorde */}
                      {(() => {
                        const firstChordPos = getChordPosition(currentExercise.firstChord);
                        return firstChordPos ? (
                          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-sm text-white font-semibold mb-2">
                              1. Primeiro acorde: <span className="text-yellow-400">{currentExercise.firstChord}</span>
                            </p>
                            <p className="text-xs text-gray-300 mb-2">
                              {currentExercise.firstType === 'major' 
                                ? 'Acorde maior (alegre)'
                                : 'Acorde menor (triste)'}
                            </p>
                            <div className="flex gap-1 text-xs text-gray-400">
                              <span>Cordas (da 6ª para 1ª):</span>
                              {firstChordPos.frets.map((fret, idx) => (
                                <span key={idx} className={fret === 'x' ? 'text-red-400' : fret === 0 ? 'text-green-400' : 'text-white'}>
                                  {fret === 'x' ? 'X' : fret === 0 ? 'O' : fret}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {firstChordPos.description}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-sm text-white">
                              1. Primeiro acorde: <span className="text-yellow-400">{currentExercise.firstChord}</span>
                            </p>
                          </div>
                        );
                      })()}
                      
                      {/* Segundo Acorde */}
                      {(() => {
                        const secondChordPos = getChordPosition(currentExercise.secondChord);
                        return secondChordPos ? (
                          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-sm text-white font-semibold mb-2">
                              2. Segundo acorde: <span className="text-blue-400">{currentExercise.secondChord}</span>
                            </p>
                            <p className="text-xs text-gray-300 mb-2">
                              {currentExercise.secondType === 'major' 
                                ? 'Acorde maior (alegre)'
                                : 'Acorde menor (triste)'}
                            </p>
                            <div className="flex gap-1 text-xs text-gray-400">
                              <span>Cordas (da 6ª para 1ª):</span>
                              {secondChordPos.frets.map((fret, idx) => (
                                <span key={idx} className={fret === 'x' ? 'text-red-400' : fret === 0 ? 'text-green-400' : 'text-white'}>
                                  {fret === 'x' ? 'X' : fret === 0 ? 'O' : fret}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {secondChordPos.description}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-sm text-white">
                              2. Segundo acorde: <span className="text-blue-400">{currentExercise.secondChord}</span>
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                    
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <p className="text-xs text-blue-300">
                        💡 <strong>Dica:</strong> Toque os dois acordes e compare o sentimento. 
                        Você sente a diferença que ouviu? Isso ajuda a conectar o que você ouve com o que você toca.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Botão Próximo */}
                <Button
                  onClick={() => {
                    setShowGuitarPractice(false);
                    nextExercise();
                  }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                >
                  Próximo Exercício
                </Button>
              </motion.div>
            </AnimatePresence>
          )}
        </Card>
      )}

      {/* Dicas */}
      <Card className="p-5 bg-[#1a1a2e]/60 backdrop-blur-xl border-white/10">
        <h4 className="text-lg font-bold text-white mb-3">💡 Como Reconhecer</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• <strong className="text-yellow-400">Acordes Maiores (alegres):</strong> Soam brilhantes, abertos, como sol</li>
          <li>• <strong className="text-blue-400">Acordes Menores (tristes):</strong> Soam melancólicos, fechados, como chuva</li>
          <li>• <strong>Compare o sentimento:</strong> Não precisa saber teoria - apenas sinta a diferença</li>
          <li>• <strong>Pratique regularmente:</strong> 5-10 minutos por dia desenvolvem essa percepção rapidamente</li>
          <li>• <strong>Aplicável a músicas:</strong> Essa habilidade ajuda você a entender o clima de qualquer música</li>
        </ul>
      </Card>
    </div>
  );
}
