/**
 * CurriculumProgressCard
 * Prominent card showing current OAPR curriculum progress and "Continue Learning" CTA
 */

import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
    BookOpen, Play, CheckCircle2, Calendar, Target,
    ChevronRight, Flame, Clock, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { WEEKLY_CURRICULUM, getDayContent, type WeekCurriculum } from '@/data/weekly-curriculum';

interface CurriculumProgress {
    currentWeek: number;
    currentDay: number;
    completedDays: number[];
    totalXP: number;
}

// In production, this would come from a store
function useCurriculumProgress(): CurriculumProgress {
    // TODO: Connect to useProgressionStore or create useCurriculumProgressStore
    return {
        currentWeek: 1,
        currentDay: 1,
        completedDays: [],
        totalXP: 0,
    };
}

export function CurriculumProgressCard() {
    const [, setLocation] = useLocation();
    const progress = useCurriculumProgress();

    const currentWeekData = WEEKLY_CURRICULUM.find(w => w.week === progress.currentWeek);
    const currentDayData = getDayContent(progress.currentWeek, progress.currentDay);

    const totalDays = 84; // 12 weeks * 7 days
    const progressPercent = (progress.completedDays.length / totalDays) * 100;

    const handleStartLesson = () => {
        setLocation(`/curriculum?week=${progress.currentWeek}&day=${progress.currentDay}`);
    };

    const handleViewCurriculum = () => {
        setLocation('/curriculum');
    };

    if (!currentWeekData || !currentDayData) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="overflow-hidden bg-gradient-to-br from-purple-600/20 via-pink-500/10 to-orange-500/10 border-purple-500/30">
                {/* Header with Milestone */}
                <div className="px-5 py-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-500/30 rounded-xl">
                                <BookOpen className="w-6 h-6 text-purple-300" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Seu Aprendizado</h2>
                                <p className="text-sm text-purple-300">Metodologia OAPR</p>
                            </div>
                        </div>

                        {progress.completedDays.length > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 rounded-full">
                                <Flame className="w-4 h-4 text-orange-400" />
                                <span className="text-sm font-medium text-orange-300">
                                    {progress.completedDays.length} dias
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-5 space-y-5">
                    {/* Current Lesson */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>Semana {progress.currentWeek} • Dia {progress.currentDay}</span>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                                {currentDayData.title}
                            </h3>
                            <p className="text-gray-300 text-sm">
                                {currentDayData.theme}
                            </p>
                        </div>

                        {/* Today's Objectives */}
                        <div className="flex flex-wrap gap-2">
                            {currentDayData.objectives.slice(0, 3).map((obj, i) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-1 text-xs bg-white/5 text-gray-300 rounded-full border border-white/10"
                                >
                                    {obj}
                                </span>
                            ))}
                        </div>

                        {/* OAPR Phases Preview */}
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { key: 'O', label: 'Ouvir', color: 'bg-blue-500', min: currentDayData.ouvir.durationMinutes },
                                { key: 'A', label: 'Analisar', color: 'bg-purple-500', min: currentDayData.analisar.durationMinutes },
                                { key: 'P', label: 'Praticar', color: 'bg-pink-500', min: currentDayData.praticar.durationMinutes },
                                { key: 'R', label: 'Revisar', color: 'bg-orange-500', min: currentDayData.revisar.durationMinutes },
                            ].map(phase => (
                                <div
                                    key={phase.key}
                                    className="text-center p-2 bg-white/5 rounded-lg border border-white/10"
                                >
                                    <div className={`w-8 h-8 mx-auto mb-1 rounded-full ${phase.color}/30 flex items-center justify-center`}>
                                        <span className={`text-sm font-bold ${phase.color.replace('bg-', 'text-')}/80`}>
                                            {phase.key}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-400">{phase.min}min</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Duration */}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-300">Duração da sessão</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                            {currentDayData.ouvir.durationMinutes +
                                currentDayData.analisar.durationMinutes +
                                currentDayData.praticar.durationMinutes +
                                currentDayData.revisar.durationMinutes} minutos
                        </span>
                    </div>

                    {/* CTA Button */}
                    <Button
                        onClick={handleStartLesson}
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25"
                    >
                        <Play className="w-6 h-6 mr-3" />
                        Começar Lição do Dia
                    </Button>

                    {/* Week Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Progresso da Semana</span>
                            <span className="text-white font-medium">
                                {progress.completedDays.filter(d => d >= (progress.currentWeek - 1) * 7 + 1 && d <= progress.currentWeek * 7).length}/7 dias
                            </span>
                        </div>
                        <Progress
                            value={(progress.completedDays.filter(d => d >= (progress.currentWeek - 1) * 7 + 1 && d <= progress.currentWeek * 7).length / 7) * 100}
                            className="h-2"
                        />
                    </div>

                    {/* Overall Progress */}
                    <div className="pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-gray-400">
                                    Jornada: {progress.completedDays.length} de 84 dias
                                </span>
                            </div>
                            <button
                                onClick={handleViewCurriculum}
                                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                            >
                                Ver currículo <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <Progress value={progressPercent} className="h-1.5 mt-2" />
                    </div>
                </div>

                {/* Week Info Footer */}
                <div className="px-5 py-3 bg-white/5 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs text-gray-400">Semana {currentWeekData.week}:</span>
                            <span className="text-sm text-white ml-2 font-medium">{currentWeekData.title}</span>
                        </div>
                        {currentWeekData.milestone && (
                            <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full">
                                🏆 {currentWeekData.milestone}
                            </span>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
