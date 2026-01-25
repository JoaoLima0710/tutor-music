import * as Tone from 'tone';

// Array de notas
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Mapeamento de notas para frequências
const NOTE_FREQUENCIES: Record<string, number> = {
  'C': 261.63,
  'C#': 277.18,
  'Db': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'Eb': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'Gb': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'Ab': 415.30,
  'A': 440.00,
  'A#': 466.16,
  'Bb': 466.16,
  'B': 493.88,
};

// Acordes e suas notas (intervalos em semitons a partir da fundamental)
const CHORD_INTERVALS: Record<string, number[]> = {
  'major': [0, 4, 7],
  'minor': [0, 3, 7],
  '7': [0, 4, 7, 10],
  'm7': [0, 3, 7, 10],
  'maj7': [0, 4, 7, 11],
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  'dim': [0, 3, 6],
  'aug': [0, 4, 8],
  '6': [0, 4, 7, 9],
  'm6': [0, 3, 7, 9],
  '9': [0, 4, 7, 10, 14],
  'add9': [0, 4, 7, 14],
};

export type InstrumentType = 'nylon-guitar' | 'steel-guitar' | 'piano';

class AudioService {
  private synth: Tone.PolySynth | null = null;
  private reverb: Tone.Reverb | null = null;
  private chorus: Tone.Chorus | null = null;
  private eq3: Tone.EQ3 | null = null;
  private isInitialized = false;
  private currentInstrument: InstrumentType = 'nylon-guitar';

