/**
 * SongPlayerService
 * 
 * Serviço avançado para reprodução de músicas com sincronização precisa
 * de tabs/cifras e reprodução de acordes em tempo real.
 */

import { unifiedAudioService } from './UnifiedAudioService';

export interface SongLine {
  text: string;
  timestamp?: number; // Timestamp em segundos (opcional)
  chords?: string[]; // Acordes na linha
  isSection?: boolean; // Se é marcador de seção [Intro], [Verso], etc.
}

export interface SongPlayerConfig {
  bpm: number;
  speed: number; // 0.5x a 2x
  loop: boolean;
  loopStart?: number; // Linha inicial do loop
  loopEnd?: number; // Linha final do loop
  playChords: boolean; // Reproduzir acordes durante playback
  chordDelay: number; // Delay entre acordes (ms)
}

export type PlayerState = 'idle' | 'playing' | 'paused' | 'stopped';

export class SongPlayerService {
  private lines: SongLine[] = [];
  private config: SongPlayerConfig = {
    bpm: 120,
    speed: 1,
    loop: false,
    playChords: true,
    chordDelay: 100,
  };
  
  private state: PlayerState = 'idle';
  private currentLineIndex = 0;
  private currentTime = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private startTime = 0;
  private pausedTime = 0;
  
  private listeners: Map<string, Set<Function>> = new Map();
  
  // Callbacks
  private onLineChangeCallback?: (lineIndex: number, line: SongLine) => void;
  private onStateChangeCallback?: (state: PlayerState) => void;
  private onTimeUpdateCallback?: (time: number) => void;

