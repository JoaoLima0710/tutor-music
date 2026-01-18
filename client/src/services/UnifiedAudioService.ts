import { audioService } from './AudioService';
import { audioServiceWithSamples } from './AudioServiceWithSamples';
import { useAudioSettingsStore } from '@/stores/useAudioSettingsStore';
import type { InstrumentType, AudioEngineType } from './AudioServiceWithSamples';

/**
 * Advanced Audio Manager
 * Exclusive service management to prevent conflicts and ensure perfect audio
 */
class AudioManager {
  private activeService: any = null;
  private currentEngine: AudioEngineType = 'synthesis';
  private isInitialized = false;
  private initializationPromise: Promise<boolean> | null = null;
  private subscribers: Set<(status: any) => void> = new Set();

  constructor() {
    // Listen to store changes to auto-switch engines
    useAudioSettingsStore.subscribe((state) => {
      if (state.audioEngine !== this.currentEngine) {
        console.log('🎵 Audio engine changed from', this.currentEngine, 'to', state.audioEngine);
        this.switchEngine(state.currentEngine);
      }
    });
  }

  /**
   * Subscribe to audio manager status changes
   */
  subscribe(callback: (status: any) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify all subscribers of status changes
   */
  private notifySubscribers() {
    const status = this.getStatus();
    this.subscribers.forEach(callback => callback(status));
  }

  /**
   * Initialize the audio system with exclusive service management
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('✅ AudioManager already initialized');
      return true;
    }

    if (this.initializationPromise) {
      console.log('⏳ AudioManager initialization in progress...');
      return this.initializationPromise;
    }

    this.initializationPromise = this._initializeInternal();

    try {
      const result = await this.initializationPromise;
      this.isInitialized = result;
      this.notifySubscribers();
      return result;
    } finally {
      this.initializationPromise = null;
    }
  }

  private async _initializeInternal(): Promise<boolean> {
    try {
      console.log('🎵 Initializing AudioManager...');

      // Get initial settings
      const { audioEngine, instrument } = useAudioSettingsStore.getState();

      // Force initial engine switch to ensure clean state
      const success = await this.switchEngine(audioEngine);

      if (success) {
        // Set initial instrument
        await this.setInstrument(instrument);
        console.log('✅ AudioManager initialized successfully with', audioEngine, 'engine');
      } else {
        console.error('❌ AudioManager initialization failed');
      }

      return success;
    } catch (error) {
      console.error('❌ AudioManager initialization error:', error);
      return false;
    }
  }

  /**
   * Switch between audio engines exclusively - THE KEY FIX
   */
  async switchEngine(engine: AudioEngineType): Promise<boolean> {
    try {
      console.log('🔄 Switching audio engine to:', engine);

      // CRITICAL: Dispose previous service COMPLETELY
      if (this.activeService) {
        console.log('🗑️ Disposing previous service...');
        try {
          await this.activeService.dispose();
        } catch (e) {
          console.warn('Warning during disposal:', e);
        }
        this.activeService = null;
      }

      // Wait a bit to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create new service
      this.currentEngine = engine;

      if (engine === 'samples') {
        console.log('🎼 Creating Soundfont service...');
        this.activeService = audioServiceWithSamples;
      } else {
        console.log('🎹 Creating Synthesis service...');
        this.activeService = audioService;
      }

      // Initialize new service
      const success = await this.activeService.initialize();

      if (success) {
        console.log('✅ Audio engine switched successfully to:', engine);
        this.notifySubscribers();
      } else {
        console.error('❌ Failed to initialize new audio engine');
        this.activeService = null;
      }

      return success;
    } catch (error) {
      console.error('❌ Error switching audio engine:', error);
      this.activeService = null;
      return false;
    }
  }

  /**
   * Get current instrument
   */
  getInstrument(): InstrumentType {
    if (!this.activeService) {
      console.warn('⚠️ No active service, returning default instrument');
      return useAudioSettingsStore.getState().instrument;
    }
    try {
      return this.activeService.getInstrument();
    } catch (error) {
      console.error('❌ Error getting instrument:', error);
      return 'nylon-guitar';
    }
  }

  /**
   * Set instrument with proper validation
   */
  async setInstrument(instrument: InstrumentType): Promise<void> {
    if (!this.activeService) {
      throw new Error('Audio service not initialized - call initialize() first');
    }

    console.log('🎸 Setting instrument to:', instrument);

    try {
      await this.activeService.setInstrument(instrument);
      console.log('✅ Instrument set successfully');
    } catch (error) {
      console.error('❌ Error setting instrument:', error);
      throw error;
    }
  }

  /**
   * Play chord with exclusive service usage
   */
  async playChord(chordName: string, duration?: number): Promise<void> {
    if (!this.activeService) {
      throw new Error('Audio service not initialized');
    }

    console.log('🎸 Playing chord:', chordName, 'with', this.currentEngine, 'engine');

    try {
      await this.activeService.playChord(chordName, duration);
      console.log('✅ Chord played successfully');
    } catch (error) {
      console.error('❌ Error playing chord:', error);
      throw error;
    }
  }

  /**
   * Play strummed chord
   */
  async playChordStrummed(chordName: string, duration?: number): Promise<void> {
    if (!this.activeService) {
      throw new Error('Audio service not initialized');
    }

    if (!this.activeService.playChordStrummed) {
      console.log('ℹ️ Strummed chords not available for', this.currentEngine, 'engine, using regular chord');
      return this.playChord(chordName, duration);
    }

    console.log('🎸 Playing strummed chord:', chordName);

    try {
      await this.activeService.playChordStrummed(chordName, duration);
      console.log('✅ Strummed chord played successfully');
    } catch (error) {
      console.error('❌ Error playing strummed chord:', error);
      throw error;
    }
  }

  /**
   * Play scale with intelligent note mapping - THE SCALE FIX
   */
  async playScale(scaleName: string, root: string, intervals: number[], duration: number = 0.5): Promise<void> {
    if (!this.activeService) {
      throw new Error('Audio service not initialized');
    }

    console.log('🎵 Playing scale:', scaleName, 'from', root, 'intervals:', intervals);

    try {
      // Generate proper scale notes from intervals
      const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const rootIndex = NOTES.indexOf(root.toUpperCase());

      if (rootIndex === -1) {
        throw new Error(`Invalid root note: ${root}`);
      }

      // Convert intervals to actual notes
      const scaleNotes = intervals.map(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        return NOTES[noteIndex] + '4'; // Octave 4 for consistency
      });

      // Add octave return note
      scaleNotes.push(root.toUpperCase() + '5');

      console.log('🎼 Generated scale notes:', scaleNotes);

      // Use the active service's native playScale method
      await this.activeService.playScale(scaleName, root, intervals, duration);
      console.log('✅ Scale played successfully');

    } catch (error) {
      console.error('❌ Error playing scale:', error);
      throw error;
    }
  }

