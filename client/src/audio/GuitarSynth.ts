import AudioEngine from './AudioEngine';
import SampleLoader from './SampleLoader';
import { ChordVoicing, SampleData, NOTE_NAMES, A4_FREQUENCY, A4_MIDI_NUMBER } from './types';

/**
 * ChordPlayer - Reproduz acordes com samples ou síntese
 */
class ChordPlayer {
  private audioEngine: AudioEngine;
  private sampleLoader: SampleLoader;
  
  // Configurações
  private volume: number = 0.7;
  private strumSpeed: number = 50; // ms entre cada corda
  private useSynthesis: boolean = false; // fallback para síntese se samples não disponíveis

  // Estado
  private activeNodes: AudioBufferSourceNode[] = [];

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
   * Define a velocidade do strum em ms
   */
  public setStrumSpeed(speed: number): void {
    this.strumSpeed = Math.max(10, Math.min(200, speed));
  }

  /**
   * Reproduz um acorde pelo nome
   */
  public async playChord(chordName: string): Promise<void> {
    await this.audioEngine.ensureResumed();

    // Tentar carregar sample primeiro
    const sampleUrl = `/samples/chords/${chordName}.mp3`;
    
    try {
      if (!this.useSynthesis) {
        const sample = await this.sampleLoader.loadSample(sampleUrl);
        await this.playSample(sample);
        return;
      }
    } catch (error) {
      console.warn(`[ChordPlayer] Sample não encontrado para ${chordName}, usando síntese`);
    }

    // Fallback: síntese
    const voicing = this.getChordVoicing(chordName);
    if (voicing) {
      await this.synthesizeChord(voicing);
    }
  }

  /**
   * Reproduz um sample de áudio
   */
  private async playSample(sample: SampleData): Promise<void> {
    const audioContext = this.audioEngine.getContext();
    const masterGain = this.audioEngine.getMasterGain();

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = sample.buffer;
    gainNode.gain.value = this.volume;

    source.connect(gainNode);
    gainNode.connect(masterGain);

    this.activeNodes.push(source);
    source.onended = () => {
      const index = this.activeNodes.indexOf(source);
      if (index > -1) this.activeNodes.splice(index, 1);
    };

    source.start(0);
  }

  /**
   * Sintetiza um acorde com múltiplas notas
   */
  private async synthesizeChord(voicing: ChordVoicing): Promise<void> {
    const audioContext = this.audioEngine.getContext();
    const masterGain = this.audioEngine.getMasterGain();
    const currentTime = audioContext.currentTime;

    // Criar um gain para o acorde inteiro
    const chordGain = audioContext.createGain();
    chordGain.gain.value = this.volume * 0.5; // Reduzir para evitar clipping
    chordGain.connect(masterGain);

    // Tocar cada nota com delay (simular strum)
    voicing.frequencies.forEach((frequency, index) => {
      const noteTime = currentTime + (index * this.strumSpeed / 1000);
      this.playNote(frequency, noteTime, chordGain);
    });
  }

