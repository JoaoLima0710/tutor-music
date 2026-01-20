/**
 * Gráfico de Histórico de Pitch
 * Exibe evolução de pitch ao longo do tempo
 */

import { useEffect, useRef, useState } from 'react';

interface PitchData {
  frequency: number;
  timestamp: number;
}

interface PitchHistoryChartProps {
  pitchData: PitchData | null;
  maxHistory?: number; // Número máximo de pontos no histórico
  timeWindow?: number; // Janela de tempo em segundos
  className?: string;
}

export function PitchHistoryChart({ 
  pitchData, 
  maxHistory = 100,
  timeWindow = 5,
  className = '' 
}: PitchHistoryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<PitchData[]>([]);

  useEffect(() => {
    if (!pitchData) return;

    // Adicionar novo ponto ao histórico
    historyRef.current.push(pitchData);

    // Remover pontos antigos (fora da janela de tempo)
    const now = Date.now();
    const cutoffTime = now - (timeWindow * 1000);
    historyRef.current = historyRef.current.filter(p => p.timestamp > cutoffTime);

    // Limitar tamanho do histórico
    if (historyRef.current.length > maxHistory) {
      historyRef.current = historyRef.current.slice(-maxHistory);
    }

    // Redesenhar gráfico
    drawChart();
  }, [pitchData, maxHistory, timeWindow]);

  const drawChart = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Limpar canvas
    ctx.fillStyle = 'rgba(15, 15, 26, 0.5)';
    ctx.fillRect(0, 0, width, height);

    if (historyRef.current.length === 0) return;

    // Encontrar range de frequências
    const frequencies = historyRef.current.map(p => p.frequency);
    const minFreq = Math.min(...frequencies);
    const maxFreq = Math.max(...frequencies);
    const freqRange = maxFreq - minFreq || 100; // Fallback para 100 Hz se range = 0

    // Desenhar grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Desenhar linha de pitch
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const now = Date.now();
    historyRef.current.forEach((point, index) => {
      const x = (index / (maxHistory - 1)) * width;
      const normalizedFreq = (point.frequency - minFreq) / freqRange;
      const y = height - (normalizedFreq * height);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Desenhar pontos
    ctx.fillStyle = '#06b6d4';
    historyRef.current.forEach((point, index) => {
      const x = (index / (maxHistory - 1)) * width;
      const normalizedFreq = (point.frequency - minFreq) / freqRange;
      const y = height - (normalizedFreq * height);

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.fillText(`${Math.round(minFreq)} Hz`, 5, height - 5);
    ctx.fillText(`${Math.round(maxFreq)} Hz`, 5, 15);
  };

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        className="w-full h-full rounded-lg border border-white/10"
      />
      <div className="absolute bottom-2 left-2 text-xs text-white/60">
        Histórico de Pitch ({timeWindow}s)
      </div>
    </div>
  );
}
