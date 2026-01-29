/**
 * Treino Rítmico Auditivo Ativo
 * Desenvolve escuta ativa de pulso sem dependência visual
 * Separação do metrônomo tradicional - foco em percepção auditiva
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, Hand, CheckCircle2, XCircle } from 'lucide-react';
import { unifiedAudioService } from '@/services/UnifiedAudioService';
import { motion, AnimatePresence } from 'framer-motion';

// Padrões rítmicos simples para treino
const RHYTHM_PATTERNS = [
  {
    id: 'simple-4',
    name: '4 Batidas Simples',
    beats: [true, true, true, true],
    bpm: 100,
    description: '4 batidas regulares',
  },
  {
    id: 'accent-4',
    name: '4 Batidas com Acento',
    beats: [true, false, true, false],
    bpm: 100,
    description: 'Batida forte, batida fraca, batida forte, batida fraca',
  },
  {
    id: 'syncopated',
    name: 'Síncope Simples',
    beats: [true, false, false, true],
    bpm: 90,
    description: 'Batida, pausa, pausa, batida',
  },
  {
    id: 'fast-4',
    name: '4 Batidas Rápidas',
    beats: [true, true, true, true],
    bpm: 140,
    description: '4 batidas rápidas e regulares',
  },
];

interface Exercise {
  pattern: typeof RHYTHM_PATTERNS[0];
  correctPulse: number; // Número de batidas no padrão
}

export function RhythmListeningPractice() {
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userPulseCount, setUserPulseCount] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [repetitionCount, setRepetitionCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const tapTimesRef = useRef<number[]>([]);
  const maxRepetitions = 3; // Repetir padrão 3 vezes

  // Gerar exercício
  const generateExercise = (): Exercise => {
    const pattern = RHYTHM_PATTERNS[Math.floor(Math.random() * RHYTHM_PATTERNS.length)];
    const correctPulse = pattern.beats.filter(b => b).length;

    return {
      pattern,
      correctPulse,
    };
  };

  // Tocar padrão rítmico
  const playPattern = async (exercise?: Exercise, repeat: boolean = true) => {
    const exerciseToPlay = exercise || currentExercise;
    if (!exerciseToPlay || isPlaying) return;

    setIsPlaying(true);
    setRepetitionCount(0);

    try {
      await unifiedAudioService.ensureInitialized();
      await new Promise(resolve => setTimeout(resolve, 100));

      const pattern = exerciseToPlay.pattern;
      const beatDuration = 0.08; // Som curto e percussivo
      const beatInterval = (60 / pattern.bpm) * 1000; // Intervalo em ms

      // Tocar padrão repetido algumas vezes
      const repetitions = repeat ? maxRepetitions : 1;

      for (let rep = 0; rep < repetitions; rep++) {
        console.log(`🎵 [Ritmo Ativo] Repetição ${rep + 1}/${repetitions}`);

        for (let i = 0; i < pattern.beats.length; i++) {
          if (pattern.beats[i]) {
            // Tocar batida (nota aguda e curta para simular clique)
            const isAccent = i === 0; // Primeira batida é acento
            const note = isAccent ? 'C5' : 'C4'; // Mais agudo para acento
            await unifiedAudioService.playNote(note, beatDuration);
          }

          // Delay até próxima batida (ou pausa)
          if (i < pattern.beats.length - 1) {
            await new Promise(resolve => setTimeout(resolve, beatInterval));
          }
        }

        // Pausa entre repetições (exceto após a última)
        if (rep < repetitions - 1) {
          await new Promise(resolve => setTimeout(resolve, beatInterval * 0.5));
          setRepetitionCount(rep + 1);
        }
      }

      setRepetitionCount(repetitions);
      console.log('✅ [Ritmo Ativo] Padrão tocado');
    } catch (error) {
      console.error('❌ Erro ao tocar padrão:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  // Iniciar modo de escuta (usuário tenta seguir o pulso)
  const startListening = async () => {
    if (!currentExercise) return;

    setIsListening(true);
    tapTimesRef.current = [];

    // Tocar padrão uma vez para referência
    await playPattern(currentExercise, false);

    // Pausa auditiva de 1 segundo antes de permitir que usuário tente
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('👂 [Ritmo Ativo] Modo escuta ativado - aguardando tentativa do usuário');
  };

  // Registrar batida do usuário (quando clicar/bater palmas)
  const recordUserBeat = () => {
    if (!isListening) return;

    const now = Date.now();
    tapTimesRef.current.push(now);

    // Tocar feedback sonoro curto
    unifiedAudioService.playNote('C6', 0.05).catch(() => { });

    console.log(`👂 [Ritmo Ativo] Batida registrada: ${tapTimesRef.current.length}`);
  };

  // Verificar resposta do usuário
  const checkAnswer = () => {
    if (!currentExercise || !isListening) return;

    const userCount = tapTimesRef.current.length;
    setUserPulseCount(userCount);
    setShowResult(true);
    setIsListening(false);

    // Tolerância: aceitar se estiver dentro de ±1 batida
    const isCorrect = Math.abs(userCount - currentExercise.correctPulse) <= 1;

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    console.log(`🎯 [Ritmo Ativo] Resposta: ${userCount}, Esperado: ${currentExercise.correctPulse}, Correto: ${isCorrect}`);
  };

  // Próximo exercício
  const nextExercise = () => {
    const newExercise = generateExercise();
    setCurrentExercise(newExercise);
    setUserPulseCount(null);
    setShowResult(false);
    setIsListening(false);
    tapTimesRef.current = [];
    setRepetitionCount(0);

    // Pausa auditiva de 2 segundos antes de tocar próximo (silêncio para processar)
    setTimeout(() => {
      playPattern(newExercise, true);
    }, 2000);
  };

  // Inicializar primeiro exercício (SEM AUTO-PLAY)
  useEffect(() => {
    const exercise = generateExercise();
    setCurrentExercise(exercise);
    // REMOVIDO: playPattern(exercise, true); - REGRA 1: Áudio nunca nasce sozinho
  }, []);

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Hand className="w-6 h-6 text-green-400" />
            Ritmo Auditivo Ativo
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Desenvolva escuta ativa de pulso - ouça e sinta o ritmo
          </p>
        </div>

        {/* Estatísticas */}
        {score.total > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{score.correct}/{score.total}</div>
            <div className="text-sm text-gray-400">{accuracy}% de precisão</div>
          </div>
        )}
      </div>

      {/* Exercício Atual */}
      {currentExercise && (
        <Card className="p-6 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10">
          {/* Instruções */}
          <div className="text-center mb-6">
            <h4 className="text-lg font-bold text-white mb-2">
              {!isListening
                ? 'Ouça o padrão rítmico e sinta o pulso:'
                : 'Agora tente seguir o pulso - clique quando ouvir cada batida:'}
            </h4>
            <p className="text-gray-300 text-sm">
              {!isListening
                ? 'Preste atenção no número de batidas. Depois você vai tentar seguir o pulso.'
                : `Padrão: ${currentExercise.pattern.description}`}
            </p>
          </div>

          {/* Controles de Áudio */}
          {!isListening && !showResult && (
            <div className="flex justify-center gap-3 mb-6">
              {/* Botão de Tocar Padrão (agora necessário para começar) */}
              <Button
                onClick={() => playPattern(currentExercise, true)}
                disabled={isPlaying}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                <Play className="w-5 h-5 mr-2" />
                {isPlaying ? 'Tocando...' : 'Ouvir Padrão'}
              </Button>

              <Button
                onClick={startListening}
                disabled={isPlaying}
                size="lg"
                variant="outline"
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                <Hand className="w-5 h-5 mr-2" />
                Tentar Seguir
              </Button>
            </div>
          )}

          {/* Modo de Escuta Ativa */}
          {isListening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 mb-6"
            >
              <div className="p-6 rounded-xl bg-green-500/20 border-2 border-green-500/50">
                <div className="text-center mb-4">
                  <Hand className="w-12 h-12 text-green-400 mx-auto mb-3 animate-pulse" />
                  <p className="text-white font-semibold mb-2">
                    Clique aqui quando ouvir cada batida:
                  </p>
                  <p className="text-gray-300 text-sm mb-4">
                    Batidas registradas: <strong className="text-green-400">{tapTimesRef.current.length}</strong>
                  </p>

                  <Button
                    onClick={recordUserBeat}
                    size="lg"
                    className="w-full h-20 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg font-bold"
                  >
                    👏 Bater Aqui
                  </Button>

                  <p className="text-xs text-gray-400 mt-3">
                    Ou bata palmas e clique no botão a cada batida
                  </p>
                </div>

                <div className="flex justify-center mt-4">
                  <Button
                    onClick={checkAnswer}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Finalizar Tentativa
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Resultado */}
          {showResult && userPulseCount !== null && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Feedback */}
                <div className={`p-4 rounded-lg border-2 ${Math.abs(userPulseCount - currentExercise.correctPulse) <= 1
                  ? 'bg-green-500/20 border-green-500/50'
                  : 'bg-red-500/20 border-red-500/50'
                  }`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {Math.abs(userPulseCount - currentExercise.correctPulse) <= 1 ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                        <span className="text-xl font-bold text-green-400">Bom trabalho! 🎉</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-red-400" />
                        <span className="text-xl font-bold text-red-400">Continue praticando</span>
                      </>
                    )}
                  </div>

                  <div className="text-center text-gray-300 text-sm space-y-1">
                    <p>
                      <strong className="text-white">Você registrou:</strong> {userPulseCount} batida{userPulseCount !== 1 ? 's' : ''}
                    </p>
                    <p>
                      <strong className="text-white">Padrão tinha:</strong> {currentExercise.correctPulse} batida{currentExercise.correctPulse !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Informação do Padrão */}
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-gray-300 text-center mb-2">
                    <strong className="text-white">Padrão tocado:</strong> {currentExercise.pattern.name}
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    {currentExercise.pattern.description} ({currentExercise.pattern.bpm} BPM)
                  </p>
                </div>

                {/* Dica Contextual */}
                {Math.abs(userPulseCount - currentExercise.correctPulse) > 1 && (
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <p className="text-xs text-blue-300 text-center">
                      💡 <strong>Dica:</strong> Tente contar mentalmente enquanto ouve.
                      O pulso é a base do ritmo - sinta-o, não apenas ouça!
                    </p>
                  </div>
                )}

                {/* Botão Próximo */}
                <Button
                  onClick={nextExercise}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  Próximo Exercício
                </Button>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Indicador de Repetição */}
          {isPlaying && repetitionCount > 0 && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-400">
                Repetição {repetitionCount}/{maxRepetitions}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Dicas */}
      <Card className="p-5 bg-[#1a1a2e]/60 backdrop-blur-xl border-white/10">
        <h4 className="text-lg font-bold text-white mb-3">💡 Como Treinar</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• <strong>Ouça primeiro:</strong> Deixe o padrão tocar algumas vezes antes de tentar seguir</li>
          <li>• <strong>Sinta o pulso:</strong> Não apenas ouça - tente sentir o ritmo no seu corpo</li>
          <li>• <strong>Conte mentalmente:</strong> "Um, dois, três, quatro" ajuda a internalizar</li>
          <li>• <strong>Reduza dependência visual:</strong> Este treino desenvolve sua escuta ativa</li>
          <li>• <strong>Pratique regularmente:</strong> 5-10 minutos por dia desenvolvem percepção rítmica</li>
        </ul>
      </Card>
    </div>
  );
}
