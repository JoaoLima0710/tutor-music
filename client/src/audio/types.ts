// Tipos base para o sistema de áudio

export interface AudioEngineState {
  isInitialized: boolean;
  isResumed: boolean;
  sampleRate: number;
  latency: number;
}

export interface SampleData {
  buffer: AudioBuffer;
  duration: number;
  loaded: boolean;
}

export interface SampleManifest {
  chords: Record<string, string>;
  notes: Record<string, string>;
  percussion: Record<string, string>;
}

export interface MetronomeConfig {
  bpm: number;
  beatsPerMeasure: number;
  subdivision: 1 | 2 | 4;
  accentFirst: boolean;
  volume: number;
}

export interface MetronomeState {
  isPlaying: boolean;
  currentBeat: number;
  currentSubdivision: number;
  bpm: number;
}

export interface TunerState {
  isListening: boolean;
  frequency: number | null;
  note: string | null;
  octave: number | null;
  cents: number;
  isInTune: boolean;
  volume: number;
}

export interface PitchDetectionResult {
  frequency: number;
  note: string;
  octave: number;
  cents: number;
  confidence: number;
}

export interface ChordVoicing {
  name: string;
  notes: string[];
  frequencies: number[];
  strumPattern?: number[];
}

export interface ScaleNotes {
  name: string;
  root: string;
  notes: string[];
  intervals: number[];
}

export interface AudioErrorType {
  code: 'CONTEXT_FAILED' | 'SAMPLE_LOAD_FAILED' | 'MICROPHONE_DENIED' | 'DECODE_FAILED' | 'PLAYBACK_FAILED';
  message: string;
  originalError?: Error;
}

export type AudioEventCallback = (event: string, data?: unknown) => void;

// Frequências padrão das cordas do violão (afinação standard E)
export const GUITAR_STANDARD_TUNING: Record<number, { note: string; frequency: number }> = {
  6: { note: 'E2', frequency: 82.41 },
  5: { note: 'A2', frequency: 110.0 },
  4: { note: 'D3', frequency: 146.83 },
  3: { note: 'G3', frequency: 196.0 },
  2: { note: 'B3', frequency: 246.94 },
  1: { note: 'E4', frequency: 329.63 },
};

// Notas cromáticas
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export type NoteName = typeof NOTE_NAMES[number];

// Frequência de referência (A4 = 440Hz)
export const A4_FREQUENCY = 440;
export const A4_MIDI_NUMBER = 69;
