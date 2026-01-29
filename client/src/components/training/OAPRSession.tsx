/**
 * OAPRSession Component
 * Guides users through the 4-phase OAPR learning cycle:
 * - Ouvir (Listen) - 2 minutes
 * - Analisar (Analyze) - 3 minutes
 * - Praticar (Practice) - 20 minutes
 * - Revisar (Review) - 5 minutes
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Headphones, Brain, Guitar, CheckCircle2,
    Play, Pause, ChevronRight, ChevronLeft,
    Clock, Music, BookOpen, Target, ExternalLink,
    CheckSquare, Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { DailyContent, PlaylistItem, Exercise } from '@/data/weekly-curriculum';

interface OAPRSessionProps {
    dayContent: DailyContent;
    onComplete?: () => void;
    onSkip?: () => void;
}

type Phase = 'ouvir' | 'analisar' | 'praticar' | 'revisar' | 'complete';

const PHASE_CONFIG = {
    ouvir: {
        icon: Headphones,
        title: 'Ouvir',
        subtitle: 'Escuta Ativa',
        color: 'from-purple-500 to-violet-600',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
        description: 'Escute as músicas sugeridas prestando atenção aos detalhes indicados.',
    },
    analisar: {
        icon: Brain,
        title: 'Analisar',
        subtitle: 'Compreensão',
        color: 'from-blue-500 to-cyan-600',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        description: 'Entenda os conceitos antes de praticar.',
    },
    praticar: {
        icon: Guitar,
        title: 'Praticar',
        subtitle: 'Mão na Massa',
        color: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        description: 'Hora de tocar! Siga os exercícios com atenção.',
    },
    revisar: {
        icon: CheckCircle2,
        title: 'Revisar',
        subtitle: 'Consolidação',
        color: 'from-orange-500 to-amber-600',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        description: 'Reflita sobre o que aprendeu hoje.',
    },
    complete: {
        icon: CheckCircle2,
        title: 'Parabéns!',
        subtitle: 'Sessão Completa',
        color: 'from-yellow-500 to-orange-600',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        description: 'Você completou a sessão do dia!',
    },
};

const PHASES: Phase[] = ['ouvir', 'analisar', 'praticar', 'revisar', 'complete'];

export function OAPRSession({ dayContent, onComplete, onSkip }: OAPRSessionProps) {
    const [currentPhase, setCurrentPhase] = useState<Phase>('ouvir');
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [timeSpent, setTimeSpent] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    const currentPhaseIndex = PHASES.indexOf(currentPhase);
    const phaseConfig = PHASE_CONFIG[currentPhase];
    const PhaseIcon = phaseConfig.icon;

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimeSpent(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNextPhase = useCallback(() => {
        const nextIndex = currentPhaseIndex + 1;
        if (nextIndex < PHASES.length) {
            setCurrentPhase(PHASES[nextIndex]);
            setTimeSpent(0);
        }
        if (PHASES[nextIndex] === 'complete' && onComplete) {
            onComplete();
        }
    }, [currentPhaseIndex, onComplete]);

    const handlePrevPhase = useCallback(() => {
        const prevIndex = currentPhaseIndex - 1;
        if (prevIndex >= 0) {
            setCurrentPhase(PHASES[prevIndex]);
            setTimeSpent(0);
        }
    }, [currentPhaseIndex]);

    const toggleCheckItem = (id: string) => {
        setCheckedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Calculate progress
    const progressPercent = ((currentPhaseIndex) / (PHASES.length - 1)) * 100;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>Dia {dayContent.day}</span>
                </div>
                <h1 className="text-3xl font-black text-white mb-2">{dayContent.title}</h1>
                <p className="text-gray-400">{dayContent.theme}</p>
            </motion.div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    {PHASES.slice(0, -1).map((phase, idx) => {
                        const config = PHASE_CONFIG[phase];
                        const Icon = config.icon;
                        const isActive = idx === currentPhaseIndex;
                        const isComplete = idx < currentPhaseIndex;
                        return (
                            <div
                                key={phase}
                                className={`flex items-center gap-1 transition-all ${isActive ? 'text-white scale-110' : isComplete ? 'text-green-400' : 'text-gray-500'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{config.title}</span>
                            </div>
                        );
                    })}
                </div>
                <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Phase Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentPhase}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className={`p-6 ${phaseConfig.bgColor} ${phaseConfig.borderColor} border`}>
                        {/* Phase Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${phaseConfig.color} flex items-center justify-center`}>
                                <PhaseIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{phaseConfig.title}</h2>
                                <p className="text-gray-400">{phaseConfig.subtitle}</p>
                            </div>
                            {currentPhase !== 'complete' && (
                                <div className="ml-auto text-right">
                                    <div className="text-2xl font-mono text-white">{formatTime(timeSpent)}</div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                                        className="text-gray-400"
                                    >
                                        {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <p className="text-gray-300 mb-6">{phaseConfig.description}</p>

                        {/* Phase-specific content */}
                        {currentPhase === 'ouvir' && (
                            <OuvirContent
                                content={dayContent.ouvir}
                                onTimerStart={() => setIsTimerRunning(true)}
                            />
                        )}

                        {currentPhase === 'analisar' && (
                            <AnalisarContent content={dayContent.analisar} />
                        )}

                        {currentPhase === 'praticar' && (
                            <PraticarContent
                                content={dayContent.praticar}
                                tips={dayContent.tips}
                                warnings={dayContent.warnings}
                            />
                        )}

                        {currentPhase === 'revisar' && (
                            <RevisarContent
                                content={dayContent.revisar}
                                checkedItems={checkedItems}
                                onToggleItem={toggleCheckItem}
                            />
                        )}

                        {currentPhase === 'complete' && (
                            <CompleteContent dayContent={dayContent} />
                        )}
                    </Card>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button
                    variant="ghost"
                    onClick={handlePrevPhase}
                    disabled={currentPhaseIndex === 0}
                    className="text-gray-400"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Anterior
                </Button>

                {currentPhase !== 'complete' ? (
                    <Button
                        onClick={handleNextPhase}
                        className={`bg-gradient-to-r ${phaseConfig.color} text-white`}
                    >
                        {currentPhase === 'revisar' ? 'Concluir' : 'Próximo'}
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        onClick={onComplete}
                        className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white"
                    >
                        Continuar Jornada
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
}

// Sub-components for each phase

function OuvirContent({ content, onTimerStart }: {
    content: DailyContent['ouvir'];
    onTimerStart: () => void;
}) {
    return (
        <div className="space-y-4">
            <p className="text-gray-300">{content.description}</p>

            <div className="grid gap-4">
                {content.playlist.map((item, idx) => (
                    <PlaylistCard key={idx} item={item} onPlay={onTimerStart} />
                ))}
            </div>

            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <p className="text-sm text-purple-300">
                    ⏱️ Tempo sugerido: <strong>{content.durationMinutes} minutos</strong>
                </p>
            </div>
        </div>
    );
}

function PlaylistCard({ item, onPlay }: { item: PlaylistItem; onPlay: () => void }) {
    return (
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Music className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white">{item.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded ${item.language === 'PT' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                            {item.language}
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm">{item.artist}</p>
                    <p className="text-gray-300 text-sm mt-2">📌 {item.reason}</p>
                    <p className="text-purple-300 text-sm">👂 <em>{item.focus}</em></p>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-purple-400"
                    onClick={onPlay}
                >
                    <ExternalLink className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

function AnalisarContent({ content }: { content: DailyContent['analisar'] }) {
    return (
        <div className="space-y-4">
            <p className="text-gray-300">{content.description}</p>

            <div className="grid gap-3">
                {content.concepts.map((concept, idx) => (
                    <div
                        key={idx}
                        className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-start gap-3"
                    >
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-400 text-sm font-bold">{idx + 1}</span>
                        </div>
                        <p className="text-gray-200">{concept}</p>
                    </div>
                ))}
            </div>

            {content.analogies && content.analogies.length > 0 && (
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Analogias para lembrar
                    </h4>
                    <ul className="space-y-2">
                        {content.analogies.map((analogy, idx) => (
                            <li key={idx} className="text-blue-200 text-sm">💡 {analogy}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm text-blue-300">
                    ⏱️ Tempo sugerido: <strong>{content.durationMinutes} minutos</strong>
                </p>
            </div>
        </div>
    );
}

function PraticarContent({ content, tips, warnings }: {
    content: DailyContent['praticar'];
    tips?: string[];
    warnings?: string[];
}) {
    return (
        <div className="space-y-4">
            <p className="text-gray-300">{content.description}</p>

            {/* Exercises */}
            <div className="space-y-4">
                {content.exercises.map((exercise, idx) => (
                    <ExerciseCard key={exercise.id} exercise={exercise} index={idx + 1} />
                ))}
            </div>

            {/* Tips */}
            {tips && tips.length > 0 && (
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="font-bold text-green-400 mb-2">💡 Dicas</h4>
                    <ul className="space-y-1">
                        {tips.map((tip, idx) => (
                            <li key={idx} className="text-green-200 text-sm">• {tip}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Warnings */}
            {warnings && warnings.length > 0 && (
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <h4 className="font-bold text-red-400 mb-2">⚠️ Atenção</h4>
                    <ul className="space-y-1">
                        {warnings.map((warning, idx) => (
                            <li key={idx} className="text-red-200 text-sm">• {warning}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm text-green-300">
                    ⏱️ Tempo sugerido: <strong>{content.durationMinutes} minutos</strong>
                </p>
            </div>
        </div>
    );
}

function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-400 font-bold">{index}</span>
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-white">{exercise.title}</h4>
                    <p className="text-gray-400 text-sm">{exercise.description}</p>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {exercise.targetBPM && (
                                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                                        🎵 {exercise.targetBPM} BPM
                                    </span>
                                )}
                                {exercise.duration && (
                                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                                        ⏱️ {Math.floor(exercise.duration / 60)} min
                                    </span>
                                )}
                                {exercise.repetitions && (
                                    <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
                                        🔄 {exercise.repetitions}x
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2">
                                {exercise.instructions.map((instruction, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                                        <span className="text-green-400">{idx + 1}.</span>
                                        <span>{instruction}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function RevisarContent({ content, checkedItems, onToggleItem }: {
    content: DailyContent['revisar'];
    checkedItems: Set<string>;
    onToggleItem: (id: string) => void;
}) {
    const allChecked = content.checklist.every((_, idx) => checkedItems.has(`check-${idx}`));
    const checkedCount = content.checklist.filter((_, idx) => checkedItems.has(`check-${idx}`)).length;

    return (
        <div className="space-y-4">
            <h4 className="font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-400" />
                Checklist de Autoavaliação
            </h4>

            <div className="space-y-2">
                {content.checklist.map((item, idx) => {
                    const id = `check-${idx}`;
                    const isChecked = checkedItems.has(id);
                    return (
                        <div
                            key={id}
                            onClick={() => onToggleItem(id)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${isChecked
                                    ? 'bg-green-500/20 border-green-500/30'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {isChecked ? (
                                    <CheckSquare className="w-5 h-5 text-green-400" />
                                ) : (
                                    <Square className="w-5 h-5 text-gray-500" />
                                )}
                                <span className={isChecked ? 'text-green-200' : 'text-gray-300'}>
                                    {item}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                    {checkedCount} de {content.checklist.length} completados
                </span>
                {allChecked && (
                    <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Todos completos!
                    </span>
                )}
            </div>

            <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <h4 className="font-bold text-orange-400 mb-2">💭 Reflexão</h4>
                <p className="text-orange-200">{content.reflection}</p>
            </div>

            <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <p className="text-sm text-orange-300">
                    ⏱️ Tempo sugerido: <strong>{content.durationMinutes} minutos</strong>
                </p>
            </div>
        </div>
    );
}

function CompleteContent({ dayContent }: { dayContent: DailyContent }) {
    return (
        <div className="text-center space-y-6">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center"
            >
                <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>

            <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                    🎉 Dia {dayContent.day} Completo!
                </h3>
                <p className="text-gray-400">
                    Você completou: <strong className="text-white">{dayContent.title}</strong>
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="text-sm text-gray-400">Objetivos</div>
                    <div className="text-lg font-bold text-white">{dayContent.objectives.length}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl mb-1">🎵</div>
                    <div className="text-sm text-gray-400">Músicas</div>
                    <div className="text-lg font-bold text-white">{dayContent.ouvir.playlist.length}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl mb-1">💪</div>
                    <div className="text-sm text-gray-400">Exercícios</div>
                    <div className="text-lg font-bold text-white">{dayContent.praticar.exercises.length}</div>
                </div>
            </div>

            <p className="text-gray-300 italic">
                "Cada dia de prática te aproxima do músico que você quer ser."
            </p>
        </div>
    );
}

export default OAPRSession;
