/**
 * ModuleCard Component
 * Displays a curriculum module with progress, lessons preview, and status
 */

import { motion } from 'framer-motion';
import {
    Lock,
    CheckCircle2,
    Clock,
    Star,
    ChevronRight,
    BookOpen,
    Target,
    FileQuestion
} from 'lucide-react';
import { Module } from '@/types/pedagogy';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
    module: Module;
    progress: number;              // 0-100
    isLocked: boolean;
    isCompleted: boolean;
    isCurrent: boolean;
    completedLessons: string[];
    completedExercises: string[];
    quizPassed: boolean;
    onClick: () => void;
}

const levelColors = {
    1: 'from-green-500 to-emerald-600',    // Iniciante
    2: 'from-blue-500 to-indigo-600',      // Intermediário
    3: 'from-purple-500 to-violet-600',    // Avançado
};

const levelLabels = {
    1: 'Iniciante',
    2: 'Intermediário',
    3: 'Avançado',
};

export function ModuleCard({
    module,
    progress,
    isLocked,
    isCompleted,
    isCurrent,
    completedLessons,
    completedExercises,
    quizPassed,
    onClick,
}: ModuleCardProps) {
    const lessonsCount = module.lessons.length;
    const exercisesCount = module.exercises.length;
    const completedLessonsCount = module.lessons.filter(l =>
        completedLessons.includes(l.id)
    ).length;
    const completedExercisesCount = module.exercises.filter(e =>
        completedExercises.includes(e.id)
    ).length;

    return (
        <motion.div
            whileHover={!isLocked ? { y: -4, scale: 1.02 } : undefined}
            whileTap={!isLocked ? { scale: 0.98 } : undefined}
            className={cn(
                'relative rounded-xl border p-6 transition-all duration-300 cursor-pointer',
                'bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm',
                isLocked && 'opacity-50 cursor-not-allowed',
                isCompleted && 'border-green-500/50 bg-green-950/20',
                isCurrent && !isCompleted && 'border-blue-500/50 ring-2 ring-blue-500/30',
                !isLocked && !isCompleted && !isCurrent && 'border-gray-700 hover:border-gray-600',
            )}
            onClick={!isLocked ? onClick : undefined}
        >
            {/* Status Badge */}
            <div className="absolute -top-3 -right-3">
                {isLocked && (
                    <div className="bg-gray-700 rounded-full p-2">
                        <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                )}
                {isCompleted && (
                    <div className="bg-green-500 rounded-full p-2">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                )}
                {isCurrent && !isCompleted && (
                    <div className="bg-blue-500 rounded-full p-2 animate-pulse">
                        <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                )}
            </div>

            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
                <div className={cn(
                    'text-4xl p-3 rounded-xl bg-gradient-to-br',
                    levelColors[module.level],
                    'text-white shadow-lg'
                )}>
                    {module.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            module.level === 1 && 'bg-green-500/20 text-green-400',
                            module.level === 2 && 'bg-blue-500/20 text-blue-400',
                            module.level === 3 && 'bg-purple-500/20 text-purple-400',
                        )}>
                            {levelLabels[module.level]}
                        </span>
                        <span className="text-xs text-gray-500">
                            Módulo {module.level}.{module.order}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-white truncate">
                        {module.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2">
                        {module.description}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Progresso</span>
                    <span className={cn(
                        'font-medium',
                        progress === 100 ? 'text-green-400' : 'text-blue-400'
                    )}>
                        {progress}%
                    </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={cn(
                            'h-full rounded-full',
                            progress === 100
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        )}
                    />
                </div>
            </div>

            {/* Content Checklist */}
            <div className="space-y-2 mb-4">
                {/* Lessons */}
                <div className="flex items-center gap-2 text-sm">
                    <BookOpen className={cn(
                        'w-4 h-4',
                        completedLessonsCount === lessonsCount ? 'text-green-400' : 'text-gray-500'
                    )} />
                    <span className={cn(
                        completedLessonsCount === lessonsCount ? 'text-green-400' : 'text-gray-400'
                    )}>
                        {completedLessonsCount}/{lessonsCount} lições
                    </span>
                    {completedLessonsCount === lessonsCount && (
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                    )}
                </div>

                {/* Exercises */}
                <div className="flex items-center gap-2 text-sm">
                    <Target className={cn(
                        'w-4 h-4',
                        completedExercisesCount === exercisesCount ? 'text-green-400' : 'text-gray-500'
                    )} />
                    <span className={cn(
                        completedExercisesCount === exercisesCount ? 'text-green-400' : 'text-gray-400'
                    )}>
                        {completedExercisesCount}/{exercisesCount} exercícios
                    </span>
                    {completedExercisesCount === exercisesCount && (
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                    )}
                </div>

                {/* Quiz */}
                <div className="flex items-center gap-2 text-sm">
                    <FileQuestion className={cn(
                        'w-4 h-4',
                        quizPassed ? 'text-green-400' : 'text-gray-500'
                    )} />
                    <span className={cn(
                        quizPassed ? 'text-green-400' : 'text-gray-400'
                    )}>
                        {quizPassed ? 'Quiz aprovado' : 'Quiz pendente'}
                    </span>
                    {quizPassed && (
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {module.estimatedDuration}
                    </span>
                    <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {module.xpReward} XP
                    </span>
                </div>

                {!isLocked && (
                    <button
                        className={cn(
                            'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                            isCompleted
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : isCurrent
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-gray-700 text-white hover:bg-gray-600'
                        )}
                    >
                        {isCompleted ? 'Revisar' : isCurrent ? 'Continuar' : 'Iniciar'}
                    </button>
                )}
            </div>

            {/* Lock Overlay */}
            {isLocked && (
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                    <div className="text-center p-4">
                        <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">
                            Complete os módulos anteriores
                        </p>
                        {module.requiredXP > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                Requer {module.requiredXP} XP
                            </p>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default ModuleCard;
