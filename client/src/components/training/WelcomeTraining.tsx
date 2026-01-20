/**
 * Treino de Boas-Vindas
 * Especial para primeiro acesso - 1 módulo de 10 minutos focado em acordes básicos
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Music, 
  Play, 
  CheckCircle2, 
  ArrowRight,
  Target,
  Clock,
  GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useGamificationStore } from '@/stores/useGamificationStore';

interface WelcomeTrainingModule {
  id: string;
  title: string;
  description: string;
  duration: number; // minutos
  steps: Array<{
    id: string;
    title: string;
    instruction: string;
    completed: boolean;
  }>;
}

const WELCOME_TRAINING: WelcomeTrainingModule = {
  id: 'welcome_basic_chords',
  title: 'Primeiros Passos: Acordes Básicos',
  description: 'Aprenda os 3 acordes mais importantes para começar a tocar',
  duration: 10,
  steps: [
    {
      id: 'chord_c',
      title: 'Acorde C (Dó Maior)',
      instruction: 'Posicione os dedos conforme mostrado. Toque todas as cordas e ouça o som.',
      completed: false
    },
    {
      id: 'chord_g',
      title: 'Acorde G (Sol Maior)',
      instruction: 'Agora vamos para o acorde G. Preste atenção na posição dos dedos.',
      completed: false
    },
    {
      id: 'chord_am',
      title: 'Acorde Am (Lá Menor)',
      instruction: 'Por último, o acorde Am. Este é um dos mais fáceis!',
      completed: false
    },
    {
      id: 'transition',
      title: 'Transição entre Acordes',
      instruction: 'Pratique mudar entre C, G e Am. Comece devagar e aumente a velocidade gradualmente.',
      completed: false
    }
  ]
};

export function WelcomeTraining() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isActive, setIsActive] = useState(false);
  const { addXP } = useGamificationStore();

  useEffect(() => {
    // Verificar se é primeiro acesso
    const firstAccess = localStorage.getItem('musictutor_first_access');
    const welcomeCompleted = localStorage.getItem('musictutor_welcome_training_completed');
    
    if (firstAccess === 'true' && !welcomeCompleted) {
      setIsActive(true);
    }
  }, []);

  const completeStep = (stepId: string) => {
    setCompletedSteps(prev => new Set(prev).add(stepId));
    
    // Avançar para próximo passo
    if (currentStep < WELCOME_TRAINING.steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 1000);
    } else {
      // Treino completo
      completeTraining();
    }
  };

  const completeTraining = () => {
    localStorage.setItem('musictutor_welcome_training_completed', 'true');
    addXP(200); // XP bônus pelo treino de boas-vindas
    setIsActive(false);
  };

  const skipTraining = () => {
    localStorage.setItem('musictutor_welcome_training_completed', 'true');
    setIsActive(false);
  };

  if (!isActive) {
    return null;
  }

  const currentStepData = WELCOME_TRAINING.steps[currentStep];
  const progress = ((completedSteps.size + (currentStepData.completed ? 1 : 0)) / WELCOME_TRAINING.steps.length) * 100;
  const isLastStep = currentStep === WELCOME_TRAINING.steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-2xl bg-gradient-to-br from-purple-900/95 to-blue-900/95 border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">
                  {WELCOME_TRAINING.title}
                </CardTitle>
                <p className="text-white/70 text-sm mt-1">
                  Treino de Boas-Vindas • {WELCOME_TRAINING.duration} minutos
                </p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/40">
              <GraduationCap className="w-3 h-3 mr-1" />
              Iniciante
            </Badge>
          </div>
          
          <Progress value={progress} className="h-2 mt-4" />
          <div className="flex justify-between text-xs text-white/60 mt-2">
            <span>Passo {currentStep + 1} de {WELCOME_TRAINING.steps.length}</span>
            <span>{Math.round(progress)}% completo</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Instrução Atual */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-300" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                {currentStepData.title}
              </h3>
            </div>
            
            <p className="text-white/80 mb-4">
              {currentStepData.instruction}
            </p>

            {/* Visual do Acorde (simplificado) */}
            {currentStepData.id.startsWith('chord_') && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {currentStepData.id === 'chord_c' ? 'C' : 
                     currentStepData.id === 'chord_g' ? 'G' : 'Am'}
                  </div>
                  <Link href="/chords">
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      Ver Diagrama Completo
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Botão de Ação */}
            <div className="mt-6">
              <Button
                onClick={() => completeStep(currentStepData.id)}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                size="lg"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Completar Treino
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Praticar e Continuar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Lista de Passos */}
          <div className="space-y-2">
            <p className="text-sm text-white/60 mb-2">Progresso do treino:</p>
            {WELCOME_TRAINING.steps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id) || (index < currentStep);
              const isCurrent = index === currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isCompleted
                      ? 'bg-green-500/10 border-green-500/40'
                      : isCurrent
                      ? 'bg-purple-500/20 border-purple-500/40'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                        isCurrent ? 'border-purple-400 bg-purple-500/20' : 'border-white/30'
                      }`} />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm ${
                        isCompleted ? 'text-green-300 line-through' : 
                        isCurrent ? 'text-white font-semibold' : 'text-white/60'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dica */}
          <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
            <p className="text-blue-200 text-sm">
              💡 <strong>Dica:</strong> Não se preocupe se não sair perfeito na primeira vez. 
              O importante é praticar regularmente!
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={skipTraining}
              className="text-white/70 hover:text-white"
            >
              Pular Treino
            </Button>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Clock className="w-4 h-4" />
              <span>Recompensa: +200 XP</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
