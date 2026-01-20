/**
 * Visualizador de Waveform (Time-Domain)
 * Exibe forma de onda em tempo real
 */

import { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  analyser: AnalyserNode | null;
  width?: number;
  height?: number;
  className?: string;
}

export function WaveformVisualizer({ 
  analyser, 
  width = 400, 
  height = 150,
  className = '' 
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);

    const draw = () => {
      if (!analyser || !ctx) return;

      animationRef.current = requestAnimationFrame(draw);

      analyser.getFloatTimeDomainData(dataArray);

      // Limpar canvas
      ctx.fillStyle = 'rgba(15, 15, 26, 0.5)';
      ctx.fillRect(0, 0, width, height);

      // Desenhar waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#06b6d4';
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] * 0.5 + 0.5; // Normalizar -1 a 1 para 0 a 1
        const y = v * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      // Linha central (zero)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Indicador de clipping (se amplitude > 0.95)
      const maxAmplitude = Math.max(...Array.from(dataArray).map(Math.abs));
      if (maxAmplitude > 0.95) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.fillRect(0, 0, width, height);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, width, height]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full rounded-lg border border-white/10"
      />
      <div className="absolute bottom-2 left-2 text-xs text-white/60">
        Forma de Onda
      </div>
    </div>
  );
}
