import AudioEngine from './AudioEngine';
import SampleLoader from './SampleLoader';
import { MetronomeConfig, MetronomeState, SampleData } from './types';

/**
 * Metronome - Metrônomo de alta precisão usando Web Audio API scheduling
 */
class Metronome {
  private audioEngine: AudioEngine;
  private sampleLoader: SampleLoader;
  
  private config: MetronomeConfig = {
    bpm: 100,
    beatsPerMeasure: 4,
    subdivision: 1,
    accentFirst: true,
    volume: 0.7,
  };

  private state: MetronomeState = {
    isPlaying: false,
    currentBeat: 0,
    currentSubdivision: 0,
    bpm: 100,
  };

  // Scheduling
  private nextNoteTime: number = 0;
  private schedulerTimerId: number | null = null;
  private readonly lookahead: number = 25; // ms - frequência do scheduler
  private readonly scheduleAheadTime: number = 0.1; // segundos - janela de scheduling

  // Sons
  private accentClick: SampleData | null = null;
  private normalClick: SampleData | null = null;
  private subdivisionClick: SampleData | null = null;

  // Callbacks
  private onBeatCallbacks: Set<(beat: number, time: number) => void> = new Set();
  private onStateChangeCallbacks: Set<(state: MetronomeState) => void> = new Set();

  constructor() {
    this.audioEngine = AudioEngine.getInstance();
    this.sampleLoader = SampleLoader.getInstance();
    this.generateClickSounds();
  }

  /**
   * Gera os sons de clique
   */
  private generateClickSounds(): void {
    this.accentClick = this.sampleLoader.generateClickSound(1200, 0.05);
    this.normalClick = this.sampleLoader.generateClickSound(800, 0.04);
    this.subdivisionClick = this.sampleLoader.generateClickSound(600, 0.03);
  }

  /**
   * Define o BPM
   */
  public setBpm(bpm: number): void {
    this.config.bpm = Math.max(40, Math.min(240, bpm));
    this.state.bpm = this.config.bpm;
    this.notifyStateChange();
  }

  /**
   * Retorna o BPM atual
   */
  public getBpm(): number {
    return this.config.bpm;
  }

  /**
   * Define beats por compasso
   */
  public setBeatsPerMeasure(beats: number): void {
    this.config.beatsPerMeasure = Math.max(1, Math.min(12, beats));
    this.notifyStateChange();
  }

  /**
   * Define subdivisão (1 = sem, 2 = colcheias, 4 = semicolcheias)
   */
  public setSubdivision(subdivision: 1 | 2 | 4): void {
    this.config.subdivision = subdivision;
    this.notifyStateChange();
  }

  /**
   * Define volume (0.0 a 1.0)
   */
  public setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Define se acentua o primeiro beat
   */
  public setAccentFirst(accent: boolean): void {
    this.config.accentFirst = accent;
  }

  /**
   * Inicia o metrônomo
   */
  public async start(): Promise<void> {
    if (this.state.isPlaying) return;

    // Garantir que o áudio está inicializado
    await this.audioEngine.initialize();
    await this.audioEngine.ensureResumed();

    this.state.isPlaying = true;
    this.state.currentBeat = 0;
    this.state.currentSubdivision = 0;
    this.nextNoteTime = this.audioEngine.getCurrentTime();
    
    this.scheduler();
    this.notifyStateChange();
    
    console.log('[Metronome] Iniciado:', this.config.bpm, 'BPM');
  }

