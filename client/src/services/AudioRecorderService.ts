export interface Recording {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  duration: number;
  date: Date;
  songId?: string;
  accuracy?: number;
}

class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private isRecording = false;
  
  async initialize(): Promise<boolean> {
    try {
      // Request microphone permission
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        console.warn('audio/webm not supported, trying audio/mp4');
        if (!MediaRecorder.isTypeSupported('audio/mp4')) {
          throw new Error('No supported audio format found');
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize audio recorder:', error);
      return false;
    }
  }
  
  async startRecording(): Promise<boolean> {
    if (this.isRecording) {
      console.warn('Already recording');
      return false;
    }
    
    if (!this.stream) {
      const initialized = await this.initialize();
      if (!initialized) {
        return false;
      }
    }
    
    try {
      this.audioChunks = [];
      
      // Determine the best supported mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      this.mediaRecorder = new MediaRecorder(this.stream!, { mimeType });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start(1000); // Collect data every second
      this.startTime = Date.now();
      this.isRecording = true;
      
      console.log('Recording started');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }
  
  async stopRecording(): Promise<Recording | null> {
    if (!this.isRecording || !this.mediaRecorder) {
      console.warn('Not currently recording');
      return null;
    }
    
    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = () => {
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        const mimeType = this.mediaRecorder!.mimeType;
        const blob = new Blob(this.audioChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const recording: Recording = {
          id: `recording-${Date.now()}`,
          name: `Gravação ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
          blob,
          url,
          duration,
          date: new Date(),
        };
        
        this.isRecording = false;
        this.audioChunks = [];
        
        console.log('Recording stopped', recording);
        resolve(recording);
      };
      
      this.mediaRecorder!.stop();
    });
  }
  
  pauseRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.pause();
    }
  }
  
  resumeRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.resume();
    }
  }
  
  getIsRecording(): boolean {
    return this.isRecording;
  }
  
  getDuration(): number {
    if (!this.isRecording) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
  
  dispose() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.audioChunks = [];
    this.isRecording = false;
  }
  
  // Download recording as file
  downloadRecording(recording: Recording) {
    const a = document.createElement('a');
    a.href = recording.url;
    a.download = `${recording.name}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  // Clean up blob URL to prevent memory leaks
  revokeRecordingURL(url: string) {
    URL.revokeObjectURL(url);
  }
}

// Singleton instance
export const audioRecorderService = new AudioRecorderService();
