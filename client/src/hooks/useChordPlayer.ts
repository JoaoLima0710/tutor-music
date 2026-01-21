import { useState, useCallback, useRef, useEffect } from 'react';
import { ChordPlayer } from '../audio';

interface UseChordPlayerReturn {
  playChord: (chordName: string) => Promise<void>;
  stopAll: () => void;
  setVolume: (volume: number) => void;
  setStrumSpeed: (speed: number) => void;
  isPlaying: boolean;
  availableChords: string[];
}

/**
 * Hook para reproduzir acordes
 */
export function useChordPlayer(): UseChordPlayerReturn {
  const playerRef = useRef<ChordPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    playerRef.current = new ChordPlayer();
    return () => {
      playerRef.current?.stopAll();
    };
  }, []);

  const playChord = useCallback(async (chordName: string) => {
    if (!playerRef.current) return;
    
    setIsPlaying(true);
    try {
      await playerRef.current.playChord(chordName);
    } finally {
      // Assumir que o acorde dura ~2 segundos
      setTimeout(() => setIsPlaying(false), 2000);
    }
  }, []);

  const stopAll = useCallback(() => {
    playerRef.current?.stopAll();
    setIsPlaying(false);
  }, []);

  const setVolume = useCallback((volume: number) => {
    playerRef.current?.setVolume(volume);
  }, []);

  const setStrumSpeed = useCallback((speed: number) => {
    playerRef.current?.setStrumSpeed(speed);
  }, []);

  const availableChords = playerRef.current?.getAvailableChords() || [];

  return {
    playChord,
    stopAll,
    setVolume,
    setStrumSpeed,
    isPlaying,
    availableChords,
  };
}
