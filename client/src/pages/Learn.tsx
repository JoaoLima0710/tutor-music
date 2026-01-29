/**
 * Learn Page
 * Main hub for structured curriculum with modules
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
    BookOpen,
    GraduationCap,
    Trophy,
    Target,
    TrendingUp,
    Star,
    ChevronRight,
    Flame
} from 'lucide-react';
import { ModuleCard } from '@/components/pedagogy/ModuleCard';
import { useUserProgressStore } from '@/stores/useUserProgressStore';
import { getLevelTitle, Module } from '@/types/pedagogy';
import { module1_1 } from '@/data/modules/module-1-1';
import { module1_2 } from '@/data/modules/module-1-2';
import { cn } from '@/lib/utils';

// All curriculum modules (will expand over time)
const allModules: Module[] = [module1_1, module1_2];

export function Learn() {
    const [, setLocation] = useLocation();
    const { progress } = useUserProgressStore();

    // Stats calculations
    const totalModules = allModules.length;
    const completedModulesCount = progress.completedModules.length;
    const totalLessons = allModules.reduce((acc, m) => acc + m.lessons.length, 0);
    const completedLessonsCount = progress.completedLessons.length;

    // Current module (first incomplete or first)
    const currentModule = allModules.find(m =>
        !progress.completedModules.includes(m.id) &&
        progress.unlockedModules.includes(m.id)
    ) || allModules[0];

    const handleModuleClick = (moduleId: string) => {
        setLocation(`/learn/module/${moduleId}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <GraduationCap className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Aprender</h1>
                            <p className="text-gray-400">Currículo estruturado de violão</p>
                        </div>
                    </div>
                </header>

                {/* Progress Overview */}
                <section className="mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Level */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-500/30"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/30 rounded-lg">
                                    <Star className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">Nível {progress.currentLevel}</p>
                                    <p className="text-sm text-purple-300">{getLevelTitle(progress.currentLevel)}</p>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>{progress.currentXP} XP</span>
                                    <span>{progress.xpToNextLevel} XP</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(progress.currentXP / progress.xpToNextLevel) * 100}%` }}
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Streak */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/30 rounded-lg">
                                    <Flame className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{progress.currentStreak}</p>
                                    <p className="text-sm text-orange-300">Dias seguidos</p>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">
                                Recorde: {progress.longestStreak} dias
                            </p>
                        </motion.div>

                        {/* Modules */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/30 rounded-lg">
                                    <BookOpen className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {completedModulesCount}/{totalModules}
                                    </p>
                                    <p className="text-sm text-green-300">Módulos</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Lessons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/30 rounded-lg">
                                    <Target className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {completedLessonsCount}/{totalLessons}
                                    </p>
                                    <p className="text-sm text-blue-300">Lições</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Current Module Highlight */}
                {currentModule && !progress.completedModules.includes(currentModule.id) && (
                    <section className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                                Continue de onde parou
                            </h2>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30 cursor-pointer hover:border-blue-500/50 transition-colors"
                            onClick={() => handleModuleClick(currentModule.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-5xl">{currentModule.icon}</div>
                                    <div>
                                        <p className="text-sm text-blue-400 mb-1">
                                            Módulo {currentModule.level}.{currentModule.order}
                                        </p>
                                        <h3 className="text-2xl font-bold text-white mb-1">
                                            {currentModule.title}
                                        </h3>
                                        <p className="text-gray-400">
                                            {currentModule.description}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="w-8 h-8 text-blue-400" />
                            </div>

                            {/* Mini progress */}
                            <div className="mt-4 flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-400">
                                        {currentModule.lessons.filter(l => progress.completedLessons.includes(l.id)).length}/
                                        {currentModule.lessons.length} lições
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-400">
                                        {currentModule.exercises.filter(e => progress.completedExercises.includes(e.id)).length}/
                                        {currentModule.exercises.length} exercícios
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm text-gray-400">
                                        {currentModule.xpReward} XP ao completar
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </section>
                )}

                {/* All Modules */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-green-400" />
                            Todos os Módulos
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allModules.map((module, index) => {
                            const isLocked = !progress.unlockedModules.includes(module.id);
                            const isCompleted = progress.completedModules.includes(module.id);
                            const isCurrent = currentModule?.id === module.id && !isCompleted;

                            // Calculate progress
                            const completedLessonsInModule = module.lessons.filter(
                                l => progress.completedLessons.includes(l.id)
                            ).length;
                            const completedExercisesInModule = module.exercises.filter(
                                e => progress.completedExercises.includes(e.id)
                            ).length;
                            const quizPassed = progress.quizResults.some(
                                r => r.quizId === module.quiz.id && r.passed
                            );

                            const totalItems = module.lessons.length + module.exercises.length + 1; // +1 for quiz
                            const completedItems = completedLessonsInModule + completedExercisesInModule + (quizPassed ? 1 : 0);
                            const progressPercent = Math.round((completedItems / totalItems) * 100);

                            return (
                                <motion.div
                                    key={module.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <ModuleCard
                                        module={module}
                                        progress={progressPercent}
                                        isLocked={isLocked}
                                        isCompleted={isCompleted}
                                        isCurrent={isCurrent}
                                        completedLessons={progress.completedLessons}
                                        completedExercises={progress.completedExercises}
                                        quizPassed={quizPassed}
                                        onClick={() => handleModuleClick(module.id)}
                                    />
                                </motion.div>
                            );
                        })}

                        {/* Coming Soon Placeholders */}
                        {[
                            { id: 'module-1-3', title: 'Mais Acordes', level: 1, order: 3, icon: '✋' },
                            { id: 'module-2-1', title: 'Pestanas', level: 2, order: 1, icon: '🎼' },
                        ].map((placeholder, index) => (
                            <motion.div
                                key={placeholder.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (allModules.length + index) * 0.1 }}
                                className="relative rounded-xl border border-gray-700/50 p-6 bg-gray-800/30 opacity-50"
                            >
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-xl">
                                    <p className="text-gray-400 font-medium">Em breve</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl opacity-30">{placeholder.icon}</div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                            Módulo {placeholder.level}.{placeholder.order}
                                        </p>
                                        <h3 className="text-lg font-bold text-gray-400">
                                            {placeholder.title}
                                        </h3>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Achievements Preview */}
                {progress.earnedBadges.length > 0 && (
                    <section className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-400" />
                                Suas Conquistas
                            </h2>
                            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                Ver todas
                            </button>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {progress.earnedBadges.map((badgeId) => (
                                <div
                                    key={badgeId}
                                    className="flex-shrink-0 w-16 h-16 bg-yellow-500/20 rounded-xl border border-yellow-500/30 flex items-center justify-center"
                                >
                                    <span className="text-2xl">🏆</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default Learn;
