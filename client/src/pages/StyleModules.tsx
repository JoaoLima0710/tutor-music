/**
 * Style Modules Page - v2.1
 * Style-specific learning modules featuring:
 * - MPB (Bossa Nova rhythms)
 * - Sertanejo (common progressions)
 * - Rock (power chords, riffs)
 * - Pop (contemporary progressions)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sidebar } from '@/components/layout/Sidebar';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useUserStore } from '@/stores/useUserStore';
import {
    Play,
    Music,
    Guitar,
    Heart,
    Star,
    Lock,
    CheckCircle2,
    ChevronRight,
    Clock,
    Headphones,
    Volume2
} from 'lucide-react';
import { unifiedAudioService } from '@/services/UnifiedAudioService';
import { toast } from 'sonner';

// Style Module Types
interface StyleLesson {
    id: string;
    title: string;
    description: string;
    duration: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    chords: string[];
    rhythm?: string;
    bpm?: number;
    completed: boolean;
    locked: boolean;
}

interface StyleModule {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    gradient: string;
    lessons: StyleLesson[];
    songs: { name: string; artist: string; chords: string[] }[];
}

// MPB/Bossa Nova Module
const MPB_MODULE: StyleModule = {
    id: 'mpb',
    name: 'MPB & Bossa Nova',
    description: 'Ritmos brasileiros autênticos com batidas sofisticadas',
    icon: '🇧🇷',
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
    lessons: [
        {
            id: 'mpb-1',
            title: 'Introdução à Bossa Nova',
            description: 'Aprenda o ritmo básico da bossa nova no violão',
            duration: '15 min',
            difficulty: 'beginner',
            chords: ['Am7', 'D7', 'Gmaj7', 'Cmaj7'],
            rhythm: 'Bossa Nova básica',
            bpm: 120,
            completed: false,
            locked: false,
        },
        {
            id: 'mpb-2',
            title: 'Acordes com 7ª',
            description: 'Acordes maiores e menores com sétima essenciais para MPB',
            duration: '20 min',
            difficulty: 'beginner',
            chords: ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5'],
            completed: false,
            locked: false,
        },
        {
            id: 'mpb-3',
            title: 'Batida João Gilberto',
            description: 'O estilo de dedilhado icônico do mestre',
            duration: '25 min',
            difficulty: 'intermediate',
            chords: ['Dm7', 'G7', 'Cmaj7', 'A7'],
            rhythm: 'Dedilhado João Gilberto',
            bpm: 100,
            completed: false,
            locked: true,
        },
        {
            id: 'mpb-4',
            title: 'Progressões II-V-I',
            description: 'A progressão mais importante do jazz e bossa',
            duration: '30 min',
            difficulty: 'intermediate',
            chords: ['Dm7', 'G7', 'Cmaj7'],
            completed: false,
            locked: true,
        },
        {
            id: 'mpb-5',
            title: 'Tom Jobim - Garota de Ipanema',
            description: 'Aprenda a música mais famosa da bossa nova',
            duration: '40 min',
            difficulty: 'advanced',
            chords: ['Fmaj7', 'G7', 'Gm7', 'Gb7', 'Fmaj7', 'Gb7'],
            completed: false,
            locked: true,
        },
    ],
    songs: [
        { name: 'Garota de Ipanema', artist: 'Tom Jobim', chords: ['Fmaj7', 'G7', 'Gm7', 'Gb7'] },
        { name: 'Chega de Saudade', artist: 'João Gilberto', chords: ['Dm7', 'E7', 'Am7', 'Gm7'] },
        { name: 'Águas de Março', artist: 'Tom Jobim', chords: ['A', 'Am', 'E7', 'A7'] },
    ],
};

// Sertanejo Module
const SERTANEJO_MODULE: StyleModule = {
    id: 'sertanejo',
    name: 'Sertanejo',
    description: 'Do raiz ao universitário, dominando o estilo mais popular do Brasil',
    icon: '🤠',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    lessons: [
        {
            id: 'sert-1',
            title: 'Acordes Básicos do Sertanejo',
            description: 'Os acordes mais usados no sertanejo',
            duration: '15 min',
            difficulty: 'beginner',
            chords: ['G', 'C', 'D', 'Em'],
            completed: false,
            locked: false,
        },
        {
            id: 'sert-2',
            title: 'Batida Sertaneja',
            description: 'O ritmo característico do estilo',
            duration: '20 min',
            difficulty: 'beginner',
            chords: ['G', 'D', 'Em', 'C'],
            rhythm: 'Batida sertaneja básica',
            bpm: 90,
            completed: false,
            locked: false,
        },
        {
            id: 'sert-3',
            title: 'Progressão I-V-vi-IV',
            description: 'A progressão mais usada no sertanejo universitário',
            duration: '25 min',
            difficulty: 'intermediate',
            chords: ['G', 'D', 'Em', 'C'],
            completed: false,
            locked: true,
        },
        {
            id: 'sert-4',
            title: 'Dedilhado Romântico',
            description: 'Para aquelas modas de viola lentas',
            duration: '30 min',
            difficulty: 'intermediate',
            chords: ['Am', 'F', 'C', 'G'],
            completed: false,
            locked: true,
        },
    ],
    songs: [
        { name: 'Evidências', artist: 'Chitãozinho & Xororó', chords: ['G', 'D', 'Em', 'C'] },
        { name: 'Amor da Sua Cama', artist: 'Gusttavo Lima', chords: ['G', 'C', 'Em', 'D'] },
        { name: 'Pega Eu', artist: 'Marília Mendonça', chords: ['Am', 'F', 'C', 'G'] },
    ],
};

// Rock Module
const ROCK_MODULE: StyleModule = {
    id: 'rock',
    name: 'Rock Nacional',
    description: 'Power chords, riffs e atitude do rock brasileiro',
    icon: '🎸',
    color: 'red',
    gradient: 'from-red-500 to-rose-600',
    lessons: [
        {
            id: 'rock-1',
            title: 'Power Chords',
            description: 'A base do rock no violão',
            duration: '20 min',
            difficulty: 'beginner',
            chords: ['E5', 'A5', 'D5', 'G5'],
            completed: false,
            locked: false,
        },
        {
            id: 'rock-2',
            title: 'Riffs Básicos',
            description: 'Introdução aos riffs de rock',
            duration: '25 min',
            difficulty: 'beginner',
            chords: ['E', 'G', 'A', 'D'],
            completed: false,
            locked: false,
        },
        {
            id: 'rock-3',
            title: 'Palm Mute',
            description: 'Técnica essencial para o som de rock',
            duration: '20 min',
            difficulty: 'intermediate',
            chords: ['E5', 'A5', 'B5'],
            completed: false,
            locked: true,
        },
        {
            id: 'rock-4',
            title: 'Legião Urbana - Ainda É Cedo',
            description: 'Aprenda um clássico do rock brasileiro',
            duration: '35 min',
            difficulty: 'intermediate',
            chords: ['Am', 'F', 'C', 'G'],
            completed: false,
            locked: true,
        },
    ],
    songs: [
        { name: 'Ainda É Cedo', artist: 'Legião Urbana', chords: ['Am', 'F', 'C', 'G'] },
        { name: 'Pra Ser Sincero', artist: 'Engenheiros do Hawaii', chords: ['D', 'G', 'A', 'Bm'] },
        { name: 'Que País É Este', artist: 'Legião Urbana', chords: ['E5', 'A5', 'B5'] },
    ],
};

// Pop Module
const POP_MODULE: StyleModule = {
    id: 'pop',
    name: 'Pop Brasileiro',
    description: 'Músicas atuais com progressões contemporâneas',
    icon: '🎤',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    lessons: [
        {
            id: 'pop-1',
            title: 'Acordes Pop Essenciais',
            description: 'Os 4 acordes que tocam 80% das músicas pop',
            duration: '15 min',
            difficulty: 'beginner',
            chords: ['C', 'G', 'Am', 'F'],
            completed: false,
            locked: false,
        },
        {
            id: 'pop-2',
            title: 'Batida Pop',
            description: 'Ritmo versátil para músicas atuais',
            duration: '20 min',
            difficulty: 'beginner',
            chords: ['G', 'D', 'Em', 'C'],
            rhythm: 'Strumming pop básico',
            bpm: 100,
            completed: false,
            locked: false,
        },
        {
            id: 'pop-3',
            title: 'Fingerstyle Pop',
            description: 'Arranjos solo para músicas populares',
            duration: '30 min',
            difficulty: 'intermediate',
            chords: ['Am', 'F', 'C', 'G'],
            completed: false,
            locked: true,
        },
        {
            id: 'pop-4',
            title: 'Capo e Transposição',
            description: 'Como adaptar músicas para sua voz',
            duration: '25 min',
            difficulty: 'intermediate',
            chords: ['G', 'C', 'D', 'Em'],
            completed: false,
            locked: true,
        },
    ],
    songs: [
        { name: 'Anunciação', artist: 'Alceu Valença', chords: ['Am', 'G', 'F', 'E'] },
        { name: 'Flor e o Beija-Flor', artist: 'Henrique e Juliano', chords: ['G', 'Em', 'C', 'D'] },
        { name: 'Meu Abrigo', artist: 'Melim', chords: ['C', 'G', 'Am', 'F'] },
    ],
};

const ALL_MODULES = [MPB_MODULE, SERTANEJO_MODULE, ROCK_MODULE, POP_MODULE];

export default function StyleModules() {
    const [selectedModule, setSelectedModule] = useState<StyleModule | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<StyleLesson | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // User and gamification stores
    const { xp, level, xpToNextLevel, currentStreak } = useGamificationStore();
    const { user } = useUserStore();
    const userName = user?.name || "Usuário";

    const playChord = async (chordName: string) => {
        setIsPlaying(true);
        try {
            // Map chord name to root note
            const root = chordName.replace(/[m7b5maj#]+/g, '');
            await unifiedAudioService.playNote(`${root}3`, 0.8);
            toast.success(`${chordName} ♪`);
        } catch (error) {
            console.error('Error playing chord:', error);
        } finally {
            setIsPlaying(false);
        }
    };

    const startLesson = (lesson: StyleLesson) => {
        if (lesson.locked) {
            toast.error('Complete as lições anteriores primeiro!');
            return;
        }
        setSelectedLesson(lesson);
        toast.success(`Iniciando: ${lesson.title}`);
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'Iniciante';
            case 'intermediate': return 'Intermediário';
            case 'advanced': return 'Avançado';
            default: return difficulty;
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <Sidebar
                userName={userName}
                userLevel={level}
                currentXP={xp}
                xpToNextLevel={xpToNextLevel}
                streak={currentStreak}
            />

            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <Guitar className="w-8 h-8 text-purple-400" />
                                Módulos de Estilo
                            </h1>
                            <p className="text-gray-400 mt-1">
                                Aprenda a tocar nos estilos mais populares do Brasil
                            </p>
                        </div>
                    </div>

                    {!selectedModule ? (
                        /* Module Selection Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {ALL_MODULES.map((module) => {
                                const completedCount = module.lessons.filter(l => l.completed).length;
                                const progress = (completedCount / module.lessons.length) * 100;

                                return (
                                    <motion.div
                                        key={module.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Card
                                            className={`p-6 cursor-pointer bg-gradient-to-br ${module.gradient}/20 border-white/10 hover:border-white/30 transition-all`}
                                            onClick={() => setSelectedModule(module)}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.gradient} flex items-center justify-center text-3xl shadow-lg`}>
                                                    {module.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-white mb-1">{module.name}</h3>
                                                    <p className="text-sm text-gray-400 mb-3">{module.description}</p>

                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className="text-gray-500">
                                                            {module.lessons.length} lições
                                                        </span>
                                                        <span className="text-gray-500">
                                                            {module.songs.length} músicas
                                                        </span>
                                                    </div>

                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between text-xs mb-1">
                                                            <span className="text-gray-400">Progresso</span>
                                                            <span className="text-white">{Math.round(progress)}%</span>
                                                        </div>
                                                        <Progress value={progress} className="h-2" />
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-gray-500" />
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Module Detail View */
                        <div className="space-y-6">
                            {/* Back Button */}
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setSelectedModule(null);
                                    setSelectedLesson(null);
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                ← Voltar aos módulos
                            </Button>

                            {/* Module Header */}
                            <Card className={`p-6 bg-gradient-to-br ${selectedModule.gradient}/20 border-white/10`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedModule.gradient} flex items-center justify-center text-4xl shadow-lg`}>
                                        {selectedModule.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedModule.name}</h2>
                                        <p className="text-gray-400">{selectedModule.description}</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Lessons */}
                            <div className="space-y-3">
                                <h3 className="text-xl font-bold text-white">Lições</h3>
                                {selectedModule.lessons.map((lesson, index) => (
                                    <motion.div
                                        key={lesson.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card
                                            className={`p-4 border-white/10 transition-all ${lesson.locked
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'hover:bg-white/5 cursor-pointer'
                                                } ${selectedLesson?.id === lesson.id ? 'ring-2 ring-purple-500' : ''}`}
                                            onClick={() => startLesson(lesson)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lesson.completed
                                                        ? 'bg-green-500/20'
                                                        : lesson.locked
                                                            ? 'bg-gray-500/20'
                                                            : `bg-gradient-to-br ${selectedModule.gradient}/30`
                                                    }`}>
                                                    {lesson.completed ? (
                                                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                                                    ) : lesson.locked ? (
                                                        <Lock className="w-5 h-5 text-gray-500" />
                                                    ) : (
                                                        <span className="text-lg font-bold text-white">{index + 1}</span>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-white">{lesson.title}</h4>
                                                    <p className="text-sm text-gray-400">{lesson.description}</p>

                                                    <div className="flex items-center gap-3 mt-2">
                                                        <Badge className={getDifficultyColor(lesson.difficulty)}>
                                                            {getDifficultyLabel(lesson.difficulty)}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {lesson.duration}
                                                        </span>
                                                    </div>
                                                </div>

                                                {!lesson.locked && (
                                                    <Button
                                                        size="sm"
                                                        className={`bg-gradient-to-r ${selectedModule.gradient}`}
                                                    >
                                                        <Play className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Chords Preview */}
                            {selectedLesson && (
                                <Card className="p-6 bg-white/5 border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Headphones className="w-5 h-5 text-purple-400" />
                                        Acordes da Lição: {selectedLesson.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {selectedLesson.chords.map((chord) => (
                                            <Button
                                                key={chord}
                                                variant="outline"
                                                onClick={() => playChord(chord)}
                                                disabled={isPlaying}
                                                className="border-white/20 text-white hover:bg-white/10"
                                            >
                                                <Volume2 className="w-4 h-4 mr-2" />
                                                {chord}
                                            </Button>
                                        ))}
                                    </div>
                                    {selectedLesson.rhythm && (
                                        <p className="mt-4 text-sm text-gray-400">
                                            🎵 Ritmo: {selectedLesson.rhythm} ({selectedLesson.bpm} BPM)
                                        </p>
                                    )}
                                </Card>
                            )}

                            {/* Songs */}
                            <div className="space-y-3">
                                <h3 className="text-xl font-bold text-white">Músicas para Praticar</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {selectedModule.songs.map((song, index) => (
                                        <Card key={index} className="p-4 bg-white/5 border-white/10">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedModule.gradient} flex items-center justify-center`}>
                                                    <Music className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white text-sm">{song.name}</h4>
                                                    <p className="text-xs text-gray-400">{song.artist}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {song.chords.map((chord) => (
                                                    <Badge key={chord} variant="outline" className="text-xs border-white/20 text-gray-300">
                                                        {chord}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