  async initialize(lowLatencyMode: boolean = false) {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Modo de baixa latência: usar latencyHint 'interactive'
      if (lowLatencyMode) {
        // Tone.js não suporta latencyHint diretamente, mas podemos otimizar
        console.log('⚡ Inicializando em modo de baixa latência');
      }
      
      await Tone.start();
      console.log('🎵 Tone.js context started');
      
      // Create effects chain
      this.eq3 = new Tone.EQ3({
        low: 0,
        mid: 0,
        high: 0,
        lowFrequency: 400,
        highFrequency: 2500,
      }).toDestination();

      // Em modo de baixa latência, reduzir ou desabilitar efeitos
      if (lowLatencyMode) {
        // Reverb mínimo ou desabilitado
        this.reverb = new Tone.Reverb({
          decay: 0.5, // Reduzido de 2.5s para 0.5s
          wet: 0.1,   // Reduzido de 0.3 para 0.1
        }).connect(this.eq3);

        // Chorus desabilitado ou mínimo
        this.chorus = new Tone.Chorus({
          frequency: 1.5,
          delayTime: 3.5,
          depth: 0.3,  // Reduzido de 0.7 para 0.3
          wet: 0.05,   // Reduzido de 0.2 para 0.05
        }).connect(this.reverb);
      } else {
        // Configuração normal
        this.reverb = new Tone.Reverb({
          decay: 2.5,
          wet: 0.3,
        }).connect(this.eq3);

        this.chorus = new Tone.Chorus({
          frequency: 1.5,
          delayTime: 3.5,
          depth: 0.7,
          wet: 0.2,
        }).connect(this.reverb);
      }

      await this.reverb.generate();
      
      // Create synth with current instrument
      this.createSynth(this.currentInstrument, lowLatencyMode);
      
      this.isInitialized = true;
      console.log('✅ AudioService initialized with', this.currentInstrument);
      return true;
    } catch (error) {
      console.error('❌ Error initializing AudioService:', error);
      return false;
    }
  }

  private createSynth(instrument: InstrumentType, lowLatencyMode: boolean = false) {
    // Dispose old synth if exists
    if (this.synth) {
      this.synth.dispose();
    }

    const instrumentConfigs = {
      'nylon-guitar': {
        oscillator: {
          type: 'triangle' as const,
          partialCount: 8,
        },
        envelope: {
          attack: 0.008,
          decay: 0.3,
          sustain: 0.4,
          release: 1.2,
        },
        volume: -8,
      },
      'steel-guitar': {
        oscillator: {
          type: 'sawtooth' as const,
          partialCount: 12,
        },
        envelope: {
          attack: 0.005,
          decay: 0.2,
          sustain: 0.5,
          release: 0.8,
        },
        volume: -10,
      },
      'piano': {
        oscillator: {
          type: 'sine' as const,
          partialCount: 16,
        },
        envelope: {
          attack: 0.002,
          decay: 0.4,
          sustain: 0.2,
          release: 1.5,
        },
        volume: -6,
      },
    };

    const config = instrumentConfigs[instrument];
    
    this.synth = new Tone.PolySynth(Tone.Synth, config);
    // Em modo de baixa latência, reduzir polyphony para economizar CPU
    this.synth.maxPolyphony = lowLatencyMode ? 12 : 32;

    // Connect to effects chain
    if (this.chorus) {
      this.synth.connect(this.chorus);
    }
  }

  async setInstrument(instrument: InstrumentType) {
    console.log('🎸 Changing instrument to:', instrument);
    this.currentInstrument = instrument;
    
    if (this.isInitialized) {
      this.createSynth(instrument);
    }
  }

  getInstrument(): InstrumentType {
    return this.currentInstrument;
  }

  private getChordNotes(root: string, chordType: string): number[] {
    const rootFreq = NOTE_FREQUENCIES[root] || NOTE_FREQUENCIES['C'];
    const intervals = CHORD_INTERVALS[chordType] || CHORD_INTERVALS['major'];
    
    return intervals.map(interval => {
      // Calcular frequência usando a fórmula: f = f0 * 2^(n/12)
      return rootFreq * Math.pow(2, interval / 12);
    });
  }

  /**
   * Play note optimized for ear training
   * - Clear attack (0.01s) for better note distinction
   * - Medium sustain (0.5) for natural sound
   * - Normalized volume for consistency
   * - Natural timbre (nylon-guitar based)
   */
  async playNoteForEarTraining(note: string, duration: number = 0.8): Promise<void> {
    try {
      await this.initialize();
      if (!this.synth) {
        console.error('❌ Synth not available');
        return;
      }

      // Ensure note has octave (default to 4 if not specified)
      let noteWithOctave = note;
      if (!/\d/.test(note)) {
        noteWithOctave = note + '4';
      }

      // Create a temporary synth with ear training optimized settings
      const earTrainingConfig = {
        oscillator: {
          type: 'triangle' as const,
          partialCount: 8, // Natural harmonics, not too synthetic
        },
        envelope: {
          attack: 0.01,  // Clear attack - not too fast, not too slow
          decay: 0.15,   // Quick decay to sustain level
          sustain: 0.55, // Medium sustain - natural and clear
          release: 0.4,   // Medium release - clean cutoff
        },
        volume: -6, // Normalized volume for consistency
      };

      const earTrainingSynth = new Tone.Synth(earTrainingConfig);
      
      // Connect to effects chain (use existing effects for consistency)
      if (this.chorus) {
        earTrainingSynth.connect(this.chorus);
      } else {
        earTrainingSynth.toDestination();
      }

      console.log('🎵 [Ear Training] Playing note:', noteWithOctave, `(${duration}s)`);

      const now = Tone.now();
      earTrainingSynth.triggerAttackRelease(noteWithOctave, duration, now);

      // Clean up after note finishes
      setTimeout(() => {
        earTrainingSynth.dispose();
      }, (duration + 0.5) * 1000);

      console.log('✅ [Ear Training] Note played successfully');
    } catch (error) {
      console.error('❌ Error playing ear training note:', error);
    }
  }

  async playNote(note: string, duration: number = 0.5): Promise<void> {
    try {
      await this.initialize();
      if (!this.synth) {
        console.error('❌ Synth not available');
        return;
      }

      // Ensure note has octave (default to 4 if not specified)
      let noteWithOctave = note;
      if (!/\d/.test(note)) {
        noteWithOctave = note + '4';
      }

      console.log('🎵 Playing note:', noteWithOctave);

      const now = Tone.now();
      this.synth.triggerAttackRelease(noteWithOctave, duration, now);

      console.log('✅ Note played successfully');
    } catch (error) {
      console.error('❌ Error playing note:', error);
    }
  }

  async playScale(scaleName: string, root: string, intervals: number[], duration: number = 0.3): Promise<void> {
    try {
      await this.initialize();
      if (!this.synth) return;

      console.log('🎵 Playing scale:', scaleName, 'from', root);

      const rootIndex = NOTES.indexOf(root);
      if (rootIndex === -1) {
        console.error('❌ Invalid root note:', root);
        return;
      }

      // Generate scale notes (ascending)
      const scaleNotes = intervals.map(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        return NOTES[noteIndex] + '4';
      });

      // Add octave note
      scaleNotes.push(root + '5');

      // Play notes in sequence
      const now = Tone.now();
      scaleNotes.forEach((note, index) => {
        this.synth!.triggerAttackRelease(note, duration, now + index * duration);
      });

      console.log('✅ Scale played:', scaleNotes.length, 'notes');
    } catch (error) {
      console.error('❌ Error playing scale:', error);
    }
  }

  async playChord(chordName: string, duration: number = 2): Promise<void> {
    console.log('🎸 playChord called:', chordName);
    
    const initialized = await this.initialize();
    if (!initialized || !this.synth) {
      console.error('❌ Synth not available');
      return;
    }

    try {
      // Parse chord name (e.g., "C", "Am", "G7")
      const match = chordName.match(/^([A-G][#b]?)(.*)/);
      if (!match) {
        console.error('❌ Invalid chord name:', chordName);
        return;
      }

      const root = match[1];
      let chordType = match[2] || 'major';
      
      // Map common chord suffixes
      if (chordType === 'm') chordType = 'minor';
      if (chordType === '') chordType = 'major';

      console.log('🎵 Parsed:', { root, chordType });

      const frequencies = this.getChordNotes(root, chordType);
      console.log('🎶 Frequencies:', frequencies);

      // Play chord as arpeggio
      const now = Tone.now();
      const noteDelay = 0.05; // 50ms between notes
      
      frequencies.forEach((freq, index) => {
        this.synth!.triggerAttackRelease(freq, duration, now + index * noteDelay);
      });

      console.log('✅ Chord played successfully');
    } catch (error) {
      console.error('❌ Error playing chord:', error);
    }
  }

  async playChordStrummed(chordName: string, duration: number = 2.5) {
    const initialized = await this.initialize();
    if (!initialized || !this.synth) {
      console.error('❌ Synth not available');
      return;
    }

    try {
      const match = chordName.match(/^([A-G][#b]?)(.*)/);
      if (!match) return;

      const root = match[1];
      let chordType = match[2] || 'major';
      if (chordType === 'm') chordType = 'minor';
      if (chordType === '') chordType = 'major';

      const frequencies = this.getChordNotes(root, chordType);

      // Play all notes together (strummed)
      const now = Tone.now();
      frequencies.forEach((freq) => {
        this.synth!.triggerAttackRelease(freq, duration, now);
      });

      console.log('✅ Strummed chord played');
    } catch (error) {
      console.error('❌ Error playing strummed chord:', error);
    }
  }

  setEQ(bassGain: number, midGain: number, trebleGain: number) {
    if (this.eq3) {
      this.eq3.low.value = bassGain;
      this.eq3.mid.value = midGain;
      this.eq3.high.value = trebleGain;
      console.log('🎚️ EQ updated:', { bass: bassGain, mid: midGain, treble: trebleGain });
    }
  }

  stopAll() {
    if (this.synth) {
      this.synth.releaseAll();
      console.log('🛑 All notes stopped');
    }
  }

  dispose() {
    this.stopAll();
    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
    }
    if (this.reverb) {
      this.reverb.dispose();
      this.reverb = null;
    }
    if (this.chorus) {
      this.chorus.dispose();
      this.chorus = null;
    }
    if (this.eq3) {
      this.eq3.dispose();
      this.eq3 = null;
    }
    this.isInitialized = false;
    console.log('🗑️ AudioService disposed');
  }
}

export const audioService = new AudioService();
