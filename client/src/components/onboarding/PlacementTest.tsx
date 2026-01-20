/**
 * Teste de Nivelamento
 * Teste opcional para determinar nível inicial do usuário
 * 10 questões práticas que avaliam conhecimento e habilidade
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Music, 
  Guitar, 
  TrendingUp,
  SkipForward,
  Award
} from 'lucide-react';
import { unifiedAudioService } from '@/services/UnifiedAudioService';
import { toast } from 'sonner';

export type PlacementLevel = 'beginner' | 'intermediate' | 'advanced';

interface PlacementQuestion {
  id: string;
  type: 'chord-recognition' | 'scale-recognition' | 'interval-recognition' | 'rhythm' | 'theory';
  question: string;
  description: string;
  options: string[];
  correctAnswer: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  audioExample?: string[]; // Notas para tocar
}

const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // Questões Básicas (1-3)
  {
    id: 'q1',
    type: 'chord-recognition',
    question: 'Qual acorde é mostrado?',
    description: 'Identifique o acorde básico',
    options: ['C', 'G', 'Am', 'F'],
    correctAnswer: 0,
    difficulty: 1,
  },
  {
    id: 'q2',
    type: 'theory',
    question: 'Quantas notas tem uma escala maior?',
    description: 'Conhecimento básico de teoria',
    options: ['5', '7', '8', '12'],
    correctAnswer: 2,
    difficulty: 1,
  },
  {
    id: 'q3',
    type: 'interval-recognition',
    question: 'Qual intervalo você ouve?',
    description: 'Escute o intervalo tocado',
    options: ['Segunda', 'Terça', 'Quarta', 'Quinta'],
    correctAnswer: 2,
    difficulty: 2,
    audioExample: ['C4', 'F4'],
  },
  // Questões Intermediárias (4-7)
  {
    id: 'q4',
    type: 'chord-recognition',
    question: 'Qual acorde com pestana é mostrado?',
    description: 'Identifique acorde com pestana',
    options: ['F', 'Bm', 'B', 'F#m'],
    correctAnswer: 0,
    difficulty: 3,
  },
  {
    id: 'q5',
    type: 'scale-recognition',
    question: 'Qual escala é tocada?',
    description: 'Escute a escala',
    options: ['Maior', 'Menor Natural', 'Pentatônica Menor', 'Dórica'],
    correctAnswer: 2,
    difficulty: 3,
  },
  {
    id: 'q6',
    type: 'theory',
    question: 'Qual é a função do acorde V em uma progressão?',
    description: 'Conhecimento de harmonia',
    options: ['Tônica', 'Dominante', 'Subdominante', 'Relativa'],
    correctAnswer: 1,
    difficulty: 3,
  },
  {
    id: 'q7',
    type: 'rhythm',
    question: 'Toque o ritmo mostrado',
    description: 'Reproduza o padrão rítmico',
    options: ['Simples', 'Complexo', 'Sincopado', 'Não consegui'],
    correctAnswer: 0,
    difficulty: 2,
  },
  // Questões Avançadas (8-10)
  {
    id: 'q8',
    type: 'chord-recognition',
    question: 'Qual acorde é mostrado?',
    description: 'Identifique acorde avançado',
    options: ['Cmaj7', 'C7', 'Cadd9', 'Csus4'],
    correctAnswer: 0,
    difficulty: 4,
  },
  {
    id: 'q9',
    type: 'scale-recognition',
    question: 'Qual modo grego é tocado?',
    description: 'Identifique o modo',
    options: ['Jônio', 'Dórico', 'Frígio', 'Lídio'],
    correctAnswer: 1,
    difficulty: 5,
  },
  {
    id: 'q10',
    type: 'theory',
    question: 'Qual é a progressão II-V-I em Dó maior?',
    description: 'Conhecimento avançado de harmonia',
    options: ['Dm-G-C', 'Em-A-D', 'F-Bb-Eb', 'G-C-F'],
    correctAnswer: 0,
    difficulty: 5,
  },
];

interface PlacementTestProps {
  onComplete: (level: PlacementLevel, score: number) => void;
  onSkip: () => void;
}

export function PlacementTest({ onComplete, onSkip }: PlacementTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  const question = PLACEMENT_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / PLACEMENT_QUESTIONS.length) * 100;

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setAnswers(prev => new Map(prev).set(currentQuestion, answerIndex));
    setShowResult(true);
  };

  const handlePlayAudio = async () => {
    if (!question.audioExample) return;
    
    setIsPlaying(true);
    try {
      for (const note of question.audioExample) {
        await unifiedAudioService.playNote(note, 'guitar', 0.5);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Erro ao tocar áudio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion < PLACEMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Calcular score
    let correctAnswers = 0;
    let totalDifficulty = 0;
    
    answers.forEach((answer, questionIndex) => {
      const q = PLACEMENT_QUESTIONS[questionIndex];
      if (answer === q.correctAnswer) {
        correctAnswers++;
        totalDifficulty += q.difficulty;
      }
    });
    
    const score = (correctAnswers / PLACEMENT_QUESTIONS.length) * 100;
    const averageDifficulty = totalDifficulty / correctAnswers || 0;
    
    // Determinar nível baseado em score e dificuldade média das questões acertadas
    let level: PlacementLevel = 'beginner';
    
    if (score >= 80 && averageDifficulty >= 4) {
      level = 'advanced';
    } else if (score >= 60 || averageDifficulty >= 3) {
      level = 'intermediate';
    } else {
      level = 'beginner';
    }
    
    setTestCompleted(true);
    
    // Toast com resultado
    toast.success(`Teste concluído! Nível determinado: ${level === 'beginner' ? 'Iniciante' : level === 'intermediate' ? 'Intermediário' : 'Avançado'}`);
    
    // Aguardar um pouco antes de chamar onComplete
    setTimeout(() => {
      onComplete(level, score);
    }, 2000);
  };

  if (testCompleted) {
    const correctCount = Array.from(answers.values()).filter((answer, idx) => 
      answer === PLACEMENT_QUESTIONS[idx].correctAnswer
    ).length;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <Award className="w-10 h-10 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Teste Concluído!</h3>
          <p className="text-gray-300">
            Você acertou {correctCount} de {PLACEMENT_QUESTIONS.length} questões
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-sm text-gray-400 mb-2">Processando resultado...</p>
          <Progress value={100} className="h-2" />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Teste de Nivelamento</h2>
          <p className="text-gray-400 text-sm">
            Questão {currentQuestion + 1} de {PLACEMENT_QUESTIONS.length}
          </p>
        </div>
        <Button
          onClick={onSkip}
          variant="outline"
          size="sm"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Pular
        </Button>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-2" />

      {/* Question Card */}
      <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <div className="space-y-4">
          {/* Question Type Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                question.type === 'chord-recognition' ? 'border-blue-500/30 text-blue-400' :
                question.type === 'scale-recognition' ? 'border-purple-500/30 text-purple-400' :
                question.type === 'interval-recognition' ? 'border-green-500/30 text-green-400' :
                question.type === 'rhythm' ? 'border-orange-500/30 text-orange-400' :
                'border-yellow-500/30 text-yellow-400'
              }
            >
              {question.type === 'chord-recognition' ? '🎸 Acordes' :
               question.type === 'scale-recognition' ? '🎵 Escalas' :
               question.type === 'interval-recognition' ? '🎼 Intervalos' :
               question.type === 'rhythm' ? '🥁 Ritmo' :
               '📚 Teoria'}
            </Badge>
            <Badge variant="outline" className="border-gray-500/30 text-gray-400">
              Dificuldade: {question.difficulty}/5
            </Badge>
          </div>

          {/* Question */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{question.question}</h3>
            <p className="text-gray-400 text-sm">{question.description}</p>
          </div>

          {/* Audio Example */}
          {question.audioExample && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <Button
                onClick={handlePlayAudio}
                disabled={isPlaying}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <Play className="w-4 h-4 mr-2" />
                {isPlaying ? 'Tocando...' : 'Ouvir Exemplo'}
              </Button>
            </div>
          )}

          {/* Answer Options */}
          <div className="space-y-2">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const showFeedback = showResult && isSelected;

              return (
                <motion.button
                  key={index}
                  onClick={() => !showResult && handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    showFeedback
                      ? isCorrect
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-red-500/20 border-red-500/50 text-red-400'
                      : isSelected
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                      : 'bg-white/5 border-white/10 text-white hover:border-white/20 hover:bg-white/10'
                  }`}
                  whileHover={!showResult ? { scale: 1.02 } : {}}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showFeedback && (
                      isCorrect ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Next Button */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {currentQuestion < PLACEMENT_QUESTIONS.length - 1 ? 'Próxima Questão' : 'Finalizar Teste'}
              </Button>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Info */}
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <p className="text-sm text-gray-300">
          💡 <strong>Dica:</strong> Este teste ajuda a determinar seu nível inicial e desbloquear os módulos apropriados. 
          Você pode pular a qualquer momento.
        </p>
      </div>
    </div>
  );
}