  /**
   * Toca uma única nota sintetizada
   */
  private playNote(frequency: number, startTime: number, destination: AudioNode): void {
    const audioContext = this.audioEngine.getContext();
    const duration = 2.0;

    // Oscilador principal
    const osc = audioContext.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = frequency;

    // Envelope de amplitude
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    // Filtro para suavizar
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  /**
   * Para todas as notas ativas
   */
  public stopAll(): void {
    this.activeNodes.forEach(node => {
      try {
        node.stop();
      } catch (e) {
        // Ignorar se já parou
      }
    });
    this.activeNodes = [];
  }

  /**
   * Retorna as frequências para um acorde
   */
  private getChordVoicing(chordName: string): ChordVoicing | null {
    const voicings: Record<string, ChordVoicing> = {
      // Maiores
      'C': { name: 'C', notes: ['C3', 'E3', 'G3', 'C4', 'E4'], frequencies: [130.81, 164.81, 196.00, 261.63, 329.63] },
      'D': { name: 'D', notes: ['D3', 'A3', 'D4', 'F#4'], frequencies: [146.83, 220.00, 293.66, 369.99] },
      'E': { name: 'E', notes: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'], frequencies: [82.41, 123.47, 164.81, 207.65, 246.94, 329.63] },
      'F': { name: 'F', notes: ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], frequencies: [87.31, 130.81, 174.61, 220.00, 261.63, 349.23] },
      'G': { name: 'G', notes: ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'], frequencies: [98.00, 123.47, 146.83, 196.00, 246.94, 392.00] },
      'A': { name: 'A', notes: ['A2', 'E3', 'A3', 'C#4', 'E4'], frequencies: [110.00, 164.81, 220.00, 277.18, 329.63] },
      'B': { name: 'B', notes: ['B2', 'F#3', 'B3', 'D#4', 'F#4'], frequencies: [123.47, 185.00, 246.94, 311.13, 369.99] },
      
      // Menores
      'Am': { name: 'Am', notes: ['A2', 'E3', 'A3', 'C4', 'E4'], frequencies: [110.00, 164.81, 220.00, 261.63, 329.63] },
      'Bm': { name: 'Bm', notes: ['B2', 'F#3', 'B3', 'D4', 'F#4'], frequencies: [123.47, 185.00, 246.94, 293.66, 369.99] },
      'Cm': { name: 'Cm', notes: ['C3', 'G3', 'C4', 'Eb4', 'G4'], frequencies: [130.81, 196.00, 261.63, 311.13, 392.00] },
      'Dm': { name: 'Dm', notes: ['D3', 'A3', 'D4', 'F4'], frequencies: [146.83, 220.00, 293.66, 349.23] },
      'Em': { name: 'Em', notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'], frequencies: [82.41, 123.47, 164.81, 196.00, 246.94, 329.63] },
      'Fm': { name: 'Fm', notes: ['F2', 'C3', 'F3', 'Ab3', 'C4'], frequencies: [87.31, 130.81, 174.61, 207.65, 261.63] },
      'Gm': { name: 'Gm', notes: ['G2', 'D3', 'G3', 'Bb3', 'D4'], frequencies: [98.00, 146.83, 196.00, 233.08, 293.66] },

      // Sétima
      'A7': { name: 'A7', notes: ['A2', 'E3', 'G3', 'C#4', 'E4'], frequencies: [110.00, 164.81, 196.00, 277.18, 329.63] },
      'B7': { name: 'B7', notes: ['B2', 'D#3', 'A3', 'B3', 'F#4'], frequencies: [123.47, 155.56, 220.00, 246.94, 369.99] },
      'C7': { name: 'C7', notes: ['C3', 'E3', 'Bb3', 'C4', 'E4'], frequencies: [130.81, 164.81, 233.08, 261.63, 329.63] },
      'D7': { name: 'D7', notes: ['D3', 'A3', 'C4', 'F#4'], frequencies: [146.83, 220.00, 261.63, 369.99] },
      'E7': { name: 'E7', notes: ['E2', 'B2', 'D3', 'G#3', 'B3', 'E4'], frequencies: [82.41, 123.47, 146.83, 207.65, 246.94, 329.63] },
      'G7': { name: 'G7', notes: ['G2', 'B2', 'D3', 'F3', 'B3', 'G4'], frequencies: [98.00, 123.47, 146.83, 174.61, 246.94, 392.00] },
    };

    return voicings[chordName] || null;
  }

  /**
   * Converte nome de nota para frequência
   */
  public noteToFrequency(noteName: string): number {
    const match = noteName.match(/^([A-G]#?)(\d)$/);
    if (!match) return 440;

    const note = match[1];
    const octave = parseInt(match[2]);
    
    const noteIndex = NOTE_NAMES.indexOf(note as any);
    if (noteIndex === -1) return 440;

    const midiNumber = (octave + 1) * 12 + noteIndex;
    return A4_FREQUENCY * Math.pow(2, (midiNumber - A4_MIDI_NUMBER) / 12);
  }

  /**
   * Lista todos os acordes disponíveis
   */
  public getAvailableChords(): string[] {
    return [
      'C', 'D', 'E', 'F', 'G', 'A', 'B',
      'Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm',
      'A7', 'B7', 'C7', 'D7', 'E7', 'G7'
    ];
  }
}

export default ChordPlayer;
