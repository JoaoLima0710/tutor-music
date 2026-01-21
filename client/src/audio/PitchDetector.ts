import AudioEngine from './AudioEngine';
import { PitchDetectionResult, NOTE_NAMES, A4_FREQUENCY, A4_MIDI_NUMBER, GUITAR_STANDARD_TUNING } from './types';

/**
 * PitchDetector - Detecta a frequência fundamental do áudio captado pelo microfone
 * Usa algoritmo de autocorrelação (YIN simplificado)
 */
class PitchDetector {
  private audioEngine: AudioEngine;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  
  private isListening: boolean = false;
  private animationFrameId: number | null = null;
  
  // Configurações
  private readonly minFrequency: number = 60; // Hz (abaixo de E2)
  private readonly maxFrequency: number = 1000; // Hz (acima de E5)
  private readonly confidenceThreshold: number = 0.85;
  
  // Callbacks
  private onPitchCallbacks: Set<(result: PitchDetectionResult | null) => void> = new Set();
  private onErrorCallbacks: Set<(error: Error) => void> = new Set();

  constructor() {
    this.audioEngine = AudioEngine.getInstance();
  }

  /**
   * Inicia a escuta do microfone
   */
  public async startListening(): Promise<void> {
    if (this.isListening) return;

    try {
      // Garantir que o áudio está inicializado
      await this.audioEngine.initialize();
      await this.audioEngine.ensureResumed();

      // Solicitar permissão do microfone
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const audioContext = this.audioEngine.getContext();

      // Criar nós de áudio
      this.sourceNode = audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = audioContext.createAnalyser();
      this.analyser.fftSize = 4096;
      this.analyser.smoothingTimeConstant = 0.0;

      // Conectar source ao analyser (não ao destination para evitar feedback)
      this.sourceNode.connect(this.analyser);

      this.isListening = true;
      this.detectPitch();

      console.log('[PitchDetector] Escuta iniciada');
    } catch (error) {
      const err = error as Error;
      console.error('[PitchDetector] Erro ao iniciar:', err);
      this.onErrorCallbacks.forEach(cb => cb(err));
      throw err;
    }
  }

  /**
   * Para a escuta do microfone
   */
  public stopListening(): void {
    this.isListening = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.analyser = null;
    console.log('[PitchDetector] Escuta parada');
  }

  /**
   * Loop de detecção de pitch
   */
  private detectPitch(): void {
    if (!this.isListening || !this.analyser) return;

    const bufferLength = this.analyser.fftSize;
    const buffer = new Float32Array(bufferLength);
    this.analyser.getFloatTimeDomainData(buffer);

    // Detectar frequência usando autocorrelação
    const result = this.autoCorrelate(buffer, this.audioEngine.getContext().sampleRate);

    // Notificar callbacks
    this.onPitchCallbacks.forEach(cb => cb(result));

    // Continuar o loop
    this.animationFrameId = requestAnimationFrame(() => this.detectPitch());
  }

