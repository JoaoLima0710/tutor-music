import PitchDetector from './PitchDetector';
import { TunerState, GUITAR_STANDARD_TUNING, PitchDetectionResult } from './types';

/**
 * Tuner - Afinador de violão usando PitchDetector
 */
class Tuner {
  private pitchDetector: PitchDetector;
  
  private state: TunerState = {
    isListening: false,
    frequency: null,
    note: null,
    octave: null,
    cents: 0,
    isInTune: false,
    volume: 0,
  };

  // Configurações
  private toleranceCents: number = 5; // ±5 cents é considerado afinado
  private smoothingFactor: number = 0.3; // Suavização de leitura

  // Histórico para suavização
  private frequencyHistory: number[] = [];
  private readonly historySize: number = 5;

  // Callbacks
  private onStateChangeCallbacks: Set<(state: TunerState) => void> = new Set();

  constructor() {
    this.pitchDetector = new PitchDetector();
    this.setupPitchCallback();
  }

  /**
   * Configura o callback de detecção de pitch
   */
  private setupPitchCallback(): void {
    this.pitchDetector.onPitch((result) => {
      this.handlePitchResult(result);
    });

    this.pitchDetector.onError((error) => {
      console.error('[Tuner] Erro na detecção:', error);
      this.state.isListening = false;
      this.notifyStateChange();
    });
  }

  /**
   * Processa resultado da detecção de pitch
   */
  private handlePitchResult(result: PitchDetectionResult | null): void {
    if (!result) {
      // Sem detecção - limpar parcialmente (manter última nota por um tempo)
      this.state.frequency = null;
      this.state.volume = 0;
      this.notifyStateChange();
      return;
    }

    // Adicionar ao histórico para suavização
    this.frequencyHistory.push(result.frequency);
    if (this.frequencyHistory.length > this.historySize) {
      this.frequencyHistory.shift();
    }

    // Calcular frequência suavizada (média)
    const smoothedFrequency = this.frequencyHistory.reduce((a, b) => a + b, 0) / this.frequencyHistory.length;

    // Encontrar a corda mais próxima
    const nearestString = this.pitchDetector.getNearestString(smoothedFrequency);

    if (nearestString) {
      this.state.frequency = smoothedFrequency;
      this.state.note = nearestString.note.replace(/\d/, '');
      this.state.octave = parseInt(nearestString.note.match(/\d/)?.[0] || '3');
      this.state.cents = nearestString.cents;
      this.state.isInTune = Math.abs(nearestString.cents) <= this.toleranceCents;
      this.state.volume = result.confidence;
    } else {
      // Frequência não corresponde a nenhuma corda conhecida
      this.state.frequency = smoothedFrequency;
      this.state.note = result.note;
      this.state.octave = result.octave;
      this.state.cents = result.cents;
      this.state.isInTune = false;
      this.state.volume = result.confidence;
    }

    this.notifyStateChange();
  }

  /**
   * Inicia o afinador
   */
  public async start(): Promise<void> {
    await this.pitchDetector.startListening();
    this.state.isListening = true;
    this.frequencyHistory = [];
    this.notifyStateChange();
  }

  /**
   * Para o afinador
   */
  public stop(): void {
    this.pitchDetector.stopListening();
    this.state.isListening = false;
    this.state.frequency = null;
    this.state.note = null;
    this.state.octave = null;
    this.state.cents = 0;
    this.state.isInTune = false;
    this.state.volume = 0;
    this.frequencyHistory = [];
    this.notifyStateChange();
  }

  /**
   * Alterna entre ligado/desligado
   */
  public toggle(): void {
    if (this.state.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * Define a tolerância em cents
   */
  public setTolerance(cents: number): void {
    this.toleranceCents = Math.max(1, Math.min(20, cents));
  }

  /**
   * Retorna o estado atual
   */
  public getState(): TunerState {
    return { ...this.state };
  }

  /**
   * Retorna a afinação padrão do violão
   */
  public getStandardTuning(): typeof GUITAR_STANDARD_TUNING {
    return GUITAR_STANDARD_TUNING;
  }

  /**
   * Retorna a direção de ajuste necessária
   */
  public getTuningDirection(): 'up' | 'down' | 'ok' | null {
    if (!this.state.frequency) return null;
    if (this.state.isInTune) return 'ok';
    return this.state.cents > 0 ? 'down' : 'up';
  }

  /**
   * Retorna a porcentagem de "quão afinado" está (0-100)
   */
  public getTuningAccuracy(): number {
    if (!this.state.frequency) return 0;
    const maxCents = 50; // Considerar 50 cents como o máximo de desafinação
    const accuracy = Math.max(0, 100 - (Math.abs(this.state.cents) / maxCents) * 100);
    return Math.round(accuracy);
  }

  /**
   * Registra callback para mudanças de estado
   */
  public onStateChange(callback: (state: TunerState) => void): () => void {
    this.onStateChangeCallbacks.add(callback);
    return () => this.onStateChangeCallbacks.delete(callback);
  }

  /**
   * Notifica callbacks de mudança de estado
   */
  private notifyStateChange(): void {
    const stateCopy = { ...this.state };
    this.onStateChangeCallbacks.forEach(cb => cb(stateCopy));
  }
}

export default Tuner;
