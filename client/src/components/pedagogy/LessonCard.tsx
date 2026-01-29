/**
 * LessonCard Component
 * Compact card for lessons within a module
 */

import { motion } from 'framer-motion';
import {
    BookOpen,
    CheckCircle2,
    Lock,
    Clock,
    ChevronRight,
    PlayCircle
} from 'lucide-react';
import { Lesson } from '@/types/pedagogy';
import { cn } from '@/lib/utils';

interface LessonCardProps {
    lesson: Lesson;
    isCompleted: boolean;
    isLocked: boolean;
    isCurrent: boolean;
    lessonNumber: number;
    onClick: () => void;
}

export function LessonCard({
    lesson,
    isCompleted,
    isLocked,
    isCurrent,
    lessonNumber,
    onClick,
}: LessonCardProps) {
    return (
        <motion.div
            whileHover={!isLocked ? { x: 4 } : undefined}
            whileTap={!isLocked ? { scale: 0.98 } : undefined}
            onClick={!isLocked ? onClick : undefined}
            className={cn(
                'flex items-center gap-4 p-4 rounded-lg transition-all duration-200 cursor-pointer',
                'border',
                isLocked && 'opacity-50 cursor-not-allowed bg-gray-800/30 border-gray-700/50',
                isCompleted && 'bg-green-950/20 border-green-500/30',
                isCurrent && !isCompleted && 'bg-blue-950/20 border-blue-500/50 ring-1 ring-blue-500/30',
                !isLocked && !isCompleted && !isCurrent && 'bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 hover:border-gray-600',
            )}
        >
            {/* Status Icon */}
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
                ) : isCurrent ? (
                    <PlayCircle className="w-5 h-5 text-white" />
                ) : (
                    <span className="text-sm font-bold text-white">{lessonNumber}</span>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h4 className={cn(
                    'font-medium truncate',
                    isCompleted ? 'text-green-400' : 'text-white'
                )}>
                    {lesson.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.estimatedTime} min
                    </span>
                    <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {lesson.content.length} seções
                    </span>
                </div>
            </div>

            {/* Arrow */}
            {!isLocked && (
                <ChevronRight className={cn(
                    'w-5 h-5 flex-shrink-0',
                    isCompleted ? 'text-green-400' : 'text-gray-400'
                )} />
            )}
        </motion.div>
    );
}

// Compact variant for lists
interface LessonListItemProps {
    lesson: Lesson;
    isCompleted: boolean;
    isLocked: boolean;
    onClick: () => void;
}

export function LessonListItem({
    lesson,
    isCompleted,
    isLocked,
    onClick,
}: LessonListItemProps) {
    return (
        <button
            onClick={!isLocked ? onClick : undefined}
            disabled={isLocked}
            className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                isLocked && 'opacity-50 cursor-not-allowed',
                isCompleted && 'text-green-400',
                !isLocked && !isCompleted && 'text-gray-300 hover:bg-gray-800/50',
            )}
        >
            {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            ) : isLocked ? (
                <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
            ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-500 flex-shrink-0" />
            )}
            <span className="truncate text-sm">{lesson.title}</span>
            <span className="ml-auto text-xs text-gray-500">{lesson.estimatedTime} min</span>
        </button>
    );
}

export default LessonCard;
