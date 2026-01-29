/**
 * Deliberate Practice Page - v2.1
 * Real-time audio analysis with microphone for chord/note practice
 * Uses existing PitchDetectionService and RealtimeAIFeedbackService
 */

import { useState, useCallback, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { RealtimeAudioFeedback } from '@/components/audio/RealtimeAudioFeedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Mic,
    MicOff,
    Target,
    Zap,
    CheckCircle2,
    XCircle,
    RefreshCw,
    TrendingUp,
    Clock,
    Award,
    Guitar,
    Music2,
    ChevronRight,
    Volume2,
    Info
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Available practice targets
const PRACTICE_CHORDS = [
    { name: 'C', notes: ['C', 'E', 'G'], difficulty: 'beginner' },
    { name: 'D', notes: ['D', 'F#', 'A'], difficulty: 'beginner' },
    { name: 'E', notes: ['E', 'G#', 'B'], difficulty: 'beginner' },
    { name: 'G', notes: ['G', 'B', 'D'], difficulty: 'beginner' },
    { name: 'A', notes: ['A', 'C#', 'E'], difficulty: 'beginner' },
    { name: 'Am', notes: ['A', 'C', 'E'], difficulty: 'beginner' },
    { name: 'Em', notes: ['E', 'G', 'B'], difficulty: 'beginner' },
    { name: 'Dm', notes: ['D', 'F', 'A'], difficulty: 'beginner' },
    { name: 'F', notes: ['F', 'A', 'C'], difficulty: 'intermediate' },
    { name: 'Bm', notes: ['B', 'D', 'F#'], difficulty: 'intermediate' },
    { name: 'C7', notes: ['C', 'E', 'G', 'Bb'], difficulty: 'intermediate' },
    { name: 'G7', notes: ['G', 'B', 'D', 'F'], difficulty: 'intermediate' },
    { name: 'Cmaj7', notes: ['C', 'E', 'G', 'B'], difficulty: 'advanced' },
    { name: 'Dm7', notes: ['D', 'F', 'A', 'C'], difficulty: 'advanced' },
];

const PRACTICE_NOTES = [
    { name: 'E (corda 6)', note: 'E', string: 6 },
    { name: 'A (corda 5)', note: 'A', string: 5 },
    { name: 'D (corda 4)', note: 'D', string: 4 },
    { name: 'G (corda 3)', note: 'G', string: 3 },
    { name: 'B (corda 2)', note: 'B', string: 2 },
    { name: 'E (corda 1)', note: 'E', string: 1 },
];

type PracticeMode = 'chord' | 'note' | 'scale';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface SessionStats {
    totalAttempts: number;
    successfulAttempts: number;
    averageQuality: number;
    sessionDuration: number;
    bestStreak: number;
    currentStreak: number;
}

export default function DeliberatePractice() {
    // Practice state
    const [practiceMode, setPracticeMode] = useState<PracticeMode>('chord');
    const [selectedTarget, setSelectedTarget] = useState<string>('C');
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
    const [isActive, setIsActive] = useState(false);

    // Session tracking
    const [sessionStats, setSessionStats] = useState<SessionStats>({
        totalAttempts: 0,
        successfulAttempts: 0,
        averageQuality: 0,
        sessionDuration: 0,
        bestStreak: 0,
        currentStreak: 0,
    });
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
    const [qualityHistory, setQualityHistory] = useState<number[]>([]);

    // Timer for session duration
    useEffect(() => {
        if (!isActive || !sessionStartTime) return;

        const interval = setInterval(() => {
            setSessionStats(prev => ({
                ...prev,
                sessionDuration: Math.floor((Date.now() - sessionStartTime) / 1000)
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, sessionStartTime]);

    // Handle feedback from RealtimeAudioFeedback
    const handleFeedback = useCallback((feedback: any) => {
        if (!isActive) return;

        const quality = feedback.quality || 0;
        const isCorrect = feedback.isCorrect || quality >= 70;

        setQualityHistory(prev => [...prev.slice(-20), quality]);

        setSessionStats(prev => {
            const newTotal = prev.totalAttempts + 1;
            const newSuccessful = isCorrect ? prev.successfulAttempts + 1 : prev.successfulAttempts;
            const newStreak = isCorrect ? prev.currentStreak + 1 : 0;
            const newBestStreak = Math.max(prev.bestStreak, newStreak);
            const newAvgQuality = [...qualityHistory, quality].reduce((a, b) => a + b, 0) / (qualityHistory.length + 1);

            return {
                ...prev,
                totalAttempts: newTotal,
                successfulAttempts: newSuccessful,
                currentStreak: newStreak,
                bestStreak: newBestStreak,
                averageQuality: Math.round(newAvgQuality),
            };
        });
    }, [isActive, qualityHistory]);

    // Start practice session
    const startPractice = useCallback(() => {
        setIsActive(true);
        setSessionStartTime(Date.now());
        toast.success('🎸 Prática iniciada! Toque o acorde/nota selecionado.');
    }, []);

    // Stop practice session
    const stopPractice = useCallback(() => {
        setIsActive(false);
        if (sessionStats.totalAttempts > 0) {
            toast.info(`📊 Sessão finalizada! Precisão: ${Math.round((sessionStats.successfulAttempts / sessionStats.totalAttempts) * 100)}%`);
        }
    }, [sessionStats]);

    // Reset session
    const resetSession = useCallback(() => {
        setSessionStats({
            totalAttempts: 0,
            successfulAttempts: 0,
            averageQuality: 0,
            sessionDuration: 0,
            bestStreak: 0,
            currentStreak: 0,
        });
        setQualityHistory([]);
        setSessionStartTime(null);
        setIsActive(false);
    }, []);

    // Get filtered chords by difficulty
    const filteredChords = PRACTICE_CHORDS.filter(c => c.difficulty === difficulty);

    // Format duration
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate accuracy percentage
    const accuracy = sessionStats.totalAttempts > 0
        ? Math.round((sessionStats.successfulAttempts / sessionStats.totalAttempts) * 100)
        : 0;

    return (
        <PageLayout>
            <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
                {/* Header */}
                <header className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-white">
                            Prática Deliberada
                        </h1>
                    </div>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Use o microfone para receber feedback em tempo real sobre sua execução.
                        Pratique acordes e notas com correções instantâneas.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel - Target Selection */}
                    <div className="space-y-4">
                        {/* Practice Mode Selection */}
                        <Card className="bg-[#1a1a2e]/80 border-white/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    Modo de Prática
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Button
                                        variant={practiceMode === 'chord' ? 'default' : 'outline'}
                                        onClick={() => setPracticeMode('chord')}
                                        className={practiceMode === 'chord' ? 'bg-purple-500' : ''}
                                        size="sm"
                                    >
                                        <Guitar className="w-4 h-4 mr-1" />
                                        Acordes
                                    </Button>
                                    <Button
                                        variant={practiceMode === 'note' ? 'default' : 'outline'}
                                        onClick={() => setPracticeMode('note')}
                                        className={practiceMode === 'note' ? 'bg-purple-500' : ''}
                                        size="sm"
                                    >
                                        <Music2 className="w-4 h-4 mr-1" />
                                        Notas
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Difficulty Selection (for chords) */}
                        {practiceMode === 'chord' && (
                            <Card className="bg-[#1a1a2e]/80 border-white/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg text-white">Dificuldade</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((diff) => (
                                            <Button
                                                key={diff}
                                                variant={difficulty === diff ? 'default' : 'outline'}
                                                onClick={() => {
                                                    setDifficulty(diff);
                                                    const firstChord = PRACTICE_CHORDS.find(c => c.difficulty === diff);
                                                    if (firstChord) setSelectedTarget(firstChord.name);
                                                }}
                                                className={difficulty === diff ? 'bg-blue-500' : ''}
                                                size="sm"
                                            >
                                                {diff === 'beginner' && '🌱 Iniciante'}
                                                {diff === 'intermediate' && '🌿 Intermediário'}
                                                {diff === 'advanced' && '🌳 Avançado'}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Target Selection */}
                        <Card className="bg-[#1a1a2e]/80 border-white/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <Target className="w-5 h-5 text-cyan-400" />
                                    {practiceMode === 'chord' ? 'Escolha o Acorde' : 'Escolha a Nota'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-2">
                                    {practiceMode === 'chord' ? (
                                        filteredChords.map((chord) => (
                                            <Button
                                                key={chord.name}
                                                variant={selectedTarget === chord.name ? 'default' : 'outline'}
                                                onClick={() => setSelectedTarget(chord.name)}
                                                className={`${selectedTarget === chord.name
                                                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 border-0'
                                                        : 'border-white/20 hover:border-purple-500/50'
                                                    }`}
                                                size="sm"
                                            >
                                                {chord.name}
                                            </Button>
                                        ))
                                    ) : (
                                        PRACTICE_NOTES.map((note) => (
                                            <Button
                                                key={note.name}
                                                variant={selectedTarget === note.note ? 'default' : 'outline'}
                                                onClick={() => setSelectedTarget(note.note)}
                                                className={`${selectedTarget === note.note
                                                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 border-0'
                                                        : 'border-white/20 hover:border-purple-500/50'
                                                    }`}
                                                size="sm"
                                            >
                                                {note.name}
                                            </Button>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Current Target Display */}
                        <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
                            <CardContent className="p-6 text-center">
                                <p className="text-sm text-gray-400 mb-2">Praticando</p>
                                <h2 className="text-5xl font-bold text-white mb-2">{selectedTarget}</h2>
                                {practiceMode === 'chord' && (
                                    <p className="text-sm text-gray-300">
                                        Notas: {PRACTICE_CHORDS.find(c => c.name === selectedTarget)?.notes.join(' - ')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Controls */}
                        <div className="flex gap-2">
                            <Button
                                onClick={isActive ? stopPractice : startPractice}
                                className={`flex-1 ${isActive
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                                    }`}
                                size="lg"
                            >
                                {isActive ? (
                                    <>
                                        <MicOff className="w-5 h-5 mr-2" />
                                        Parar
                                    </>
                                ) : (
                                    <>
                                        <Mic className="w-5 h-5 mr-2" />
                                        Iniciar Prática
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={resetSession}
                                variant="outline"
                                className="border-white/20"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Center Panel - Real-time Feedback */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Microphone Feedback */}
                        <Card className="bg-[#1a1a2e]/80 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-xl text-white flex items-center gap-2">
                                    <Volume2 className="w-5 h-5 text-green-400" />
                                    Feedback em Tempo Real
                                    {isActive && (
                                        <Badge className="bg-green-500 text-white animate-pulse ml-2">
                                            🎤 ESCUTANDO
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isActive ? (
                                    <RealtimeAudioFeedback
                                        practiceType={practiceMode}
                                        target={selectedTarget}
                                        difficulty={difficulty}
                                        showControls={false}
                                        showDetailedFeedback={true}
                                        compact={false}
                                        autoStart={true}
                                        onFeedback={handleFeedback}
                                    />
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Mic className="w-10 h-10 text-gray-500" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-300 mb-2">
                                            Microfone Inativo
                                        </h3>
                                        <p className="text-gray-500 mb-4">
                                            Clique em "Iniciar Prática" para ativar a detecção de áudio
                                        </p>
                                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 max-w-md mx-auto">
                                            <div className="flex items-start gap-3">
                                                <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-gray-300 text-left">
                                                    Posicione o microfone próximo ao violão para melhores resultados.
                                                    Evite ambientes com muito ruído de fundo.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Session Statistics */}
                        <Card className="bg-[#1a1a2e]/80 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                                    Estatísticas da Sessão
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* Accuracy */}
                                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
                                        <div className="text-3xl font-bold text-green-400 mb-1">
                                            {accuracy}%
                                        </div>
                                        <p className="text-sm text-gray-400">Precisão</p>
                                        <Progress
                                            value={accuracy}
                                            className="mt-2 h-1.5 bg-gray-700"
                                        />
                                    </div>

                                    {/* Current Streak */}
                                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
                                        <div className="text-3xl font-bold text-orange-400 mb-1">
                                            {sessionStats.currentStreak}
                                        </div>
                                        <p className="text-sm text-gray-400">Sequência</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Melhor: {sessionStats.bestStreak}
                                        </p>
                                    </div>

                                    {/* Quality */}
                                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                                        <div className="text-3xl font-bold text-purple-400 mb-1">
                                            {sessionStats.averageQuality}%
                                        </div>
                                        <p className="text-sm text-gray-400">Qualidade Média</p>
                                    </div>

                                    {/* Duration */}
                                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                                        <div className="text-3xl font-bold text-blue-400 mb-1">
                                            {formatDuration(sessionStats.sessionDuration)}
                                        </div>
                                        <p className="text-sm text-gray-400">Tempo de Prática</p>
                                    </div>
                                </div>

                                {/* Attempts Summary */}
                                {sessionStats.totalAttempts > 0 && (
                                    <div className="mt-4 p-4 rounded-lg bg-gray-800/50 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                <span className="text-green-400 font-semibold">
                                                    {sessionStats.successfulAttempts}
                                                </span>
                                                <span className="text-gray-500">acertos</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <XCircle className="w-5 h-5 text-red-400" />
                                                <span className="text-red-400 font-semibold">
                                                    {sessionStats.totalAttempts - sessionStats.successfulAttempts}
                                                </span>
                                                <span className="text-gray-500">erros</span>
                                            </div>
                                        </div>
                                        <div className="text-gray-400 text-sm">
                                            Total: {sessionStats.totalAttempts} tentativas
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tips Card */}
                        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Award className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-white mb-1">Dica de Prática</h4>
                                        <p className="text-sm text-gray-300">
                                            {practiceMode === 'chord'
                                                ? `Para o acorde ${selectedTarget}, certifique-se de que todas as notas soem limpas. Toque cada corda individualmente para verificar.`
                                                : `Ao praticar a nota ${selectedTarget}, foque na afinação e sustain. Uma nota limpa tem mais valor que velocidade.`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
