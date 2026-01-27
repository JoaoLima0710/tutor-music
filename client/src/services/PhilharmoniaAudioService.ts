/**
 * PhilharmoniaAudioService
 * 
 * Usa samples de instrumentos orquestrais do Philharmonia Orchestra.
 * Oferece som autêntico de instrumentos clássicos de alta qualidade.
 */

import { InstrumentType } from '@/stores/useAudioSettingsStore';

interface NoteManifest {
  [noteName: string]: {
    file: string;
    duration: number;
  };
}

interface InstrumentManifest {
  [instrumentName: string]: {
    count: number;
    notes: string[];
  };
}

type PhilharmoniaInstrument =
  | 'violin'
  | 'viola'
  | 'cello'
  | 'double_bass'
  | 'flute'
  | 'oboe'
  | 'clarinet'
  | 'bass_clarinet'
  | 'saxophone'
  | 'bassoon'
  | 'contrabassoon'
  | 'cor_anglais'
  | 'trumpet'
  | 'french_horn'
  | 'trombone'
  | 'tuba'
  | 'guitar'
  | 'mandolin'
  | 'banjo'
  | 'percussion';

class PhilharmoniaAudioService {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private isLoading = false;
  private noteBuffers: Map<string, AudioBuffer> = new Map();
  private instrumentManifest: InstrumentManifest | null = null;
  private currentInstrument: PhilharmoniaInstrument = 'violin';
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private gainNode: GainNode | null = null;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    if (this.isLoading) {
      console.log('⏳ Already loading Philharmonia samples...');
      return false;
    }

    this.isLoading = true;

