/**
 * GuitarSetAudioService
 * 
 * Usa samples reais extraídos do dataset GuitarSet para reprodução de áudio.
 * Oferece som autêntico de guitarra gravada por profissionais.
 */

import type { InstrumentType } from './AudioServiceWithSamples';

interface ChordManifest {
  [chordName: string]: {
    file: string;
    duration: number;
  };
}

interface NoteManifest {
  [noteName: string]: {
    file: string;
    duration: number;
  };
}

class GuitarSetAudioService {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private isLoading = false;
  private chordBuffers: Map<string, AudioBuffer> = new Map();
  private noteBuffers: Map<string, AudioBuffer> = new Map();
  private chordManifest: ChordManifest | null = null;
  private noteManifest: NoteManifest | null = null;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private gainNode: GainNode | null = null;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      // Ensure AudioContext is resumed (important for tablets)
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return true;
    }

    if (this.isLoading) {
      console.log('⏳ Already loading GuitarSet samples...');
      return false;
    }

    this.isLoading = true;

    try {
      // Create AudioContext with optimized settings for tablets
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass({
        sampleRate: 44100, // Standard sample rate
        latencyHint: 'interactive', // Low latency for responsive playback
      });
      
      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.8; // Default volume

      // Ensure AudioContext is running (critical for tablets)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      console.log('🎵 AudioContext created for GuitarSet samples, state:', this.audioContext.state);

      // Load manifests
      await this.loadManifests();

      // Preload essential samples (chords) - critical for smooth playback
      await this.preloadChords();

      this.isInitialized = true;
      console.log('✅ GuitarSetAudioService initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing GuitarSetAudioService:', error);
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  private async loadManifests(): Promise<void> {
    try {
      // Load chord manifest
      const chordManifestResponse = await fetch('/samples/chords/manifest.json');
      if (chordManifestResponse.ok) {
        this.chordManifest = await chordManifestResponse.json();
        console.log(`📋 Loaded chord manifest: ${Object.keys(this.chordManifest!).length} chords`);
      } else {
        console.warn('⚠️ Chord manifest not found');
      }

      // Load note manifest (if exists)
      try {
        const noteManifestResponse = await fetch('/samples/notes/manifest.json');
        if (noteManifestResponse.ok) {
          this.noteManifest = await noteManifestResponse.json();
          console.log(`📋 Loaded note manifest: ${Object.keys(this.noteManifest!).length} notes`);
        }
      } catch (e) {
        // Notes manifest is optional
        console.log('ℹ️ Note manifest not available');
      }
    } catch (error) {
      console.error('❌ Error loading manifests:', error);
    }
  }

  private async preloadChords(): Promise<void> {
    if (!this.chordManifest || !this.audioContext) return;

    console.log('📦 Preloading essential chord samples...');

    // Preload common chords (C, D, E, G, A, Am, Em)
    // Expanded list for better tablet performance
    const essentialChords = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Am', 'Dm', 'Em', 'Gm', 'C7', 'D7', 'G7', 'A7'];
    
    // Load chords sequentially for tablets to prevent buffer issues
    // This ensures each chord is fully loaded before starting the next
    for (const chord of essentialChords) {
      if (this.chordManifest![chord]) {
        try {
          await this.loadChordSample(chord);
          // Small delay between loads to prevent overwhelming the tablet's audio system
          await new Promise(resolve => setTimeout(resolve, 10));
        } catch (error) {
          console.warn(`⚠️ Failed to preload chord ${chord}:`, error);
        }
      }
    }

    console.log('✅ Essential chords preloaded');
  }

  private async loadChordSample(chordName: string): Promise<AudioBuffer | null> {
    if (this.chordBuffers.has(chordName)) {
      return this.chordBuffers.get(chordName)!;
    }

    if (!this.chordManifest || !this.chordManifest[chordName]) {
      console.warn(`⚠️ Chord sample not found: ${chordName}`);
      return null;
    }

    if (!this.audioContext) {
      console.error('❌ AudioContext not initialized');
      return null;
    }

    try {
      const file = this.chordManifest[chordName].file;
      const response = await fetch(`/samples/chords/${file}`);
      
      if (!response.ok) {
        console.warn(`⚠️ Failed to load chord sample: ${file}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.chordBuffers.set(chordName, audioBuffer);
      console.log(`✅ Loaded chord sample: ${chordName}`);
      
      return audioBuffer;
    } catch (error) {
      console.error(`❌ Error loading chord sample ${chordName}:`, error);
      return null;
    }
  }

  private async loadNoteSample(noteName: string): Promise<AudioBuffer | null> {
    if (this.noteBuffers.has(noteName)) {
      return this.noteBuffers.get(noteName)!;
    }

    if (!this.noteManifest || !this.noteManifest[noteName]) {
      console.warn(`⚠️ Note sample not found: ${noteName}`);
      return null;
    }

    if (!this.audioContext) {
      console.error('❌ AudioContext not initialized');
      return null;
    }

    try {
      const file = this.noteManifest[noteName].file;
      const response = await fetch(`/samples/notes/${file}`);
      
      if (!response.ok) {
        console.warn(`⚠️ Failed to load note sample: ${file}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.noteBuffers.set(noteName, audioBuffer);
      console.log(`✅ Loaded note sample: ${noteName}`);
      
      return audioBuffer;
    } catch (error) {
      console.error(`❌ Error loading note sample ${noteName}:`, error);
      return null;
    }
  }

  private playBuffer(buffer: AudioBuffer, startTime?: number, duration?: number): void {
    if (!this.audioContext || !this.gainNode) {
      console.error('❌ AudioContext not initialized');
      return;
    }

    // Resume context if suspended (critical for tablets)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(err => {
        console.error('❌ Failed to resume AudioContext:', err);
      });
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode);

    // Track active sources for cleanup
    this.activeSources.add(source);

    source.onended = () => {
      this.activeSources.delete(source);
    };

    // Use a small lookahead time for smoother playback on tablets
    // This ensures the audio system has time to prepare
    const lookaheadTime = 0.01; // 10ms lookahead
    const baseTime = this.audioContext.currentTime;
    const actualStartTime = startTime ?? (baseTime + lookaheadTime);

    try {
      source.start(actualStartTime);

      // Only stop if duration is specified AND is shorter than buffer duration
      // This prevents cutting off chords prematurely on tablets
      if (duration && duration < buffer.duration) {
        source.stop(actualStartTime + duration);
      } else {
        // Let the buffer play to completion for full chord sound
        // This is especially important for tablets where audio can be cut off
      }
    } catch (error) {
      console.error('❌ Error starting audio source:', error);
      this.activeSources.delete(source);
    }
  }

  async playChord(chordName: string, duration?: number): Promise<void> {
    console.log('🎸 GuitarSet: Playing chord:', chordName);

    const initialized = await this.initialize();
    if (!initialized) {
      console.error('❌ GuitarSetAudioService not initialized');
      return;
    }

    // Ensure AudioContext is active before playing (critical for tablets)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        // Small delay to ensure context is fully active
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        console.error('❌ Failed to resume AudioContext:', error);
      }
    }

    // Normalize chord name (handle variations)
    const normalizedChord = this.normalizeChordName(chordName);
    
    // Load sample if not already loaded (pre-loading is critical for smooth playback)
    let buffer = await this.loadChordSample(normalizedChord);
    
    if (!buffer) {
      console.warn(`⚠️ Chord sample not available: ${normalizedChord}, trying fallback...`);
      // Try without suffix (e.g., "C" instead of "Cmaj")
      const root = normalizedChord.replace(/[m7#b]/g, '');
      buffer = await this.loadChordSample(root);
      
      if (!buffer) {
        console.error(`❌ No sample available for chord: ${chordName}`);
        return;
      }
    }

    // For tablets: Don't limit duration, let the full chord play
    // This prevents "choppy" sound from premature stopping
    const fullDuration = duration || buffer.duration;
    
    // Play the buffer with full duration to prevent cutting off
    this.playBuffer(buffer, undefined, fullDuration);
    console.log('✅ Chord played:', normalizedChord, 'duration:', fullDuration.toFixed(2), 's');
  }

  async playChordStrummed(chordName: string, duration?: number): Promise<void> {
    // For strummed, we play the same sample but can add slight delay between strings
    // For now, just play normally (the samples are already strummed)
    await this.playChord(chordName, duration);
  }

  async playScale(scaleName: string, root: string, intervals: number[], duration: number = 0.5): Promise<void> {
    console.log('🎵 GuitarSet: Playing scale:', scaleName, 'from', root);

    const initialized = await this.initialize();
    if (!initialized) {
      console.error('❌ GuitarSetAudioService not initialized');
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
    const startTime = this.audioContext!.currentTime;
    
    for (let i = 0; i < scaleNotes.length; i++) {
      const noteName = scaleNotes[i];
      const noteWithOctave = noteName + '4'; // Use octave 4 for consistency
      
      // Try to load note sample
      let buffer = await this.loadNoteSample(noteWithOctave);
      
      if (!buffer) {
        // Fallback: try without octave
        buffer = await this.loadNoteSample(noteName);
      }

      if (buffer) {
        const noteStartTime = startTime + (i * duration);
        this.playBuffer(buffer, noteStartTime, duration);
      } else {
        console.warn(`⚠️ Note sample not available: ${noteWithOctave}`);
      }
    }

    console.log('✅ Scale played:', scaleNotes.length, 'notes');
  }

  async playNote(note: string, duration?: number): Promise<void> {
    console.log('🎵 GuitarSet: Playing note:', note);

    const initialized = await this.initialize();
    if (!initialized) {
      console.error('❌ GuitarSetAudioService not initialized');
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
      console.warn(`⚠️ Note sample not available: ${note}`);
      return;
    }

    this.playBuffer(buffer, undefined, duration);
    console.log('✅ Note played:', note);
  }

  private normalizeChordName(chordName: string): string {
    // Parse chord name (e.g., "C", "Am", "G7", "C#m")
    const match = chordName.match(/^([A-G][#b]?)(.*)/);
    if (!match) {
      return chordName;
    }

    const root = match[1];
    let suffix = match[2] || '';

    // Normalize suffix
    if (suffix === 'm' || suffix === 'min') {
      suffix = 'm';
    } else if (suffix === '7') {
      suffix = '7';
    } else if (suffix === '' || suffix === 'maj' || suffix === 'major') {
      suffix = ''; // Major chord has no suffix in our naming
    }

    return root + suffix;
  }

  async setInstrument(instrument: InstrumentType): Promise<void> {
    // GuitarSet samples are always guitar, so this is a no-op
    // But we keep the interface for compatibility
    console.log('ℹ️ GuitarSet samples are always guitar, ignoring instrument change:', instrument);
  }

  getInstrument(): InstrumentType {
    return 'nylon-guitar'; // GuitarSet samples are guitar
  }

  stopAll(): void {
    console.log('🛑 Stopping all GuitarSet audio...');
    
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
    // Could be added with BiquadFilterNode if needed
    console.log('ℹ️ EQ not available for GuitarSet samples');
  }

  async dispose(): Promise<void> {
    console.log('🗑️ Disposing GuitarSetAudioService...');
    
    this.stopAll();
    
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.chordBuffers.clear();
    this.noteBuffers.clear();
    this.isInitialized = false;
    
    console.log('✅ GuitarSetAudioService disposed');
  }
}

export const guitarSetAudioService = new GuitarSetAudioService();