  /**
   * Para o metrônomo
   */
  public stop(): void {
    if (!this.state.isPlaying) return;

    this.state.isPlaying = false;
    
    if (this.schedulerTimerId !== null) {
      clearTimeout(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }
    
    this.notifyStateChange();
    console.log('[Metronome] Parado');
  }

  /**
   * Alterna entre play/stop
   */
  public toggle(): void {
    if (this.state.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * Scheduler principal - roda em loop enquanto metrônomo está ativo
   */
  private scheduler(): void {
    if (!this.state.isPlaying) return;

    const currentTime = this.audioEngine.getCurrentTime();

    // Agendar todas as notas dentro da janela de lookahead
    while (this.nextNoteTime < currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.state.currentBeat, this.state.currentSubdivision, this.nextNoteTime);
      this.advanceNote();
    }

    // Reagendar o scheduler
    this.schedulerTimerId = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  /**
   * Agenda uma nota para tocar em um tempo específico
   */
  private scheduleNote(beat: number, subdivision: number, time: number): void {
    const audioContext = this.audioEngine.getContext();
    const masterGain = this.audioEngine.getMasterGain();

    // Selecionar o sample correto
    let clickSample: SampleData | null;
    let volumeMultiplier: number;

    if (subdivision === 0) {
      // Beat principal
      if (beat === 0 && this.config.accentFirst) {
        clickSample = this.accentClick;
        volumeMultiplier = 1.0;
      } else {
        clickSample = this.normalClick;
        volumeMultiplier = 0.8;
      }
    } else {
      // Subdivisão
      clickSample = this.subdivisionClick;
      volumeMultiplier = 0.5;
    }

    if (!clickSample) return;

    // TODO: migrate to AudioBus
    // Substituir criação direta de source e conexão com masterGain por:
    // const audioBus = getAudioBus();
    // audioBus.playSample({ sample: clickSample, channel: 'metronome', volume: this.config.volume * volumeMultiplier, when: time });

    // Criar source e gain
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = clickSample.buffer;
    gainNode.gain.value = this.config.volume * volumeMultiplier;

    source.connect(gainNode);
    gainNode.connect(masterGain);

    source.start(time);

    // Notificar callbacks de beat (apenas no beat principal, não subdivisão)
    if (subdivision === 0) {
      const delay = Math.max(0, (time - audioContext.currentTime) * 1000);
      setTimeout(() => {
        this.onBeatCallbacks.forEach(callback => callback(beat, time));
      }, delay);
    }
  }

  /**
   * Avança para a próxima nota
   */
  private advanceNote(): void {
    const secondsPerBeat = 60.0 / this.config.bpm;
    const secondsPerSubdivision = secondsPerBeat / this.config.subdivision;

    this.nextNoteTime += secondsPerSubdivision;
    
    this.state.currentSubdivision++;
    
    if (this.state.currentSubdivision >= this.config.subdivision) {
      this.state.currentSubdivision = 0;
      this.state.currentBeat = (this.state.currentBeat + 1) % this.config.beatsPerMeasure;
    }
  }

  /**
   * Registra callback para eventos de beat
   */
  public onBeat(callback: (beat: number, time: number) => void): () => void {
    this.onBeatCallbacks.add(callback);
    return () => this.onBeatCallbacks.delete(callback);
  }

  /**
   * Registra callback para mudanças de estado
   */
  public onStateChange(callback: (state: MetronomeState) => void): () => void {
    this.onStateChangeCallbacks.add(callback);
    return () => this.onStateChangeCallbacks.delete(callback);
  }

  /**
   * Notifica callbacks de mudança de estado
   */
  private notifyStateChange(): void {
    const stateCopy = { ...this.state };
    this.onStateChangeCallbacks.forEach(callback => callback(stateCopy));
  }

  /**
   * Retorna o estado atual
   */
  public getState(): MetronomeState {
    return { ...this.state };
  }

  /**
   * Retorna a configuração atual
   */
  public getConfig(): MetronomeConfig {
    return { ...this.config };
  }

  /**
   * Tap tempo - calcula BPM baseado em taps
   */
  private tapTimes: number[] = [];
  private readonly TAP_TIMEOUT = 2000; // Reset após 2 segundos sem tap

  public tap(): number | null {
    const now = Date.now();

    // Limpar taps antigos
    if (this.tapTimes.length > 0 && now - this.tapTimes[this.tapTimes.length - 1] > this.TAP_TIMEOUT) {
      this.tapTimes = [];
    }

    this.tapTimes.push(now);

    // Manter apenas os últimos 8 taps
    if (this.tapTimes.length > 8) {
      this.tapTimes.shift();
    }

    // Calcular BPM se tivermos pelo menos 2 taps
    if (this.tapTimes.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < this.tapTimes.length; i++) {
        intervals.push(this.tapTimes[i] - this.tapTimes[i - 1]);
      }
      
      const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round(60000 / averageInterval);
      
      if (bpm >= 40 && bpm <= 240) {
        this.setBpm(bpm);
        return bpm;
      }
    }

    return null;
  }

  /**
   * Reseta o tap tempo
   */
  public resetTap(): void {
    this.tapTimes = [];
  }
}

export default Metronome;
