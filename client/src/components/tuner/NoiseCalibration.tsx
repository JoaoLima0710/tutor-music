/**
 * Componente de Calibração de Ruído de Fundo
 * Permite calibrar o threshold dinamicamente para melhor precisão
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Volume2, VolumeX, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NoiseCalibrationProps {
  onCalibrationComplete: (threshold: number) => void;
  currentThreshold?: number;
}

export function NoiseCalibration({ onCalibrationComplete, currentThreshold = 0.01 }: NoiseCalibrationProps) {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [measuredNoise, setMeasuredNoise] = useState<number[]>([]);
  const [calibratedThreshold, setCalibratedThreshold] = useState<number | null>(null);
  const [signalQuality, setSignalQuality] = useState<'good' | 'medium' | 'poor'>('good');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCalibration = async () => {
    try {
      setIsCalibrating(true);
      setCalibrationProgress(0);
      setMeasuredNoise([]);

      // Solicitar acesso ao microfone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Criar AudioContext
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      microphoneRef.current = microphone;

      // Medir ruído por 3 segundos
      const samples: number[] = [];
      const startTime = Date.now();
      const duration = 3000; // 3 segundos

      const measureNoise = () => {
        const bufferLength = analyser.frequencyBinCount;
        const buffer = new Float32Array(bufferLength);
        analyser.getFloatTimeDomainData(buffer);

        // Calcular RMS
        let rms = 0;
        for (let i = 0; i < buffer.length; i++) {
          rms += buffer[i] * buffer[i];
        }
        rms = Math.sqrt(rms / buffer.length);
        samples.push(rms);

        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / duration) * 100);
        setCalibrationProgress(progress);

        // Atualizar qualidade do sinal
        if (rms < 0.005) {
          setSignalQuality('good');
        } else if (rms < 0.02) {
          setSignalQuality('medium');
        } else {
          setSignalQuality('poor');
        }

        if (elapsed < duration) {
          animationRef.current = requestAnimationFrame(measureNoise);
        } else {
          // Calibração completa
          finishCalibration(samples);
        }
      };

      measureNoise();
    } catch (error) {
      console.error('Erro ao calibrar:', error);
      setIsCalibrating(false);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  const finishCalibration = (samples: number[]) => {
    // Calcular threshold baseado no percentil 95 do ruído medido
    const sorted = [...samples].sort((a, b) => a - b);
    const percentile95 = sorted[Math.floor(sorted.length * 0.95)];
    
    // Threshold = 1.5x o ruído medido (margem de segurança)
    const threshold = Math.max(0.005, Math.min(0.05, percentile95 * 1.5));
    
    setMeasuredNoise(samples);
    setCalibratedThreshold(threshold);
    setIsCalibrating(false);

    // Parar captura
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Aplicar threshold
    onCalibrationComplete(threshold);
  };

  const getSignalQualityColor = () => {
    switch (signalQuality) {
      case 'good':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      return 'text-red-400';
    }
  };

  const getSignalQualityLabel = () => {
    switch (signalQuality) {
      case 'good':
        return 'Excelente';
      case 'medium':
        return 'Bom';
      return 'Ruim';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Calibração de Ruído de Fundo
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isCalibrating && !calibratedThreshold && (
          <div className="space-y-4">
            <p className="text-white/70 text-sm">
              Para melhor precisão, calibre o ruído de fundo do seu ambiente. 
              Fique em silêncio por 3 segundos enquanto medimos o ruído ambiente.
            </p>
            
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/70">Threshold Atual</span>
                <span className="text-sm font-semibold text-white">{currentThreshold.toFixed(4)}</span>
              </div>
              <Progress value={(currentThreshold / 0.05) * 100} className="h-2" />
            </div>

            <Button
              onClick={startCalibration}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Iniciar Calibração
            </Button>
          </div>
        )}

        {isCalibrating && (
          <div className="space-y-4">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
              <p className="text-white font-semibold mb-1">Calibrando...</p>
              <p className="text-sm text-white/70">
                Fique em silêncio por 3 segundos
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/70">
                <span>Progresso</span>
                <span>{Math.round(calibrationProgress)}%</span>
              </div>
              <Progress value={calibrationProgress} className="h-3" />
            </div>

            {/* Indicador de Qualidade do Sinal */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Qualidade do Sinal</span>
                <span className={`text-sm font-semibold ${getSignalQualityColor()}`}>
                  {getSignalQualityLabel()}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {signalQuality === 'good' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                {signalQuality === 'medium' && <AlertCircle className="w-4 h-4 text-yellow-400" />}
                {signalQuality === 'poor' && <AlertCircle className="w-4 h-4 text-red-400" />}
                <span className="text-xs text-white/60">
                  {signalQuality === 'good' && 'Ambiente silencioso detectado'}
                  {signalQuality === 'medium' && 'Algum ruído de fundo presente'}
                  {signalQuality === 'poor' && 'Muito ruído - tente um local mais silencioso'}
                </span>
              </div>
            </div>
          </div>
        )}

        {calibratedThreshold && !isCalibrating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/40">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="font-semibold text-green-300">Calibração Concluída!</span>
              </div>
              <p className="text-sm text-white/70 mb-3">
                Threshold ajustado para: <strong className="text-white">{calibratedThreshold.toFixed(4)}</strong>
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Ruído medido (média)</span>
                  <span>{(measuredNoise.reduce((a, b) => a + b, 0) / measuredNoise.length).toFixed(4)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Threshold aplicado</span>
                  <span>{calibratedThreshold.toFixed(4)}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                setCalibratedThreshold(null);
                setMeasuredNoise([]);
              }}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Recalibrar
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
