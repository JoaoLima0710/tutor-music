/**
 * DiagnosticAssessment v2.1
 * Enhanced diagnostic system with practical audio tests
 * - Audio Recognition: Major vs Minor chords
 * - Rhythm Test: Tap detection via microphone
 * - Diagram Reading: Visual chord identification
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Play,
    Mic,
    MicOff,
    CheckCircle2,
    XCircle,
    Music,
    Volume2,
    Hand,
    Eye,
    Award,
    RefreshCw,
    SkipForward,
    ArrowRight
} from 'lucide-react';
import { unifiedAudioService } from '@/services/UnifiedAudioService';
import { toast } from 'sonner';

// Types
interface DiagnosticResult {
    audioRecognition: { score: number; total: number };
    rhythmAccuracy: { score: number; avgDeviation: number };
    diagramReading: { score: number; total: number };
    overallLevel: 'beginner' | 'intermediate' | 'advanced';
    suggestedWeekStart: number;
    strengths: string[];
    areasToImprove: string[];
}

type TestPhase = 'intro' | 'audio' | 'rhythm' | 'diagrams' | 'results';

interface AudioQuestion {
    id: string;
    chordNotes: string[];
    chordType: 'major' | 'minor';
    chordName: string;
}

interface DiagramQuestion {
    id: string;
    chordName: string;
    options: string[];
    correctAnswer: number;
    frets: number[][];  // Simplified fret diagram
}

// Test Data
const AUDIO_QUESTIONS: AudioQuestion[] = [
    { id: 'a1', chordNotes: ['C4', 'E4', 'G4'], chordType: 'major', chordName: 'C' },
    { id: 'a2', chordNotes: ['A3', 'C4', 'E4'], chordType: 'minor', chordName: 'Am' },
    { id: 'a3', chordNotes: ['G3', 'B3', 'D4'], chordType: 'major', chordName: 'G' },
    { id: 'a4', chordNotes: ['E3', 'G3', 'B3'], chordType: 'minor', chordName: 'Em' },
    { id: 'a5', chordNotes: ['D4', 'F#4', 'A4'], chordType: 'major', chordName: 'D' },
    { id: 'a6', chordNotes: ['D4', 'F4', 'A4'], chordType: 'minor', chordName: 'Dm' },
];

const DIAGRAM_QUESTIONS: DiagramQuestion[] = [
    {
        id: 'd1',
        chordName: 'Em',
        options: ['Em', 'Am', 'C', 'G'],
        correctAnswer: 0,
        frets: [[0, 2, 2, 0, 0, 0]],
    },
    {
        id: 'd2',
        chordName: 'C',
        options: ['G', 'D', 'C', 'F'],
        correctAnswer: 2,
        frets: [[0, 3, 2, 0, 1, 0]],
    },
    {
        id: 'd3',
        chordName: 'G',
        options: ['Am', 'G', 'Em', 'D'],
        correctAnswer: 1,
        frets: [[3, 2, 0, 0, 0, 3]],
    },
    {
        id: 'd4',
        chordName: 'Am',
        options: ['Em', 'Dm', 'Am', 'E'],
        correctAnswer: 2,
        frets: [[0, 0, 2, 2, 1, 0]],
    },
];

// Rhythm Test BPMs
const RHYTHM_BPMS = [60, 80, 100];

interface DiagnosticAssessmentProps {
    onComplete: (result: DiagnosticResult) => void;
    onSkip: () => void;
}

export function DiagnosticAssessment({ onComplete, onSkip }: DiagnosticAssessmentProps) {
    const [phase, setPhase] = useState<TestPhase>('intro');

    // Audio test state
    const [audioQuestion, setAudioQuestion] = useState(0);
    const [audioAnswers, setAudioAnswers] = useState<Map<number, 'major' | 'minor'>>(new Map());
    const [isPlayingChord, setIsPlayingChord] = useState(false);
    const [audioAnswered, setAudioAnswered] = useState(false);

    // Rhythm test state
    const [currentBPM, setCurrentBPM] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [rhythmScores, setRhythmScores] = useState<number[]>([]);
    const [beatCount, setBeatCount] = useState(0);
    const [tapTimes, setTapTimes] = useState<number[]>([]);
    const [metronomeInterval, setMetronomeInterval] = useState<NodeJS.Timeout | null>(null);
    const expectedBeatTime = useRef<number>(0);

    // Diagram test state
    const [diagramQuestion, setDiagramQuestion] = useState(0);
    const [diagramAnswers, setDiagramAnswers] = useState<Map<number, number>>(new Map());
    const [diagramAnswered, setDiagramAnswered] = useState(false);

    // Results
    const [result, setResult] = useState<DiagnosticResult | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (metronomeInterval) {
                clearInterval(metronomeInterval);
            }
        };
    }, [metronomeInterval]);

    // === AUDIO TEST HANDLERS ===
    const playChord = async () => {
        const question = AUDIO_QUESTIONS[audioQuestion];
        setIsPlayingChord(true);

        try {
            // Play chord notes simultaneously
            const playPromises = question.chordNotes.map(note =>
                unifiedAudioService.playNote(note, 0.8)
            );
            await Promise.all(playPromises);
            await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
            console.error('Error playing chord:', error);
            toast.error('Erro ao reproduzir áudio');
        } finally {
            setIsPlayingChord(false);
        }
    };

    const handleAudioAnswer = (answer: 'major' | 'minor') => {
        setAudioAnswers(prev => new Map(prev).set(audioQuestion, answer));
        setAudioAnswered(true);
    };

    const nextAudioQuestion = () => {
        if (audioQuestion < AUDIO_QUESTIONS.length - 1) {
            setAudioQuestion(audioQuestion + 1);
            setAudioAnswered(false);
        } else {
            setPhase('rhythm');
        }
    };

    // === RHYTHM TEST HANDLERS ===
    const startRhythmTest = () => {
        const bpm = RHYTHM_BPMS[currentBPM];
        const intervalMs = 60000 / bpm;

        setIsRecording(true);
        setBeatCount(0);
        setTapTimes([]);
        expectedBeatTime.current = Date.now();

        // Start metronome
        const playClick = async () => {
            try {
                await unifiedAudioService.playNote('C5', 0.1);
            } catch (e) {
                // Ignore
            }
        };

        playClick();

        const interval = setInterval(() => {
            setBeatCount(prev => {
                if (prev >= 7) {
                    clearInterval(interval);
                    setIsRecording(false);
                    calculateRhythmScore();
                    return prev;
                }
                expectedBeatTime.current = Date.now();
                playClick();
                return prev + 1;
            });
        }, intervalMs);

        setMetronomeInterval(interval);
    };

    const handleTap = () => {
        if (!isRecording) return;

        const tapTime = Date.now();
        const deviation = Math.abs(tapTime - expectedBeatTime.current);
        setTapTimes(prev => [...prev, deviation]);
    };

    const calculateRhythmScore = () => {
        if (tapTimes.length === 0) {
            setRhythmScores(prev => [...prev, 0]);
        } else {
            const avgDeviation = tapTimes.reduce((a, b) => a + b, 0) / tapTimes.length;
            // Score: 100 for perfect, decreasing by 10 for every 50ms deviation
            const score = Math.max(0, 100 - Math.floor(avgDeviation / 50) * 10);
            setRhythmScores(prev => [...prev, score]);
        }

        if (currentBPM < RHYTHM_BPMS.length - 1) {
            setCurrentBPM(currentBPM + 1);
        } else {
            setPhase('diagrams');
        }
    };

    // === DIAGRAM TEST HANDLERS ===
    const handleDiagramAnswer = (answerIndex: number) => {
        setDiagramAnswers(prev => new Map(prev).set(diagramQuestion, answerIndex));
        setDiagramAnswered(true);
    };

    const nextDiagramQuestion = () => {
        if (diagramQuestion < DIAGRAM_QUESTIONS.length - 1) {
            setDiagramQuestion(diagramQuestion + 1);
            setDiagramAnswered(false);
        } else {
            calculateResults();
        }
    };

    // === RESULTS CALCULATION ===
    const calculateResults = () => {
        // Audio score
        let audioCorrect = 0;
        audioAnswers.forEach((answer, idx) => {
            if (answer === AUDIO_QUESTIONS[idx].chordType) {
                audioCorrect++;
            }
        });

        // Rhythm score
        const avgRhythmScore = rhythmScores.length > 0
            ? rhythmScores.reduce((a, b) => a + b, 0) / rhythmScores.length
            : 0;
        const avgDeviation = rhythmScores.length > 0
            ? Math.floor(100 - avgRhythmScore) * 5
            : 999;

        // Diagram score
        let diagramCorrect = 0;
        diagramAnswers.forEach((answer, idx) => {
            if (answer === DIAGRAM_QUESTIONS[idx].correctAnswer) {
                diagramCorrect++;
            }
        });

        // Calculate overall level and suggested start
        const audioPercent = (audioCorrect / AUDIO_QUESTIONS.length) * 100;
        const diagramPercent = (diagramCorrect / DIAGRAM_QUESTIONS.length) * 100;
        const overallScore = (audioPercent + avgRhythmScore + diagramPercent) / 3;

        let overallLevel: 'beginner' | 'intermediate' | 'advanced';
        let suggestedWeekStart: number;
        const strengths: string[] = [];
        const areasToImprove: string[] = [];

        if (overallScore >= 80) {
            overallLevel = 'advanced';
            suggestedWeekStart = 7;
        } else if (overallScore >= 50) {
            overallLevel = 'intermediate';
            suggestedWeekStart = 3;
        } else {
            overallLevel = 'beginner';
            suggestedWeekStart = 1;
        }

        // Analyze strengths and weaknesses
        if (audioPercent >= 70) {
            strengths.push('Reconhecimento auditivo');
        } else {
            areasToImprove.push('Diferenciação de acordes maiores e menores');
        }

        if (avgRhythmScore >= 70) {
            strengths.push('Senso rítmico');
        } else {
            areasToImprove.push('Precisão rítmica');
        }

        if (diagramPercent >= 70) {
            strengths.push('Leitura de diagramas');
        } else {
            areasToImprove.push('Identificação visual de acordes');
        }

        const diagnosticResult: DiagnosticResult = {
            audioRecognition: { score: audioCorrect, total: AUDIO_QUESTIONS.length },
            rhythmAccuracy: { score: Math.round(avgRhythmScore), avgDeviation },
            diagramReading: { score: diagramCorrect, total: DIAGRAM_QUESTIONS.length },
            overallLevel,
            suggestedWeekStart,
            strengths,
            areasToImprove,
        };

        setResult(diagnosticResult);
        setPhase('results');
    };

    // === RENDER PHASES ===
    const renderIntro = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
        >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Music className="w-10 h-10 text-white" />
            </div>

            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Diagnóstico Musical</h2>
                <p className="text-gray-400">
                    Vamos avaliar suas habilidades com 3 testes práticos rápidos
                </p>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <Volume2 className="w-5 h-5 text-blue-400" />
                    <div className="text-left">
                        <p className="text-white font-medium">Teste Auditivo</p>
                        <p className="text-sm text-gray-400">Identificar acordes maiores e menores</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <Hand className="w-5 h-5 text-green-400" />
                    <div className="text-left">
                        <p className="text-white font-medium">Teste Rítmico</p>
                        <p className="text-sm text-gray-400">Bater palmas no tempo do metrônomo</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <Eye className="w-5 h-5 text-purple-400" />
                    <div className="text-left">
                        <p className="text-white font-medium">Leitura de Diagramas</p>
                        <p className="text-sm text-gray-400">Identificar acordes pelo diagrama</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <Button
                    onClick={onSkip}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Pular
                </Button>
                <Button
                    onClick={() => setPhase('audio')}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                    Começar
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

            <p className="text-xs text-gray-500">
                ⏱️ Tempo estimado: 3-5 minutos
            </p>
        </motion.div>
    );

    const renderAudioTest = () => {
        const question = AUDIO_QUESTIONS[audioQuestion];
        const progress = ((audioQuestion + 1) / AUDIO_QUESTIONS.length) * 100;
        const userAnswer = audioAnswers.get(audioQuestion);
        const isCorrect = userAnswer === question.chordType;

        return (
            <motion.div
                key="audio"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 mb-2">
                            <Volume2 className="w-3 h-3 mr-1" /> Teste Auditivo
                        </Badge>
                        <p className="text-sm text-gray-400">
                            Pergunta {audioQuestion + 1} de {AUDIO_QUESTIONS.length}
                        </p>
                    </div>
                </div>

                <Progress value={progress} className="h-2" />

                <Card className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30">
                    <div className="text-center space-y-6">
                        <h3 className="text-xl font-bold text-white">
                            Este acorde é MAIOR ou MENOR?
                        </h3>

                        <Button
                            onClick={playChord}
                            disabled={isPlayingChord}
                            size="lg"
                            className="w-full max-w-xs mx-auto h-16 text-lg bg-gradient-to-r from-blue-500 to-purple-500"
                        >
                            {isPlayingChord ? (
                                <>
                                    <Volume2 className="w-6 h-6 mr-2 animate-pulse" />
                                    Tocando...
                                </>
                            ) : (
                                <>
                                    <Play className="w-6 h-6 mr-2" />
                                    Ouvir Acorde
                                </>
                            )}
                        </Button>

                        {!audioAnswered ? (
                            <div className="flex gap-4 justify-center">
                                <Button
                                    onClick={() => handleAudioAnswer('major')}
                                    variant="outline"
                                    size="lg"
                                    className="flex-1 max-w-[150px] h-14 border-green-500/50 text-green-400 hover:bg-green-500/20"
                                >
                                    😊 Maior
                                </Button>
                                <Button
                                    onClick={() => handleAudioAnswer('minor')}
                                    variant="outline"
                                    size="lg"
                                    className="flex-1 max-w-[150px] h-14 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                                >
                                    😢 Menor
                                </Button>
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
                                                <span className="text-green-400 font-bold">Correto!</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-6 h-6 text-red-400" />
                                                <span className="text-red-400 font-bold">
                                                    Era {question.chordType === 'major' ? 'MAIOR' : 'MENOR'} ({question.chordName})
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <Button onClick={nextAudioQuestion} className="w-full">
                                    {audioQuestion < AUDIO_QUESTIONS.length - 1 ? 'Próximo' : 'Continuar para Ritmo'}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </Card>
            </motion.div>
        );
    };

    const renderRhythmTest = () => {
        const bpm = RHYTHM_BPMS[currentBPM];
        const progress = ((currentBPM + 1) / RHYTHM_BPMS.length) * 100;

        return (
            <motion.div
                key="rhythm"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
            >
                <div>
                    <Badge variant="outline" className="border-green-500/30 text-green-400 mb-2">
                        <Hand className="w-3 h-3 mr-1" /> Teste Rítmico
                    </Badge>
                    <p className="text-sm text-gray-400">
                        Velocidade {currentBPM + 1} de {RHYTHM_BPMS.length}: {bpm} BPM
                    </p>
                </div>

                <Progress value={progress} className="h-2" />

                <Card className="p-6 bg-gradient-to-br from-green-900/30 to-teal-900/30 border-green-500/30">
                    <div className="text-center space-y-6">
                        <h3 className="text-xl font-bold text-white">
                            Toque a tela no tempo do metrônomo
                        </h3>

                        <p className="text-gray-400">
                            {isRecording ? `Batida ${beatCount + 1} de 8` : 'Pressione iniciar para ouvir o metrônomo'}
                        </p>

                        <div className="flex flex-col items-center gap-4">
                            {!isRecording ? (
                                <Button
                                    onClick={startRhythmTest}
                                    size="lg"
                                    className="w-full max-w-xs h-16 text-lg bg-gradient-to-r from-green-500 to-teal-500"
                                >
                                    <Play className="w-6 h-6 mr-2" />
                                    Iniciar ({bpm} BPM)
                                </Button>
                            ) : (
                                <motion.button
                                    onClick={handleTap}
                                    className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-lg shadow-green-500/30"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Hand className="w-12 h-12 text-white" />
                                </motion.button>
                            )}
                        </div>

                        {tapTimes.length > 0 && (
                            <div className="text-sm text-gray-400">
                                Toques registrados: {tapTimes.length}
                            </div>
                        )}
                    </div>
                </Card>

                {rhythmScores.length > 0 && (
                    <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-sm text-gray-400">
                            Pontuação anterior: {rhythmScores[rhythmScores.length - 1]}%
                        </p>
                    </div>
                )}
            </motion.div>
        );
    };

    const renderDiagramTest = () => {
        const question = DIAGRAM_QUESTIONS[diagramQuestion];
        const progress = ((diagramQuestion + 1) / DIAGRAM_QUESTIONS.length) * 100;
        const userAnswer = diagramAnswers.get(diagramQuestion);
        const isCorrect = userAnswer === question.correctAnswer;

        return (
            <motion.div
                key="diagrams"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
            >
                <div>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400 mb-2">
                        <Eye className="w-3 h-3 mr-1" /> Leitura de Diagramas
                    </Badge>
                    <p className="text-sm text-gray-400">
                        Pergunta {diagramQuestion + 1} de {DIAGRAM_QUESTIONS.length}
                    </p>
                </div>

                <Progress value={progress} className="h-2" />

                <Card className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white text-center">
                            Qual acorde é este?
                        </h3>

                        {/* Simple Chord Diagram */}
                        <div className="flex justify-center">
                            <div className="bg-amber-900/30 p-4 rounded-lg border border-amber-500/30">
                                <div className="grid grid-cols-6 gap-2">
                                    {question.frets[0].map((fret, stringIdx) => (
                                        <div key={stringIdx} className="flex flex-col items-center">
                                            <span className="text-xs text-amber-300 mb-1">
                                                {fret === 0 ? 'o' : fret === -1 ? 'x' : ''}
                                            </span>
                                            <div className="w-6 h-20 border-x border-gray-600 relative">
                                                {[1, 2, 3, 4].map(fretNum => (
                                                    <div
                                                        key={fretNum}
                                                        className="absolute w-full border-b border-gray-500"
                                                        style={{ top: `${fretNum * 25}%` }}
                                                    >
                                                        {fret === fretNum && (
                                                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-500" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Answer Options */}
                        {!diagramAnswered ? (
                            <div className="grid grid-cols-2 gap-3">
                                {question.options.map((option, idx) => (
                                    <Button
                                        key={idx}
                                        onClick={() => handleDiagramAnswer(idx)}
                                        variant="outline"
                                        className="h-12 border-white/20 text-white hover:bg-white/10"
                                    >
                                        {option}
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
                                    <div className="flex items-center justify-center gap-2">
                                        {isCorrect ? (
                                            <>
                                                <CheckCircle2 className="w-6 h-6 text-green-400" />
                                                <span className="text-green-400 font-bold">Correto! É {question.chordName}</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-6 h-6 text-red-400" />
                                                <span className="text-red-400 font-bold">Era {question.chordName}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <Button onClick={nextDiagramQuestion} className="w-full">
                                    {diagramQuestion < DIAGRAM_QUESTIONS.length - 1 ? 'Próximo' : 'Ver Resultados'}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </Card>
            </motion.div>
        );
    };

    const renderResults = () => {
        if (!result) return null;

        const levelLabels = {
            beginner: 'Iniciante',
            intermediate: 'Intermediário',
            advanced: 'Avançado'
        };

        const levelColors = {
            beginner: 'from-green-500 to-emerald-500',
            intermediate: 'from-blue-500 to-purple-500',
            advanced: 'from-purple-500 to-pink-500'
        };

        return (
            <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
            >
                <div className="text-center">
                    <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${levelColors[result.overallLevel]} flex items-center justify-center mb-4`}>
                        <Award className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Diagnóstico Completo!
                    </h2>
                    <p className="text-gray-400">
                        Seu nível: <span className="text-white font-bold">{levelLabels[result.overallLevel]}</span>
                    </p>
                </div>

                {/* Scores Breakdown */}
                <div className="grid gap-3">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Volume2 className="w-5 h-5 text-blue-400" />
                                <span className="text-white">Reconhecimento Auditivo</span>
                            </div>
                            <span className="text-blue-400 font-bold">
                                {result.audioRecognition.score}/{result.audioRecognition.total}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Hand className="w-5 h-5 text-green-400" />
                                <span className="text-white">Precisão Rítmica</span>
                            </div>
                            <span className="text-green-400 font-bold">
                                {result.rhythmAccuracy.score}%
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-purple-400" />
                                <span className="text-white">Leitura de Diagramas</span>
                            </div>
                            <span className="text-purple-400 font-bold">
                                {result.diagramReading.score}/{result.diagramReading.total}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Strengths & Areas to Improve */}
                <div className="grid grid-cols-2 gap-4">
                    {result.strengths.length > 0 && (
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                            <h4 className="text-green-400 font-bold mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Pontos Fortes
                            </h4>
                            <ul className="text-sm text-gray-300 space-y-1">
                                {result.strengths.map((s, i) => (
                                    <li key={i}>• {s}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.areasToImprove.length > 0 && (
                        <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                            <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2">
                                <RefreshCw className="w-4 h-4" /> A Desenvolver
                            </h4>
                            <ul className="text-sm text-gray-300 space-y-1">
                                {result.areasToImprove.map((a, i) => (
                                    <li key={i}>• {a}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Recommendation */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <p className="text-white text-center">
                        📚 Recomendamos começar pela <strong>Semana {result.suggestedWeekStart}</strong> do currículo
                    </p>
                </div>

                <Button
                    onClick={() => onComplete(result)}
                    className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                    Continuar para o App
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </motion.div>
        );
    };

    return (
        <div className="max-w-md mx-auto">
            <AnimatePresence mode="wait">
                {phase === 'intro' && renderIntro()}
                {phase === 'audio' && renderAudioTest()}
                {phase === 'rhythm' && renderRhythmTest()}
                {phase === 'diagrams' && renderDiagramTest()}
                {phase === 'results' && renderResults()}
            </AnimatePresence>
        </div>
    );
}

export type { DiagnosticResult };
