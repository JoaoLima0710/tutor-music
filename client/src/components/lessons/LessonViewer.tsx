/**
 * Visualizador de Lições
 * Exibe lições passo a passo com feedback imediato
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  BookOpen,
  Target,
  Award,
  Clock,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lesson, LessonStep } from '@/data/lessons';
import { InteractiveChordExercise } from './InteractiveChordExercise';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useProgressionStore } from '@/stores/useProgressionStore';

interface LessonViewerProps {
  lesson: Lesson;
  onComplete: () => void;
  onExit: () => void;
}

export function LessonViewer({ lesson, onComplete, onExit }: LessonViewerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [lessonComplete, setLessonComplete] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [stepResults, setStepResults] = useState<Record<string, { accuracy: number; time: number }>>({});
  
  const { addXP, unlockAchievement, updateMissionProgress } = useGamificationStore();
  const { updateSkillProgress, addPracticeTime } = useProgressionStore();
  
  const currentStep = lesson.steps[currentStepIndex];
  const progress = (completedSteps.size / lesson.steps.length) * 100;

  // Timer da lição
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalTime(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Completar step
  const completeStep = (accuracy?: number, time?: number) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep.id);
    setCompletedSteps(newCompleted);
    
    if (accuracy && time) {
      setStepResults(prev => ({
        ...prev,
        [currentStep.id]: { accuracy, time },
      }));
    }
    
    // Verificar se completou tudo
    if (newCompleted.size === lesson.steps.length) {
      finishLesson();
    } else {
      // Ir para próximo step
      nextStep();
    }
  };

  // Próximo step
  const nextStep = () => {
    if (currentStepIndex < lesson.steps.length - 1) {
      setCurrentStepIndex(i => i + 1);
    }
  };

  // Step anterior
  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(i => i - 1);
    }
  };

  // Finalizar lição
  const finishLesson = () => {
    setLessonComplete(true);
    
    // Calcular métricas
    const avgAccuracy = Object.values(stepResults).length > 0
      ? Object.values(stepResults).reduce((sum, r) => sum + r.accuracy, 0) / Object.values(stepResults).length
      : 100;
    
    // Dar recompensas
    addXP(lesson.xpReward);
    addPracticeTime(Math.round(totalTime / 60));
    updateMissionProgress('practice-time', totalTime);
    
    // Desbloquear habilidades
    lesson.skillsToUnlock.forEach(skillId => {
      updateSkillProgress(skillId, avgAccuracy, avgAccuracy);
    });
    
    // Verificar conquistas
    if (lesson.id === 'lesson-2-1') {
      unlockAchievement('first-chord');
    }
    if (lesson.id === 'lesson-4-2') {
      unlockAchievement('first-song');
    }
  };

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Renderizar conteúdo do step
  const renderStepContent = (step: LessonStep) => {
    switch (step.type) {
      case 'text':
        return (
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
              {step.content.split('\n').map((line, i) => {
                // Processar markdown básico
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <h3 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                }
                if (line.startsWith('- ')) {
                  return <li key={i} className="ml-4 text-gray-300">{line.substring(2)}</li>;
                }
                if (line.includes('**')) {
                  const parts = line.split(/\*\*(.*?)\*\*/);
                  return (
                    <p key={i} className="text-gray-300">
                      {parts.map((part, j) => 
                        j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
                      )}
                    </p>
                  );
                }
                return line ? <p key={i} className="text-gray-300">{line}</p> : <br key={i} />;
              })}
            </div>
          </div>
        );
        
      case 'exercise':
        if (step.exerciseType === 'chord' && step.exerciseData?.chord) {
          return (
            <InteractiveChordExercise
              chord={step.exerciseData.chord}
              fingers={step.exerciseData.fingers || []}
              stringsToPlay={step.exerciseData.stringsToPlay || [1, 2, 3, 4, 5, 6]}
              onComplete={(accuracy, time) => completeStep(accuracy, time)}
              targetRepetitions={step.exerciseData.repetitions || 5}
            />
          );
        }
        return (
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <p className="text-gray-300 whitespace-pre-wrap">{step.content}</p>
            <Button
              onClick={() => completeStep(100, 0)}
              className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-500"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Concluir Exercício
            </Button>
          </div>
        );
        
      case 'practice':
        return (
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Hora de Praticar!</h3>
            </div>
            <p className="text-gray-300 whitespace-pre-wrap mb-6">{step.content}</p>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <Clock className="w-4 h-4" />
              <span>Duração sugerida: {Math.round(step.duration / 60)} min</span>
            </div>
            <Button
              onClick={() => completeStep(100, step.duration)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completei a Prática!
            </Button>
          </div>
        );
        
      case 'quiz':
        if (step.exerciseData) {
          return (
            <QuizComponent
              question={step.exerciseData.question}
              options={step.exerciseData.options}
              correctIndex={step.exerciseData.correct}
              onComplete={(correct) => completeStep(correct ? 100 : 50, 0)}
            />
          );
        }
        return null;
        
      default:
        return (
          <div className="p-6 rounded-xl bg-white/5">
            <p className="text-gray-300">{step.content}</p>
          </div>
        );
    }
  };

  // Tela de conclusão
  if (lessonComplete) {
    const avgAccuracy = Object.values(stepResults).length > 0
      ? Math.round(Object.values(stepResults).reduce((sum, r) => sum + r.accuracy, 0) / Object.values(stepResults).length)
      : 100;
    
    return (
      <Card className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-6"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
            <Award className="w-12 h-12 text-white" />
          </div>
        </motion.div>
        
        <h2 className="text-3xl font-bold text-white mb-2">Lição Concluída!</h2>
        <p className="text-gray-400 mb-8">{lesson.title}</p>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-3xl font-bold text-green-400">{avgAccuracy}%</p>
            <p className="text-sm text-gray-400">Precisão</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-3xl font-bold text-cyan-400">{formatTime(totalTime)}</p>
            <p className="text-sm text-gray-400">Tempo</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-3xl font-bold text-yellow-400">+{lesson.xpReward}</p>
            <p className="text-sm text-gray-400">XP</p>
          </div>
        </div>
        
        {lesson.skillsToUnlock.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <p className="text-sm text-purple-400 mb-2">Habilidades Desbloqueadas:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {lesson.skillsToUnlock.map(skill => (
                <span key={skill} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-4">
          <Button
            onClick={onExit}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300"
          >
            Voltar ao Menu
          </Button>
          <Button
            onClick={onComplete}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            Próxima Lição
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onExit}
          variant="ghost"
          className="text-gray-400 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Sair
        </Button>
        
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
          <p className="text-sm text-gray-400">
            Passo {currentStepIndex + 1} de {lesson.steps.length}
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-mono">{formatTime(totalTime)}</span>
        </div>
      </div>
      
      {/* Progresso */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex gap-1">
          {lesson.steps.map((step, i) => (
            <button
              key={step.id}
              onClick={() => setCurrentStepIndex(i)}
              className={`flex-1 h-1 rounded-full transition-colors ${
                completedSteps.has(step.id) 
                  ? 'bg-green-500' 
                  : i === currentStepIndex 
                    ? 'bg-purple-500' 
                    : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Conteúdo do Step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-6 bg-white/5 border-white/10">
            {/* Título do Step */}
            <div className="flex items-center gap-3 mb-6">
              {currentStep.type === 'text' && <BookOpen className="w-6 h-6 text-blue-400" />}
              {currentStep.type === 'exercise' && <Target className="w-6 h-6 text-orange-400" />}
              {currentStep.type === 'practice' && <PlayCircle className="w-6 h-6 text-purple-400" />}
              {currentStep.type === 'quiz' && <Star className="w-6 h-6 text-yellow-400" />}
              
              <div>
                <h2 className="text-lg font-bold text-white">{currentStep.title}</h2>
                <p className="text-xs text-gray-500">
                  {currentStep.type === 'text' && 'Leitura'}
                  {currentStep.type === 'exercise' && 'Exercício'}
                  {currentStep.type === 'practice' && 'Prática'}
                  {currentStep.type === 'quiz' && 'Quiz'}
                </p>
              </div>
              
              {completedSteps.has(currentStep.id) && (
                <CheckCircle2 className="w-6 h-6 text-green-400 ml-auto" />
              )}
            </div>
            
            {/* Conteúdo */}
            {renderStepContent(currentStep)}
          </Card>
        </motion.div>
      </AnimatePresence>
      
      {/* Navegação */}
      <div className="flex gap-4">
        <Button
          onClick={prevStep}
          disabled={currentStepIndex === 0}
          variant="outline"
          className="flex-1 border-gray-600 text-gray-300 disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
        
        {currentStep.type === 'text' && (
          <Button
            onClick={() => {
              completeStep();
            }}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            {completedSteps.has(currentStep.id) ? 'Próximo' : 'Entendi!'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        
        {(currentStep.type === 'exercise' || currentStep.type === 'practice') && 
          !completedSteps.has(currentStep.id) && currentStepIndex < lesson.steps.length - 1 && (
          <Button
            onClick={nextStep}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300"
          >
            Pular
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Componente de Quiz
function QuizComponent({
  question,
  options,
  correctIndex,
  onComplete,
}: {
  question: string;
  options: string[];
  correctIndex: number;
  onComplete: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    
    setTimeout(() => {
      onComplete(index === correctIndex);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <p className="text-lg text-white font-medium">{question}</p>
      
      <div className="space-y-2">
        {options.map((option, index) => {
          let bgColor = 'bg-white/5 hover:bg-white/10';
          if (answered) {
            if (index === correctIndex) {
              bgColor = 'bg-green-500/20 border-green-500';
            } else if (index === selected && index !== correctIndex) {
              bgColor = 'bg-red-500/20 border-red-500';
            }
          }
          
          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={answered}
              className={`w-full p-4 rounded-lg border border-white/10 text-left transition-all ${bgColor} ${
                answered ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <span className="text-gray-300">{option}</span>
            </button>
          );
        })}
      </div>
      
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            selected === correctIndex 
              ? 'bg-green-500/10 border border-green-500/30' 
              : 'bg-red-500/10 border border-red-500/30'
          }`}
        >
          <p className={selected === correctIndex ? 'text-green-400' : 'text-red-400'}>
            {selected === correctIndex 
              ? 'Correto! Muito bem!' 
              : `Incorreto. A resposta certa é: ${options[correctIndex]}`}
          </p>
        </motion.div>
      )}
    </div>
  );
}
