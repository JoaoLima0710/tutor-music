// Pitch detection using autocorrelation algorithm
export interface PitchDetectionResult {
  frequency: number;
  note: string;
  octave: number;
  cents: number; // Deviation from perfect pitch (-50 to +50)
  clarity: number; // Confidence level (0-1)
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

class PitchDetectionService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private dataArray: Float32Array | null = null;
  private bufferLength = 0;
  private isRunning = false;
  private animationFrameId: number | null = null;
  private onPitchDetectedCallback: ((result: PitchDetectionResult | null) => void) | null = null;
  
  async initialize(): Promise<boolean> {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        },
      });
      
      // Create audio context
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Create analyser
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 4096; // Higher FFT size for better low-frequency resolution
      this.analyser.smoothingTimeConstant = 0.8;
      
      this.bufferLength = this.analyser.fftSize;
      this.dataArray = new Float32Array(this.bufferLength);
      
      // Connect nodes
      source.connect(this.analyser);
      
      console.log('PitchDetectionService initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize pitch detection:', error);
      return false;
    }
  }
  
  start(callback: (result: PitchDetectionResult | null) => void) {
    if (!this.analyser || !this.dataArray) {
      console.error('Pitch detection not initialized');
      return;
    }
    
    this.isRunning = true;
    this.onPitchDetectedCallback = callback;
    this.detectPitch();
  }
  
  stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  private detectPitch() {
    if (!this.isRunning || !this.analyser || !this.dataArray || !this.audioContext) {
      return;
    }
    
    this.analyser.getFloatTimeDomainData(this.dataArray);
    
    const result = this.autoCorrelate(this.dataArray, this.audioContext.sampleRate);
    
    if (this.onPitchDetectedCallback) {
      this.onPitchDetectedCallback(result);
    }
    
    this.animationFrameId = requestAnimationFrame(() => this.detectPitch());
  }
  
  private autoCorrelate(buffer: Float32Array, sampleRate: number): PitchDetectionResult | null {
    // Find the RMS (Root Mean Square) to detect silence
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);
    
    // If too quiet, return null
    if (rms < 0.01) {
      return null;
    }
    
    // Autocorrelation
    const SIZE = buffer.length;
    const MAX_SAMPLES = Math.floor(SIZE / 2);
    let best_offset = -1;
    let best_correlation = 0;
    let rms_sum = 0;
    let foundGoodCorrelation = false;
    
    // Calculate RMS
    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      rms_sum += val * val;
    }
    rms_sum = Math.sqrt(rms_sum / SIZE);
    
    if (rms_sum < 0.01) return null; // Not enough signal
    
    // Find the best correlation
    let lastCorrelation = 1;
    for (let offset = 1; offset < MAX_SAMPLES; offset++) {
      let correlation = 0;
      
      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs(buffer[i] - buffer[i + offset]);
      }
      
      correlation = 1 - correlation / MAX_SAMPLES;
      
      if (correlation > 0.9 && correlation > lastCorrelation) {
        foundGoodCorrelation = true;
        if (correlation > best_correlation) {
          best_correlation = correlation;
          best_offset = offset;
        }
      }
      
      lastCorrelation = correlation;
    }
    
    if (!foundGoodCorrelation || best_offset === -1) {
      return null;
    }
    
    // Refine the offset using parabolic interpolation
    const x1 = best_offset - 1;
    const x2 = best_offset;
    const x3 = best_offset + 1;
    
    if (x1 >= 0 && x3 < MAX_SAMPLES) {
      let y1 = 0, y2 = 0, y3 = 0;
      
      for (let i = 0; i < MAX_SAMPLES; i++) {
        y1 += Math.abs(buffer[i] - buffer[i + x1]);
        y2 += Math.abs(buffer[i] - buffer[i + x2]);
        y3 += Math.abs(buffer[i] - buffer[i + x3]);
      }
      
      y1 = 1 - y1 / MAX_SAMPLES;
      y2 = 1 - y2 / MAX_SAMPLES;
      y3 = 1 - y3 / MAX_SAMPLES;
      
      const a = (y1 + y3 - 2 * y2) / 2;
      const b = (y3 - y1) / 2;
      
      if (a !== 0) {
        const peak = -b / (2 * a);
        best_offset = x2 + peak;
      }
    }
    
    const frequency = sampleRate / best_offset;
    
    // Convert frequency to note
    const noteInfo = this.frequencyToNote(frequency);
    
    return {
      frequency,
      note: noteInfo.note,
      octave: noteInfo.octave,
      cents: noteInfo.cents,
      clarity: best_correlation,
    };
  }
  
  private frequencyToNote(frequency: number): { note: string; octave: number; cents: number } {
    // A4 = 440 Hz
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75); // C0 frequency
    
    const halfSteps = 12 * Math.log2(frequency / C0);
    const noteIndex = Math.round(halfSteps) % 12;
    const octave = Math.floor(Math.round(halfSteps) / 12);
    
    // Calculate cents deviation
    const exactHalfSteps = 12 * Math.log2(frequency / C0);
    const cents = Math.round((exactHalfSteps - Math.round(halfSteps)) * 100);
    
    return {
      note: NOTE_NAMES[noteIndex],
      octave,
      cents,
    };
  }
  
  // Check if detected note matches target note
  isNoteMatch(detected: PitchDetectionResult, targetNote: string, tolerance: number = 50): boolean {
    // Extract note name without octave
    const detectedNote = detected.note;
    const targetNoteClean = targetNote.replace(/[0-9]/g, '');
    
    // Check if notes match
    if (detectedNote !== targetNoteClean) {
      return false;
    }
    
    // Check if cents deviation is within tolerance
    return Math.abs(detected.cents) <= tolerance;
  }
  
  // Get all notes in a chord
  getChordNotes(chordName: string): string[] {
    const chordRoot = chordName.replace(/[^A-G#]/g, '');
    const chordType = chordName.replace(/^[A-G#]+/, '');
    
    const rootIndex = NOTE_NAMES.indexOf(chordRoot);
    if (rootIndex === -1) return [];
    
    // Define chord intervals (semitones from root)
    const intervals: Record<string, number[]> = {
      '': [0, 4, 7], // Major
      'm': [0, 3, 7], // Minor
      '7': [0, 4, 7, 10], // Dominant 7th
      'M7': [0, 4, 7, 11], // Major 7th
      'm7': [0, 3, 7, 10], // Minor 7th
      'dim': [0, 3, 6], // Diminished
      'aug': [0, 4, 8], // Augmented
      'sus4': [0, 5, 7], // Suspended 4th
      'sus2': [0, 2, 7], // Suspended 2nd
    };
    
    const chordIntervals = intervals[chordType] || intervals[''];
    
    return chordIntervals.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return NOTE_NAMES[noteIndex];
    });
  }
  
  dispose() {
    this.stop();
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.dataArray = null;
  }
}

// Singleton instance
export const pitchDetectionService = new PitchDetectionService();
