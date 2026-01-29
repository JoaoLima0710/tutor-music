import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface SpectrumVisualizerProps {
  width?: number;
  height?: number;
}

export function SpectrumVisualizer({ width = 800, height = 200 }: SpectrumVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string>('');

  const startVisualizer = async () => {
    try {
      setError('');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Create audio context and analyser
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048; // Higher resolution
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsActive(true);
      draw();
      
      console.log('🎤 Spectrum visualizer started');
    } catch (err) {
      console.error('❌ Error starting visualizer:', err);
      setError('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  const stopVisualizer = () => {
    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsActive(false);
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    console.log('🛑 Spectrum visualizer stopped');
  };

  const draw = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawFrame = () => {
      animationRef.current = requestAnimationFrame(drawFrame);

      analyser.getByteFrequencyData(dataArray);

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(15, 15, 26, 0.3)');
      gradient.addColorStop(1, 'rgba(15, 15, 26, 0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw frequency bars
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        // Create gradient for each bar
        const barGradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        
        // Color based on frequency range
        if (i < bufferLength * 0.3) {
          // Low frequencies (bass) - cyan to blue
          barGradient.addColorStop(0, '#06b6d4');
          barGradient.addColorStop(1, '#0891b2');
        } else if (i < bufferLength * 0.7) {
          // Mid frequencies - purple to violet
          barGradient.addColorStop(0, '#a855f7');
          barGradient.addColorStop(1, '#7c3aed');
        } else {
          // High frequencies (treble) - pink to orange
          barGradient.addColorStop(0, '#f472b6');
          barGradient.addColorStop(1, '#fb923c');
        }

        ctx.fillStyle = barGradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      // Draw center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    drawFrame();
  };

  useEffect(() => {
    return () => {
      stopVisualizer();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-[#06b6d4]" />
              Visualizador de Espectro
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Veja as frequências captadas pelo microfone em tempo real
            </p>
          </div>
          
          <Button
            onClick={isActive ? stopVisualizer : startVisualizer}
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

        <div className="relative rounded-xl overflow-hidden border border-white/10">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full h-auto"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="text-center">
                <Mic className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Clique em "Iniciar" para visualizar</p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2]"></div>
            <span className="text-gray-400">Graves (Bass)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#a855f7] to-[#7c3aed]"></div>
            <span className="text-gray-400">Médios (Mid)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#f472b6] to-[#fb923c]"></div>
            <span className="text-gray-400">Agudos (Treble)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
