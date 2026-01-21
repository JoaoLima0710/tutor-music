import { useState, useEffect, useCallback, useRef } from 'react';
import { PitchDetector } from '../audio';
import { PitchDetectionResult } from '../audio/types';

interface UsePitchDetectionReturn {
  isListening: boolean;
  result: PitchDetectionResult | null;
  error: Error | null;
  start: () => Promise<void>;
  stop: () => void;
  toggle: () => void;
}

/**
 * Hook para detecção de pitch
 */
export function usePitchDetection(): UsePitchDetectionReturn {
  const detectorRef = useRef<PitchDetector | null>(null);
  
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<PitchDetectionResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    detectorRef.current = new PitchDetector();
    
    const unsubscribePitch = detectorRef.current.onPitch((pitchResult) => {
      setResult(pitchResult);
    });

    const unsubscribeError = detectorRef.current.onError((err) => {
      setError(err);
      setIsListening(false);
    });

    return () => {
      detectorRef.current?.stopListening();
      unsubscribePitch();
      unsubscribeError();
    };
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      await detectorRef.current?.startListening();
      setIsListening(true);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const stop = useCallback(() => {
    detectorRef.current?.stopListening();
    setIsListening(false);
    setResult(null);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  return {
    isListening,
    result,
    error,
    start,
    stop,
    toggle,
  };
}
