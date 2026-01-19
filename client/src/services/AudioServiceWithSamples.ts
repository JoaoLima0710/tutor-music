import Soundfont from 'soundfont-player';

// Array de notas
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

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

const SOUNDFONT_INSTRUMENTS: Record<InstrumentType, string> = {
  'nylon-guitar': 'acoustic_guitar_nylon',
  'steel-guitar': 'acoustic_guitar_steel',
  'piano': 'acoustic_grand_piano',
};

class AudioServiceWithSamples {
  private instrument: Soundfont.Player | null = null;
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private currentInstrument: InstrumentType = 'nylon-guitar';
  private isLoading = false;

  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Create AudioContext
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      console.log('🎵 AudioContext created');
      
      // Load initial instrument
      await this.loadInstrument(this.currentInstrument);
      
      this.isInitialized = true;
      console.log('✅ AudioServiceWithSamples initialized with', this.currentInstrument);
      return true;
    } catch (error) {
      console.error('❌ Error initializing AudioServiceWithSamples:', error);
      return false;
    }
  }

  private async loadInstrument(instrumentType: InstrumentType) {
    if (this.isLoading) {
      console.log('⏳ Already loading an instrument...');
      return;
    }

    this.isLoading = true;

    try {
      if (!this.audioContext) {
        throw new Error('AudioContext not initialized');
      }

      const soundfontName = SOUNDFONT_INSTRUMENTS[instrumentType];
      console.log('🎸 Loading instrument:', soundfontName);

      // Dispose old instrument
      if (this.instrument) {
        this.instrument = null;
      }

      // Load new instrument from CDN
      this.instrument = await Soundfont.instrument(this.audioContext, soundfontName as any, {
        soundfont: 'MusyngKite', // High-quality soundfont
        nameToUrl: (name: string, soundfont: string) => {
          return `https://gleitz.github.io/midi-js-soundfonts/${soundfont}/${name}-mp3.js`;
        },
      });

      console.log('✅ Instrument loaded:', soundfontName);
    } catch (error) {
      console.error('❌ Error loading instrument:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async setInstrument(instrumentType: InstrumentType) {
    console.log('🎸 Changing instrument to:', instrumentType);
    this.currentInstrument = instrumentType;
    
    if (this.isInitialized) {
      await this.loadInstrument(instrumentType);
    }
  }

  getInstrument(): InstrumentType {
    return this.currentInstrument;
  }

  private getNoteFromInterval(root: string, interval: number): string {
    const rootIndex = NOTES.indexOf(root);
    if (rootIndex === -1) return 'C4';
    
    const noteIndex = (rootIndex + interval) % 12;
    const octave = 4 + Math.floor((rootIndex + interval) / 12);
    
    return NOTES[noteIndex] + octave;
  }

  private getChordNotes(root: string, chordType: string): string[] {
    const intervals = CHORD_INTERVALS[chordType] || CHORD_INTERVALS['major'];
    return intervals.map(interval => this.getNoteFromInterval(root, interval));
  }

  async playNote(note: string, duration: number = 0.5): Promise<void> {
    try {
      await this.initialize();
      if (!this.instrument) {
        console.error('❌ Instrument not loaded');
        return;
      }

      // Ensure note has octave (default to 4 if not specified)
      let noteWithOctave = note;
      if (!/\d/.test(note)) {
        noteWithOctave = note + '4';
      }

      console.log('🎵 Playing note:', noteWithOctave);

      const currentTime = this.audioContext!.currentTime;
      this.instrument.play(noteWithOctave, currentTime, { duration });

      console.log('✅ Note played successfully');
    } catch (error) {
      console.error('❌ Error playing note:', error);
    }
  }

  async playScale(scaleName: string, root: string, intervals: number[], duration: number = 0.5): Promise<void> {
    try {
      await this.initialize();
      if (!this.instrument) {
        console.error('❌ Instrument not loaded');
        return;
      }

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
      let currentTime = this.audioContext!.currentTime;
      scaleNotes.forEach((note) => {
        this.instrument!.play(note, currentTime, { duration });
        currentTime += duration;
      });

      console.log('✅ Scale played:', scaleNotes.length, 'notes');
    } catch (error) {
      console.error('❌ Error playing scale:', error);
    }
  }

  async playChord(chordName: string, duration: number = 2): Promise<void> {
    console.log('🎸 playChord called:', chordName);
    
    const initialized = await this.initialize();
    if (!initialized || !this.instrument) {
      console.error('❌ Instrument not available');
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

      const notes = this.getChordNotes(root, chordType);
      console.log('🎶 Notes:', notes);

      // Play chord as arpeggio
      const currentTime = this.audioContext!.currentTime;
      const noteDelay = 0.08; // 80ms between notes for arpeggio
      
      notes.forEach((note, index) => {
        this.instrument!.play(note, currentTime + index * noteDelay, { duration });
      });

      console.log('✅ Chord played successfully');
    } catch (error) {
      console.error('❌ Error playing chord:', error);
    }
  }

  async playChordStrummed(chordName: string, duration: number = 2.5) {
    const initialized = await this.initialize();
    if (!initialized || !this.instrument) {
      console.error('❌ Instrument not available');
      return;
    }

    try {
      const match = chordName.match(/^([A-G][#b]?)(.*)/);
      if (!match) return;

      const root = match[1];
      let chordType = match[2] || 'major';
      if (chordType === 'm') chordType = 'minor';
      if (chordType === '') chordType = 'major';

      const notes = this.getChordNotes(root, chordType);

      // Play all notes together (strummed)
      const currentTime = this.audioContext!.currentTime;
      notes.forEach((note) => {
        this.instrument!.play(note, currentTime, { duration });
      });

      console.log('✅ Strummed chord played');
    } catch (error) {
      console.error('❌ Error playing strummed chord:', error);
    }
  }

  stopAll() {
    if (this.instrument) {
      this.instrument.stop();
      console.log('🛑 All notes stopped');
    }
  }

  dispose() {
    this.stopAll();
    if (this.instrument) {
      this.instrument = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isInitialized = false;
    console.log('🗑️ AudioServiceWithSamples disposed');
  }
}

export const audioServiceWithSamples = new AudioServiceWithSamples();
