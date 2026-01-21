import { useState, useEffect, useCallback, useRef } from 'react';
import { Tuner } from '../audio';
import { TunerState } from '../audio/types';

interface UseTunerReturn {
  state: TunerState;
  start: () => Promise<void>;
  stop: () => void;
  toggle: () => void;
  tuningDirection: 'up' | 'down' | 'ok' | null;
  tuningAccuracy: number;
  setTolerance: (cents: number) => void;
}

/**
 * Hook para usar o afinador
 */
export function useTuner(): UseTunerReturn {
  const tunerRef = useRef<Tuner | null>(null);
  
  const [state, setState] = useState<TunerState>({
    isListening: false,
    frequency: null,
    note: null,
    octave: null,
    cents: 0,
    isInTune: false,
    volume: 0,
  });

  const [tuningDirection, setTuningDirection] = useState<'up' | 'down' | 'ok' | null>(null);
  const [tuningAccuracy, setTuningAccuracy] = useState(0);

  // Inicializar afinador
  useEffect(() => {
    tunerRef.current = new Tuner();
    
    const unsubscribe = tunerRef.current.onStateChange((newState) => {
      setState(newState);
      setTuningDirection(tunerRef.current?.getTuningDirection() || null);
      setTuningAccuracy(tunerRef.current?.getTuningAccuracy() || 0);
    });

    return () => {
      tunerRef.current?.stop();
      unsubscribe();
    };
  }, []);

  const start = useCallback(async () => {
    await tunerRef.current?.start();
  }, []);

  const stop = useCallback(() => {
    tunerRef.current?.stop();
  }, []);

  const toggle = useCallback(() => {
    tunerRef.current?.toggle();
  }, []);

  const setTolerance = useCallback((cents: number) => {
    tunerRef.current?.setTolerance(cents);
  }, []);

  return {
    state,
    start,
    stop,
    toggle,
    tuningDirection,
    tuningAccuracy,
    setTolerance,
  };
}
