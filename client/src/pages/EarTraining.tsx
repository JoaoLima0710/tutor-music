/**
 * Ear Training Page - v2.1
 * Progressive ear training system with:
 * - Interval Recognition (4 levels)
 * - Chord Recognition (Major/Minor/7th)
 * - Rhythm Recognition
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sidebar } from '@/components/layout/Sidebar';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useUserStore } from '@/stores/useUserStore';
import {
    Play,
    Music,
    Volume2,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Trophy,
    Star,
    Headphones,
    BarChart3
} from 'lucide-react';
import { unifiedAudioService } from '@/services/UnifiedAudioService';
import { toast } from 'sonner';

// Types
interface IntervalQuestion {
    id: string;
    notes: [string, string];
    interval: string;
    semitones: number;
    referencesSongs: string[];
}

interface ChordQuestion {
    id: string;
    notes: string[];
    type: 'major' | 'minor' | 'major7' | 'minor7' | 'dominant7';
    name: string;
}

interface TrainingStats {
    intervalsCorrect: number;
    intervalsTotal: number;
    chordsCorrect: number;
    chordsTotal: number;
    currentStreak: number;
    bestStreak: number;
}

// Interval Data with Reference Songs
const INTERVALS: { [key: string]: { name: string; semitones: number; songs: string[] } } = {
    'm2': { name: 'Segunda Menor', semitones: 1, songs: ['Tubarão (Jaws)', 'Für Elise'] },
    'M2': { name: 'Segunda Maior', semitones: 2, songs: ['Ode à Alegria', 'Parabéns'] },
    'm3': { name: 'Terça Menor', semitones: 3, songs: ['Greensleeves', 'Hey Jude (começo)'] },
    'M3': { name: 'Terça Maior', semitones: 4, songs: ['Oh When the Saints', 'Kumbaya'] },
    'P4': { name: 'Quarta Justa', semitones: 5, songs: ['Hino Nacional', 'Amazing Grace'] },
    'TT': { name: 'Trítono', semitones: 6, songs: ['Simpsons', 'Maria (West Side Story)'] },
    'P5': { name: 'Quinta Justa', semitones: 7, songs: ['Star Wars', 'Twinkle Twinkle'] },
    'm6': { name: 'Sexta Menor', semitones: 8, songs: ['The Entertainer', 'Go Down Moses'] },
    'M6': { name: 'Sexta Maior', semitones: 9, songs: ['NBC Theme', 'Hush Little Baby'] },
    'm7': { name: 'Sétima Menor', semitones: 10, songs: ['Star Trek', 'Somewhere (West Side)'] },
    'M7': { name: 'Sétima Maior', semitones: 11, songs: ['Take On Me', 'Superman Theme'] },
    'P8': { name: 'Oitava', semitones: 12, songs: ['Somewhere Over the Rainbow', 'Singing in the Rain'] },
};

// Training Levels
const INTERVAL_LEVELS = [
    { level: 1, name: 'Básico', intervals: ['M2', 'm3', 'M3', 'P5'], description: 'Intervalos mais comuns' },
    { level: 2, name: 'Intermediário', intervals: ['m2', 'M2', 'm3', 'M3', 'P4', 'P5', 'P8'], description: 'Todos os intervalos simples' },
    { level: 3, name: 'Avançado', intervals: ['m2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'], description: 'Intervalos com trítono e sextas' },
    { level: 4, name: 'Mestre', intervals: Object.keys(INTERVALS), description: 'Todos os 12 intervalos' },
];

// Generate random interval question
function generateIntervalQuestion(level: number): IntervalQuestion {
    const levelConfig = INTERVAL_LEVELS[level - 1];
    const intervalKey = levelConfig.intervals[Math.floor(Math.random() * levelConfig.intervals.length)];
    const interval = INTERVALS[intervalKey];

    // Starting notes from C3 to G4
    const baseNotes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4'];
    const baseNote = baseNotes[Math.floor(Math.random() * baseNotes.length)];

    // Calculate second note
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const baseNoteName = baseNote.replace(/\d/, '');
    const baseOctave = parseInt(baseNote.replace(/\D/g, ''));
    const baseNoteIndex = noteNames.indexOf(baseNoteName);

    const secondNoteIndex = (baseNoteIndex + interval.semitones) % 12;
    const secondOctave = baseOctave + Math.floor((baseNoteIndex + interval.semitones) / 12);
    const secondNote = `${noteNames[secondNoteIndex]}${secondOctave}`;

    return {
        id: `interval-${Date.now()}`,
        notes: [baseNote, secondNote],
        interval: intervalKey,
        semitones: interval.semitones,
        referencesSongs: interval.songs,
    };
}

// Generate chord question
function generateChordQuestion(includeSevenths: boolean): ChordQuestion {
    const roots = ['C', 'D', 'E', 'F', 'G', 'A'];
    const root = roots[Math.floor(Math.random() * roots.length)];
    const octave = 4;

    const types: Array<'major' | 'minor' | 'major7' | 'minor7' | 'dominant7'> = includeSevenths
        ? ['major', 'minor', 'major7', 'minor7', 'dominant7']
        : ['major', 'minor'];

    const type = types[Math.floor(Math.random() * types.length)];

    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = noteNames.indexOf(root);

    const getNote = (semitones: number) => {
        const idx = (rootIndex + semitones) % 12;
        const oct = octave + Math.floor((rootIndex + semitones) / 12);
        return `${noteNames[idx]}${oct}`;
    };

    let notes: string[] = [];
    let name = '';

    switch (type) {
        case 'major':
            notes = [`${root}${octave}`, getNote(4), getNote(7)];
            name = root;
            break;
        case 'minor':
            notes = [`${root}${octave}`, getNote(3), getNote(7)];
            name = `${root}m`;
            break;
        case 'major7':
            notes = [`${root}${octave}`, getNote(4), getNote(7), getNote(11)];
            name = `${root}maj7`;
            break;
        case 'minor7':
            notes = [`${root}${octave}`, getNote(3), getNote(7), getNote(10)];
            name = `${root}m7`;
            break;
        case 'dominant7':
            notes = [`${root}${octave}`, getNote(4), getNote(7), getNote(10)];
            name = `${root}7`;
            break;
    }

    return { id: `chord-${Date.now()}`, notes, type, name };
}

export default function EarTraining() {
    const [activeTab, setActiveTab] = useState('intervals');
    const [intervalLevel, setIntervalLevel] = useState(1);
    const [includeSevenths, setIncludeSevenths] = useState(false);

    // User and gamification stores
    const { xp, level, xpToNextLevel, currentStreak } = useGamificationStore();
    const { user } = useUserStore();
    const userName = user?.name || "Usuário";

    // Training state
    const [currentIntervalQuestion, setCurrentIntervalQuestion] = useState<IntervalQuestion | null>(null);
    const [currentChordQuestion, setCurrentChordQuestion] = useState<ChordQuestion | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    // Stats
    const [stats, setStats] = useState<TrainingStats>({
        intervalsCorrect: 0,
        intervalsTotal: 0,
        chordsCorrect: 0,
        chordsTotal: 0,
        currentStreak: 0,
        bestStreak: 0,
    });

    // Initialize first question
    useEffect(() => {
        setCurrentIntervalQuestion(generateIntervalQuestion(intervalLevel));
        setCurrentChordQuestion(generateChordQuestion(includeSevenths));
    }, [intervalLevel, includeSevenths]);

    // Play interval
    const playInterval = async () => {
        if (!currentIntervalQuestion) return;
        setIsPlaying(true);

        try {
            await unifiedAudioService.playNote(currentIntervalQuestion.notes[0], 0.7);
            await new Promise(resolve => setTimeout(resolve, 800));
            await unifiedAudioService.playNote(currentIntervalQuestion.notes[1], 0.7);
        } catch (error) {
            console.error('Error playing interval:', error);
        } finally {
            setIsPlaying(false);
        }
    };

    // Play chord
    const playChord = async () => {
        if (!currentChordQuestion) return;
        setIsPlaying(true);

        try {
            const playPromises = currentChordQuestion.notes.map(note =>
                unifiedAudioService.playNote(note, 0.8)
            );
            await Promise.all(playPromises);
        } catch (error) {
            console.error('Error playing chord:', error);
        } finally {
            setIsPlaying(false);
        }
    };

    // Handle interval answer
    const handleIntervalAnswer = (answer: string) => {
        if (!currentIntervalQuestion || showResult) return;

        const correct = answer === currentIntervalQuestion.interval;
        setSelectedAnswer(answer);
        setIsCorrect(correct);
        setShowResult(true);

        setStats(prev => ({
            ...prev,
            intervalsTotal: prev.intervalsTotal + 1,
            intervalsCorrect: prev.intervalsCorrect + (correct ? 1 : 0),
            currentStreak: correct ? prev.currentStreak + 1 : 0,
            bestStreak: correct ? Math.max(prev.bestStreak, prev.currentStreak + 1) : prev.bestStreak,
        }));

        if (correct) {
            toast.success('Correto! 🎉');
        } else {
            toast.error(`Era ${INTERVALS[currentIntervalQuestion.interval].name}`);
        }
    };

    // Handle chord answer
    const handleChordAnswer = (answer: 'major' | 'minor' | 'major7' | 'minor7' | 'dominant7') => {
        if (!currentChordQuestion || showResult) return;

        const correct = answer === currentChordQuestion.type;
        setSelectedAnswer(answer);
        setIsCorrect(correct);
        setShowResult(true);

        setStats(prev => ({
            ...prev,
            chordsTotal: prev.chordsTotal + 1,
            chordsCorrect: prev.chordsCorrect + (correct ? 1 : 0),
            currentStreak: correct ? prev.currentStreak + 1 : 0,
            bestStreak: correct ? Math.max(prev.bestStreak, prev.currentStreak + 1) : prev.bestStreak,
        }));

        if (correct) {
            toast.success('Correto! 🎉');
        }
    };

    // Next question
    const nextQuestion = (type: 'interval' | 'chord') => {
        setShowResult(false);
        setSelectedAnswer(null);

        if (type === 'interval') {
            setCurrentIntervalQuestion(generateIntervalQuestion(intervalLevel));
        } else {
            setCurrentChordQuestion(generateChordQuestion(includeSevenths));
        }
    };

    // Get available interval options for current level
    const getIntervalOptions = () => {
        const levelConfig = INTERVAL_LEVELS[intervalLevel - 1];
        return levelConfig.intervals.map(key => ({
            key,
            name: INTERVALS[key].name,
        }));
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
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <Headphones className="w-8 h-8 text-purple-400" />
                                Treinamento Auditivo
                            </h1>
                            <p className="text-gray-400 mt-1">
                                Desenvolva seu ouvido musical com exercícios progressivos
                            </p>
                        </div>

                        {/* Stats Summary */}
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-400">{stats.currentStreak}</div>
                                <div className="text-xs text-gray-500">Streak</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-400">{stats.bestStreak}</div>
                                <div className="text-xs text-gray-500">Melhor</div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="bg-white/5 border border-white/10">
                            <TabsTrigger value="intervals" className="data-[state=active]:bg-purple-500/30">
                                <Music className="w-4 h-4 mr-2" />
                                Intervalos
                            </TabsTrigger>
                            <TabsTrigger value="chords" className="data-[state=active]:bg-blue-500/30">
                                <Volume2 className="w-4 h-4 mr-2" />
                                Acordes
                            </TabsTrigger>
                            <TabsTrigger value="progress" className="data-[state=active]:bg-green-500/30">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Progresso
                            </TabsTrigger>
                        </TabsList>

                        {/* Intervals Tab */}
                        <TabsContent value="intervals" className="space-y-6">
                            {/* Level Selector */}
                            <div className="flex gap-2">
                                {INTERVAL_LEVELS.map((lvl) => (
                                    <Button
                                        key={lvl.level}
                                        variant={intervalLevel === lvl.level ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                            setIntervalLevel(lvl.level);
                                            setShowResult(false);
                                        }}
                                        className={intervalLevel === lvl.level
                                            ? 'bg-purple-500 hover:bg-purple-600'
                                            : 'border-white/20 text-white hover:bg-white/10'}
                                    >
                                        {lvl.name}
                                    </Button>
                                ))}
                            </div>

                            <p className="text-sm text-gray-400">
                                {INTERVAL_LEVELS[intervalLevel - 1].description}
                            </p>

                            {/* Main Training Card */}
                            <Card className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
                                <div className="text-center space-y-6">
                                    <h3 className="text-xl font-bold text-white">
                                        Qual intervalo você ouve?
                                    </h3>

                                    <Button
                                        onClick={playInterval}
                                        disabled={isPlaying}
                                        size="lg"
                                        className="w-full max-w-xs mx-auto h-20 text-xl bg-gradient-to-r from-purple-500 to-pink-500"
                                    >
                                        {isPlaying ? (
                                            <>
                                                <Volume2 className="w-8 h-8 mr-3 animate-pulse" />
                                                Tocando...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-8 h-8 mr-3" />
                                                Ouvir Intervalo
                                            </>
                                        )}
                                    </Button>

                                    {/* Answer Options */}
                                    {!showResult ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                                            {getIntervalOptions().map(({ key, name }) => (
                                                <Button
                                                    key={key}
                                                    onClick={() => handleIntervalAnswer(key)}
                                                    variant="outline"
                                                    className="h-14 border-white/20 text-white hover:bg-white/10 text-sm"
                                                >
                                                    {name}
                                                </Button>
                                            ))}
                                        </div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-4"
                                        >
                                            <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
                                                <div className="flex items-center justify-center gap-2 mb-2">
                                                    {isCorrect ? (
                                                        <>
                                                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                                                            <span className="text-green-400 font-bold">Correto!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-6 h-6 text-red-400" />
                                                            <span className="text-red-400 font-bold">
                                                                Era: {INTERVALS[currentIntervalQuestion!.interval].name}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Reference Songs */}
                                                <div className="text-sm text-gray-300">
                                                    <p className="mb-1">🎵 Músicas de referência:</p>
                                                    <ul className="text-gray-400">
                                                        {currentIntervalQuestion?.referencesSongs.map((song, i) => (
                                                            <li key={i}>• {song}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <Button onClick={() => nextQuestion('interval')} className="w-full max-w-xs">
                                                Próximo Intervalo
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>
                            </Card>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4 bg-white/5 border-white/10">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-400">
                                            {stats.intervalsTotal > 0
                                                ? Math.round((stats.intervalsCorrect / stats.intervalsTotal) * 100)
                                                : 0}%
                                        </div>
                                        <div className="text-sm text-gray-400">Taxa de Acerto</div>
                                    </div>
                                </Card>
                                <Card className="p-4 bg-white/5 border-white/10">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">
                                            {stats.intervalsCorrect}/{stats.intervalsTotal}
                                        </div>
                                        <div className="text-sm text-gray-400">Acertos</div>
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Chords Tab */}
                        <TabsContent value="chords" className="space-y-6">
                            {/* Include 7ths toggle */}
                            <div className="flex items-center gap-3">
                                <label className="text-gray-300">Incluir acordes com 7ª:</label>
                                <button
                                    onClick={() => setIncludeSevenths(!includeSevenths)}
                                    className={`w-12 h-6 rounded-full transition-colors ${includeSevenths ? 'bg-blue-500' : 'bg-white/20'
                                        }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full bg-white transition-transform ${includeSevenths ? 'translate-x-6' : 'translate-x-0.5'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Main Training Card */}
                            <Card className="p-6 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
                                <div className="text-center space-y-6">
                                    <h3 className="text-xl font-bold text-white">
                                        Este acorde é Maior ou Menor?
                                        {includeSevenths && ' (ou com 7ª?)'}
                                    </h3>

                                    <Button
                                        onClick={playChord}
                                        disabled={isPlaying}
                                        size="lg"
                                        className="w-full max-w-xs mx-auto h-20 text-xl bg-gradient-to-r from-blue-500 to-cyan-500"
                                    >
                                        {isPlaying ? (
                                            <>
                                                <Volume2 className="w-8 h-8 mr-3 animate-pulse" />
                                                Tocando...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-8 h-8 mr-3" />
                                                Ouvir Acorde
                                            </>
                                        )}
                                    </Button>

                                    {/* Answer Options */}
                                    {!showResult ? (
                                        <div className={`grid ${includeSevenths ? 'grid-cols-5' : 'grid-cols-2'} gap-3 max-w-xl mx-auto`}>
                                            <Button
                                                onClick={() => handleChordAnswer('major')}
                                                variant="outline"
                                                className="h-16 border-green-500/30 text-green-400 hover:bg-green-500/20"
                                            >
                                                😊 Maior
                                            </Button>
                                            <Button
                                                onClick={() => handleChordAnswer('minor')}
                                                variant="outline"
                                                className="h-16 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                                            >
                                                😢 Menor
                                            </Button>
                                            {includeSevenths && (
                                                <>
                                                    <Button
                                                        onClick={() => handleChordAnswer('major7')}
                                                        variant="outline"
                                                        className="h-16 border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                                                    >
                                                        Maj7
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleChordAnswer('minor7')}
                                                        variant="outline"
                                                        className="h-16 border-pink-500/30 text-pink-400 hover:bg-pink-500/20"
                                                    >
                                                        m7
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleChordAnswer('dominant7')}
                                                        variant="outline"
                                                        className="h-16 border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                                                    >
                                                        7 (dom)
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-4"
                                        >
                                            <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
                                                <div className="flex items-center justify-center gap-2">
                                                    {isCorrect ? (
                                                        <>
                                                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                                                            <span className="text-green-400 font-bold">Correto! Era {currentChordQuestion?.name}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-6 h-6 text-red-400" />
                                                            <span className="text-red-400 font-bold">Era {currentChordQuestion?.name}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <Button onClick={() => nextQuestion('chord')} className="w-full max-w-xs">
                                                Próximo Acorde
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>
                            </Card>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4 bg-white/5 border-white/10">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">
                                            {stats.chordsTotal > 0
                                                ? Math.round((stats.chordsCorrect / stats.chordsTotal) * 100)
                                                : 0}%
                                        </div>
                                        <div className="text-sm text-gray-400">Taxa de Acerto</div>
                                    </div>
                                </Card>
                                <Card className="p-4 bg-white/5 border-white/10">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-cyan-400">
                                            {stats.chordsCorrect}/{stats.chordsTotal}
                                        </div>
                                        <div className="text-sm text-gray-400">Acertos</div>
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Progress Tab */}
                        <TabsContent value="progress" className="space-y-6">
                            <Card className="p-6 bg-white/5 border-white/10">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-yellow-400" />
                                    Seu Progresso
                                </h3>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h4 className="text-purple-400 font-semibold">Intervalos</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Exercícios</span>
                                                <span className="text-white">{stats.intervalsTotal}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Acertos</span>
                                                <span className="text-green-400">{stats.intervalsCorrect}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Taxa</span>
                                                <span className="text-purple-400">
                                                    {stats.intervalsTotal > 0
                                                        ? Math.round((stats.intervalsCorrect / stats.intervalsTotal) * 100)
                                                        : 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-blue-400 font-semibold">Acordes</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Exercícios</span>
                                                <span className="text-white">{stats.chordsTotal}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Acertos</span>
                                                <span className="text-green-400">{stats.chordsCorrect}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Taxa</span>
                                                <span className="text-blue-400">
                                                    {stats.chordsTotal > 0
                                                        ? Math.round((stats.chordsCorrect / stats.chordsTotal) * 100)
                                                        : 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-yellow-400 font-semibold">Melhor Streak</p>
                                            <p className="text-sm text-gray-400">Acertos consecutivos</p>
                                        </div>
                                        <div className="text-4xl font-bold text-yellow-400 flex items-center gap-2">
                                            <Star className="w-8 h-8" />
                                            {stats.bestStreak}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Tips */}
                            <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
                                <h3 className="text-lg font-bold text-white mb-3">💡 Dicas para Melhorar</h3>
                                <ul className="space-y-2 text-gray-300 text-sm">
                                    <li>• Pratique cantar os intervalos antes de identificá-los</li>
                                    <li>• Use as músicas de referência para memorizar cada intervalo</li>
                                    <li>• Comece no nível Básico até atingir 80% de acerto</li>
                                    <li>• Pratique 5-10 minutos por dia consistentemente</li>
                                </ul>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
