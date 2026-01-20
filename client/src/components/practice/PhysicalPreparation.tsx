/**
 * Módulo de Preparação Física
 * Exercícios de alongamento e fortalecimento para iniciantes
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  Play, 
  RotateCcw,
  Heart,
  Hand,
  Target,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number; // segundos
  category: 'warmup' | 'strength' | 'flexibility';
  instructions: string[];
  tips: string[];
  icon: any;
}

const EXERCISES: Exercise[] = [
  {
    id: 'finger-stretch',
    name: 'Alongamento de Dedos',
    description: 'Aquece e alonga os dedos antes de tocar',
    duration: 30,
    category: 'warmup',
    icon: Hand,
    instructions: [
      'Estenda a mão esquerda à sua frente',
      'Com a mão direita, puxe suavemente cada dedo para trás',
      'Mantenha por 5 segundos cada dedo',
      'Repita com a mão direita',
    ],
    tips: [
      'Não force - alongamento deve ser suave',
      'Respire profundamente durante o alongamento',
      'Se sentir dor, pare imediatamente',
    ],
  },
  {
    id: 'wrist-circles',
    name: 'Círculos de Pulso',
    description: 'Aquece os pulsos e previne lesões',
    duration: 20,
    category: 'warmup',
    icon: RotateCcw,
    instructions: [
      'Estenda os braços à frente',
      'Gire os pulsos em círculos lentos',
      '10 rotações no sentido horário',
      '10 rotações no sentido anti-horário',
    ],
    tips: [
      'Movimentos suaves e controlados',
      'Não force a amplitude',
      'Faça pausas se sentir desconforto',
    ],
  },
  {
    id: 'grip-squeeze',
    name: 'Fortalecimento de Grip',
    description: 'Fortalece os músculos da mão para pressionar cordas',
    duration: 60,
    category: 'strength',
    icon: Target,
    instructions: [
      'Segure uma bola de tênis ou objeto macio',
      'Aperte com força por 3 segundos',
      'Solte lentamente',
      'Repita 10 vezes com cada mão',
    ],
    tips: [
      'Use objeto macio para iniciantes',
      'Não exagere - cansaço é normal',
      'Faça pausas entre séries',
    ],
  },
  {
    id: 'finger-independence',
    name: 'Independência dos Dedos',
    description: 'Melhora controle individual de cada dedo',
    duration: 45,
    category: 'flexibility',
    icon: Hand,
    instructions: [
      'Coloque a mão sobre uma superfície plana',
      'Levante um dedo por vez, mantendo os outros abaixados',
      'Comece pelo indicador, depois médio, anelar, mindinho',
      'Repita 5 vezes com cada dedo',
    ],
    tips: [
      'É normal que seja difícil no início',
      'Pratique devagar e com controle',
      'O mindinho e anelar são os mais difíceis',
    ],
  },
  {
    id: 'shoulder-rolls',
    name: 'Rolamento de Ombros',
    description: 'Relaxa ombros e pescoço após prática',
    duration: 30,
    category: 'warmup',
    icon: Activity,
    instructions: [
      'Em pé ou sentado, relaxe os ombros',
      'Rode os ombros para frente 5 vezes',
      'Rode os ombros para trás 5 vezes',
      'Repita 2 séries',
    ],
    tips: [
      'Movimentos lentos e fluidos',
      'Foque em relaxar a tensão',
      'Ótimo para fazer entre sessões de prática',
    ],
  },
  {
    id: 'thumb-stretch',
    name: 'Alongamento do Polegar',
    description: 'Específico para posicionamento no braço do violão',
    duration: 25,
    category: 'flexibility',
    icon: Hand,
    instructions: [
      'Estenda a mão com palma para cima',
      'Com a outra mão, puxe o polegar suavemente',
      'Mantenha por 10 segundos',
      'Repita 3 vezes com cada mão',
    ],
    tips: [
      'Polegar é crucial para técnica de violão',
      'Alongamento suave é suficiente',
      'Faça antes de sessões longas',
    ],
  },
];

export function PhysicalPreparation() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentCategory, setCurrentCategory] = useState<'all' | 'warmup' | 'strength' | 'flexibility'>('all');

  const filteredExercises = currentCategory === 'all' 
    ? EXERCISES 
    : EXERCISES.filter(e => e.category === currentCategory);

  const handleStartExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setTimeRemaining(exercise.duration);
    setIsRunning(true);
  };

  const handleCompleteExercise = () => {
    if (selectedExercise) {
      setCompletedExercises(prev => new Set(prev).add(selectedExercise.id));
      setIsRunning(false);
      setTimeRemaining(0);
      setSelectedExercise(null);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(0);
    setSelectedExercise(null);
  };

  // Timer countdown
  useEffect(() => {
    if (!isRunning || !selectedExercise || timeRemaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          if (selectedExercise) {
            setCompletedExercises(prevSet => new Set(prevSet).add(selectedExercise.id));
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, selectedExercise]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = selectedExercise && selectedExercise.duration > 0
    ? ((selectedExercise.duration - timeRemaining) / selectedExercise.duration) * 100
    : 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Preparação Física</h2>
          <p className="text-sm text-gray-400">Exercícios de alongamento e fortalecimento</p>
        </div>
      </div>

      {/* Dica Importante */}
      <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-300">
              <strong className="text-blue-400">💡 Recomendado:</strong> Faça estes exercícios antes de cada sessão de prática. 
              Eles preparam seus músculos e previnem lesões, especialmente importantes para iniciantes.
            </p>
          </div>
        </div>
      </div>

      {/* Filtros por Categoria */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'Todos' },
          { value: 'warmup', label: 'Aquecimento' },
          { value: 'strength', label: 'Força' },
          { value: 'flexibility', label: 'Flexibilidade' },
        ].map((cat) => (
          <Button
            key={cat.value}
            onClick={() => setCurrentCategory(cat.value as any)}
            variant={currentCategory === cat.value ? 'default' : 'outline'}
            size="sm"
            className={
              currentCategory === cat.value
                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                : 'border-white/20 text-white hover:bg-white/10'
            }
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Exercício em Execução */}
      {selectedExercise && isRunning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{selectedExercise.name}</h3>
              <p className="text-sm text-gray-300">{selectedExercise.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-400">{formatTime(timeRemaining)}</div>
              <div className="text-xs text-gray-400">Tempo restante</div>
            </div>
          </div>

          <Progress value={progress} className="mb-4 h-2" />

          <div className="space-y-3 mb-4">
            <h4 className="font-semibold text-white">Instruções:</h4>
            <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
              {selectedExercise.instructions.map((instruction, idx) => (
                <li key={idx}>{instruction}</li>
              ))}
            </ol>
          </div>

          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <h4 className="font-semibold text-white mb-2 text-sm">💡 Dicas:</h4>
            <ul className="space-y-1 text-xs text-gray-300 list-disc list-inside">
              {selectedExercise.tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleCompleteExercise}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Concluir
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Lista de Exercícios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExercises.map((exercise) => {
          const isCompleted = completedExercises.has(exercise.id);
          const isActive = selectedExercise?.id === exercise.id && isRunning;

          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-orange-500/30 to-red-500/30 border-orange-500/50'
                  : isCompleted
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  isCompleted
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/10 text-gray-400'
                }`}>
                  <exercise.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white">{exercise.name}</h3>
                    {isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{exercise.description}</p>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        exercise.category === 'warmup'
                          ? 'border-blue-500/30 text-blue-400'
                          : exercise.category === 'strength'
                          ? 'border-red-500/30 text-red-400'
                          : 'border-purple-500/30 text-purple-400'
                      }`}
                    >
                      {exercise.category === 'warmup' ? 'Aquecimento' :
                       exercise.category === 'strength' ? 'Força' : 'Flexibilidade'}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatTime(exercise.duration)}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleStartExercise(exercise)}
                    disabled={isActive}
                    size="sm"
                    className={`w-full ${
                      isCompleted
                        ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Em Execução...
                      </>
                    ) : isCompleted ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Refazer
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progresso Geral */}
      {completedExercises.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Progresso da Sessão</p>
              <p className="text-2xl font-bold text-green-400">
                {completedExercises.size}/{EXERCISES.length} exercícios
              </p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border-4 border-green-500/30 flex items-center justify-center">
                <Heart className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
}
