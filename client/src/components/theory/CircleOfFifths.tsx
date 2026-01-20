/**
 * Círculo das Quintas Interativo
 * Ferramenta fundamental para entender relações entre tonalidades
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Info, Play, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { unifiedAudioService } from '@/services/UnifiedAudioService';

export interface KeyInfo {
  major: string;
  minor: string;
  sharps: number;
  flats: number;
  chords: string[];
}

const CIRCLE_OF_FIFTHS: KeyInfo[] = [
  { major: 'C', minor: 'Am', sharps: 0, flats: 0, chords: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'] },
  { major: 'G', minor: 'Em', sharps: 1, flats: 0, chords: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'] },
  { major: 'D', minor: 'Bm', sharps: 2, flats: 0, chords: ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'] },
  { major: 'A', minor: 'F#m', sharps: 3, flats: 0, chords: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'] },
  { major: 'E', minor: 'C#m', sharps: 4, flats: 0, chords: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'] },
  { major: 'B', minor: 'G#m', sharps: 5, flats: 0, chords: ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'] },
  { major: 'F#', minor: 'D#m', sharps: 6, flats: 0, chords: ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'] },
  { major: 'Gb', minor: 'Ebm', sharps: 0, flats: 6, chords: ['Gb', 'Abm', 'Bbm', 'Cb', 'Db', 'Ebm', 'Fdim'] },
  { major: 'Db', minor: 'Bbm', sharps: 0, flats: 5, chords: ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim'] },
  { major: 'Ab', minor: 'Fm', sharps: 0, flats: 4, chords: ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim'] },
  { major: 'Eb', minor: 'Cm', sharps: 0, flats: 3, chords: ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'] },
  { major: 'Bb', minor: 'Gm', sharps: 0, flats: 2, chords: ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'] },
  { major: 'F', minor: 'Dm', sharps: 0, flats: 1, chords: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'] },
];

interface CircleOfFifthsProps {
  onKeySelect?: (key: KeyInfo) => void;
  showChords?: boolean;
  interactive?: boolean;
  className?: string;
}

export function CircleOfFifths({
  onKeySelect,
  showChords = true,
  interactive = true,
  className = '',
}: CircleOfFifthsProps) {
  const [selectedKey, setSelectedKey] = useState<KeyInfo | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleKeyClick = (key: KeyInfo) => {
    if (!interactive) return;
    
    setSelectedKey(key);
    if (onKeySelect) {
      onKeySelect(key);
    }
  };

  const playKeyChord = async (chord: string) => {
    setIsPlaying(true);
    try {
      await unifiedAudioService.playChord(chord, 1.5);
    } catch (error) {
      console.error('Erro ao tocar acorde:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  // Calcular posição no círculo (12 posições, 360° / 12 = 30° cada)
  const getKeyPosition = (index: number) => {
    const angle = (index * 30 - 90) * (Math.PI / 180); // -90° para começar no topo
    const radius = 140; // Raio do círculo
    const centerX = 200;
    const centerY = 200;
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle: angle * (180 / Math.PI),
    };
  };

  return (
    <Card className={`p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0891b2] flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Círculo das Quintas</h3>
            <p className="text-sm text-gray-400">Relações entre tonalidades</p>
          </div>
        </div>
        
        <Button
          onClick={() => setShowInfo(!showInfo)}
          variant="outline"
          size="sm"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Info className="w-4 h-4" />
        </Button>
      </div>

      {showInfo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
        >
          <p className="text-sm text-gray-300 mb-2">
            O <strong className="text-blue-400">Círculo das Quintas</strong> mostra as relações entre tonalidades.
          </p>
          <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
            <li><strong>Sentido horário:</strong> Quintas ascendentes (C → G → D → A...)</li>
            <li><strong>Sentido anti-horário:</strong> Quartas ascendentes (C → F → Bb → Eb...)</li>
            <li><strong>Relativas:</strong> Cada maior tem uma menor relativa (ex: C maior ↔ Am menor)</li>
            <li><strong>Armaduras:</strong> Número de sustenidos/bemóis aumenta conforme você se move no círculo</li>
          </ul>
        </motion.div>
      )}

      {/* Círculo Visual */}
      <div className="relative w-full max-w-md mx-auto mb-6" style={{ height: '400px' }}>
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Círculo de fundo */}
          <circle
            cx="200"
            cy="200"
            r="140"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="2"
          />

              {/* Linhas de conexão (opcional) */}
              {interactive && (
                <>
                  {CIRCLE_OF_FIFTHS.map((key, index) => {
                    const nextIndex = (index + 1) % CIRCLE_OF_FIFTHS.length;
                    const pos1 = getKeyPosition(index);
                    const pos2 = getKeyPosition(nextIndex);
                    return (
                      <line
                        key={`line-${index}`}
                        x1={pos1.x}
                        y1={pos1.y}
                        x2={pos2.x}
                        y2={pos2.y}
                        stroke="rgba(6, 182, 212, 0.2)"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                      />
                    );
                  })}
                </>
              )}

          {/* Tonalidades */}
          {CIRCLE_OF_FIFTHS.map((key, index) => {
            const pos = getKeyPosition(index);
            const isSelected = selectedKey?.major === key.major;

            return (
              <g key={key.major}>
                {/* Círculo da tonalidade */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 28 : 24}
                  fill={isSelected ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)'}
                  stroke={isSelected ? '#0891b2' : 'rgba(255, 255, 255, 0.2)'}
                  strokeWidth={isSelected ? 3 : 2}
                  className={interactive ? 'cursor-pointer hover:fill-cyan-500/30' : ''}
                  onClick={() => handleKeyClick(key)}
                />

                {/* Texto - Maior */}
                <text
                  x={pos.x}
                  y={pos.y - 8}
                  textAnchor="middle"
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                  className={interactive ? 'cursor-pointer' : ''}
                  onClick={() => handleKeyClick(key)}
                >
                  {key.major}
                </text>

                {/* Texto - Menor */}
                <text
                  x={pos.x}
                  y={pos.y + 12}
                  textAnchor="middle"
                  fill="rgba(255, 255, 255, 0.6)"
                  fontSize="12"
                  className={interactive ? 'cursor-pointer' : ''}
                  onClick={() => handleKeyClick(key)}
                >
                  {key.minor}
                </text>

                {/* Indicador de sustenidos/bemóis */}
                {key.sharps > 0 && (
                  <text
                    x={pos.x + 20}
                    y={pos.y - 20}
                    textAnchor="middle"
                    fill="#fbbf24"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {key.sharps}#
                  </text>
                )}
                {key.flats > 0 && (
                  <text
                    x={pos.x - 20}
                    y={pos.y - 20}
                    textAnchor="middle"
                    fill="#a78bfa"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {key.flats}♭
                  </text>
                )}
              </g>
            );
          })}

          {/* Centro - Instruções */}
          <circle
            cx="200"
            cy="200"
            r="50"
            fill="rgba(15, 15, 26, 0.8)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
          />
          <text
            x="200"
            y="195"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            Círculo das
          </text>
          <text
            x="200"
            y="210"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            Quintas
          </text>
        </svg>
      </div>

      {/* Informações da Tonalidade Selecionada */}
      <AnimatePresence>
        {selectedKey && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 rounded-xl bg-gradient-to-br from-[#06b6d4]/20 to-[#0891b2]/20 border border-[#06b6d4]/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-lg font-bold text-white">
                  {selectedKey.major} Maior / {selectedKey.minor} Menor
                </h4>
                <p className="text-sm text-gray-400">
                  {selectedKey.sharps > 0 && `${selectedKey.sharps} sustenido${selectedKey.sharps > 1 ? 's' : ''}`}
                  {selectedKey.flats > 0 && `${selectedKey.flats} bemol${selectedKey.flats > 1 ? 'is' : ''}`}
                  {selectedKey.sharps === 0 && selectedKey.flats === 0 && 'Sem acidentes'}
                </p>
              </div>
              <Button
                onClick={() => setSelectedKey(null)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            {showChords && (
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">Campo Harmônico:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedKey.chords.map((chord, index) => {
                    const romanNumeral = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'][index];
                    return (
                      <button
                        key={chord}
                        onClick={() => playKeyChord(chord)}
                        disabled={isPlaying}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#06b6d4]/30 border border-white/20 text-white text-sm font-medium transition-all disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{romanNumeral}</span>
                          <span>{chord}</span>
                          <Play className="w-3 h-3" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dica */}
      <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
        <p className="text-xs text-gray-400">
          <strong className="text-cyan-400">💡 Dica:</strong> Clique em uma tonalidade para ver seu campo harmônico. 
          Tonalidades vizinhas no círculo são harmonicamente próximas e fáceis de modular.
        </p>
      </div>
    </Card>
  );
}
