import { audioService } from './AudioService';
import { audioServiceWithSamples } from './AudioServiceWithSamples';
import { guitarSetAudioService } from './GuitarSetAudioService';
import { philharmoniaAudioService } from './PhilharmoniaAudioService';
import { useAudioSettingsStore } from '@/stores/useAudioSettingsStore';
import type { InstrumentType } from './AudioServiceWithSamples';
import type { AudioEngineType } from '@/stores/useAudioSettingsStore';

/**
 * Advanced Audio Manager
 * Exclusive service management to prevent conflicts and ensure perfect audio
 * Optimized for mobile devices and PWA environments
 */
class AudioManager {
  private activeService: any = null;
  private currentEngine: AudioEngineType = 'synthesis';
  private isInitialized = false;
  private initializationPromise: Promise<boolean> | null = null;
  private subscribers: Set<(status: any) => void> = new Set();
  private isMobileDevice = false;
  private isMobile = false;
  private isTablet = false;
  private audioContextState: AudioContextState = 'suspended';
  private lastAudioTime = 0;
  private mobileOptimizations = false;

  constructor() {
    // Detect mobile device for optimizations
    this.detectMobileDevice();

    // Apply mobile-specific optimizations if needed
    if (this.isMobile || this.isTablet) {
      this.applyMobileOptimizations();
    }

    // Listen to store changes to auto-switch engines
    useAudioSettingsStore.subscribe((state) => {
      if (state.audioEngine !== this.currentEngine) {
        console.log('🎵 Audio engine changed from', this.currentEngine, 'to', state.audioEngine);
        this.switchEngine(state.currentEngine);
      }
    });

    // Mobile-specific event listeners
    if (typeof document !== 'undefined') {
      // Listen to visibility changes (important for mobile PWA)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          console.log('📱 App hidden, pausing audio context');
          this.handleVisibilityChange(true);
        } else {
          console.log('📱 App visible, resuming audio context');
          this.handleVisibilityChange(false);
        }
      });

      // Handle page unload (prevent audio issues)
      window.addEventListener('beforeunload', () => {
        this.emergencyCleanup();
      });

      // Mobile: Handle app going to background/foreground
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // App going to background
          this.handleAppBackground();
        } else {
          // App coming to foreground
          this.handleAppForeground();
        }
      });
    }
  }

  /**
   * Handle app going to background (mobile optimization)
   */
  private handleAppBackground(): void {
    if (this.mobileOptimizations) {
      console.log('📱 App going to background, suspending audio');
      this.stopAll();
      this.audioContextState = 'suspended';
    }
  }

  /**
   * Handle app coming to foreground (mobile optimization)
   */
  private async handleAppForeground(): Promise<void> {
    if (this.mobileOptimizations) {
      console.log('📱 App coming to foreground, resuming audio');
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      await this.ensureAudioContext();
    }
  }

  /**
   * Detect mobile devices for specific optimizations
   */
  private detectMobileDevice(): void {
    if (typeof navigator === 'undefined') return;

    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 768;
    const isTabletUA = /ipad|android(?!.*mobile)/i.test(userAgent);

    this.isMobile = isMobileUA && !isTabletUA;
    this.isTablet = isTabletUA || (isMobileUA && window.innerWidth > 768 && window.innerHeight > 1024);
    this.isMobileDevice = this.isMobile || this.isTablet;

    if (this.isMobileDevice) {
      console.log('📱 Mobile/tablet device detected:', {
        isMobile: this.isMobile,
        isTablet: this.isTablet,
        userAgent: userAgent.substring(0, 50) + '...',
        screenSize: `${window.innerWidth}x${window.innerHeight}`
      });

      this.mobileOptimizations = true;

      // Force synthesis engine on mobile/tablet for better performance and compatibility
      const settings = useAudioSettingsStore.getState();
      if (settings.audioEngine !== 'synthesis') {
        console.log('📱 Forcing synthesis engine on mobile/tablet for better performance');
        // Don't change store directly, let the subscription handle it
      }
    } else {
      console.log('🖥️ Desktop device detected');
    }
  }

  /**
   * Apply mobile-specific audio optimizations
   */
  private applyMobileOptimizations(): void {
    console.log('⚡ Applying mobile audio optimizations...');

    // These optimizations will be applied during audio service initialization
    this.mobileOptimizationsConfig = {
      // Reduce reverb for better performance
      reverbWet: 0.1, // Instead of 0.3
      reverbDecay: 1.0, // Instead of 2.5

      // Reduce chorus intensity
      chorusWet: 0.1, // Instead of 0.2
      chorusDepth: 0.3, // Instead of 0.7

      // Shorter note durations for mobile
      defaultNoteDuration: 0.4, // Instead of 0.5-0.6

      // Smaller audio buffers for lower latency
      useSmallerBuffers: true,

      // Disable complex effects on very low-end devices
      disableEffectsOnLowEnd: true
    };

    console.log('✅ Mobile optimizations configured:', this.mobileOptimizationsConfig);
  }

  /**
   * Handle app visibility changes (crucial for mobile PWA)
   */
  private async handleVisibilityChange(hidden: boolean): Promise<void> {
    if (!this.activeService) return;

    try {
      if (hidden) {
        // App going to background - suspend audio context
        if (this.currentEngine === 'samples' && this.activeService.audioContext) {
          await this.activeService.audioContext.suspend();
          this.audioContextState = 'suspended';
        }
      } else {
        // App coming to foreground - resume audio context
        if (this.currentEngine === 'samples' && this.activeService.audioContext) {
          await this.activeService.audioContext.resume();
          this.audioContextState = 'running';
        }

        // Ensure audio is still working after resume
        await this.ensureAudioContext();
      }
    } catch (error) {
      console.warn('⚠️ Error handling visibility change:', error);
    }
  }

  /**
   * Emergency cleanup on page unload
   */
  private emergencyCleanup(): void {
    try {
      this.stopAll();
      if (this.activeService && this.activeService.dispose) {
        this.activeService.dispose();
      }
    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error);
    }
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
      console.log('🎵 Initializing AudioManager...', this.mobileOptimizations ? '(Mobile Mode)' : '(Desktop Mode)');

      // Get initial settings
      const { audioEngine, instrument } = useAudioSettingsStore.getState();

      // Mobile-specific: Force synthesis for better performance
      const actualEngine = this.mobileOptimizations ? 'synthesis' : audioEngine;

      if (this.mobileOptimizations && audioEngine !== 'synthesis') {
        console.log('📱 Mobile: Forcing synthesis engine for better performance');
      }

      // Force initial engine switch to ensure clean state
      const success = await this.switchEngine(actualEngine);

      if (success) {
        // Set initial instrument
        await this.setInstrument(instrument);

        // Mobile-specific: Ensure audio context is ready
        if (this.mobileOptimizations) {
          await this.ensureAudioContext();
        }

        console.log('✅ AudioManager initialized successfully with', actualEngine, 'engine');
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
   * Ensure audio context is running (crucial for mobile and tablets)
   */
  private async ensureAudioContext(): Promise<void> {
    if (!this.activeService) return;

    try {
      // Check for AudioContext in different service types
      let audioContext: AudioContext | null = null;
      
      if (this.activeService.audioContext) {
        audioContext = this.activeService.audioContext;
      } else if (this.currentEngine === 'guitarset' && (this.activeService as any).audioContext) {
        audioContext = (this.activeService as any).audioContext;
      } else if (this.currentEngine === 'philharmonia' && (this.activeService as any).audioContext) {
        audioContext = (this.activeService as any).audioContext;
      }

      if (audioContext) {
        if (audioContext.state === 'suspended') {
          console.log(`📱 ${this.isTablet ? 'Tablet' : 'Mobile'}: Resuming suspended AudioContext...`);
          await audioContext.resume();
          this.audioContextState = 'running';
          console.log('✅ Audio context resumed, state:', audioContext.state);
          
          // Additional delay for tablets to ensure context is fully ready
          if (this.isTablet) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        } else if (audioContext.state === 'running') {
          this.audioContextState = 'running';
        }

        // Test audio context with a brief tone (helps with mobile/tablet audio issues)
        if ((this.mobileOptimizations || this.isTablet) && audioContext.state === 'running') {
          // Skip test for tablets to avoid unnecessary delay
          if (!this.isTablet) {
            await this.testAudioContext();
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Audio context ensure failed:', error);
    }
  }

  /**
   * Test audio context with a very brief inaudible tone (helps mobile)
   */
  private async testAudioContext(): Promise<void> {
    try {
      // Create a very brief, inaudible test tone
      const testNote = 'C4';
      const testDuration = 0.001; // 1ms - inaudible but tests the context

      await this.playNote(testNote, testDuration);
      console.log('🔊 Audio context test successful');
    } catch (error) {
      console.warn('⚠️ Audio context test failed:', error);
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

      if (engine === 'guitarset') {
        console.log('🎸 Creating GuitarSet samples service...');
        this.activeService = guitarSetAudioService;
      } else if (engine === 'philharmonia') {
        console.log('🎼 Creating Philharmonia Orchestra service...');
        this.activeService = philharmoniaAudioService;
      } else if (engine === 'samples') {
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

    console.log('🎸 Setting instrument to:', instrument, 'on engine:', this.currentEngine);

    try {
      // Map InstrumentType to PhilharmoniaInstrument if using philharmonia engine
      if (this.currentEngine === 'philharmonia') {
        const philharmoniaInstrument = this.mapToPhilharmoniaInstrument(instrument);
        await philharmoniaAudioService.setInstrument(philharmoniaInstrument);
      } else {
        await this.activeService.setInstrument(instrument);
      }
      console.log('✅ Instrument set successfully');
    } catch (error) {
      console.error('❌ Error setting instrument:', error);
      throw error;
    }
  }

  /**
   * Map InstrumentType to PhilharmoniaInstrument
   */
  private mapToPhilharmoniaInstrument(instrument: InstrumentType): string {
    const mapping: Record<string, string> = {
      'violin': 'violin',
      'viola': 'viola',
      'cello': 'cello',
      'double-bass': 'double_bass',
      'flute': 'flute',
      'oboe': 'oboe',
      'clarinet': 'clarinet',
      'saxophone': 'saxophone',
      'trumpet': 'trumpet',
      'french-horn': 'french_horn',
      'trombone': 'trombone',
      'guitar': 'guitar',
      'mandolin': 'mandolin',
      'banjo': 'banjo',
      // Fallbacks
      'nylon-guitar': 'guitar',
      'steel-guitar': 'guitar',
      'piano': 'violin', // Piano not available, fallback to violin
    };
    
    return mapping[instrument] || 'violin';
  }

  /**
   * Play chord with exclusive service usage and tablet/mobile optimizations
   */
  async playChord(chordName: string, duration?: number): Promise<void> {
    if (!this.activeService) {
      throw new Error('Audio service not initialized');
    }

    // Tablet/Mobile optimization: Check timing to prevent overlaps
    // Increased delay for tablets to ensure smooth playback
    const now = Date.now();
    const minDelay = this.isTablet ? 200 : 100; // Longer delay for tablets
    if (this.mobileOptimizations && (now - this.lastAudioTime) < minDelay) {
      const delayTime = this.isTablet ? 250 : 150;
      console.log(`📱 ${this.isTablet ? 'Tablet' : 'Mobile'}: Delaying chord play to prevent overlap`);
      await new Promise(resolve => setTimeout(resolve, delayTime));
    }

    console.log('🎸 Playing chord:', chordName, 'with', this.currentEngine, 'engine', this.isTablet ? '(Tablet)' : this.mobileOptimizations ? '(Mobile)' : '');

    try {
      // Ensure audio context is active (critical for tablets)
      if (this.mobileOptimizations || this.isTablet) {
        await this.ensureAudioContext();
        // Additional small delay for tablets to ensure context is ready
        if (this.isTablet) {
          await new Promise(resolve => setTimeout(resolve, 20));
        }
      }

      // For tablets, don't limit duration - let chords play fully
      const actualDuration = this.isTablet ? undefined : duration;
      
      await this.activeService.playChord(chordName, actualDuration);
      this.lastAudioTime = Date.now();

      console.log('✅ Chord played successfully');
    } catch (error) {
      console.error('❌ Error playing chord:', error);

      // Tablet/Mobile fallback: Try to reinitialize and retry once
      if ((this.mobileOptimizations || this.isTablet) && !error.message.includes('not initialized')) {
        console.log(`📱 ${this.isTablet ? 'Tablet' : 'Mobile'}: Attempting recovery...`);
        try {
          await this.reinitialize();
          const retryDelay = this.isTablet ? 300 : 200;
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          const actualDuration = this.isTablet ? undefined : duration;
          await this.activeService.playChord(chordName, actualDuration);
          console.log('✅ Chord recovered successfully');
          return;
        } catch (retryError) {
          console.error('❌ Recovery failed:', retryError);
        }
      }

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

    // Mobile optimization: Adjust timing for better performance
    const actualDuration = this.mobileOptimizations ? Math.max(duration, 0.3) : duration;

    console.log('🎵 Playing scale:', scaleName, 'from', root, 'intervals:', intervals, this.mobileOptimizations ? '(Mobile)' : '');

    try {
      // Mobile: Ensure audio context before playing
      if (this.mobileOptimizations) {
        await this.ensureAudioContext();
      }

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
      await this.activeService.playScale(scaleName, root, intervals, actualDuration);
      this.lastAudioTime = Date.now();

      console.log('✅ Scale played successfully');

    } catch (error) {
      console.error('❌ Error playing scale:', error);

      // Mobile fallback: Try with simplified approach
      if (this.mobileOptimizations) {
        console.log('📱 Mobile: Attempting simplified scale playback...');
        try {
          // Play individual notes with delays to prevent overlap
          for (let i = 0; i < Math.min(intervals.length, 5); i++) { // Limit to 5 notes for mobile
            const noteIndex = (NOTES.indexOf(root.toUpperCase()) + intervals[i]) % 12;
            const note = NOTES[noteIndex] + '4';
            await this.playNote(note, actualDuration);
            await new Promise(resolve => setTimeout(resolve, 200)); // Longer delay for mobile
          }
          console.log('✅ Simplified scale playback successful');
          return;
        } catch (fallbackError) {
          console.error('❌ Simplified playback also failed:', fallbackError);
        }
      }

      throw error;
    }
  }

  /**
   * Play single note - FIXED VERSION
   */
  async playNote(note: string, duration?: number): Promise<void> {
    if (!this.activeService) {
      // Try to initialize if not already
      await this.initialize();
      if (!this.activeService) {
        throw new Error('Audio service not initialized');
      }
    }

    // Ensure note has octave (default to 4 if not specified)
    let noteWithOctave = note;
    if (!/\d/.test(note)) {
      noteWithOctave = note + '4';
    }

    console.log('🎵 Playing note:', noteWithOctave);

    try {
      // Mobile optimization: Ensure audio context
      if (this.mobileOptimizations) {
        await this.ensureAudioContext();
      }

      // Use the active service's playNote method directly
      if (this.activeService.playNote) {
        await this.activeService.playNote(noteWithOctave, duration || 0.5);
        this.lastAudioTime = Date.now();
        console.log('✅ Note played successfully');
      } else {
        // Fallback: Use playScale with single note
        const rootNote = note.replace(/\d+$/, '');
        await this.playScale(note, rootNote, [0], duration || 0.5);
        console.log('✅ Note played via scale fallback');
      }
    } catch (error) {
      console.error('❌ Error playing note:', error);
      
      // Mobile fallback: Try to reinitialize and retry
      if (this.mobileOptimizations) {
        console.log('📱 Mobile: Attempting recovery...');
        try {
          await this.reinitialize();
          await new Promise(resolve => setTimeout(resolve, 200));
          if (this.activeService?.playNote) {
            await this.activeService.playNote(noteWithOctave, duration || 0.5);
            console.log('✅ Note recovered successfully');
            return;
          }
        } catch (retryError) {
          console.error('❌ Recovery failed:', retryError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Stop all audio immediately with mobile optimizations
   */
  stopAll(): void {
    console.log('🛑 Stopping all audio...', this.mobileOptimizations ? '(Mobile)' : '');

    try {
      // Stop active service
      if (this.activeService && this.activeService.stopAll) {
        this.activeService.stopAll();
      }

      // Safety fallback - try to stop all services
      if (audioService.stopAll) audioService.stopAll();
      if (audioServiceWithSamples.stopAll) audioServiceWithSamples.stopAll();
      if (guitarSetAudioService.stopAll) guitarSetAudioService.stopAll();
      if (philharmoniaAudioService.stopAll) philharmoniaAudioService.stopAll();

      // Mobile-specific: Reset audio context state
      if (this.mobileOptimizations) {
        this.audioContextState = 'suspended';
        this.lastAudioTime = 0;
      }

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
      await guitarSetAudioService.dispose();
      await philharmoniaAudioService.dispose();

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
