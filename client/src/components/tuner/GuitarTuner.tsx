import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, ChevronUp, ChevronDown, Play, Volume2, ArrowDown, ArrowUp, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NoiseCalibration } from './NoiseCalibration';
import { SpectrumVisualizer } from '@/components/audio/SpectrumVisualizer';
import { WaveformVisualizer } from '@/components/audio/WaveformVisualizer';
import { PitchHistoryChart } from '@/components/audio/PitchHistoryChart';
import { unifiedAudioService } from '@/services/UnifiedAudioService';

// Frequências padrão das cordas do violão (afinação padrão)
const GUITAR_STRINGS = [
  { name: 'E', number: 6, frequency: 82.41, octave: 2 },   // E2
  { name: 'A', number: 5, frequency: 110.00, octave: 2 },  // A2
  { name: 'D', number: 4, frequency: 146.83, octave: 3 },  // D3
  { name: 'G', number: 3, frequency: 196.00, octave: 3 },  // G3
  { name: 'B', number: 2, frequency: 246.94, octave: 3 },  // B3
  { name: 'e', number: 1, frequency: 329.63, octave: 4 },  // E4
];

interface DetectedNote {
  note: string;
  frequency: number;
  cents: number;
  octave: number;
}

export function GuitarTuner() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  
  const [isActive, setIsActive] = useState(false);
  const [detectedNote, setDetectedNote] = useState<DetectedNote | null>(null);
  const [targetString, setTargetString] = useState<typeof GUITAR_STRINGS[0] | null>(null);
  const [error, setError] = useState('');
  const [octaveOffset, setOctaveOffset] = useState(0); // Para ajustar oitavas
  const [noiseThreshold, setNoiseThreshold] = useState(0.01); // Threshold de ruído calibrado
  const [currentPitchData, setCurrentPitchData] = useState<{ frequency: number; timestamp: number } | null>(null);
  
  // Estados para treino ativo de percepção
  const [trainingMode, setTrainingMode] = useState(false);
  const [referenceNotePlayed, setReferenceNotePlayed] = useState(false);
  const [userGuess, setUserGuess] = useState<'flat' | 'sharp' | 'perfect' | null>(null);
  const [showVisualFeedback, setShowVisualFeedback] = useState(false);
  const [trainingScore, setTrainingScore] = useState({ correct: 0, total: 0 });

  const startTuner = async () => {
    try {
      setError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096; // Alta resolução para melhor detecção de pitch
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsActive(true);
      detectPitch();
      
      // Armazenar analyser para visualizações
      analyserRef.current = analyser;
      
      console.log('🎸 Guitar tuner started');
    } catch (err) {
      console.error('❌ Error starting tuner:', err);
      setError('Não foi possível acessar o microfone');
    }
  };

  const stopTuner = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsActive(false);
    setDetectedNote(null);
    
    console.log('🛑 Guitar tuner stopped');
  };

  const detectPitch = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.fftSize;
    const buffer = new Float32Array(bufferLength);

    const detect = () => {
      animationRef.current = requestAnimationFrame(detect);
      
      analyser.getFloatTimeDomainData(buffer);
      
      const frequency = autoCorrelate(buffer, audioContextRef.current!.sampleRate);
      
      // Atualizar dados de pitch para histórico
      if (frequency > 0) {
        setCurrentPitchData({
          frequency,
          timestamp: Date.now()
        });
      }
      
      if (frequency > 0) {
        const noteInfo = frequencyToNote(frequency);
        setDetectedNote(noteInfo);
        
        // Auto-detectar qual corda está sendo tocada
        const closestString = findClosestString(frequency + (octaveOffset * 1200)); // Ajustar por oitavas
        setTargetString(closestString);
        
        // No modo treino, não mostrar feedback visual até o usuário responder
        if (trainingMode && !showVisualFeedback) {
          // Manter detecção mas não mostrar ainda
        }
      }
    };

    detect();
  };

  // Algoritmo de autocorrelação para detectar pitch
  const autoCorrelate = (buffer: Float32Array, sampleRate: number): number => {
    let size = buffer.length;
    let maxSamples = Math.floor(size / 2);
    let bestOffset = -1;
    let bestCorrelation = 0;
    let rms = 0;

    // Calcular RMS (volume)
    for (let i = 0; i < size; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / size);
    
    // Threshold de volume mínimo (usar threshold calibrado)
    if (rms < noiseThreshold) return -1;

    // Autocorrelação
    let lastCorrelation = 1;
    for (let offset = 0; offset < maxSamples; offset++) {
      let correlation = 0;

      for (let i = 0; i < maxSamples; i++) {
        correlation += Math.abs(buffer[i] - buffer[i + offset]);
      }

      correlation = 1 - correlation / maxSamples;
      
      if (correlation > 0.9 && correlation > lastCorrelation) {
        const foundGoodCorrelation = correlation > bestCorrelation;
        if (foundGoodCorrelation) {
          bestCorrelation = correlation;
          bestOffset = offset;
        }
      }
      
      lastCorrelation = correlation;
    }

    if (bestCorrelation > 0.01 && bestOffset > -1) {
      const frequency = sampleRate / bestOffset;
      return frequency;
    }
    
    return -1;
  };

  const frequencyToNote = (frequency: number): DetectedNote => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75);
    
    const halfSteps = 12 * Math.log2(frequency / C0);
    const octave = Math.floor(halfSteps / 12);
    const noteIndex = Math.round(halfSteps % 12);
    const note = noteNames[noteIndex];
    
    // Calcular cents (diferença em centésimos de semitom)
    const targetFreq = C0 * Math.pow(2, (octave * 12 + noteIndex) / 12);
    const cents = Math.round(1200 * Math.log2(frequency / targetFreq));
    
    return { note, frequency, cents, octave };
  };

  const findClosestString = (frequency: number) => {
    let closest = GUITAR_STRINGS[0];
    let minDiff = Math.abs(frequency - closest.frequency);

    for (const string of GUITAR_STRINGS) {
      const adjustedFreq = string.frequency * Math.pow(2, octaveOffset);
      const diff = Math.abs(frequency - adjustedFreq);
      if (diff < minDiff) {
        minDiff = diff;
        closest = string;
      }
    }

    return closest;
  };

  const getTuningStatus = () => {
    if (!detectedNote || !targetString) return 'detecting';
    
    const cents = detectedNote.cents;
    if (Math.abs(cents) <= 5) return 'perfect';
    if (cents < -5) return 'flat';
    return 'sharp';
  };

  // Tocar nota de referência para treino
  const playReferenceNote = async () => {
    if (!targetString) return;
    
    try {
      await unifiedAudioService.ensureInitialized();
      // Tocar a nota de referência da corda (duração otimizada para percepção)
      const noteName = `${targetString.name}${targetString.octave}`;
      await unifiedAudioService.playNote(noteName, 1.0);
      setReferenceNotePlayed(true);
      console.log('🎵 [Treino] Nota de referência tocada:', noteName);
    } catch (error) {
      console.error('❌ Erro ao tocar nota de referência:', error);
    }
  };

  // Verificar resposta do usuário no treino
  const checkTrainingAnswer = (guess: 'flat' | 'sharp' | 'perfect') => {
    if (!detectedNote || !targetString || !trainingMode) return;
    
    setUserGuess(guess);
    setShowVisualFeedback(true);
    
    const actualStatus = getTuningStatus();
    const isCorrect = guess === actualStatus;
    
    setTrainingScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    
    console.log(`🎯 [Treino] Resposta: ${guess}, Real: ${actualStatus}, Correto: ${isCorrect}`);
  };

  // Reiniciar treino para próxima tentativa
  const resetTrainingRound = () => {
    setReferenceNotePlayed(false);
    setUserGuess(null);
    setShowVisualFeedback(false);
    setDetectedNote(null);
  };

  // Iniciar novo treino
  const startTrainingRound = () => {
    resetTrainingRound();
    // Auto-selecionar uma corda aleatória para treinar
    const randomString = GUITAR_STRINGS[Math.floor(Math.random() * GUITAR_STRINGS.length)];
    setTargetString(randomString);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'perfect': return 'text-green-400 border-green-400';
      case 'flat': return 'text-cyan-400 border-cyan-400';
      case 'sharp': return 'text-orange-400 border-orange-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'perfect': return '✓ Afinado!';
      case 'flat': return '↓ Muito grave (apertar corda)';
      case 'sharp': return '↑ Muito agudo (afrouxar corda)';
      default: return 'Toque uma corda...';
    }
  };

  useEffect(() => {
    return () => {
      stopTuner();
    };
  }, []);

  const status = getTuningStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              🎸 Afinador de Violão
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {trainingMode 
                ? 'Treine sua percepção de altura - ouça antes de ver!'
                : 'Afine as 6 cordas do seu violão com precisão'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setTrainingMode(!trainingMode);
                if (trainingMode) {
                  resetTrainingRound();
                } else {
                  startTrainingRound();
                }
              }}
              variant={trainingMode ? 'default' : 'outline'}
              className={trainingMode 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                : 'border-white/20 text-white hover:bg-white/10'
              }
            >
              {trainingMode ? '🎯 Modo Treino' : 'Modo Normal'}
            </Button>
            
            <Button
              onClick={isActive ? stopTuner : startTuner}
              className={`${
                isActive
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  : 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#06b6d4]'
              } text-white shadow-lg`}
            >
              {isActive ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Parar
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Iniciar
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Calibração de Ruído */}
        <div className="mb-6">
          <NoiseCalibration
            onCalibrationComplete={setNoiseThreshold}
            currentThreshold={noiseThreshold}
          />
        </div>

        {/* Octave Control */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <span className="text-sm text-gray-400">Oitava:</span>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setOctaveOffset(prev => prev - 1)}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <span className="text-white font-bold w-12 text-center">
              {octaveOffset > 0 ? `+${octaveOffset}` : octaveOffset}
            </span>
            <Button
              onClick={() => setOctaveOffset(prev => prev + 1)}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Modo Treino: Interface de Percepção Ativa */}
        {trainingMode && isActive ? (
          <div className="space-y-6 mb-6">
            {/* Instruções do Treino */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50">
              <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-400" />
                Treino de Percepção de Altura
              </h4>
              <p className="text-gray-300 text-sm mb-4">
                <strong>Objetivo:</strong> Desenvolver sua capacidade de identificar se uma nota está grave ou aguda apenas ouvindo.
              </p>
              
              {/* Passo 1: Ouvir Nota de Referência */}
              {!referenceNotePlayed && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-white font-semibold mb-2">📌 Passo 1: Ouça a nota de referência</p>
                    <p className="text-gray-300 text-sm mb-4">
                      Vamos tocar a nota correta da corda <strong className="text-purple-400">{targetString?.name}</strong> (Corda {targetString?.number}).
                      Preste atenção no som!
                    </p>
                    <Button
                      onClick={playReferenceNote}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Tocar Nota de Referência
                    </Button>
                  </div>
                </div>
              )}

              {/* Passo 2: Tocar e Identificar */}
              {referenceNotePlayed && !userGuess && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-white font-semibold mb-2">🎸 Passo 2: Toque a corda e identifique</p>
                    <p className="text-gray-300 text-sm mb-4">
                      Agora toque a corda <strong className="text-purple-400">{targetString?.name}</strong> no seu violão.
                      <strong className="text-yellow-400"> Antes de ver o resultado</strong>, tente identificar:
                    </p>
                    <ul className="text-gray-300 text-sm space-y-2 mb-4 ml-4">
                      <li>• A nota está <strong className="text-cyan-400">mais grave</strong> que a referência?</li>
                      <li>• A nota está <strong className="text-orange-400">mais aguda</strong> que a referência?</li>
                      <li>• A nota está <strong className="text-green-400">afinada</strong> (igual à referência)?</li>
                    </ul>
                    <p className="text-gray-400 text-xs italic mb-4">
                      💡 Dica: Compare mentalmente o som que você tocou com o som de referência que acabou de ouvir.
                    </p>
                    
                    {/* Botões de Resposta - sempre visíveis após ouvir referência */}
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        onClick={() => {
                          if (detectedNote && targetString) {
                            checkTrainingAnswer('flat');
                          } else {
                            // Se ainda não detectou, mostrar mensagem
                            alert('Toque a corda primeiro para poder responder!');
                          }
                        }}
                        disabled={!detectedNote || !targetString}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white h-auto py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-5 h-5 mb-2" />
                        <div className="text-sm font-semibold">Mais Grave</div>
                        <div className="text-xs opacity-80">(Apertar)</div>
                      </Button>
                      <Button
                        onClick={() => {
                          if (detectedNote && targetString) {
                            checkTrainingAnswer('perfect');
                          } else {
                            alert('Toque a corda primeiro para poder responder!');
                          }
                        }}
                        disabled={!detectedNote || !targetString}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-auto py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 className="w-5 h-5 mb-2" />
                        <div className="text-sm font-semibold">Afinado</div>
                        <div className="text-xs opacity-80">(Correto)</div>
                      </Button>
                      <Button
                        onClick={() => {
                          if (detectedNote && targetString) {
                            checkTrainingAnswer('sharp');
                          } else {
                            alert('Toque a corda primeiro para poder responder!');
                          }
                        }}
                        disabled={!detectedNote || !targetString}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-auto py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-5 h-5 mb-2" />
                        <div className="text-sm font-semibold">Mais Agudo</div>
                        <div className="text-xs opacity-80">(Afrouxar)</div>
                      </Button>
                    </div>
                    
                    {!detectedNote && (
                      <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm text-center">
                        🎸 Toque a corda {targetString?.name} no seu violão para poder responder...
                      </div>
                    )}
                    
                    {/* Botão para repetir nota de referência */}
                    <Button
                      onClick={playReferenceNote}
                      variant="outline"
                      className="w-full mt-3 border-white/20 text-white hover:bg-white/10"
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Ouvir Referência Novamente
                    </Button>
                  </div>
                </div>
              )}

              {/* Passo 3: Feedback Visual */}
              {showVisualFeedback && detectedNote && targetString && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl border-4 bg-black/30 backdrop-blur-sm"
                  style={{ 
                    borderColor: getStatusColor(status).includes('green') ? '#34d399' :
                                getStatusColor(status).includes('cyan') ? '#22d3ee' : '#fb923c'
                  }}
                >
                  <div className="text-center">
                    {/* Resultado */}
                    <div className="mb-4">
                      {userGuess === status ? (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/50 text-green-400">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-bold">Correto! 🎉</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 text-red-400">
                          <span className="font-bold">Não foi dessa vez</span>
                        </div>
                      )}
                    </div>

                    {/* Feedback Visual (agora visível) */}
                    <div className="text-6xl font-bold mb-2">
                      {targetString.name}
                      <span className="text-3xl text-gray-400 ml-2">
                        (Corda {targetString.number})
                      </span>
                    </div>
                    <div className="text-2xl text-gray-300 mb-4">
                      {detectedNote.frequency.toFixed(2)} Hz
                    </div>
                    
                    {/* Cents Meter */}
                    <div className="relative h-16 bg-white/10 rounded-full overflow-hidden mb-4">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1 h-full bg-white/50"></div>
                      </div>
                      <motion.div
                        className={`absolute top-0 h-full w-2 ${
                          status === 'perfect' ? 'bg-green-400' :
                          status === 'flat' ? 'bg-cyan-400' : 'bg-orange-400'
                        } rounded-full`}
                        animate={{
                          left: `${50 + (detectedNote.cents / 2)}%`,
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    </div>
                    
                    <div className="text-xl font-semibold mb-2">
                      {detectedNote.cents > 0 ? '+' : ''}{detectedNote.cents} cents
                    </div>
                    <div className={`text-lg font-bold ${getStatusColor(status)}`}>
                      {getStatusMessage(status)}
                    </div>

                    {/* Explicação */}
                    <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10 text-left">
                      <p className="text-sm text-gray-300">
                        <strong className="text-white">Sua resposta:</strong> {userGuess === 'flat' ? 'Mais Grave' : userGuess === 'sharp' ? 'Mais Agudo' : 'Afinado'}
                      </p>
                      <p className="text-sm text-gray-300 mt-1">
                        <strong className="text-white">Realidade:</strong> {getStatusMessage(status)}
                      </p>
                      {userGuess !== status && (
                        <p className="text-xs text-yellow-300 mt-2 italic">
                          💡 Continue praticando! Com o tempo, você vai conseguir identificar apenas ouvindo.
                        </p>
                      )}
                    </div>

                    {/* Próxima Tentativa */}
                    <div className="mt-6 flex gap-3">
                      <Button
                        onClick={startTrainingRound}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      >
                        Próxima Corda
                      </Button>
                      <Button
                        onClick={resetTrainingRound}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Repetir Esta
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Estatísticas do Treino */}
              {trainingScore.total > 0 && (
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Precisão no Treino:</span>
                    <span className="text-white font-bold">
                      {Math.round((trainingScore.correct / trainingScore.total) * 100)}% 
                      ({trainingScore.correct}/{trainingScore.total})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Modo Normal: Display Original */
          <div className={`relative rounded-2xl border-4 ${getStatusColor(status)} p-8 mb-6 bg-black/30 backdrop-blur-sm transition-all duration-300`}>
            <AnimatePresence mode="wait">
              {detectedNote && targetString ? (
                <motion.div
                  key="detected"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center"
                >
                  <div className="text-6xl font-bold mb-2">
                    {targetString.name}
                    <span className="text-3xl text-gray-400 ml-2">
                      (Corda {targetString.number})
                    </span>
                  </div>
                  <div className="text-2xl text-gray-300 mb-4">
                    {detectedNote.frequency.toFixed(2)} Hz
                  </div>
                  
                  {/* Cents Meter */}
                  <div className="relative h-16 bg-white/10 rounded-full overflow-hidden mb-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1 h-full bg-white/50"></div>
                    </div>
                    <motion.div
                      className={`absolute top-0 h-full w-2 ${
                        status === 'perfect' ? 'bg-green-400' :
                        status === 'flat' ? 'bg-cyan-400' : 'bg-orange-400'
                      } rounded-full`}
                      animate={{
                        left: `${50 + (detectedNote.cents / 2)}%`,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  </div>
                  
                  <div className="text-xl font-semibold">
                    {detectedNote.cents > 0 ? '+' : ''}{detectedNote.cents} cents
                  </div>
                  <div className={`text-lg mt-2 font-bold ${getStatusColor(status)}`}>
                    {getStatusMessage(status)}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-gray-400 py-8"
                >
                  <Mic className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl">{isActive ? 'Toque uma corda...' : 'Clique em "Iniciar" para afinar'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Visualizações de Áudio */}
        {isActive && analyserRef.current && (
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SpectrumVisualizer analyser={analyserRef.current} />
              <WaveformVisualizer analyser={analyserRef.current} />
            </div>
            {currentPitchData && (
              <PitchHistoryChart pitchData={currentPitchData} />
            )}
          </div>
        )}

        {/* String Reference */}
        <div className="grid grid-cols-6 gap-2">
          {GUITAR_STRINGS.map((string) => (
            <div
              key={string.number}
              className={`p-3 rounded-lg text-center transition-all ${
                targetString?.number === string.number && isActive
                  ? 'bg-gradient-to-br from-[#06b6d4] to-[#0891b2] text-white scale-105 shadow-lg shadow-cyan-500/50'
                  : 'bg-white/5 text-gray-400'
              }`}
            >
              <div className="text-2xl font-bold">{string.name}</div>
              <div className="text-xs mt-1">Corda {string.number}</div>
              <div className="text-xs text-gray-500">{string.frequency.toFixed(1)} Hz</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
