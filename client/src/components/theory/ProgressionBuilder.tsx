/**
 * Construtor de Progressões Harmônicas
 * Permite usuário montar progressões e analisar função harmônica
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Trash2, Music, Target, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { unifiedAudioService } from '@/services/UnifiedAudioService';
import { HARMONIC_PROGRESSIONS, HarmonicProgression, analyzeProgression, transposeProgression } from '@/data/progressions';
import { CircleOfFifths } from './CircleOfFifths';

export function ProgressionBuilder() {
  const [selectedChords, setSelectedChords] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('C');
  const [isPlaying, setIsPlaying] = useState(false);
  const [analysis, setAnalysis] = useState<{ romanNumerals: string[]; function: string; analysis: string } | null>(null);
  const [selectedProgression, setSelectedProgression] = useState<HarmonicProgression | null>(null);

  const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const CHORD_TYPES = ['', 'm', '7', 'm7', 'maj7', 'sus2', 'sus4', 'dim', 'aug'];

  const handleAddChord = (chord: string) => {
    setSelectedChords([...selectedChords, chord]);
    // Analisar progressão atualizada
    const newAnalysis = analyzeProgression([...selectedChords, chord], selectedKey);
    setAnalysis(newAnalysis);
  };

  const handleRemoveChord = (index: number) => {
    const newChords = selectedChords.filter((_, i) => index !== i);
    setSelectedChords(newChords);
    if (newChords.length > 0) {
      const newAnalysis = analyzeProgression(newChords, selectedKey);
      setAnalysis(newAnalysis);
    } else {
      setAnalysis(null);
    }
  };

  const handlePlayProgression = async () => {
    if (selectedChords.length === 0) return;

    setIsPlaying(true);
    try {
      // Tocar cada acorde sequencialmente
      for (const chord of selectedChords) {
        await unifiedAudioService.playChord(chord, 1.5);
        await new Promise(resolve => setTimeout(resolve, 100)); // Pequena pausa entre acordes
      }
    } catch (error) {
      console.error('Erro ao tocar progressão:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleLoadProgression = (progression: HarmonicProgression) => {
    // Transpor para tonalidade selecionada se necessário
    if (progression.key !== selectedKey) {
      const transposed = transposeProgression(progression, selectedKey);
      setSelectedChords(transposed.chords);
      setAnalysis({
        romanNumerals: transposed.romanNumerals,
        function: transposed.function,
        analysis: transposed.function,
      });
    } else {
      setSelectedChords(progression.chords);
      setAnalysis({
        romanNumerals: progression.romanNumerals,
        function: progression.function,
        analysis: progression.function,
      });
    }
    setSelectedProgression(progression);
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Tonalidade */}
      <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Music className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Tonalidade</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {CHROMATIC_NOTES.map(note => (
            <Button
              key={note}
              onClick={() => {
                setSelectedKey(note);
                // Re-analisar progressão na nova tonalidade
                if (selectedChords.length > 0) {
                  const newAnalysis = analyzeProgression(selectedChords, note);
                  setAnalysis(newAnalysis);
                }
              }}
              variant={selectedKey === note ? 'default' : 'outline'}
              size="sm"
              className={selectedKey === note ? 'bg-cyan-500 text-white' : ''}
            >
              {note}
            </Button>
          ))}
        </div>
      </Card>

      {/* Progressões Pré-definidas */}
      <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-bold text-white">Progressões Comuns</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {HARMONIC_PROGRESSIONS.slice(0, 6).map(progression => (
            <button
              key={progression.id}
              onClick={() => handleLoadProgression(progression)}
              className="p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all"
            >
              <div className="font-semibold text-white mb-1">{progression.name}</div>
              <div className="text-sm text-gray-400 mb-2">{progression.romanNumerals.join(' - ')}</div>
              <div className="text-xs text-gray-500">{progression.description}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Construtor de Progressão */}
      <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Sua Progressão</h3>
          </div>
          <Button
            onClick={() => {
              setSelectedChords([]);
              setAnalysis(null);
              setSelectedProgression(null);
            }}
            variant="outline"
            size="sm"
            className="text-red-400 border-red-400/30 hover:bg-red-400/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        </div>

        {/* Acordes Selecionados */}
        {selectedChords.length > 0 && (
          <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedChords.map((chord, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30"
                >
                  <span className="text-white font-semibold">{chord}</span>
                  <button
                    onClick={() => handleRemoveChord(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Análise */}
            {analysis && (
              <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="text-sm text-gray-300 mb-1">
                  <strong className="text-blue-400">Análise:</strong> {analysis.romanNumerals.join(' - ')}
                </div>
                <div className="text-xs text-gray-400">
                  <strong>Função:</strong> {analysis.function}
                </div>
              </div>
            )}

            <Button
              onClick={handlePlayProgression}
              disabled={isPlaying}
              className="mt-3 w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Play className="w-4 h-4 mr-2" />
              {isPlaying ? 'Tocando...' : 'Tocar Progressão'}
            </Button>
          </div>
        )}

        {/* Seletor de Acordes */}
        <div>
          <p className="text-sm text-gray-400 mb-3">Adicione acordes à sua progressão:</p>
          <div className="space-y-3">
            {CHROMATIC_NOTES.map(note => (
              <div key={note} className="flex items-center gap-2">
                <span className="w-12 text-sm text-gray-400">{note}:</span>
                <div className="flex flex-wrap gap-2">
                  {CHORD_TYPES.map(type => {
                    const chord = note + type;
                    return (
                      <Button
                        key={chord}
                        onClick={() => handleAddChord(chord)}
                        variant="outline"
                        size="sm"
                        className="text-white border-white/20 hover:bg-white/10"
                      >
                        {chord}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Círculo das Quintas (para referência) */}
      <CircleOfFifths
        onKeySelect={(key) => {
          setSelectedKey(key.major);
          if (selectedChords.length > 0) {
            const newAnalysis = analyzeProgression(selectedChords, key.major);
            setAnalysis(newAnalysis);
          }
        }}
        showChords={false}
        interactive={true}
      />
    </div>
  );
}