    try {
      // Create AudioContext
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.8; // Default volume

      console.log('🎵 AudioContext created for Philharmonia samples');

      // Load general manifest
      await this.loadManifest();

      this.isInitialized = true;
      console.log('✅ PhilharmoniaAudioService initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing PhilharmoniaAudioService:', error);
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  private async loadManifest(): Promise<void> {
    try {
      const manifestResponse = await fetch('/samples/philharmonia/manifest.json');
      if (manifestResponse.ok) {
        this.instrumentManifest = await manifestResponse.json();
        console.log(`📋 Loaded Philharmonia manifest: ${Object.keys(this.instrumentManifest!).length} instruments`);
      } else {
        console.warn('⚠️ Philharmonia manifest not found');
      }
    } catch (error) {
      console.error('❌ Error loading Philharmonia manifest:', error);
    }
  }

  async setInstrument(instrument: PhilharmoniaInstrument): Promise<void> {
    this.currentInstrument = instrument;
    // Clear note buffers when changing instrument
    this.noteBuffers.clear();
    console.log('🎼 Philharmonia instrument set to:', instrument);
  }

  getInstrument(): PhilharmoniaInstrument {
    return this.currentInstrument;
  }

  async loadNoteSample(noteName: string): Promise<AudioBuffer | null> {
    const cacheKey = `${this.currentInstrument}_${noteName}`;

    if (this.noteBuffers.has(cacheKey)) {
      return this.noteBuffers.get(cacheKey)!;
    }

    if (!this.audioContext) {
      console.error('❌ AudioContext not initialized');
      return null;
    }

    try {
      // Tentar carregar do diretório do instrumento
      const filePath = `/samples/philharmonia/${this.currentInstrument}/${noteName}.wav`;
      const response = await fetch(filePath);

      if (!response.ok) {
        // Tentar variações do nome da nota
        const variations = this.getNoteVariations(noteName);
        for (const variation of variations) {
          const altPath = `/samples/philharmonia/${this.currentInstrument}/${variation}.wav`;
          const altResponse = await fetch(altPath);
          if (altResponse.ok) {
            const arrayBuffer = await altResponse.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.noteBuffers.set(cacheKey, audioBuffer);
            console.log(`✅ Loaded note sample: ${this.currentInstrument}/${variation}`);
            return audioBuffer;
          }
        }

        console.warn(`⚠️ Note sample not found: ${this.currentInstrument}/${noteName}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.noteBuffers.set(cacheKey, audioBuffer);
      console.log(`✅ Loaded note sample: ${this.currentInstrument}/${noteName}`);

      return audioBuffer;
    } catch (error) {
      console.error(`❌ Error loading note sample ${noteName}:`, error);
      return null;
    }
  }

  private getNoteVariations(noteName: string): string[] {
    // Gerar variações do nome da nota para tentar encontrar o arquivo
    const variations: string[] = [noteName];

    // Tentar com diferentes formatos
    if (noteName.includes('#')) {
      variations.push(noteName.replace('#', 's')); // C#4 -> Cs4
    }

    // Tentar uppercase/lowercase
    variations.push(noteName.toUpperCase());
    variations.push(noteName.toLowerCase());

    return variations;
  }

  private playBuffer(buffer: AudioBuffer, startTime?: number, duration?: number): void {
    if (!this.audioContext || !this.gainNode) {
      console.error('❌ AudioContext not initialized');
      return;
    }

    // Resume context if suspended (important for mobile)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode);

    // Track active sources for cleanup
    this.activeSources.add(source);

    source.onended = () => {
      this.activeSources.delete(source);
    };

    const actualStartTime = startTime ?? this.audioContext.currentTime;
    source.start(actualStartTime);

    // Stop after duration if specified
    if (duration) {
      source.stop(actualStartTime + duration);
    }
  }

  async playNote(note: string, duration?: number): Promise<void> {
    console.log('🎵 Philharmonia: Playing note:', note, 'on', this.currentInstrument);

    const initialized = await this.initialize();
    if (!initialized) {
      console.error('❌ PhilharmoniaAudioService not initialized');
      return;
    }

    // Try to load note sample
    let buffer = await this.loadNoteSample(note);

    if (!buffer) {
      // Fallback: try without octave
      const noteWithoutOctave = note.replace(/\d+$/, '');
      buffer = await this.loadNoteSample(noteWithoutOctave);
    }

    if (!buffer) {
      console.warn(`⚠️ Note sample not available: ${this.currentInstrument}/${note}`);
      return;
    }

    this.playBuffer(buffer, undefined, duration);
    console.log('✅ Note played:', note);
  }

  async playScale(scaleName: string, root: string, intervals: number[], duration: number = 0.5): Promise<void> {
    console.log('🎵 Philharmonia: Playing scale:', scaleName, 'from', root);

    const initialized = await this.initialize();
    if (!initialized) {
      console.error('❌ PhilharmoniaAudioService not initialized');
      return;
    }

    // Convert intervals to note names
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = NOTES.indexOf(root.toUpperCase());

    if (rootIndex === -1) {
      console.error('❌ Invalid root note:', root);
      return;
    }

    // Generate scale notes
    const scaleNotes = intervals.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return NOTES[noteIndex];
    });

    // Add octave return
    scaleNotes.push(root.toUpperCase());

    // Play notes in sequence
    for (let i = 0; i < scaleNotes.length; i++) {
      const noteName = scaleNotes[i];
      const noteWithOctave = noteName + '4'; // Use octave 4 for consistency

      await this.playNote(noteWithOctave, duration);

      // Delay between notes
      if (i < scaleNotes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, duration * 1000 + 100));
      }
    }

    console.log('✅ Scale played:', scaleNotes.length, 'notes');
  }

  stopAll(): void {
    console.log('🛑 Stopping all Philharmonia audio...');

    // Stop all active sources
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source may have already ended
      }
    });

    this.activeSources.clear();
    console.log('✅ All audio stopped');
  }

  setEQ(bassGain: number, midGain: number, trebleGain: number): void {
    // EQ not implemented for samples (would require audio processing)
    console.log('ℹ️ EQ not available for Philharmonia samples');
  }

  async dispose(): Promise<void> {
    console.log('🗑️ Disposing PhilharmoniaAudioService...');

    this.stopAll();

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.noteBuffers.clear();
    this.isInitialized = false;

    console.log('✅ PhilharmoniaAudioService disposed');
  }
}

export const philharmoniaAudioService = new PhilharmoniaAudioService();
