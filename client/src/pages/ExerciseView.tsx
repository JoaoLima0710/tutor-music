/**
 * ExerciseView Page
 * Interactive exercise player with timer, hints, and self-validation
 */

import { useState, useEffect, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Target,
    Clock,
    Star,
    CheckCircle2,
    Lightbulb,
    Play,
    Pause,
    RotateCcw,
    ChevronRight,
    AlertCircle,
    Music
} from 'lucide-react';
import { useUserProgressStore } from '@/stores/useUserProgressStore';
import { module1_1 } from '@/data/modules/module-1-1';
import { module1_2 } from '@/data/modules/module-1-2';
import { Exercise } from '@/types/pedagogy';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// All exercises from all modules
const allExercises: Record<string, Exercise> = {};
const exerciseToModule: Record<string, string> = {};

[module1_1, module1_2].forEach(module => {
    module.exercises.forEach(ex => {
        allExercises[ex.id] = ex;
        exerciseToModule[ex.id] = module.id;
    });
});

export function ExerciseView() {
    const [, params] = useRoute('/learn/exercise/:exerciseId');
    const [, setLocation] = useLocation();
    const { progress, completeExercise, updateStreak } = useUserProgressStore();

    const exerciseId = params?.exerciseId || '';
    const exercise = allExercises[exerciseId];
    const moduleId = exerciseToModule[exerciseId];

    // State
    const [isStarted, setIsStarted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [currentHintIndex, setCurrentHintIndex] = useState(-1);
    const [showHints, setShowHints] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [repetitionCount, setRepetitionCount] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const isCompleted = progress.completedExercises.includes(exerciseId);

    // Update streak
    useEffect(() => {
        updateStreak();
    }, []);

    // Timer logic
    useEffect(() => {
        if (isStarted && !isPaused) {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isStarted, isPaused]);

    if (!exercise) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">Exercício não encontrado</p>
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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        setIsStarted(true);
        setIsPaused(false);
    };

    const handlePause = () => {
        setIsPaused(!isPaused);
    };

    const handleReset = () => {
        setIsStarted(false);
        setIsPaused(false);
        setElapsedTime(0);
        setRepetitionCount(0);
        setCurrentHintIndex(-1);
    };

    const handleShowHint = () => {
        if (currentHintIndex < exercise.hints.length - 1) {
            setCurrentHintIndex(prev => prev + 1);
            setShowHints(true);
        }
    };

    const handleRepetition = () => {
        setRepetitionCount(prev => prev + 1);

        // Celebration at target repetitions
        if (exercise.repetitions && repetitionCount + 1 >= exercise.repetitions) {
            toast.success('🎯 Meta de repetições alcançada!');
        }
    };

    const handleComplete = async (success: boolean) => {
        setIsCompleting(true);

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        completeExercise(exerciseId, success, elapsedTime);

        if (success) {
            toast.success(`🎯 Exercício concluído! +${exercise.xpReward} XP`, {
                description: exercise.title,
            });
        }

        setIsCompleting(false);
        setLocation(`/learn/module/${moduleId}`);
    };

    const handleBack = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setLocation(`/learn/module/${moduleId}`);
    };

    // Get exercise-specific content
    const getExerciseTypeContent = () => {
        switch (exercise.type) {
            case 'chord-change':
                const chordData = exercise.data as { fromChord?: string; toChord: string; targetTime?: number; fingeringTips?: string[] };
                return (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
                        <div className="flex items-center justify-center gap-8 mb-6">
                            {chordData.fromChord && (
                                <>
                                    <div className="text-center">
                                        <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30 flex items-center justify-center mb-2">
                                            <span className="text-4xl font-bold text-white">{chordData.fromChord}</span>
                                        </div>
                                        <p className="text-sm text-gray-400">De</p>
                                    </div>
                                    <ChevronRight className="w-8 h-8 text-purple-400" />
                                </>
                            )}
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 flex items-center justify-center mb-2">
                                    <span className="text-4xl font-bold text-white">{chordData.toChord}</span>
                                </div>
                                <p className="text-sm text-gray-400">{chordData.fromChord ? 'Para' : 'Acorde'}</p>
                            </div>
                        </div>

                        {chordData.fingeringTips && chordData.fingeringTips.length > 0 && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <p className="text-sm font-medium text-blue-400 mb-2">💡 Dicas de dedilhado:</p>
                                <ul className="space-y-1">
                                    {chordData.fingeringTips.map((tip, i) => (
                                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                            <span className="text-blue-400">•</span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );

            case 'theory':
                const theoryData = exercise.data as { questions?: string[] };
                return (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
                        <h4 className="text-lg font-semibold text-white mb-4">Checklist:</h4>
                        <div className="space-y-3">
                            {theoryData.questions?.map((question, i) => (
                                <label key={i} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-2 border-gray-500 text-green-500 focus:ring-green-500 bg-transparent"
                                    />
                                    <span className="text-gray-300">{question}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

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
                            <span className="hidden sm:inline">Voltar ao módulo</span>
                        </button>

                        {/* Timer */}
                        {isStarted && (
                            <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
                                <Clock className="w-4 h-4 text-blue-400" />
                                <span className="font-mono text-lg text-white">{formatTime(elapsedTime)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Exercise Info */}
                <div className="flex items-start gap-4 mb-8">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                        <Target className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                                Exercício
                            </span>
                            {isCompleted && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Concluído
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">{exercise.title}</h1>
                        <p className="text-gray-400">{exercise.instructions}</p>
                    </div>
                </div>

                {/* Goal */}
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="text-sm text-green-400 font-medium">Objetivo</p>
                            <p className="text-white">{exercise.goal}</p>
                        </div>
                    </div>
                </div>

                {/* Exercise-specific content */}
                {getExerciseTypeContent()}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
                        <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-white">{exercise.estimatedTime}</p>
                        <p className="text-xs text-gray-400">minutos</p>
                    </div>

                    {exercise.repetitions && (
                        <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
                            <RotateCcw className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                            <p className="text-2xl font-bold text-white">
                                {repetitionCount}/{exercise.repetitions}
                            </p>
                            <p className="text-xs text-gray-400">repetições</p>
                        </div>
                    )}

                    <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
                        <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-white">{exercise.xpReward}</p>
                        <p className="text-xs text-gray-400">XP</p>
                    </div>
                </div>

                {/* Hints */}
                <AnimatePresence>
                    {showHints && currentHintIndex >= 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                        >
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-400 mb-1">
                                            Dica {currentHintIndex + 1} de {exercise.hints.length}
                                        </p>
                                        <p className="text-gray-300">{exercise.hints[currentHintIndex]}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Common Mistakes */}
                {exercise.commonMistakes.length > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-400 mb-2">Erros comuns a evitar:</p>
                                <ul className="space-y-1">
                                    {exercise.commonMistakes.map((mistake, i) => (
                                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                            <span className="text-yellow-400">•</span>
                                            {mistake}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                    {!isStarted ? (
                        <button
                            onClick={handleStart}
                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                        >
                            <Play className="w-6 h-6" />
                            Iniciar Exercício
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handlePause}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                                    isPaused
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-700 text-white hover:bg-gray-600'
                                )}
                            >
                                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                {isPaused ? 'Continuar' : 'Pausar'}
                            </button>

                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reiniciar
                            </button>

                            {exercise.repetitions && (
                                <button
                                    onClick={handleRepetition}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    +1 Repetição
                                </button>
                            )}

                            {currentHintIndex < exercise.hints.length - 1 && (
                                <button
                                    onClick={handleShowHint}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    <Lightbulb className="w-4 h-4" />
                                    Ver Dica
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Complete Buttons */}
                {isStarted && (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-8 border-t border-gray-700">
                        <button
                            onClick={() => handleComplete(true)}
                            disabled={isCompleting}
                            className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors w-full sm:w-auto justify-center"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Consegui! ✓
                        </button>
                        <button
                            onClick={() => handleComplete(false)}
                            disabled={isCompleting}
                            className="flex items-center gap-2 px-8 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors w-full sm:w-auto justify-center"
                        >
                            Preciso praticar mais
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ExerciseView;
