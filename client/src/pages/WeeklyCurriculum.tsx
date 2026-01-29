/**
 * Weekly Curriculum Page
 * Displays the 12-week progressive curriculum with OAPR learning cycle
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import {
    Calendar, ChevronRight, Lock, CheckCircle2,
    Clock, Music, Target, Play, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PageLayout } from '@/components/layout/PageLayout';
import { OAPRSession } from '@/components/training/OAPRSession';
import { WEEKLY_CURRICULUM, getWeekByNumber, getDayContent, type WeekCurriculum } from '@/data/weekly-curriculum';

interface UserProgress {
    currentWeek: number;
    currentDay: number;
    completedDays: number[];
    totalXP: number;
}

export default function WeeklyCurriculumPage() {
    const [location, setLocation] = useLocation();
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [showSession, setShowSession] = useState(false);

    // In production, this would come from a store/API
    const [progress, setProgress] = useState<UserProgress>({
        currentWeek: 1,
        currentDay: 1,
        completedDays: [],
        totalXP: 0,
    });

    // Check URL for day parameter
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const weekParam = params.get('week');
        const dayParam = params.get('day');

        if (weekParam && dayParam) {
            setSelectedWeek(parseInt(weekParam));
            setSelectedDay(parseInt(dayParam));
            setShowSession(true);
        }
    }, [location]);

    const handleStartDay = (weekNum: number, dayNum: number) => {
        setSelectedWeek(weekNum);
        setSelectedDay(dayNum);
        setShowSession(true);
        setLocation(`/curriculum?week=${weekNum}&day=${dayNum}`);
    };

    const handleCompleteDay = () => {
        if (selectedDay !== null) {
            setProgress(prev => ({
                ...prev,
                completedDays: [...prev.completedDays, selectedDay],
                currentDay: selectedDay + 1,
                totalXP: prev.totalXP + 50,
            }));
        }
        setShowSession(false);
        setSelectedWeek(null);
        setSelectedDay(null);
        setLocation('/curriculum');
    };

    const isDayCompleted = (dayNum: number) => progress.completedDays.includes(dayNum);
    const isDayLocked = (weekNum: number, dayNum: number) => {
        if (weekNum > progress.currentWeek) return true;
        if (weekNum === progress.currentWeek && dayNum > progress.currentDay) return true;
        return false;
    };

    // If showing a session
    if (showSession && selectedWeek && selectedDay) {
        const dayContent = getDayContent(selectedWeek, selectedDay);
        if (dayContent) {
            return (
                <PageLayout>
                    <div className="p-4 md:p-8">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setShowSession(false);
                                    setLocation('/curriculum');
                                }}
                                className="text-gray-400"
                            >
                                ← Voltar ao Currículo
                            </Button>
                        </div>

                        <OAPRSession
                            dayContent={dayContent}
                            onComplete={handleCompleteDay}
                        />
                    </div>
                </PageLayout>
            );
        }
    }

    return (
        <PageLayout>
            <div className="p-4 md:p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <BookOpen className="w-5 h-5" />
                        <span className="text-sm font-medium">Metodologia OAPR</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                        Currículo de 12 Semanas
                    </h1>
                    <p className="text-gray-400">
                        Aprenda violão de forma progressiva com o ciclo Ouvir-Analisar-Praticar-Revisar
                    </p>
                </motion.div>

                {/* Progress Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Seu Progresso</h3>
                                <p className="text-gray-400">
                                    Semana {progress.currentWeek}, Dia {progress.currentDay}
                                </p>
                            </div>

                            <div className="flex gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-400">{progress.completedDays.length}</div>
                                    <div className="text-xs text-gray-400">Dias Completos</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-400">{progress.totalXP}</div>
                                    <div className="text-xs text-gray-400">XP Total</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-400">
                                        {Math.round((progress.completedDays.length / 84) * 100)}%
                                    </div>
                                    <div className="text-xs text-gray-400">Progresso</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Progress
                                value={(progress.completedDays.length / 84) * 100}
                                className="h-2"
                            />
                        </div>
                    </Card>
                </motion.div>

                {/* Week Cards */}
                <div className="space-y-6">
                    {WEEKLY_CURRICULUM.map((week, weekIdx) => (
                        <WeekCard
                            key={week.week}
                            week={week}
                            isUnlocked={week.week <= progress.currentWeek}
                            progress={progress}
                            onStartDay={handleStartDay}
                            isDayCompleted={isDayCompleted}
                            isDayLocked={isDayLocked}
                            delay={weekIdx * 0.1}
                        />
                    ))}
                </div>
            </div>
        </PageLayout>
    );
}