  /**
   * Parse chord sheet string into structured lines
   */
  parseChordSheet(chordSheet: string): SongLine[] {
    const rawLines = chordSheet.split('\n').filter(line => line.trim() !== '');
    const lines: SongLine[] = [];
    
    rawLines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Section marker like [Intro], [Verso 1]
      if (trimmed.startsWith('[') && trimmed.endsWith(']') && !trimmed.includes('[') && trimmed.length < 30) {
        lines.push({
          text: trimmed,
          isSection: true,
        });
      } else {
        // Extract chords from line
        const chordMatches = trimmed.match(/\[([^\]]+)\]/g);
        const chords = chordMatches ? chordMatches.map(m => m.replace(/[\[\]]/g, '')) : [];
        
        lines.push({
          text: trimmed,
          chords,
          timestamp: undefined, // Will be calculated based on BPM
        });
      }
    });
    
    return lines;
  }

  /**
   * Calculate timestamp for each line based on BPM
   */
  calculateTimestamps(lines: SongLine[], bpm: number, speed: number): SongLine[] {
    const beatsPerSecond = (bpm / 60) * speed;
    const secondsPerBeat = 1 / beatsPerSecond;
    
    // Assume 4 beats per line (can be customized)
    const secondsPerLine = secondsPerBeat * 4;
    
    let currentTime = 0;
    
    return lines.map(line => {
      if (line.isSection) {
        return line; // Sections don't have duration
      }
      
      const timestamp = currentTime;
      currentTime += secondsPerLine;
      
      return {
        ...line,
        timestamp,
      };
    });
  }

  /**
   * Initialize player with chord sheet
   */
  initialize(chordSheet: string, config: Partial<SongPlayerConfig> = {}) {
    this.lines = this.parseChordSheet(chordSheet);
    this.config = { ...this.config, ...config };
    
    // Calculate timestamps
    this.lines = this.calculateTimestamps(
      this.lines,
      this.config.bpm,
      this.config.speed
    );
    
    this.reset();
    this.notifyListeners('initialized', { lines: this.lines, config: this.config });
  }

  /**
   * Play the song
   */
  async play() {
    if (this.state === 'playing') return;
    
    if (this.state === 'paused') {
      // Resume from paused position
      this.startTime = Date.now() - this.pausedTime;
    } else {
      // Start from beginning or loop start
      const startIndex = this.config.loop && this.config.loopStart !== undefined
        ? this.config.loopStart
        : 0;
      
      this.currentLineIndex = startIndex;
      this.currentTime = this.lines[startIndex]?.timestamp || 0;
      this.startTime = Date.now() - (this.currentTime * 1000);
    }
    
    this.state = 'playing';
    this.notifyListeners('stateChange', this.state);
    this.onStateChangeCallback?.(this.state);
    
    // Start playback loop
    this.startPlaybackLoop();
  }

  /**
   * Pause the song
   */
  pause() {
    if (this.state !== 'playing') return;
    
    this.pausedTime = Date.now() - this.startTime;
    this.state = 'paused';
    this.stopPlaybackLoop();
    this.notifyListeners('stateChange', this.state);
    this.onStateChangeCallback?.(this.state);
  }

  /**
   * Stop the song
   */
  stop() {
    this.state = 'stopped';
    this.stopPlaybackLoop();
    this.reset();
    this.notifyListeners('stateChange', this.state);
    this.onStateChangeCallback?.(this.state);
  }

  /**
   * Reset to beginning
   */
  reset() {
    this.currentLineIndex = 0;
    this.currentTime = 0;
    this.pausedTime = 0;
    this.startTime = 0;
    this.state = 'idle';
  }

  /**
   * Seek to specific line
   */
  seekToLine(lineIndex: number) {
    if (lineIndex < 0 || lineIndex >= this.lines.length) return;
    
    const wasPlaying = this.state === 'playing';
    
    if (wasPlaying) {
      this.pause();
    }
    
    this.currentLineIndex = lineIndex;
    this.currentTime = this.lines[lineIndex]?.timestamp || 0;
    this.pausedTime = this.currentTime * 1000;
    
    this.notifyListeners('lineChange', { lineIndex, line: this.lines[lineIndex] });
    this.onLineChangeCallback?.(lineIndex, this.lines[lineIndex]);
    
    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * Seek to specific time
   */
  seekToTime(time: number) {
    // Find line closest to this time
    const lineIndex = this.lines.findIndex(
      (line, index) => {
        const nextLine = this.lines[index + 1];
        return line.timestamp !== undefined &&
          time >= (line.timestamp || 0) &&
          (!nextLine || time < (nextLine.timestamp || Infinity));
      }
    );
    
    if (lineIndex >= 0) {
      this.seekToLine(lineIndex);
    }
  }

  /**
   * Set playback speed
   */
  setSpeed(speed: number) {
    this.config.speed = Math.max(0.5, Math.min(2, speed));
    
    // Recalculate timestamps with new speed
    this.lines = this.calculateTimestamps(
      this.lines,
      this.config.bpm,
      this.config.speed
    );
    
    this.notifyListeners('speedChange', this.config.speed);
  }

  /**
   * Set BPM
   */
  setBPM(bpm: number) {
    this.config.bpm = Math.max(60, Math.min(200, bpm));
    
    // Recalculate timestamps with new BPM
    this.lines = this.calculateTimestamps(
      this.lines,
      this.config.bpm,
      this.config.speed
    );
    
    this.notifyListeners('bpmChange', this.config.bpm);
  }

  /**
   * Toggle loop
   */
  setLoop(loop: boolean, startLine?: number, endLine?: number) {
    this.config.loop = loop;
    this.config.loopStart = startLine;
    this.config.loopEnd = endLine;
    this.notifyListeners('loopChange', { loop, startLine, endLine });
  }

  /**
   * Main playback loop
   */
  private startPlaybackLoop() {
    const updateInterval = 50; // Update every 50ms for smooth playback
    
    this.intervalId = setInterval(() => {
      if (this.state !== 'playing') {
        this.stopPlaybackLoop();
        return;
      }
      
      const elapsed = (Date.now() - this.startTime) / 1000;
      this.currentTime = elapsed;
      
      // Find current line based on timestamp
      let newLineIndex = this.currentLineIndex;
      
      // Check if we should move to next line
      const currentLine = this.lines[this.currentLineIndex];
      const nextLine = this.lines[this.currentLineIndex + 1];
      
      if (nextLine && nextLine.timestamp !== undefined && elapsed >= (nextLine.timestamp || 0)) {
        newLineIndex = this.currentLineIndex + 1;
      }
      
      // Check if we should move to previous line (when seeking backwards)
      if (currentLine && currentLine.timestamp !== undefined && elapsed < (currentLine.timestamp || 0)) {
        // Find the correct line
        for (let i = this.currentLineIndex - 1; i >= 0; i--) {
          const line = this.lines[i];
          if (line.timestamp !== undefined && elapsed >= (line.timestamp || 0)) {
            newLineIndex = i;
            break;
          }
        }
      }
      
      // Update line if changed
      if (newLineIndex !== this.currentLineIndex) {
        this.currentLineIndex = newLineIndex;
        
        const line = this.lines[this.currentLineIndex];
        
        // Play chords if enabled
        if (this.config.playChords && line.chords && line.chords.length > 0) {
          this.playChordsForLine(line.chords);
        }
        
        // Check for loop end
        if (this.config.loop && this.config.loopEnd !== undefined && this.currentLineIndex >= this.config.loopEnd) {
          this.seekToLine(this.config.loopStart || 0);
          return;
        }
        
        // Check for end of song
        if (this.currentLineIndex >= this.lines.length - 1) {
          if (this.config.loop) {
            this.seekToLine(this.config.loopStart || 0);
          } else {
            this.stop();
          }
          return;
        }
        
        this.notifyListeners('lineChange', { lineIndex: this.currentLineIndex, line });
        this.onLineChangeCallback?.(this.currentLineIndex, line);
      }
      
      this.notifyListeners('timeUpdate', this.currentTime);
      this.onTimeUpdateCallback?.(this.currentTime);
      
    }, updateInterval);
  }

  /**
   * Stop playback loop
   */
  private stopPlaybackLoop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Play chords for a line
   */
  private async playChordsForLine(chords: string[]) {
    if (!chords || chords.length === 0) return;
    
    // Play chords with slight delay between them
    for (let i = 0; i < chords.length; i++) {
      const chord = chords[i];
      
      // Normalize chord name (remove spaces, handle variations)
      const normalizedChord = chord.trim().replace(/\s+/g, '');
      
      // Play chord using unified audio service
      try {
        await unifiedAudioService.playChord(normalizedChord, 1.5);
      } catch (error) {
        console.warn(`Failed to play chord ${normalizedChord}:`, error);
      }
      
      // Delay between chords
      if (i < chords.length - 1) {
        await new Promise(resolve => setTimeout(resolve, this.config.chordDelay));
      }
    }
  }

  /**
   * Event listeners
   */
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private notifyListeners(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in listener for ${event}:`, error);
      }
    });
  }

  /**
   * Set callbacks
   */
  setOnLineChange(callback: (lineIndex: number, line: SongLine) => void) {
    this.onLineChangeCallback = callback;
  }

  setOnStateChange(callback: (state: PlayerState) => void) {
    this.onStateChangeCallback = callback;
  }

  setOnTimeUpdate(callback: (time: number) => void) {
    this.onTimeUpdateCallback = callback;
  }

  /**
   * Getters
   */
  getState(): PlayerState {
    return this.state;
  }

  getCurrentLineIndex(): number {
    return this.currentLineIndex;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getLines(): SongLine[] {
    return this.lines;
  }

  getConfig(): SongPlayerConfig {
    return { ...this.config };
  }

  getTotalDuration(): number {
    const lastLine = this.lines[this.lines.length - 1];
    return lastLine?.timestamp || 0;
  }

  /**
   * Cleanup
   */
  dispose() {
    this.stop();
    this.listeners.clear();
    this.onLineChangeCallback = undefined;
    this.onStateChangeCallback = undefined;
    this.onTimeUpdateCallback = undefined;
  }
}

// Export singleton instance
export const songPlayerService = new SongPlayerService();
