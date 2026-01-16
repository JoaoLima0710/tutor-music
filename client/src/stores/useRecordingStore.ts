import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recording } from '@/services/AudioRecorderService';

interface RecordingState {
  recordings: Recording[];
  addRecording: (recording: Recording) => void;
  removeRecording: (id: string) => void;
  updateRecording: (id: string, updates: Partial<Recording>) => void;
  getRecordingById: (id: string) => Recording | undefined;
  getRecordingsBySong: (songId: string) => Recording[];
  clearAllRecordings: () => void;
}

export const useRecordingStore = create<RecordingState>()(
  persist(
    (set, get) => ({
      recordings: [],
      
      addRecording: (recording) => {
        set((state) => ({
          recordings: [recording, ...state.recordings],
        }));
      },
      
      removeRecording: (id) => {
        set((state) => ({
          recordings: state.recordings.filter((r) => r.id !== id),
        }));
      },
      
      updateRecording: (id, updates) => {
        set((state) => ({
          recordings: state.recordings.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },
      
      getRecordingById: (id) => {
        return get().recordings.find((r) => r.id === id);
      },
      
      getRecordingsBySong: (songId) => {
        return get().recordings.filter((r) => r.songId === songId);
      },
      
      clearAllRecordings: () => {
        set({ recordings: [] });
      },
    }),
    {
      name: 'musictutor-recordings',
      // Don't persist blob and url (they won't work after reload)
      partialize: (state) => ({
        recordings: state.recordings.map(r => ({
          ...r,
          blob: undefined,
          url: undefined,
        })),
      }),
    }
  )
);
