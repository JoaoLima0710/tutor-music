/**
 * Serviço de Processamento de Áudio em Tempo Real
 * Pipeline completo para captura, processamento e análise de áudio
 */

import { chordDetectionAIService, ChordClassificationResult } from './ChordDetectionAIService';

export interface AudioProcessingConfig {
  sampleRate: number;
  bufferSize: number;
  channels: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface ProcessedAudioChunk {
  audioData: Float32Array;
  timestamp: number;
  duration: number;
  rms: number;
  peak: number;
  isSilent: boolean;
}

export interface AudioAnalysisResult {
  chunk: ProcessedAudioChunk;
  chordDetection?: ChordClassificationResult;
  quality: {
    signalToNoiseRatio: number;
    clarity: number;
    stability: number;
  };
}

export class AudioProcessingService {
  private static instance: AudioProcessingService;
  private audioContext: AudioContext | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private stream: MediaStream | null = null;

  private isInitialized = false;
  private isProcessing = false;
  private onAudioChunkCallback: ((result: AudioAnalysisResult) => void) | null = null;

  // Buffers para análise
  private audioBuffer: Float32Array;
  private circularBuffer: Float32Array;
  private bufferIndex = 0;
  private recentChunks: Float32Array[] = []; // Últimos 3 chunks para análise acumulada
  private maxRecentChunks = 3;

  // Configurações padrão (otimizadas para baixa latência)
  private config: AudioProcessingConfig = {
    sampleRate: 44100,
    bufferSize: 1024, // ~23ms de áudio a 44.1kHz (reduzido para menor latência)
    channels: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  };

  // Estatísticas de processamento
  private stats = {
    chunksProcessed: 0,
    averageLatency: 0,
    droppedFrames: 0,
    lastProcessingTime: 0
  };

  private constructor() {
    this.audioBuffer = new Float32Array(this.config.bufferSize);
    this.circularBuffer = new Float32Array(this.config.bufferSize * 4); // Buffer circular 4x maior
  }

  static getInstance(): AudioProcessingService {
    if (!AudioProcessingService.instance) {
      AudioProcessingService.instance = new AudioProcessingService();
    }
    return AudioProcessingService.instance;
  }

  /**
   * Inicializa o serviço de processamento de áudio
   */
  async initialize(config?: Partial<AudioProcessingConfig>): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.log('🎵 Inicializando processamento de áudio...');

      // Atualizar configurações
      if (config) {
        this.config = { ...this.config, ...config };
        this.audioBuffer = new Float32Array(this.config.bufferSize);
        this.circularBuffer = new Float32Array(this.config.bufferSize * 4);
      }

