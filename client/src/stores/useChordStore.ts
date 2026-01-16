import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChordProgress {
  chordId: string;
  practiced: boolean;
  lastPracticed?: number;
  accuracy: number;
  attempts: number;
}

interface ChordStore {
  progress: Record<string, ChordProgress>;
  currentChord: string | null;
  
  setCurrentChord: (chordId: string) => void;
  markAsPracticed: (chordId: string, accuracy: number) => void;
  getChordProgress: (chordId: string) => ChordProgress | undefined;
  getPracticedCount: () => number;
}

export const useChordStore = create<ChordStore>()(
  persist(
    (set, get) => ({
      progress: {},
      currentChord: null,
      
      setCurrentChord: (chordId) => {
        set({ currentChord: chordId });
      },
      
      markAsPracticed: (chordId, accuracy) => {
        set((state) => {
          const existing = state.progress[chordId];
          
          return {
            progress: {
              ...state.progress,
              [chordId]: {
                chordId,
                practiced: true,
                lastPracticed: Date.now(),
                accuracy: existing 
                  ? (existing.accuracy * existing.attempts + accuracy) / (existing.attempts + 1)
                  : accuracy,
                attempts: existing ? existing.attempts + 1 : 1,
              },
            },
          };
        });
      },
      
      getChordProgress: (chordId) => {
        return get().progress[chordId];
      },
      
      getPracticedCount: () => {
        return Object.values(get().progress).filter(p => p.practiced).length;
      },
    }),
    {
      name: 'chord-store',
      version: 1,
    }
  )
);
