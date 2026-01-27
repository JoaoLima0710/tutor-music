import { useState, useEffect, useCallback } from 'react';
import { AudioEngine, initializeAudioSystem, isAudioReady } from '../audio';
import { unifiedAudioService } from '../services/UnifiedAudioService';

interface UseAudioReturn {
  isReady: boolean;
  isInitializing: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
  unlock: () => Promise<boolean>;
  playNote: (note: string, duration?: number) => Promise<boolean>;
  playNotes: (notes: string[], options?: { duration?: number; stagger?: number }) => Promise<void>;
  playChord: (chordName: string, duration?: number) => Promise<boolean>;
  stopAll: () => void;
}

/**
 * Hook para gerenciar inicialização e reprodução do sistema de áudio
 */
export function useAudio(): UseAudioReturn {
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Verificar estado inicial
  useEffect(() => {
    setIsReady(isAudioReady());
  }, []);

  // Listener para mudanças de estado
  useEffect(() => {
    const audioEngine = AudioEngine.getInstance();

    const handleStateChange = () => {
      setIsReady(audioEngine.isReady());
    };

    audioEngine.on('initialized', handleStateChange);
    audioEngine.on('resumed', handleStateChange);
    audioEngine.on('statechange', handleStateChange);

    return () => {
      audioEngine.off('initialized', handleStateChange);
      audioEngine.off('resumed', handleStateChange);
      audioEngine.off('statechange', handleStateChange);
    };
  }, []);

  const initialize = useCallback(async () => {
    if (isReady || isInitializing) return;

    setIsInitializing(true);
    setError(null);

    try {
      unifiedAudioService.markUserInteraction();
      await initializeAudioSystem();
      setIsReady(true);
    } catch (err) {
      setError(err as Error);
      console.error('[useAudio] Erro na inicialização:', err);
    } finally {
      setIsInitializing(false);
    }
  }, [isReady, isInitializing]);

  const unlock = useCallback(async (): Promise<boolean> => {
    const audioEngine = AudioEngine.getInstance();
    const success = await audioEngine.unlockAudio();
    setIsReady(success);
    return success;
  }, []);

  const playNote = useCallback(async (note: string, duration?: number) => {
    return await unifiedAudioService.playNote(note, duration);
  }, []);

  const playChord = useCallback(async (chordName: string, duration?: number) => {
    return await unifiedAudioService.playChord(chordName, duration);
  }, []);

  const playNotes = useCallback(async (notes: string[], options?: { duration?: number; stagger?: number }) => {
    const { duration = 0.5, stagger = 0 } = options || {};
    for (let i = 0; i < notes.length; i++) {
      unifiedAudioService.playNote(notes[i], duration);
      if (stagger > 0 && i < notes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, stagger * 1000));
      }
    }
  }, []);

  const stopAll = useCallback(() => {
    unifiedAudioService.stopAll();
  }, []);

  return {
    isReady,
    isInitializing,
    error,
    initialize,
    unlock,
    playNote,
    playNotes,
    playChord,
    stopAll,
  };
}
