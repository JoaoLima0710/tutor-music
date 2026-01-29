/**
 * LessonView Page
 * Displays a single lesson with theory content
 */

import { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Clock,
    BookOpen,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { TheoryExplanation } from '@/components/pedagogy/TheoryExplanation';
import { useUserProgressStore } from '@/stores/useUserProgressStore';
import { allModules } from '@/data/modules';
import { Lesson } from '@/types/pedagogy';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// All lessons from all modules
const allLessons: Record<string, Lesson> = {};
const lessonToModule: Record<string, string> = {};

// Populate from all modules
allModules.forEach(module => {
    module.lessons.forEach(lesson => {
        allLessons[lesson.id] = lesson;
        lessonToModule[lesson.id] = module.id;
    });
});

export function LessonView() {
    const [, params] = useRoute('/learn/lesson/:lessonId');
    const [, setLocation] = useLocation();
    const { progress, completeLesson, addXP, updateStreak } = useUserProgressStore();

    const lessonId = params?.lessonId || '';
    const lesson = allLessons[lessonId];
    const moduleId = lessonToModule[lessonId];

    const [startTime] = useState(() => Date.now());
    const [isCompleting, setIsCompleting] = useState(false);

    const isCompleted = progress.completedLessons.includes(lessonId);

    // Update streak when viewing a lesson
    useEffect(() => {
        updateStreak();
    }, []);

    if (!lesson) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">Lição não encontrada</p>
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

    const handleComplete = async () => {
        setIsCompleting(true);

        // Small delay for animation
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!isCompleted) {
            completeLesson(lessonId);
            toast.success('🎉 Lição concluída! +10 XP', {
                description: lesson.title,
            });
        }

        // Navigate to next lesson or back to module
        if (lesson.nextLessonId) {
            setLocation(`/learn/lesson/${lesson.nextLessonId}`);
        } else {
            setLocation(`/learn/module/${moduleId}`);
            toast.info('📚 Todas as lições foram concluídas!', {
                description: 'Agora você pode praticar com os exercícios.',
            });
        }

        setIsCompleting(false);
    };

    const handlePrevious = () => {
        if (lesson.previousLessonId) {
            setLocation(`/learn/lesson/${lesson.previousLessonId}`);
        }
    };

    const handleBack = () => {
        setLocation(`/learn/module/${moduleId}`);
    };

    // Calculate lesson position
    const moduleData = allModules.find(m => m.id === moduleId);
    const lessonIndex = moduleData?.lessons.findIndex(l => l.id === lessonId) ?? -1;
    const totalLessons = moduleData?.lessons.length ?? 0;

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

                        {/* Lesson Progress */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                                Lição {lessonIndex + 1} de {totalLessons}
                            </span>
                            {isCompleted && (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((lessonIndex + 1) / totalLessons) * 100}%` }}
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Meta Info */}
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        Lição {lessonIndex + 1}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        ~{lesson.estimatedTime} min
                    </span>
                </div>

                {/* Theory Content */}
                <TheoryExplanation
                    title={lesson.title}
                    content={lesson.content}
                    images={lesson.images}
                    diagrams={lesson.diagrams}
                />

                {/* Navigation */}
                <div className="mt-12 flex items-center justify-between gap-4">
                    <button
                        onClick={handlePrevious}
                        disabled={!lesson.previousLessonId}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                            lesson.previousLessonId
                                ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                                : 'text-gray-600 cursor-not-allowed'
                        )}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Anterior</span>
                    </button>

                    <button
                        onClick={handleComplete}
                        disabled={isCompleting}
                        className={cn(
                            'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all',
                            isCompleted
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white',
                            isCompleting && 'opacity-50 cursor-wait'
                        )}
                    >
                        {isCompleting ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                />
                                <span>Salvando...</span>
                            </>
                        ) : isCompleted ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>
                                    {lesson.nextLessonId ? 'Próxima Lição' : 'Voltar ao Módulo'}
                                </span>
                            </>
                        ) : (
                            <>
                                <span>Concluir Lição</span>
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </main>

            {/* Floating Nav for Mobile */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 p-4 sm:hidden">
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={handlePrevious}
                        disabled={!lesson.previousLessonId}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors',
                            lesson.previousLessonId
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                        )}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                    </button>

                    <button
                        onClick={handleComplete}
                        disabled={isCompleting}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium',
                            isCompleted ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                        )}
                    >
                        {isCompleted ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Próxima
                            </>
                        ) : (
                            <>
                                Concluir
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LessonView;