      // Solicitar acesso ao microfone
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channels,
          echoCancellation: this.config.echoCancellation,
          noiseSuppression: this.config.noiseSuppression,
          autoGainControl: this.config.autoGainControl
        }
      });

      // Criar contexto de áudio (otimizado para baixa latência)
      this.audioContext = new AudioContext({
        sampleRate: this.config.sampleRate,
        latencyHint: 'interactive' // Baixa latência
      });
      
      // Otimizar para processamento em tempo real
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Criar nós de áudio
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();

      // Configurar analyser (otimizado para baixa latência)
      this.analyser.fftSize = this.config.bufferSize * 2;
      this.analyser.smoothingTimeConstant = 0.3; // Aumentado para suavizar variações
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;

      // Criar processor para processamento em tempo real
      this.processor = this.audioContext.createScriptProcessor(
        this.config.bufferSize,
        this.config.channels,
        this.config.channels
      );

      // Conectar nós
      this.microphone.connect(this.analyser);
      this.microphone.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      // Configurar callback de processamento
      this.processor.onaudioprocess = this.handleAudioProcess.bind(this);

      // Inicializar serviço de IA para detecção de acordes
      await chordDetectionAIService.initialize();

      this.isInitialized = true;
      console.log('✅ Processamento de áudio inicializado');

      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar processamento de áudio:', error);
      this.dispose();
      return false;
    }
  }

  /**
   * Inicia processamento de áudio em tempo real
   */
  startProcessing(callback: (result: AudioAnalysisResult) => void): void {
    if (!this.isInitialized) {
      throw new Error('Serviço não inicializado. Chame initialize() primeiro.');
    }

    this.onAudioChunkCallback = callback;
    this.isProcessing = true;
    this.resetStats();

    console.log('▶️ Processamento de áudio iniciado');
  }

  /**
   * Para processamento de áudio
   */
  stopProcessing(): void {
    this.isProcessing = false;
    this.onAudioChunkCallback = null;
    console.log('⏹️ Processamento de áudio parado');
  }

  /**
   * Callback principal de processamento de áudio
   */
  private async handleAudioProcess(event: AudioProcessingEvent): Promise<void> {
    if (!this.isProcessing) return;

    const startTime = performance.now();

    try {
      // Obter dados do canal esquerdo (mono)
      const inputBuffer = event.inputBuffer.getChannelData(0);

      // Criar chunk processado
      const chunk = this.processAudioChunk(inputBuffer);

      // Analisar qualidade do sinal
      const quality = this.analyzeSignalQuality(chunk);

      // Detecção de acordes com IA (otimizada)
      let chordDetection: ChordClassificationResult | undefined;
      
      // Filtro mais inteligente: só detectar se há sinal significativo
      const hasSignificantSignal = chunk.rms > 0.02 && chunk.peak > 0.05 && !chunk.isSilent;
      
      if (hasSignificantSignal) {
        try {
          // Usar buffer acumulado para melhor análise (últimos 3 chunks)
          const accumulatedBuffer = this.getAccumulatedBuffer();
          
          // Detectar apenas se o buffer acumulado tem duração suficiente (~70ms)
          if (accumulatedBuffer.length >= this.config.bufferSize * 3) {
            chordDetection = await chordDetectionAIService.detectChord(accumulatedBuffer);
          }
        } catch (error) {
          console.warn('Erro na detecção de acordes:', error);
        }
      }

      // Criar resultado completo
      const result: AudioAnalysisResult = {
        chunk,
        chordDetection,
        quality
      };

      // Chamar callback se registrado
      if (this.onAudioChunkCallback) {
        this.onAudioChunkCallback(result);
      }

      // Atualizar estatísticas
      this.updateStats(performance.now() - startTime);

    } catch (error) {
      console.error('Erro no processamento de áudio:', error);
      this.stats.droppedFrames++;
    }
  }

  /**
   * Processa um chunk de áudio
   */
  private processAudioChunk(inputBuffer: Float32Array): ProcessedAudioChunk {
    // Copiar dados para buffer circular
    for (let i = 0; i < inputBuffer.length; i++) {
      this.circularBuffer[this.bufferIndex] = inputBuffer[i];
      this.bufferIndex = (this.bufferIndex + 1) % this.circularBuffer.length;
    }

    // Extrair chunk atual do buffer circular (últimos bufferSize samples)
    const chunkStart = (this.bufferIndex - this.config.bufferSize + this.circularBuffer.length) % this.circularBuffer.length;
    const audioData = new Float32Array(this.config.bufferSize);

    for (let i = 0; i < this.config.bufferSize; i++) {
      audioData[i] = this.circularBuffer[(chunkStart + i) % this.circularBuffer.length];
    }
    
    // Manter histórico de chunks recentes para análise acumulada
    this.recentChunks.push(new Float32Array(audioData));
    if (this.recentChunks.length > this.maxRecentChunks) {
      this.recentChunks.shift();
    }

    // Calcular métricas básicas
    const rms = this.calculateRMS(audioData);
    const peak = this.calculatePeak(audioData);
    const isSilent = rms < 0.005; // Threshold de silêncio

    return {
      audioData,
      timestamp: Date.now(),
      duration: this.config.bufferSize / this.config.sampleRate,
      rms,
      peak,
      isSilent
    };
  }

  /**
   * Calcula RMS (Root Mean Square) do sinal
   */
  private calculateRMS(buffer: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  /**
   * Calcula pico do sinal
   */
  private calculatePeak(buffer: Float32Array): number {
    let peak = 0;
    for (let i = 0; i < buffer.length; i++) {
      peak = Math.max(peak, Math.abs(buffer[i]));
    }
    return peak;
  }

  /**
   * Analisa qualidade do sinal
   */
  private analyzeSignalQuality(chunk: ProcessedAudioChunk): AudioAnalysisResult['quality'] {
    const { audioData } = chunk;

    // Signal-to-Noise Ratio (simplificado)
    const signalPower = chunk.rms * chunk.rms;
    const noisePower = this.estimateNoisePower(audioData);
    const snr = signalPower > 0 ? 10 * Math.log10(signalPower / noisePower) : 0;

    // Clareza (presença de fundamental vs ruído)
    const clarity = this.calculateSignalClarity(audioData);

    // Estabilidade (consistência do sinal)
    const stability = this.calculateSignalStability(audioData);

    return {
      signalToNoiseRatio: snr,
      clarity,
      stability
    };
  }

  /**
   * Estima potência do ruído
   */
  private estimateNoisePower(audioData: Float32Array): number {
    // Método simplificado: usar amostras com baixa amplitude como ruído
    const noiseSamples: number[] = [];

    for (let i = 0; i < audioData.length; i++) {
      if (Math.abs(audioData[i]) < 0.01) { // Threshold baixo
        noiseSamples.push(audioData[i]);
      }
    }

    if (noiseSamples.length === 0) return 0.0001; // Valor mínimo

    const noisePower = noiseSamples.reduce((sum, sample) => sum + sample * sample, 0) / noiseSamples.length;
    return Math.max(noisePower, 0.0001);
  }

  /**
   * Calcula clareza do sinal (fundamental vs harmônicos/ruído)
   */
  private calculateSignalClarity(audioData: Float32Array): number {
    // Implementação simplificada
    // Em produção, seria baseada em análise espectral

    // Calcular energia total
    const totalEnergy = audioData.reduce((sum, sample) => sum + sample * sample, 0);

    if (totalEnergy === 0) return 0;

    // Estimar energia do fundamental (usando autocorrelação)
    const fundamentalEnergy = this.estimateFundamentalEnergy(audioData);

    return Math.min(fundamentalEnergy / totalEnergy, 1);
  }

  /**
   * Estima energia do fundamental
   */
  private estimateFundamentalEnergy(audioData: Float32Array): number {
    // Autocorrelação simplificada para encontrar pico
    const sampleRate = this.config.sampleRate;
    const minFreq = 80;
    const maxFreq = 1000;

    const minPeriod = Math.floor(sampleRate / maxFreq);
    const maxPeriod = Math.floor(sampleRate / minFreq);

    let maxCorrelation = 0;

    for (let period = minPeriod; period <= maxPeriod; period++) {
      let correlation = 0;

      for (let i = 0; i < audioData.length - period; i++) {
        correlation += audioData[i] * audioData[i + period];
      }

      maxCorrelation = Math.max(maxCorrelation, correlation);
    }

    return maxCorrelation / audioData.length;
  }

  /**
   * Calcula estabilidade do sinal
   */
  private calculateSignalStability(audioData: Float32Array): number {
    // Medir variabilidade da amplitude ao longo do tempo
    const windowSize = Math.floor(audioData.length / 10);
    const windows: number[] = [];

    for (let i = 0; i < audioData.length; i += windowSize) {
      const window = audioData.slice(i, i + windowSize);
      const rms = this.calculateRMS(window);
      windows.push(rms);
    }

    if (windows.length < 2) return 1;

    // Calcular coeficiente de variação
    const mean = windows.reduce((a, b) => a + b, 0) / windows.length;
    const variance = windows.reduce((sum, rms) => sum + Math.pow(rms - mean, 2), 0) / windows.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;

    // Estabilidade = 1 - coeficiente de variação (normalizado)
    return Math.max(0, 1 - cv * 2);
  }

  /**
   * Obtém buffer acumulado dos últimos chunks (para melhor análise)
   */
  private getAccumulatedBuffer(): Float32Array {
    if (this.recentChunks.length === 0) {
      return new Float32Array(this.config.bufferSize);
    }
    
    const totalLength = this.recentChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const accumulated = new Float32Array(totalLength);
    
    let offset = 0;
    for (const chunk of this.recentChunks) {
      accumulated.set(chunk, offset);
      offset += chunk.length;
    }
    
    return accumulated;
  }

  /**
   * Atualiza estatísticas de processamento
   */
  private updateStats(processingTime: number): void {
    this.stats.chunksProcessed++;
    this.stats.lastProcessingTime = processingTime;

    // Calcular média móvel da latência
    const alpha = 0.1; // Fator de suavização
    this.stats.averageLatency = alpha * processingTime + (1 - alpha) * this.stats.averageLatency;
  }

  /**
   * Reseta estatísticas
   */
  private resetStats(): void {
    this.stats = {
      chunksProcessed: 0,
      averageLatency: 0,
      droppedFrames: 0,
      lastProcessingTime: 0
    };
  }

  /**
   * Obtém estatísticas de performance
   */
  getPerformanceStats(): {
    isInitialized: boolean;
    isProcessing: boolean;
    chunksProcessed: number;
    averageLatency: number;
    droppedFrames: number;
    sampleRate: number;
    bufferSize: number;
    aiServiceStats: any;
  } {
    return {
      isInitialized: this.isInitialized,
      isProcessing: this.isProcessing,
      chunksProcessed: this.stats.chunksProcessed,
      averageLatency: this.stats.averageLatency,
      droppedFrames: this.stats.droppedFrames,
      sampleRate: this.config.sampleRate,
      bufferSize: this.config.bufferSize,
      aiServiceStats: chordDetectionAIService.getPerformanceStats()
    };
  }

  /**
   * Atualiza configurações
   */
  updateConfig(config: Partial<AudioProcessingConfig>): void {
    const wasProcessing = this.isProcessing;

    if (wasProcessing) {
      this.stopProcessing();
    }

    this.config = { ...this.config, ...config };

    // Recriar buffers com novo tamanho
    this.audioBuffer = new Float32Array(this.config.bufferSize);
    this.circularBuffer = new Float32Array(this.config.bufferSize * 4);
    this.bufferIndex = 0;

    if (wasProcessing) {
      // Reinicializar com novas configurações
      this.dispose();
      this.initialize(this.config).then(success => {
        if (success && this.onAudioChunkCallback) {
          this.startProcessing(this.onAudioChunkCallback);
        }
      });
    }
  }

  /**
   * Limpa recursos
   */
  dispose(): void {
    this.stopProcessing();

    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.isInitialized = false;
    chordDetectionAIService.dispose();
  }
}

export const audioProcessingService = AudioProcessingService.getInstance();