/**
 * QuizPlayer Page
 * Full quiz experience with progress, questions, and results
 */

import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    FileQuestion,
    CheckCircle2,
    XCircle,
    Star,
    Trophy,
    RotateCcw,
    Home,
    Sparkles
} from 'lucide-react';
import { QuizQuestionComponent } from '@/components/pedagogy/QuizQuestion';
import { useUserProgressStore } from '@/stores/useUserProgressStore';
import { module1_1 } from '@/data/modules/module-1-1';
import { module1_2 } from '@/data/modules/module-1-2';
import { Quiz, QuizAnswer, QuizResult, Module } from '@/types/pedagogy';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// All quizzes from modules
const allQuizzes: Record<string, Quiz> = {};
const quizToModule: Record<string, string> = {};
const allModulesMap: Record<string, Module> = {};

[module1_1, module1_2].forEach(module => {
    allQuizzes[module.quiz.id] = module.quiz;
    quizToModule[module.quiz.id] = module.id;
    allModulesMap[module.id] = module;
});

// Confetti effect
const triggerConfetti = () => {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
        });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
};

export function QuizPlayer() {
    const [, params] = useRoute('/learn/quiz/:quizId');
    const [, setLocation] = useLocation();
    const { progress, submitQuiz, completeModule, earnBadge, updateStreak } = useUserProgressStore();

    const quizId = params?.quizId || '';
    const quiz = allQuizzes[quizId];
    const moduleId = quizToModule[quizId];

    // State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<QuizAnswer[]>([]);
    const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>();
    const [showFeedback, setShowFeedback] = useState(false);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
    const [startTime] = useState(() => Date.now());

    // Update streak
    useEffect(() => {
        updateStreak();
    }, []);

    if (!quiz) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">Quiz não encontrado</p>
                    <button
                        onClick={() => setLocation('/learn')}
                        className="text-blue-400 hover:text-blue-300"
                    >
                        Voltar para Aprender
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

    const handleSelectOption = (optionId: string) => {
        if (!showFeedback) {
            setSelectedOptionId(optionId);
        }
    };

    const handleConfirm = () => {
        if (selectedOptionId) {
            setShowFeedback(true);

            // Store answer
            const answer: QuizAnswer = {
                questionId: currentQuestion.id,
                selectedOptionId,
            };
            setAnswers(prev => [...prev, answer]);
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            // Submit quiz
            const allAnswers = [...answers];

            // Build correct answers map
            const correctAnswers: Record<string, string> = {};
            const explanations: Record<string, string> = {};
            quiz.questions.forEach(q => {
                correctAnswers[q.id] = q.correctOptionId;
                explanations[q.id] = q.explanation;
            });

            const result = submitQuiz(quizId, allAnswers, correctAnswers, explanations, quiz.passingScore);
            setQuizResult(result);

            // Celebration for passing
            if (result.passed) {
                triggerConfetti();

                // Check if module is now complete
                const module = allModulesMap[moduleId];
                if (module) {
                    const allLessonsComplete = module.lessons.every(
                        l => progress.completedLessons.includes(l.id)
                    );
                    const allExercisesComplete = module.exercises.every(
                        e => progress.completedExercises.includes(e.id)
                    );

                    if (allLessonsComplete && allExercisesComplete) {
                        completeModule(moduleId);
                        if (module.badgeReward) {
                            earnBadge(module.badgeReward.id);
                        }
                        toast.success('🎉 Módulo concluído!', {
                            description: `Você completou "${module.title}" e ganhou ${module.xpReward} XP!`,
                        });
                    }
                }
            }
        } else {
            // Move to next question
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOptionId(undefined);
            setShowFeedback(false);
        }
    };

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setSelectedOptionId(undefined);
        setShowFeedback(false);
        setQuizResult(null);
    };

    const handleBack = () => {
        setLocation(`/learn/module/${moduleId}`);
    };

    // Results screen
    if (quizResult) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-lg w-full"
                >
                    {/* Result Card */}
                    <div className={cn(
                        'rounded-2xl p-8 text-center border',
                        quizResult.passed
                            ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30'
                            : 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30'
                    )}>
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="mb-6"
                        >
                            {quizResult.passed ? (
                                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Trophy className="w-12 h-12 text-white" />
                                </div>
                            ) : (
                                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                    <XCircle className="w-12 h-12 text-white" />
                                </div>
                            )}
                        </motion.div>

                        {/* Title */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={cn(
                                'text-3xl font-bold mb-2',
                                quizResult.passed ? 'text-green-400' : 'text-red-400'
                            )}
                        >
                            {quizResult.passed ? '🎉 Parabéns!' : 'Quase lá!'}
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-300 mb-6"
                        >
                            {quizResult.passed
                                ? 'Você foi aprovado no quiz!'
                                : 'Continue praticando e tente novamente.'}
                        </motion.p>

                        {/* Score */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gray-800/50 rounded-xl p-6 mb-6"
                        >
                            <div className="text-6xl font-bold text-white mb-2">
                                {quizResult.score}%
                            </div>
                            <p className="text-gray-400">
                                {quizResult.correctCount} de {quizResult.totalQuestions} corretas
                            </p>

                            {/* Progress bar */}
                            <div className="mt-4 h-3 bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${quizResult.score}%` }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                    className={cn(
                                        'h-full rounded-full',
                                        quizResult.score >= quiz.passingScore
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                            : 'bg-gradient-to-r from-red-500 to-orange-500'
                                    )}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Mínimo para aprovação: {quiz.passingScore}%
                            </p>
                        </motion.div>

                        {/* XP Earned */}
                        {quizResult.passed && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 }}
                                className="flex items-center justify-center gap-2 mb-6"
                            >
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                <span className="text-yellow-400 font-semibold">
                                    +{quizResult.score === 100 ? quiz.xpReward + quiz.perfectScoreBonus : quiz.xpReward} XP
                                </span>
                                {quizResult.score === 100 && (
                                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                                        Bônus nota máxima!
                                    </span>
                                )}
                            </motion.div>
                        )}

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-3"
                        >
                            {quizResult.passed ? (
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors w-full sm:w-auto justify-center"
                                >
                                    <Home className="w-5 h-5" />
                                    Voltar ao Módulo
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleRetry}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                        Tentar Novamente
                                    </button>
                                    <button
                                        onClick={handleBack}
                                        className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors w-full sm:w-auto justify-center"
                                    >
                                        Revisar Lições
                                    </button>
                                </>
                            )}
                        </motion.div>
                    </div>

                    {/* Answer Review */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="mt-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">Suas Respostas:</h3>
                        <div className="space-y-2">
                            {quizResult.answers.map((answer, index) => {
                                const question = quiz.questions.find(q => q.id === answer.questionId);
                                return (
                                    <div
                                        key={answer.questionId}
                                        className={cn(
                                            'flex items-center gap-3 p-3 rounded-lg border',
                                            answer.isCorrect
                                                ? 'bg-green-500/10 border-green-500/30'
                                                : 'bg-red-500/10 border-red-500/30'
                                        )}
                                    >
                                        <span className={cn(
                                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                                            answer.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                        )}>
                                            {answer.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        </span>
                                        <span className="text-sm text-gray-300 truncate flex-1">
                                            {index + 1}. {question?.question.slice(0, 50)}...
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    // Quiz taking screen
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
            {/* Header */}
            <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Sair do Quiz</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <FileQuestion className="w-5 h-5 text-purple-400" />
                            <span className="text-white font-medium">{quiz.title}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    <QuizQuestionComponent
                        key={currentQuestion.id}
                        question={currentQuestion}
                        questionNumber={currentQuestionIndex + 1}
                        totalQuestions={quiz.questions.length}
                        selectedOptionId={selectedOptionId}
                        showFeedback={showFeedback}
                        onSelectOption={handleSelectOption}
                        onConfirm={handleConfirm}
                        onNext={handleNext}
                    />
                </AnimatePresence>
            </main>
        </div>
    );
}

export default QuizPlayer;
