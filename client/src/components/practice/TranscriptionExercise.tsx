/**
 * Exercícios de Transcrição
 * App toca melodia, usuário reproduz
 * Detecção de pitch via microfone
 * Progressão: 4 notas → 8 notas → 16 notas
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Mic, 
  MicOff,
  CheckCircle2, 
  XCircle, 
  Music, 
  Trophy,
  RotateCcw,
  Volume2,
  AlertCircle
} from 'lucide-react';
import { unifiedAudioService } from '@/services/UnifiedAudioService';
import { PitchDetectionService, PitchDetectionResult, pitchDetectionService } from '@/services/PitchDetectionService';
import { toast } from 'sonner';
import { useGamificationStore } from '@/stores/useGamificationStore';

interface Melody {
  notes: string[]; // Ex: ['C4', 'D4', 'E4', 'F4']
  name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Melodias pré-definidas por dificuldade
const MELODIES: Record<'beginner' | 'intermediate' | 'advanced', Melody[]> = {
  beginner: [
    { notes: ['C4', 'D4', 'E4', 'F4'], name: 'Escala Ascendente', difficulty: 'beginner' },
    { notes: ['G4', 'F4', 'E4', 'D4'], name: 'Escala Descendente', difficulty: 'beginner' },
    { notes: ['C4', 'E4', 'G4', 'C5'], name: 'Arpejo Maior', difficulty: 'beginner' },
    { notes: ['C4', 'D4', 'E4', 'G4'], name: 'Melodia Simples', difficulty: 'beginner' },
  ],
  intermediate: [
    { notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], name: 'Escala Completa', difficulty: 'intermediate' },
    { notes: ['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'C4', 'C4'], name: 'Arpejo com Retorno', difficulty: 'intermediate' },
    { notes: ['G4', 'A4', 'B4', 'C5', 'D5', 'C5', 'B4', 'A4'], name: 'Melodia Intermediária', difficulty: 'intermediate' },
    { notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'F4', 'E4', 'D4'], name: 'Onda Melódica', difficulty: 'intermediate' },
  ],
  advanced: [
    { notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6', 'C6'], name: 'Escala Dupla', difficulty: 'advanced' },
    { notes: ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6', 'G5', 'E5', 'C5', 'G4', 'E4', 'C4', 'C4', 'C4', 'C4'], name: 'Arpejo Complexo', difficulty: 'advanced' },
    { notes: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'F5', 'E5', 'D5', 'C5', 'B4', 'A4', 'G4', 'G4'], name: 'Melodia Avançada', difficulty: 'advanced' },
    { notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4'], name: 'Escala com Retorno', difficulty: 'advanced' },
  ],
};

// Converter nota para frequência (Hz)
const noteToFrequency = (note: string): number => {
  const A4 = 440;
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  const match = note.match(/^([A-G]#?)(\d+)$/);
  if (!match) return 0;
  
  const [, noteName, octave] = match;
  const noteIndex = noteNames.indexOf(noteName);
  const octaveNum = parseInt(octave);
  
  // Cálculo: f = 440 * 2^((n - 69) / 12)
  // Onde n é o número MIDI (A4 = 69)
  const midiNumber = (octaveNum + 1) * 12 + noteIndex;
  const frequency = A4 * Math.pow(2, (midiNumber - 69) / 12);
  
  return frequency;
};

  // Verificar se resultado de detecção corresponde à nota esperada
  const isNoteMatch = (detected: PitchDetectionResult, expectedNote: string): boolean => {
    // Usar o método do serviço que já faz a comparação correta
    return pitchService.isNoteMatch(detected, expectedNote, 50); // 50 cents de tolerância
  };

export function TranscriptionExercise() {
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [currentMelody, setCurrentMelody] = useState<Melody | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [userNotes, setUserNotes] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const pitchService = pitchDetectionService;
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentDetectedNote, setCurrentDetectedNote] = useState<string | null>(null);
  const [detectionTimeout, setDetectionTimeout] = useState<NodeJS.Timeout | null>(null);
  const { addXP } = useGamificationStore();

  // Inicializar serviço de detecção de pitch
  useEffect(() => {
    const initPitchDetection = async () => {
      try {
        const initialized = await pitchService.initialize();
        if (initialized) {
          setIsInitialized(true);
          console.log('✅ Pitch detection service initialized');
        } else {
          toast.error('Não foi possível acessar o microfone');
        }
      } catch (error) {
        console.error('Erro ao inicializar detecção de pitch:', error);
        toast.error('Erro ao inicializar detecção de pitch');
      }
    };

    initPitchDetection();

    return () => {
      // Cleanup
      if (detectionTimeout) {
        clearTimeout(detectionTimeout);
      }
    };
  }, []);

  // Selecionar melodia aleatória
  const selectRandomMelody = () => {
    const availableMelodies = MELODIES[difficulty];
    const randomMelody = availableMelodies[Math.floor(Math.random() * availableMelodies.length)];
    setCurrentMelody(randomMelody);
    setCurrentNoteIndex(0);
    setUserNotes([]);
    setShowResult(false);
    setIsListening(false);
  };

  // Tocar melodia
  const playMelody = async () => {
    if (!currentMelody || isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      for (let i = 0; i < currentMelody.notes.length; i++) {
        const note = currentMelody.notes[i];
        await unifiedAudioService.playNote(note, 'guitar', 0.6);
        
        // Pausa entre notas (exceto após a última)
        if (i < currentMelody.notes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Erro ao tocar melodia:', error);
      toast.error('Erro ao reproduzir melodia');
    } finally {
      setIsPlaying(false);
    }
  };

  // Iniciar detecção
  const startListening = () => {
    if (!currentMelody || !isInitialized || isListening) return;
    
    setIsListening(true);
    setCurrentNoteIndex(0);
    setUserNotes([]);
    setShowResult(false);
    
    // Iniciar detecção de pitch
    pitchService.start((result: PitchDetectionResult | null) => {
      if (result && result.frequency > 0 && result.clarity > 0.3) {
        // Formar nota completa (ex: "C4")
        const detectedNote = `${result.note}${result.octave}`;
        setCurrentDetectedNote(detectedNote);
        
        // Verificar se corresponde à nota esperada
        const expectedNote = currentMelody.notes[currentNoteIndex];
        if (isNoteMatch(result, expectedNote)) {
          // Nota correta detectada
          const newUserNotes = [...userNotes, detectedNote];
          setUserNotes(newUserNotes);
          
          // Avançar para próxima nota
          if (currentNoteIndex < currentMelody.notes.length - 1) {
            setCurrentNoteIndex(currentNoteIndex + 1);
            toast.success(`Nota ${currentNoteIndex + 1}/${currentMelody.notes.length} correta!`, {
              duration: 1000,
            });
          } else {
            // Todas as notas foram detectadas
            finishTranscription(newUserNotes);
          }
        }
      }
    });
  };

  // Parar detecção
  const stopListening = () => {
    pitchService.stop();
    setIsListening(false);
    setCurrentDetectedNote(null);
    
    if (detectionTimeout) {
      clearTimeout(detectionTimeout);
    }
  };

  // Finalizar transcrição
  const finishTranscription = (notes: string[]) => {
    stopListening();
    
    if (!currentMelody) return;
    
    // Verificar acertos (comparar notas diretamente, já que foram validadas durante detecção)
    let correctCount = 0;
    currentMelody.notes.forEach((expectedNote, index) => {
      const userNote = notes[index];
      if (userNote) {
        // Extrair nome da nota sem oitava para comparação
        const userNoteName = userNote.replace(/[0-9]/g, '');
        const expectedNoteName = expectedNote.replace(/[0-9]/g, '');
        if (userNoteName === expectedNoteName) {
          correctCount++;
        }
      }
    });
    
    const accuracy = (correctCount / currentMelody.notes.length) * 100;
    const isSuccess = accuracy >= 80;
    
    setShowResult(true);
    setScore(prev => ({
      correct: prev.correct + (isSuccess ? 1 : 0),
      total: prev.total + 1,
    }));

    if (isSuccess) {
      addXP(50);
      toast.success('Parabéns! 🎉', {
        description: `Você acertou ${correctCount}/${currentMelody.notes.length} notas (${Math.round(accuracy)}%)`,
      });
    } else {
      toast.error('Tente novamente', {
        description: `Você acertou ${correctCount}/${currentMelody.notes.length} notas (${Math.round(accuracy)}%)`,
      });
    }
  };


  // Selecionar melodia ao mudar dificuldade
  useEffect(() => {
    selectRandomMelody();
  }, [difficulty]);

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  const progress = currentMelody && currentNoteIndex > 0 
    ? (currentNoteIndex / currentMelody.notes.length) * 100 
    : 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">🎼 Exercícios de Transcrição</h3>
            <p className="text-sm text-gray-300">
              Ouça a melodia e reproduza no seu violão
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <p className="text-xs text-gray-400">Acertos</p>
            </div>
            <p className="text-2xl font-bold text-white">{score.correct}/{score.total}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <p className="text-xs text-gray-400">Precisão</p>
            </div>
            <p className="text-2xl font-bold text-white">{accuracy}%</p>
          </div>
          
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Music className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-gray-400">Dificuldade</p>
            </div>
            <p className="text-sm font-bold text-white capitalize">{difficulty}</p>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="flex gap-2">
          {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <Button
              key={level}
              onClick={() => setDifficulty(level)}
              variant={difficulty === level ? 'default' : 'outline'}
              size="sm"
              disabled={isListening || isPlaying}
              className={
                difficulty === level
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                  : 'border-white/20 text-white hover:bg-white/10'
              }
            >
              {level === 'beginner' ? '4 Notas' :
               level === 'intermediate' ? '8 Notas' : '16 Notas'}
            </Button>
          ))}
        </div>

        {/* Current Exercise */}
        {currentMelody && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-white mb-1">{currentMelody.name}</h4>
                  <p className="text-sm text-gray-400">
                    {currentMelody.notes.length} notas • {difficulty === 'beginner' ? 'Iniciante' :
                    difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    difficulty === 'beginner' ? 'border-green-500/30 text-green-400' :
                    difficulty === 'intermediate' ? 'border-yellow-500/30 text-yellow-400' :
                    'border-red-500/30 text-red-400'
                  }
                >
                  {currentMelody.notes.length} notas
                </Badge>
              </div>

              {/* Progress */}
              {isListening && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">
                      Nota {currentNoteIndex + 1}/{currentMelody.notes.length}
                    </span>
                    <span className="text-sm text-gray-300">
                      Esperando: {currentMelody.notes[currentNoteIndex]}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Detected Note */}
              {isListening && currentDetectedNote && (
                <div className="mb-4 p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <p className="text-sm text-gray-300 mb-1">Nota detectada:</p>
                  <p className="text-2xl font-bold text-blue-400">{currentDetectedNote}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={playMelody}
                  disabled={isPlaying || isListening}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isPlaying ? 'Tocando...' : 'Ouvir Melodia'}
                </Button>
                
                {!isListening ? (
                  <Button
                    onClick={startListening}
                    disabled={!isInitialized || isPlaying || !currentMelody}
                    size="lg"
                    variant="outline"
                    className="flex-1 border-green-500/50 text-green-400 hover:bg-green-500/20"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Começar Transcrição
                  </Button>
                ) : (
                  <Button
                    onClick={stopListening}
                    size="lg"
                    variant="outline"
                    className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/20"
                  >
                    <MicOff className="w-5 h-5 mr-2" />
                    Parar
                  </Button>
                )}
              </div>

              {/* Result */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <h5 className="font-bold text-white mb-3">Resultado:</h5>
                  <div className="space-y-2">
                    {currentMelody.notes.map((expectedNote, index) => {
                      const userNote = userNotes[index];
                      const userNoteName = userNote ? userNote.replace(/[0-9]/g, '') : '';
                      const expectedNoteName = expectedNote.replace(/[0-9]/g, '');
                      const isCorrect = userNoteName === expectedNoteName;
                      
                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded ${
                            isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}
                        >
                          <span className="text-sm text-gray-300">
                            Nota {index + 1}:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              Esperado: {expectedNote}
                            </span>
                            {userNote && (
                              <>
                                <span className="text-sm text-gray-400">→</span>
                                <span className={`text-sm font-semibold ${
                                  isCorrect ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  Você: {userNote}
                                </span>
                                {isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-400" />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <Button
                    onClick={selectRandomMelody}
                    className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    Próximo Exercício
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <h4 className="text-sm font-bold text-white mb-2">💡 Dicas</h4>
          <ul className="space-y-1 text-xs text-gray-300">
            <li>• Certifique-se de que seu microfone está funcionando</li>
            <li>• Toque as notas uma de cada vez, claramente</li>
            <li>• Aguarde a detecção antes de tocar a próxima nota</li>
            <li>• Pratique em um ambiente silencioso para melhor detecção</li>
          </ul>
        </div>

        {/* Microphone Status */}
        {!isInitialized && (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <p className="text-sm text-yellow-400">
                Aguardando permissão do microfone...
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