  /**
   * Algoritmo de autocorrelação para detecção de pitch
   */
  private autoCorrelate(buffer: Float32Array, sampleRate: number): PitchDetectionResult | null {
    const SIZE = buffer.length;
    
    // Verificar se há sinal significativo
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    
    if (rms < 0.01) {
      // Sinal muito fraco
      return null;
    }

    // Normalizar o buffer
    const normalizedBuffer = new Float32Array(SIZE);
    for (let i = 0; i < SIZE; i++) {
      normalizedBuffer[i] = buffer[i];
    }

    // Autocorrelação
    const correlation = new Float32Array(SIZE);
    for (let lag = 0; lag < SIZE; lag++) {
      let sum = 0;
      for (let i = 0; i < SIZE - lag; i++) {
        sum += normalizedBuffer[i] * normalizedBuffer[i + lag];
      }
      correlation[lag] = sum;
    }

    // Encontrar o primeiro pico após o zero-lag
    let maxCorrelation = 0;
    let bestLag = 0;

    // Determinar lags mínimo e máximo baseados nas frequências desejadas
    const minLag = Math.floor(sampleRate / this.maxFrequency);
    const maxLag = Math.ceil(sampleRate / this.minFrequency);

    for (let lag = minLag; lag < Math.min(maxLag, SIZE); lag++) {
      if (correlation[lag] > maxCorrelation) {
        maxCorrelation = correlation[lag];
        bestLag = lag;
      }
    }

    // Calcular confiança
    const confidence = maxCorrelation / correlation[0];

    if (confidence < this.confidenceThreshold || bestLag === 0) {
      return null;
    }

    // Refinamento parabólico do pico
    let refinedLag = bestLag;
    if (bestLag > 0 && bestLag < SIZE - 1) {
      const y1 = correlation[bestLag - 1];
      const y2 = correlation[bestLag];
      const y3 = correlation[bestLag + 1];
      const delta = (y3 - y1) / (2 * (2 * y2 - y1 - y3));
      refinedLag = bestLag + delta;
    }

    const frequency = sampleRate / refinedLag;

    // Verificar limites
    if (frequency < this.minFrequency || frequency > this.maxFrequency) {
      return null;
    }

    // Converter para nota
    const { note, octave, cents } = this.frequencyToNote(frequency);

    return {
      frequency,
      note,
      octave,
      cents,
      confidence,
    };
  }

  /**
   * Converte frequência para nota musical
   */
  private frequencyToNote(frequency: number): { note: string; octave: number; cents: number } {
    // Calcular número de semitons a partir de A4
    const semitonesFromA4 = 12 * Math.log2(frequency / A4_FREQUENCY);
    const nearestSemitone = Math.round(semitonesFromA4);
    const cents = Math.round((semitonesFromA4 - nearestSemitone) * 100);

    // Calcular nota e oitava
    const midiNumber = A4_MIDI_NUMBER + nearestSemitone;
    const noteIndex = ((midiNumber % 12) + 12) % 12;
    const octave = Math.floor(midiNumber / 12) - 1;
    const note = NOTE_NAMES[noteIndex];

    return { note, octave, cents };
  }

  /**
   * Verifica se a frequência está dentro da tolerância para afinação
   */
  public isInTune(cents: number, tolerance: number = 5): boolean {
    return Math.abs(cents) <= tolerance;
  }

  /**
   * Retorna a corda mais próxima para afinação
   */
  public getNearestString(frequency: number): { string: number; note: string; targetFrequency: number; cents: number } | null {
    let nearestString = 0;
    let nearestDistance = Infinity;
    let nearestData = GUITAR_STANDARD_TUNING[1];

    for (const [stringNum, data] of Object.entries(GUITAR_STANDARD_TUNING)) {
      const distance = Math.abs(frequency - data.frequency);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestString = parseInt(stringNum);
        nearestData = data;
      }
    }

    if (nearestDistance > 50) {
      // Frequência muito longe de qualquer corda
      return null;
    }

    const cents = Math.round(1200 * Math.log2(frequency / nearestData.frequency));

    return {
      string: nearestString,
      note: nearestData.note,
      targetFrequency: nearestData.frequency,
      cents,
    };
  }

  /**
   * Registra callback para resultados de detecção
   */
  public onPitch(callback: (result: PitchDetectionResult | null) => void): () => void {
    this.onPitchCallbacks.add(callback);
    return () => this.onPitchCallbacks.delete(callback);
  }

  /**
   * Registra callback para erros
   */
  public onError(callback: (error: Error) => void): () => void {
    this.onErrorCallbacks.add(callback);
    return () => this.onErrorCallbacks.delete(callback);
  }

  /**
   * Retorna se está escutando
   */
  public getIsListening(): boolean {
    return this.isListening;
  }
}

export default PitchDetector;