interface WeekCardProps {
    week: WeekCurriculum;
    isUnlocked: boolean;
    progress: UserProgress;
    onStartDay: (week: number, day: number) => void;
    isDayCompleted: (day: number) => boolean;
    isDayLocked: (week: number, day: number) => boolean;
    delay: number;
}

function WeekCard({ week, isUnlocked, progress, onStartDay, isDayCompleted, isDayLocked, delay }: WeekCardProps) {
    const [isExpanded, setIsExpanded] = useState(week.week === progress.currentWeek);

    const completedDaysInWeek = week.days.filter(d => isDayCompleted(d.day)).length;
    const progressPercent = (completedDaysInWeek / week.days.length) * 100;

    const gradients = [
        'from-purple-500 to-violet-600',
        'from-blue-500 to-cyan-600',
        'from-green-500 to-emerald-600',
        'from-orange-500 to-amber-600',
    ];
    const gradient = gradients[(week.week - 1) % gradients.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card className={`overflow-hidden border ${isUnlocked ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
                {/* Week Header */}
                <div
                    className={`p-6 cursor-pointer transition-all ${isUnlocked ? 'hover:bg-white/5' : ''}`}
                    onClick={() => isUnlocked && setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                            {isUnlocked ? (
                                <Calendar className="w-7 h-7 text-white" />
                            ) : (
                                <Lock className="w-7 h-7 text-white/50" />
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-purple-400">Semana {week.week}</span>
                                {week.milestone && completedDaysInWeek === week.days.length && (
                                    <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                                        ⭐ {week.milestone}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">{week.title}</h3>
                            <p className="text-gray-400 text-sm">{week.subtitle}</p>

                            {isUnlocked && (
                                <div className="mt-3 flex items-center gap-4">
                                    <div className="flex-1">
                                        <Progress value={progressPercent} className="h-1.5" />
                                    </div>
                                    <span className="text-sm text-gray-400">
                                        {completedDaysInWeek}/{week.days.length} dias
                                    </span>
                                </div>
                            )}
                        </div>

                        {isUnlocked && (
                            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        )}
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && isUnlocked && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        className="border-t border-white/10"
                    >
                        {/* Goals */}
                        <div className="p-4 bg-white/5">
                            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4 text-purple-400" />
                                Objetivos da Semana
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {week.goals.map((goal, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                                        {goal}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Days Grid */}
                        <div className="p-4">
                            <div className="grid grid-cols-7 gap-2">
                                {week.days.map(day => {
                                    const completed = isDayCompleted(day.day);
                                    const locked = isDayLocked(week.week, day.day);
                                    const isCurrent = week.week === progress.currentWeek && day.day === progress.currentDay;

                                    return (
                                        <button
                                            key={day.day}
                                            disabled={locked}
                                            onClick={() => !locked && onStartDay(week.week, day.day)}
                                            className={`
                        relative p-3 rounded-lg text-center transition-all
                        ${completed ? 'bg-green-500/20 border border-green-500/30' : ''}
                        ${isCurrent && !completed ? 'bg-purple-500/20 border border-purple-500/50 ring-2 ring-purple-500/50' : ''}
                        ${!completed && !isCurrent && !locked ? 'bg-white/5 border border-white/10 hover:bg-white/10' : ''}
                        ${locked ? 'bg-white/5 border border-white/5 opacity-40 cursor-not-allowed' : ''}
                      `}
                                        >
                                            <div className="text-xs text-gray-400 mb-1">Dia</div>
                                            <div className={`text-lg font-bold ${completed ? 'text-green-400' :
                                                isCurrent ? 'text-purple-400' :
                                                    locked ? 'text-gray-500' : 'text-white'
                                                }`}>
                                                {day.day}
                                            </div>

                                            {completed && (
                                                <CheckCircle2 className="w-4 h-4 text-green-400 absolute -top-1 -right-1" />
                                            )}
                                            {locked && (
                                                <Lock className="w-3 h-3 text-gray-500 absolute -top-1 -right-1" />
                                            )}
                                            {isCurrent && !completed && (
                                                <Play className="w-3 h-3 text-purple-400 absolute -top-1 -right-1" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Weekly Playlist Preview */}
                        {week.weeklyPlaylist.length > 0 && (
                            <div className="p-4 border-t border-white/10">
                                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <Music className="w-4 h-4 text-pink-400" />
                                    Playlist da Semana
                                </h4>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {week.weeklyPlaylist.slice(0, 4).map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex-shrink-0 p-3 bg-white/5 rounded-lg border border-white/10 min-w-[180px]"
                                        >
                                            <div className="text-sm font-medium text-white truncate">{item.title}</div>
                                            <div className="text-xs text-gray-400 truncate">{item.artist}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </Card>
        </motion.div>
    );
}