  /**
   * Play single note
   */
  async playNote(note: string, duration?: number): Promise<void> {
    if (!this.activeService) {
      throw new Error('Audio service not initialized');
    }

    console.log('🎵 Playing note:', note);

    try {
      // Use scale method with single note interval
      await this.playScale(note, note, [0], duration || 0.5);
      console.log('✅ Note played successfully');
    } catch (error) {
      console.error('❌ Error playing note:', error);
      throw error;
    }
  }

  /**
   * Stop all audio immediately
   */
  stopAll(): void {
    console.log('🛑 Stopping all audio...');

    try {
      // Stop active service
      if (this.activeService && this.activeService.stopAll) {
        this.activeService.stopAll();
      }

      // Safety fallback - try to stop both services
      if (audioService.stopAll) audioService.stopAll();
      if (audioServiceWithSamples.stopAll) audioServiceWithSamples.stopAll();

      console.log('✅ All audio stopped');
    } catch (error) {
      console.error('❌ Error stopping audio:', error);
    }
  }

  /**
   * Set EQ (only works with synthesis engine)
   */
  setEQ(bassGain: number, midGain: number, trebleGain: number): void {
    console.log('🎛️ Setting EQ:', { bassGain, midGain, trebleGain });

    try {
      if (this.activeService && this.activeService.setEQ) {
        this.activeService.setEQ(bassGain, midGain, trebleGain);
      } else if (this.currentEngine === 'synthesis') {
        // Fallback for synthesis engine
        audioService.setEQ(bassGain, midGain, trebleGain);
      }
    } catch (error) {
      console.error('❌ Error setting EQ:', error);
    }
  }

  /**
   * Dispose all resources completely
   */
  async dispose(): Promise<void> {
    console.log('🗑️ Disposing AudioManager...');

    try {
      if (this.activeService) {
        await this.activeService.dispose();
        this.activeService = null;
      }

      // Safety cleanup
      await audioService.dispose();
      await audioServiceWithSamples.dispose();

      this.isInitialized = false;
      this.notifySubscribers();

      console.log('✅ AudioManager disposed successfully');
    } catch (error) {
      console.error('❌ Error disposing AudioManager:', error);
    }
  }

  /**
   * Get comprehensive status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      currentEngine: this.currentEngine,
      hasActiveService: !!this.activeService,
      serviceType: this.activeService?.constructor?.name || 'None',
      subscribersCount: this.subscribers.size,
      timestamp: Date.now()
    };
  }

  /**
   * Force reinitialize (for recovery)
   */
  async reinitialize(): Promise<boolean> {
    console.log('🔄 Force reinitializing AudioManager...');

    await this.dispose();
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for cleanup

    return this.initialize();
  }
}

// Export singleton instance
export const audioManager = new AudioManager();

// Legacy compatibility layer - redirects to new manager
export const unifiedAudioService = {
  initialize: () => audioManager.initialize(),
  setInstrument: (instrument: InstrumentType) => audioManager.setInstrument(instrument),
  getInstrument: () => audioManager.getInstrument(),
  playChord: (chordName: string, duration?: number) => audioManager.playChord(chordName, duration),
  playChordStrummed: (chordName: string, duration?: number) => audioManager.playChordStrummed(chordName, duration),
  playScale: (scaleName: string, root: string, intervals: number[], duration?: number) => audioManager.playScale(scaleName, root, intervals, duration),
  playNote: (note: string, duration?: number) => audioManager.playNote(note, duration),
  stopAll: () => audioManager.stopAll(),
  setEQ: (bassGain: number, midGain: number, trebleGain: number) => audioManager.setEQ(bassGain, midGain, trebleGain),
  dispose: () => audioManager.dispose(),

  // Additional methods for compatibility
  getStatus: () => audioManager.getStatus(),
  reinitialize: () => audioManager.reinitialize()
};
