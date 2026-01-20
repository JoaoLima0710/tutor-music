import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NoiseCalibration } from './NoiseCalibration';
import { SpectrumVisualizer } from '@/components/audio/SpectrumVisualizer';
import { WaveformVisualizer } from '@/components/audio/WaveformVisualizer';
import { PitchHistoryChart } from '@/components/audio/PitchHistoryChart';

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
              Afine as 6 cordas do seu violão com precisão
            </p>
          </div>
          
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

        {/* Main Display */}
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
