/**
 * ModuleView Page
 * Displays a single module with lessons, exercises, and quiz
 */

import { useState, useMemo } from 'react';
import { useRoute, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    Target,
    FileQuestion,
    CheckCircle2,
    Lock,
    Star,
    Clock,
    ChevronRight,
    PlayCircle
} from 'lucide-react';
import { LessonCard } from '@/components/pedagogy/LessonCard';
import { useUserProgressStore } from '@/stores/useUserProgressStore';
import { modulesById as modulesMap } from '@/data/modules';
import { Module } from '@/types/pedagogy';
import { cn } from '@/lib/utils';

type TabType = 'lessons' | 'exercises' | 'quiz';

export function ModuleView() {
    const [, params] = useRoute('/learn/module/:moduleId');
    const [, setLocation] = useLocation();
    const { progress, completeLesson, completeExercise } = useUserProgressStore();

    const moduleId = params?.moduleId || 'module-1-1';
    const module = modulesMap[moduleId];

    const [activeTab, setActiveTab] = useState<TabType>('lessons');

    if (!module) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <p className="text-gray-400">Módulo não encontrado</p>
            </div>
        );
    }

    // Progress calculations
    const completedLessonsInModule = module.lessons.filter(
        l => progress.completedLessons.includes(l.id)
    ).length;
    const completedExercisesInModule = module.exercises.filter(
        e => progress.completedExercises.includes(e.id)
    ).length;
    const quizPassed = progress.quizResults.some(
        r => r.quizId === module.quiz.id && r.passed
    );

    const allLessonsComplete = completedLessonsInModule === module.lessons.length;
    const allExercisesComplete = completedExercisesInModule === module.exercises.length;
    const canAccessQuiz = allLessonsComplete && allExercisesComplete;

    // Total progress
    const totalItems = module.lessons.length + module.exercises.length + 1;
    const completedItems = completedLessonsInModule + completedExercisesInModule + (quizPassed ? 1 : 0);
    const progressPercent = Math.round((completedItems / totalItems) * 100);

    // Find first incomplete lesson/exercise
    const firstIncompleteLesson = module.lessons.find(
        l => !progress.completedLessons.includes(l.id)
    );
    const firstIncompleteExercise = module.exercises.find(
        e => !progress.completedExercises.includes(e.id)
    );

    const handleLessonClick = (lessonId: string) => {
        setLocation(`/learn/lesson/${lessonId}`);
    };

    const handleExerciseClick = (exerciseId: string) => {
        setLocation(`/learn/exercise/${exerciseId}`);
    };

    const handleQuizClick = () => {
        if (canAccessQuiz) {
            setLocation(`/learn/quiz/${module.quiz.id}`);
        }
    };

    const tabs = [
        { id: 'lessons' as const, label: 'Lições', icon: BookOpen, count: module.lessons.length, completed: completedLessonsInModule },
        { id: 'exercises' as const, label: 'Exercícios', icon: Target, count: module.exercises.length, completed: completedExercisesInModule },
        { id: 'quiz' as const, label: 'Quiz', icon: FileQuestion, count: 1, completed: quizPassed ? 1 : 0 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
            {/* Header */}
            <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <button
                        onClick={() => setLocation('/learn')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Voltar para Aprender</span>
                    </button>

                    <div className="flex items-start gap-4">
                        <div className={cn(
                            'text-5xl p-4 rounded-xl bg-gradient-to-br shadow-lg',
                            module.level === 1 && 'from-green-500 to-emerald-600',
                            module.level === 2 && 'from-blue-500 to-indigo-600',
                            module.level === 3 && 'from-purple-500 to-violet-600',
                        )}>
                            {module.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                    'text-xs font-medium px-2 py-0.5 rounded-full',
                                    module.level === 1 && 'bg-green-500/20 text-green-400',
                                    module.level === 2 && 'bg-blue-500/20 text-blue-400',
                                    module.level === 3 && 'bg-purple-500/20 text-purple-400',
                                )}>
                                    Módulo {module.level}.{module.order}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {module.estimatedDuration}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-1">{module.title}</h1>
                            <p className="text-gray-400 text-sm">{module.description}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-400">Progresso do módulo</span>
                            <span className={cn(
                                'font-medium',
                                progressPercent === 100 ? 'text-green-400' : 'text-blue-400'
                            )}>
                                {progressPercent}%
                            </span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                className={cn(
                                    'h-full rounded-full',
                                    progressPercent === 100
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex gap-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const isComplete = tab.completed === tab.count;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors relative',
                                        isActive
                                            ? 'bg-gray-800 text-white'
                                            : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50',
                                    )}
                                >
                                    <Icon className={cn(
                                        'w-4 h-4',
                                        isComplete && 'text-green-400'
                                    )} />
                                    <span className="text-sm font-medium">{tab.label}</span>
                                    <span className={cn(
                                        'text-xs px-1.5 py-0.5 rounded-full',
                                        isComplete
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-gray-700 text-gray-400'
                                    )}>
                                        {tab.completed}/{tab.count}
                                    </span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-6">
                <AnimatePresence mode="wait">
                    {/* Lessons Tab */}
                    {activeTab === 'lessons' && (
                        <motion.div
                            key="lessons"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            {module.lessons.map((lesson, index) => {
                                const isCompleted = progress.completedLessons.includes(lesson.id);
                                const isCurrent = firstIncompleteLesson?.id === lesson.id;
                                const previousLesson = index > 0 ? module.lessons[index - 1] : null;
                                const isLocked = previousLesson
                                    ? !progress.completedLessons.includes(previousLesson.id)
                                    : false;

                                return (
                                    <LessonCard
                                        key={lesson.id}
                                        lesson={lesson}
                                        isCompleted={isCompleted}
                                        isLocked={isLocked}
                                        isCurrent={isCurrent}
                                        lessonNumber={index + 1}
                                        onClick={() => handleLessonClick(lesson.id)}
                                    />
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Exercises Tab */}
                    {activeTab === 'exercises' && (
                        <motion.div
                            key="exercises"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            {!allLessonsComplete && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                                    <p className="text-yellow-400 text-sm flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Complete todas as lições para desbloquear os exercícios
                                    </p>
                                </div>
                            )}

                            {module.exercises.map((exercise, index) => {
                                const isCompleted = progress.completedExercises.includes(exercise.id);
                                const isCurrent = firstIncompleteExercise?.id === exercise.id;
                                const isLocked = !allLessonsComplete;

                                return (
                                    <motion.div
                                        key={exercise.id}
                                        whileHover={!isLocked ? { x: 4 } : undefined}
                                        whileTap={!isLocked ? { scale: 0.98 } : undefined}
                                        onClick={!isLocked ? () => handleExerciseClick(exercise.id) : undefined}
                                        className={cn(
                                            'flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer',
                                            isLocked && 'opacity-50 cursor-not-allowed bg-gray-800/30 border-gray-700/50',
                                            isCompleted && 'bg-green-950/20 border-green-500/30',
                                            isCurrent && !isCompleted && 'bg-blue-950/20 border-blue-500/50',
                                            !isLocked && !isCompleted && !isCurrent && 'bg-gray-800/30 border-gray-700 hover:bg-gray-800/50',
                                        )}
                                    >
                                        <div className={cn(
                                            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                                            isLocked && 'bg-gray-700',
                                            isCompleted && 'bg-green-500',
                                            isCurrent && !isCompleted && 'bg-blue-500',
                                            !isLocked && !isCompleted && !isCurrent && 'bg-gray-700',
                                        )}>
                                            {isLocked ? (
                                                <Lock className="w-4 h-4 text-gray-400" />
                                            ) : isCompleted ? (
                                                <CheckCircle2 className="w-5 h-5 text-white" />
                                            ) : (
                                                <Target className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={cn(
                                                'font-medium truncate',
                                                isCompleted ? 'text-green-400' : 'text-white'
                                            )}>
                                                {exercise.title}
                                            </h4>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {exercise.estimatedTime} min
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-yellow-500" />
                                                    {exercise.xpReward} XP
                                                </span>
                                                {exercise.repetitions && (
                                                    <span>{exercise.repetitions} repetições</span>
                                                )}
                                            </div>
                                        </div>
                                        {!isLocked && <ChevronRight className="w-5 h-5 text-gray-400" />}
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Quiz Tab */}
                    {activeTab === 'quiz' && (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className={cn(
                                'rounded-xl border p-6',
                                canAccessQuiz
                                    ? 'bg-purple-500/10 border-purple-500/30'
                                    : 'bg-gray-800/30 border-gray-700/50 opacity-60'
                            )}>
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        'p-3 rounded-xl',
                                        canAccessQuiz ? 'bg-purple-500/30' : 'bg-gray-700'
                                    )}>
                                        {canAccessQuiz ? (
                                            <FileQuestion className="w-8 h-8 text-purple-400" />
                                        ) : (
                                            <Lock className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-1">
                                            {module.quiz.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-4">
                                            {module.quiz.description}
                                        </p>

                                        <div className="flex flex-wrap gap-4 text-sm mb-4">
                                            <span className="flex items-center gap-1 text-gray-400">
                                                <FileQuestion className="w-4 h-4" />
                                                {module.quiz.questions.length} questões
                                            </span>
                                            <span className="flex items-center gap-1 text-gray-400">
                                                <Target className="w-4 h-4" />
                                                Mínimo {module.quiz.passingScore}% para aprovar
                                            </span>
                                            <span className="flex items-center gap-1 text-yellow-500">
                                                <Star className="w-4 h-4" />
                                                {module.quiz.xpReward} XP
                                            </span>
                                        </div>

                                        {!canAccessQuiz && (
                                            <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                                                <p className="text-sm text-gray-400">
                                                    Para liberar o quiz, complete:
                                                </p>
                                                <ul className="mt-2 space-y-1">
                                                    {!allLessonsComplete && (
                                                        <li className="text-sm text-yellow-400 flex items-center gap-2">
                                                            <BookOpen className="w-3 h-3" />
                                                            {module.lessons.length - completedLessonsInModule} lição(ões) restante(s)
                                                        </li>
                                                    )}
                                                    {allLessonsComplete && !allExercisesComplete && (
                                                        <li className="text-sm text-yellow-400 flex items-center gap-2">
                                                            <Target className="w-3 h-3" />
                                                            {module.exercises.length - completedExercisesInModule} exercício(s) restante(s)
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {quizPassed && (
                                            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-4">
                                                <p className="text-green-400 flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Quiz aprovado! Você pode refazê-lo para melhorar sua nota.
                                                </p>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleQuizClick}
                                            disabled={!canAccessQuiz}
                                            className={cn(
                                                'px-6 py-2.5 rounded-lg font-medium transition-colors',
                                                canAccessQuiz
                                                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                            )}
                                        >
                                            {quizPassed ? 'Refazer Quiz' : 'Iniciar Quiz'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default ModuleView;
