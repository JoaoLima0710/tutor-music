import React, { useCallback } from 'react';
import { useMetronome } from '../../hooks/useMetronome';
import { Play, Pause, Plus, Minus, Hand } from 'lucide-react';

export function MetronomeControl() {
  const {
    state,
    config,
    toggle,
    setBpm,
    setBeatsPerMeasure,
    setSubdivision,
    setVolume,
    tap,
  } = useMetronome();

  const handleBpmChange = useCallback((delta: number) => {
    setBpm(config.bpm + delta);
  }, [config.bpm, setBpm]);

  const handleTap = useCallback(() => {
    const newBpm = tap();
    if (newBpm) {
      console.log(`Tap Tempo: ${newBpm} BPM`);
    }
  }, [tap]);

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        🎵 Metrônomo
      </h3>

      {/* BPM Display */}
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-primary mb-1">
          {config.bpm}
        </div>
        <div className="text-sm text-muted-foreground">BPM</div>
      </div>

      {/* Beat Indicators */}
      <div className="flex justify-center gap-2 mb-6">
        {Array.from({ length: config.beatsPerMeasure }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-100 ${
              state.isPlaying && state.currentBeat === i
                ? i === 0
                  ? 'bg-orange-500 scale-125'
                  : 'bg-primary scale-110'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => handleBpmChange(-5)}
          className="p-3 bg-muted rounded-full hover:bg-muted/80 transition"
        >
          <Minus className="w-5 h-5" />
        </button>

        <button
          onClick={toggle}
          className={`p-4 rounded-full transition-all ${
            state.isPlaying
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {state.isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-0.5" />
          )}
        </button>

        <button
          onClick={() => handleBpmChange(5)}
          className="p-3 bg-muted rounded-full hover:bg-muted/80 transition"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Tap Tempo */}
      <button
        onClick={handleTap}
        className="w-full py-3 bg-muted rounded-xl hover:bg-muted/80 transition flex items-center justify-center gap-2 mb-4"
      >
        <Hand className="w-5 h-5" />
        Tap Tempo
      </button>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-4">
        {/* Time Signature */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Compasso
          </label>
          <select
            value={config.beatsPerMeasure}
            onChange={(e) => setBeatsPerMeasure(parseInt(e.target.value))}
            className="w-full bg-muted rounded-lg px-3 py-2 text-sm"
          >
            <option value={2}>2/4</option>
            <option value={3}>3/4</option>
            <option value={4}>4/4</option>
            <option value={6}>6/8</option>
          </select>
        </div>

        {/* Subdivision */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Subdivisão
          </label>
          <select
            value={config.subdivision}
            onChange={(e) => setSubdivision(parseInt(e.target.value) as 1 | 2 | 4)}
            className="w-full bg-muted rounded-lg px-3 py-2 text-sm"
          >
            <option value={1}>Nenhuma</option>
            <option value={2}>Colcheias</option>
            <option value={4}>Semicolcheias</option>
          </select>
        </div>
      </div>

      {/* Volume Slider */}
      <div className="mt-4">
        <label className="text-xs text-muted-foreground mb-1 block">
          Volume: {Math.round(config.volume * 100)}%
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={config.volume * 100}
          onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
          className="w-full accent-primary"
        />
      </div>
    </div>
  );
}

export default MetronomeControl;
