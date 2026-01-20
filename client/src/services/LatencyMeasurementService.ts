/**
 * Serviço de Medição de Latência de Áudio
 * Mede latência real do sistema de áudio
 */

class LatencyMeasurementService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  /**
   * Mede latência real do sistema
   * Reproduz click, captura via microfone, calcula diferença
   */
  async measureLatency(): Promise<number | null> {
    try {
      // Solicitar acesso ao microfone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.stream = stream;

      // Criar AudioContext
      const audioContext = new AudioContext({ latencyHint: 'interactive' });
      this.audioContext = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3;
      this.analyser = analyser;

      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      this.microphone = microphone;

      // Criar oscilador para click de teste
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      this.oscillator = oscillator;
      this.gainNode = gainNode;

      oscillator.type = 'sine';
      oscillator.frequency.value = 1000; // 1 kHz
      gainNode.gain.value = 0.5;

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Capturar dados de áudio
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      // Marcar tempo de início
      const startTime = audioContext.currentTime;
      const playTime = startTime + 0.1; // Tocar após 100ms

      // Agendar click
      oscillator.start(playTime);
      oscillator.stop(playTime + 0.01); // Click de 10ms

      // Detectar quando click é capturado
      let detected = false;
      let detectedTime = 0;
      const maxWaitTime = 1.0; // Máximo 1 segundo

      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          analyser.getFloatTimeDomainData(dataArray);

          // Calcular RMS
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sum / bufferLength);

          // Se RMS > threshold, click foi detectado
          if (rms > 0.01 && !detected) {
            detected = true;
            detectedTime = audioContext.currentTime;
            clearInterval(checkInterval);

            // Calcular latência
            const latency = (detectedTime - playTime) * 1000; // Converter para ms
            this.cleanup();
            resolve(Math.max(0, latency));
          }

          // Timeout
          if (audioContext.currentTime - playTime > maxWaitTime) {
            clearInterval(checkInterval);
            this.cleanup();
            resolve(null);
          }
        }, 10); // Verificar a cada 10ms
      });
    } catch (error) {
      console.error('Erro ao medir latência:', error);
      this.cleanup();
      return null;
    }
  }

  /**
   * Limpa recursos
   */
  private cleanup(): void {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
    }
    if (this.microphone) {
      this.microphone.disconnect();
    }
    if (this.analyser) {
      this.analyser.disconnect();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

export const latencyMeasurementService = new LatencyMeasurementService();
