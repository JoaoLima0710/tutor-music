/**
 * Visualizador de Espectro de Frequências
 * Exibe espectro FFT em tempo real
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SpectrumVisualizerProps {
  analyser: AnalyserNode | null;
  width?: number;
  height?: number;
  className?: string;
}

export function SpectrumVisualizer({ 
  analyser, 
  width = 400, 
  height = 200,
  className = '' 
}: SpectrumVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;

    const draw = () => {
      if (!analyser || !ctx) return;

      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Limpar canvas
      ctx.fillStyle = 'rgba(15, 15, 26, 0.5)';
      ctx.fillRect(0, 0, width, height);

      // Desenhar espectro
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height;

        // Cor baseada na frequência (azul para graves, vermelho para agudos)
        const hue = (i / bufferLength) * 240; // 0-240 (azul a vermelho)
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;

        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      // Linha de frequência fundamental (se detectada)
      // Será adicionada quando integrar com PitchDetectionService
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
        Espectro de Frequências
      </div>
    </div>
  );
}
