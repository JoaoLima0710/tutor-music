import AudioEngine from './AudioEngine';
import SampleLoader from './SampleLoader';
import { ScaleNotes, NOTE_NAMES, A4_FREQUENCY, A4_MIDI_NUMBER } from './types';

/**
 * ScalePlayer - Reproduz escalas nota por nota ou em sequência
 */
class ScalePlayer {
  private audioEngine: AudioEngine;
  private sampleLoader: SampleLoader;
  
  // Configurações
  private volume: number = 0.7;
  private noteDuration: number = 500; // ms por nota
  private isPlaying: boolean = false;
  private currentNoteIndex: number = 0;
  
  // Callbacks
  private onNotePlayCallbacks: Set<(noteIndex: number, noteName: string) => void> = new Set();

  constructor() {
    this.audioEngine = AudioEngine.getInstance();
    this.sampleLoader = SampleLoader.getInstance();
  }

  /**
   * Define o volume (0.0 a 1.0)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Define a duração de cada nota em ms
   */
  public setNoteDuration(duration: number): void {
    this.noteDuration = Math.max(100, Math.min(2000, duration));
  }

  /**
   * Toca uma única nota
   */
  public async playNote(noteName: string): Promise<void> {
    await this.audioEngine.ensureResumed();
    
    const frequency = this.noteToFrequency(noteName);
    this.synthesizeNote(frequency, this.noteDuration / 1000);
  }

  /**
   * Toca uma escala completa
   */
  public async playScale(scaleName: string, rootNote: string, direction: 'up' | 'down' | 'updown' = 'up'): Promise<void> {
    if (this.isPlaying) {
      this.stop();
      return;
    }

    await this.audioEngine.ensureResumed();
    
    const scaleData = this.getScaleData(scaleName, rootNote);
    if (!scaleData) {
      console.error(`[ScalePlayer] Escala não encontrada: ${scaleName}`);
      return;
    }

    let notes = scaleData.notes;
    
    if (direction === 'down') {
      notes = [...notes].reverse();
    } else if (direction === 'updown') {
      notes = [...notes, ...notes.slice(0, -1).reverse()];
    }

    this.isPlaying = true;
    this.currentNoteIndex = 0;

    for (let i = 0; i < notes.length; i++) {
      if (!this.isPlaying) break;
      
      this.currentNoteIndex = i;
      const note = notes[i];
      
      // Notificar callbacks
      this.onNotePlayCallbacks.forEach(cb => cb(i, note));
      
      // Tocar a nota
      const frequency = this.noteToFrequency(note);
      this.synthesizeNote(frequency, this.noteDuration / 1000);
      
      // Esperar antes da próxima nota
      await this.delay(this.noteDuration);
    }

    this.isPlaying = false;
    this.currentNoteIndex = 0;
  }

  /**
   * Para a reprodução
   */
  public stop(): void {
    this.isPlaying = false;
    this.currentNoteIndex = 0;
  }

  /**
   * Sintetiza uma nota
   * TODO: migrate to AudioBus
   * Substituir criação direta de oscilador e conexão com masterGain por:
   * const audioBus = getAudioBus();
   * audioBus.playOscillator({ frequency, type: 'triangle', duration, channel: 'scales', volume: this.volume * 0.4 });
   */
  private synthesizeNote(frequency: number, duration: number): void {
    const audioContext = this.audioEngine.getContext();
    const masterGain = this.audioEngine.getMasterGain();
    const currentTime = audioContext.currentTime;

    // Oscilador
    const osc = audioContext.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = frequency;

    // Envelope
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, currentTime + 0.02);
    gainNode.gain.setValueAtTime(this.volume * 0.4, currentTime + duration * 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);

    // Filtro
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3000;

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGain);

    osc.start(currentTime);
    osc.stop(currentTime + duration);
  }

  /**
   * Retorna os dados de uma escala
   */
  private getScaleData(scaleName: string, rootNote: string): ScaleNotes | null {
    const scaleIntervals: Record<string, number[]> = {
      'major': [0, 2, 4, 5, 7, 9, 11, 12],
      'natural-minor': [0, 2, 3, 5, 7, 8, 10, 12],
      'harmonic-minor': [0, 2, 3, 5, 7, 8, 11, 12],
      'melodic-minor': [0, 2, 3, 5, 7, 9, 11, 12],
      'pentatonic-major': [0, 2, 4, 7, 9, 12],
      'pentatonic-minor': [0, 3, 5, 7, 10, 12],
      'blues': [0, 3, 5, 6, 7, 10, 12],
      'dorian': [0, 2, 3, 5, 7, 9, 10, 12],
      'phrygian': [0, 1, 3, 5, 7, 8, 10, 12],
      'lydian': [0, 2, 4, 6, 7, 9, 11, 12],
      'mixolydian': [0, 2, 4, 5, 7, 9, 10, 12],
      'locrian': [0, 1, 3, 5, 6, 8, 10, 12],
    };

    const intervals = scaleIntervals[scaleName.toLowerCase()];
    if (!intervals) return null;

    const rootMidi = this.noteNameToMidi(rootNote);
    if (rootMidi === -1) return null;

    const notes = intervals.map(interval => {
      const midiNote = rootMidi + interval;
      return this.midiToNoteName(midiNote);
    });

    return {
      name: scaleName,
      root: rootNote,
      notes,
      intervals,
    };
  }

  /**
   * Converte nome de nota para frequência
   */
  private noteToFrequency(noteName: string): number {
    const midiNote = this.noteNameToMidi(noteName);
    if (midiNote === -1) return 440;
    return A4_FREQUENCY * Math.pow(2, (midiNote - A4_MIDI_NUMBER) / 12);
  }

  /**
   * Converte nome de nota para número MIDI
   */
  private noteNameToMidi(noteName: string): number {
    const match = noteName.match(/^([A-G]#?)(\d)$/);
    if (!match) return -1;

    const note = match[1];
    const octave = parseInt(match[2]);
    
    const noteIndex = NOTE_NAMES.indexOf(note as any);
    if (noteIndex === -1) return -1;

    return (octave + 1) * 12 + noteIndex;
  }

  /**
   * Converte número MIDI para nome de nota
   */
  private midiToNoteName(midiNote: number): string {
    const noteIndex = midiNote % 12;
    const octave = Math.floor(midiNote / 12) - 1;
    return `${NOTE_NAMES[noteIndex]}${octave}`;
  }

  /**
   * Helper para delay assíncrono
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Registra callback para quando uma nota toca
   */
  public onNotePlay(callback: (noteIndex: number, noteName: string) => void): () => void {
    this.onNotePlayCallbacks.add(callback);
    return () => this.onNotePlayCallbacks.delete(callback);
  }

  /**
   * Retorna se está tocando
   */
  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Retorna o índice da nota atual
   */
  public getCurrentNoteIndex(): number {
    return this.currentNoteIndex;
  }

  /**
   * Lista escalas disponíveis
   */
  public getAvailableScales(): string[] {
    return [
      'major', 'natural-minor', 'harmonic-minor', 'melodic-minor',
      'pentatonic-major', 'pentatonic-minor', 'blues',
      'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'
    ];
  }
}

export default ScalePlayer;
