/**
 * 🎓 Guided Training Session Component
 * 
 * Sessão de Treino Guiada que simula um professor humano.
 * 
 * Funcionalidades:
 * - Estrutura fixa de sessão (começo, meio, fim)
 * - Sequenciamento de treinos existentes
 * - Encerramento com reforço positivo
 * - Sugestão de próximo passo
 * 
 * REGRAS:
 * - NÃO cria novo estado global complexo
 * - NÃO altera arquitetura de áudio
 * - NÃO impacta rotas existentes
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  CheckCircle2,
  ArrowRight,
  Target,
  Clock,
  Trophy,
  Lightbulb,
  Heart,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PhysicalPreparation } from './PhysicalPreparation';
import { MotorCoordinationExercises } from './MotorCoordinationExercises';
import { RhythmTraining } from './RhythmTraining';
import { ChordProgressionPractice } from './ChordProgressionPractice';

type SessionPhase = 'welcome' | 'warmup' | 'coordination' | 'rhythm' | 'chords' | 'completion';

interface SessionStep {
  id: SessionPhase;
  title: string;
  description: string;
  duration: number; // minutos estimados
  component?: React.ComponentType<any>;
  tips: string[];
}

const SESSION_STRUCTURE: SessionStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo à Sessão de Treino!',
    description: 'Vamos começar com uma sessão completa e guiada',
    duration: 1,
    tips: [
      'Reserve cerca de 20-25 minutos para esta sessão',
      'Tenha seu violão por perto',
      'Vamos começar com aquecimento',
    ],
  },
  {
    id: 'warmup',
    title: 'Aquecimento e Preparação',
    description: 'Prepare seu corpo e mãos para o treino',
    duration: 5,
    component: PhysicalPreparation,
    tips: [
      'Faça os exercícios com calma',
      'Não force movimentos',
      'Respire naturalmente',
    ],
  },
  {
    id: 'coordination',
    title: 'Coordenação Motora',
    description: 'Desenvolva independência das mãos',
    duration: 5,
    component: MotorCoordinationExercises,
    tips: [
      'Foque em precisão, não velocidade',
      'Use as pausas para descansar',
      'Observe o feedback de fadiga',
    ],
  },
  {
    id: 'rhythm',
    title: 'Treino Rítmico',
    description: 'Desenvolva seu pulso interno',
    duration: 5,
    component: RhythmTraining,
    tips: [
      'Ouça o metrônomo antes de bater',
      'Tente sentir o pulso internamente',
      'Mantenha consistência',
    ],
  },
  {
    id: 'chords',
    title: 'Troca de Acordes',
    description: 'Pratique progressões reais',
    duration: 5,
    component: ChordProgressionPractice,
    tips: [
      'Comece devagar',
      'Domine cada velocidade antes de acelerar',
      'Observe o feedback de timing',
    ],
  },
  {
    id: 'completion',
    title: 'Parabéns!',
    description: 'Você completou a sessão de treino',
    duration: 1,
    tips: [],
  },
];

interface GuidedTrainingSessionProps {
  onComplete?: () => void;
  onExit?: () => void;
}

export function GuidedTrainingSession({
  onComplete,
  onExit,
}: GuidedTrainingSessionProps) {
  const [currentPhase, setCurrentPhase] = useState<SessionPhase>('welcome');
  const [completedPhases, setCompletedPhases] = useState<Set<SessionPhase>>(new Set());
  const [sessionStartTime] = useState<number>(Date.now());
  const [phaseStartTime, setPhaseStartTime] = useState<number>(Date.now());

  const currentStep = SESSION_STRUCTURE.find(s => s.id === currentPhase)!;
  const currentIndex = SESSION_STRUCTURE.findIndex(s => s.id === currentPhase);
  const progress = ((currentIndex + 1) / SESSION_STRUCTURE.length) * 100;
  const totalDuration = SESSION_STRUCTURE.reduce((sum, step) => sum + step.duration, 0);

  // Avançar para próxima fase
  const nextPhase = () => {
    setCompletedPhases(prev => new Set(prev).add(currentPhase));
    
    if (currentIndex < SESSION_STRUCTURE.length - 1) {
      setCurrentPhase(SESSION_STRUCTURE[currentIndex + 1].id as SessionPhase);
      setPhaseStartTime(Date.now());
    } else {
      // Sessão completa
      if (onComplete) {
        onComplete();
      }
    }
  };

  // Voltar para fase anterior
  const previousPhase = () => {
    if (currentIndex > 0) {
      setCurrentPhase(SESSION_STRUCTURE[currentIndex - 1].id as SessionPhase);
      setPhaseStartTime(Date.now());
    }
  };

  // Iniciar sessão
  const startSession = () => {
    setCurrentPhase('warmup');
    setPhaseStartTime(Date.now());
  };

  // Calcular tempo decorrido
  const elapsedTime = Math.floor((Date.now() - sessionStartTime) / 1000 / 60); // minutos

  // Renderizar componente da fase atual
  const renderPhaseComponent = () => {
    if (!currentStep.component) return null;

    const Component = currentStep.component;
    
    // Props específicas por componente
    const componentProps: any = {
      onExit: onExit,
    };

    // Adicionar onComplete se o componente suportar
    if (currentStep.id === 'chords') {
      componentProps.onComplete = (accuracy?: number, bpm?: number) => {
        setTimeout(() => {
          nextPhase();
        }, 2000);
      };
    } else if (currentStep.id === 'rhythm') {
      componentProps.onComplete = (accuracy?: number, avgDelay?: number) => {
        setTimeout(() => {
          nextPhase();
        }, 2000);
      };
    } else if (currentStep.id === 'coordination') {
      componentProps.onComplete = (totalSessions?: number, avgFatigue?: number) => {
        setTimeout(() => {
          nextPhase();
        }, 2000);
      };
    }
    
    return (
      <div className="mt-6">
        <Component {...componentProps} />
      </div>
    );
  };

  // Sugestão de próximo passo baseada na fase atual
  const getNextStepSuggestion = (): string => {
    if (currentPhase === 'welcome') {
      return 'Comece com o aquecimento para preparar seu corpo';
    } else if (currentPhase === 'warmup') {
      return 'Agora vamos trabalhar a coordenação motora';
    } else if (currentPhase === 'coordination') {
      return 'Vamos desenvolver seu pulso rítmico';
    } else if (currentPhase === 'rhythm') {
      return 'Agora pratique trocas de acordes em progressões reais';
    } else if (currentPhase === 'chords') {
      return 'Parabéns! Você completou todos os exercícios';
    }
    return '';
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      {/* Header com Progresso */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">🎓 Sessão de Treino Guiada</h2>
            <p className="text-sm text-gray-400">Siga o passo a passo como um professor ao seu lado</p>
          </div>
          {onExit && (
            <Button onClick={onExit} variant="ghost" size="sm" className="text-gray-400">
              Sair
            </Button>
          )}
        </div>

        {/* Barra de Progresso */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progresso da Sessão</span>
            <span>{currentIndex + 1} / {SESSION_STRUCTURE.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Indicadores de Fases */}
        <div className="flex justify-between gap-2 mb-4">
          {SESSION_STRUCTURE.map((step, index) => {
            const isCompleted = completedPhases.has(step.id);
            const isCurrent = step.id === currentPhase;
            const isPast = index < currentIndex;

            return (
              <div
                key={step.id}
                className={`flex-1 h-2 rounded transition-all ${
                  isCompleted
                    ? 'bg-green-500'
                    : isCurrent
                    ? 'bg-purple-500'
                    : isPast
                    ? 'bg-purple-500/30'
                    : 'bg-gray-700'
                }`}
                title={step.title}
              />
            );
          })}
        </div>

        {/* Tempo e Duração */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Tempo: {elapsedTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>Duração estimada: {totalDuration} min</span>
          </div>
        </div>
      </div>

      {/* Fase Atual */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Welcome Phase */}
          {currentPhase === 'welcome' && (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="mb-6"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </motion.div>
              
              <h3 className="text-3xl font-bold text-white mb-3">{currentStep.title}</h3>
              <p className="text-lg text-gray-300 mb-6">{currentStep.description}</p>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-6 text-left">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  O que você vai fazer hoje:
                </h4>
                <ul className="space-y-2 text-gray-300">
                  {SESSION_STRUCTURE.slice(1, -1).map((step, index) => (
                    <li key={step.id} className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold">{index + 1}.</span>
                      <span>{step.title} ({step.duration} min)</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={startSession}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg px-8 py-6"
              >
                <Play className="w-6 h-6 mr-2" />
                Começar Sessão
              </Button>
            </div>
          )}

          {/* Completion Phase */}
          {currentPhase === 'completion' && (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="mb-6"
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/50">
                  <Trophy className="w-16 h-16 text-white" />
                </div>
              </motion.div>

              <h3 className="text-3xl font-bold text-white mb-3">Parabéns! 🎉</h3>
              <p className="text-lg text-gray-300 mb-6">
                Você completou toda a sessão de treino!
              </p>

              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-6 text-left">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  Você conquistou:
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>Aquecimento e preparação física</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>Coordenação motora aprimorada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>Pulso rítmico desenvolvido</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>Trocas de acordes praticadas</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6 text-left">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Próximo passo sugerido:
                </h4>
                <p className="text-gray-300 mb-4">
                  Continue praticando regularmente! Para sua próxima sessão, recomendamos:
                </p>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white font-semibold mb-2">
                    Focar em um exercício específico
                  </p>
                  <p className="text-sm text-gray-400">
                    Escolha o exercício que você sentiu mais dificuldade e pratique por mais tempo.
                    A repetição é a chave para o progresso!
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => {
                    if (onComplete) onComplete();
                  }}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                >
                  Finalizar Sessão
                </Button>
                <Button
                  onClick={() => setCurrentPhase('welcome')}
                  variant="outline"
                  className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5"
                >
                  Fazer Outra Sessão
                </Button>
              </div>
            </div>
          )}

          {/* Fases de Exercício */}
          {currentPhase !== 'welcome' && currentPhase !== 'completion' && (
            <div>
              {/* Cabeçalho da Fase */}
              <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                      {currentIndex}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{currentStep.title}</h3>
                      <p className="text-sm text-gray-300">{currentStep.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                    ~{currentStep.duration} min
                  </Badge>
                </div>

                {/* Dicas da Fase */}
                {currentStep.tips.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-purple-500/20">
                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Dicas:
                    </p>
                    <ul className="space-y-1">
                      {currentStep.tips.map((tip, index) => (
                        <li key={index} className="text-xs text-gray-300 flex items-start gap-2">
                          <span className="text-purple-400 mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sugestão de Próximo Passo */}
                {getNextStepSuggestion() && (
                  <div className="mt-4 pt-4 border-t border-purple-500/20">
                    <p className="text-xs text-blue-400 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      {getNextStepSuggestion()}
                    </p>
                  </div>
                )}
              </div>

              {/* Componente do Exercício */}
              {renderPhaseComponent()}

              {/* Navegação */}
              <div className="mt-6 flex justify-between">
                <Button
                  onClick={previousPhase}
                  disabled={currentIndex === 0}
                  variant="outline"
                  className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5"
                >
                  ← Anterior
                </Button>
                <Button
                  onClick={nextPhase}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {currentIndex === SESSION_STRUCTURE.length - 2 ? 'Finalizar' : 'Próximo →'}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}
