import { useState, useEffect, useCallback, useRef } from 'react';
import { Metronome } from '../audio';
import { MetronomeState, MetronomeConfig } from '../audio/types';

interface UseMetronomeReturn {
  state: MetronomeState;
  config: MetronomeConfig;
  start: () => Promise<void>;
  stop: () => void;
  toggle: () => void;
  setBpm: (bpm: number) => void;
  setBeatsPerMeasure: (beats: number) => void;
  setSubdivision: (subdivision: 1 | 2 | 4) => void;
  setVolume: (volume: number) => void;
  tap: () => number | null;
}

/**
 * Hook para controlar o metrônomo
 */
export function useMetronome(): UseMetronomeReturn {
  const metronomeRef = useRef<Metronome | null>(null);
  
  const [state, setState] = useState<MetronomeState>({
    isPlaying: false,
    currentBeat: 0,
    currentSubdivision: 0,
    bpm: 100,
  });

  const [config, setConfig] = useState<MetronomeConfig>({
    bpm: 100,
    beatsPerMeasure: 4,
    subdivision: 1,
    accentFirst: true,
    volume: 0.7,
  });

  // Inicializar metrônomo
  useEffect(() => {
    metronomeRef.current = new Metronome();
    
    // Listener para mudanças de estado
    const unsubscribe = metronomeRef.current.onStateChange((newState) => {
      setState(newState);
    });

    return () => {
      metronomeRef.current?.stop();
      unsubscribe();
    };
  }, []);

  const start = useCallback(async () => {
    await metronomeRef.current?.start();
  }, []);

  const stop = useCallback(() => {
    metronomeRef.current?.stop();
  }, []);

  const toggle = useCallback(() => {
    metronomeRef.current?.toggle();
  }, []);

  const setBpm = useCallback((bpm: number) => {
    metronomeRef.current?.setBpm(bpm);
    setConfig(prev => ({ ...prev, bpm }));
  }, []);

  const setBeatsPerMeasure = useCallback((beats: number) => {
    metronomeRef.current?.setBeatsPerMeasure(beats);
    setConfig(prev => ({ ...prev, beatsPerMeasure: beats }));
  }, []);

  const setSubdivision = useCallback((subdivision: 1 | 2 | 4) => {
    metronomeRef.current?.setSubdivision(subdivision);
    setConfig(prev => ({ ...prev, subdivision }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    metronomeRef.current?.setVolume(volume);
    setConfig(prev => ({ ...prev, volume }));
  }, []);

  const tap = useCallback((): number | null => {
    return metronomeRef.current?.tap() || null;
  }, []);

  return {
    state,
    config,
    start,
    stop,
    toggle,
    setBpm,
    setBeatsPerMeasure,
    setSubdivision,
    setVolume,
    tap,
  };
}
