/**
 * Testes unitários para PitchDetectionService
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { pitchDetectionService, PitchDetectionResult } from '@/services/PitchDetectionService';
import {
  AudioPermissionError,
  BrowserNotSupportedError,
  AudioContextError,
} from '@/errors/AudioErrors';

// Mock Web Audio API
class MockAudioContext {
  sampleRate = 44100;
  state = 'running';
  createMediaStreamSource = vi.fn(() => ({
    connect: vi.fn(),
  }));
  createAnalyser = vi.fn(() => ({
    fftSize: 4096,
    smoothingTimeConstant: 0.8,
    getFloatTimeDomainData: vi.fn(),
  }));
  close = vi.fn();
  suspend = vi.fn();
  resume = vi.fn();
}

// Mock MediaStream
class MockMediaStream {
  getTracks = vi.fn(() => [
    {
      stop: vi.fn(),
    },
  ]);
}

describe('PitchDetectionService', () => {
  beforeEach(() => {
    // Reset service state
    pitchDetectionService.dispose();
    
    // Mock global objects
    global.window = {
      AudioContext: MockAudioContext as any,
      webkitAudioContext: MockAudioContext as any,
    } as any;
    
    global.navigator = {
      mediaDevices: {
        getUserMedia: vi.fn(),
      },
    } as any;
  });

  afterEach(() => {
    pitchDetectionService.dispose();
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully with valid browser support', async () => {
      // Mock getUserMedia to return a stream
      (navigator.mediaDevices.getUserMedia as any) = vi.fn().mockResolvedValue(new MockMediaStream());
      
      const result = await pitchDetectionService.initialize();
      
      expect(result).toBe(true);
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    });

    it('should fail when browser does not support AudioContext', async () => {
      // Remove AudioContext support
      delete (global.window as any).AudioContext;
      delete (global.window as any).webkitAudioContext;
      
      const result = await pitchDetectionService.initialize();
      
      expect(result).toBe(false);
      const error = pitchDetectionService.getInitializationError();
      expect(error).toContain('não suporta');
    });

    it('should handle permission denied error', async () => {
      // Mock getUserMedia to throw permission error
      const permissionError = new DOMException('Permission denied', 'NotAllowedError');
      (navigator.mediaDevices.getUserMedia as any) = vi.fn().mockRejectedValue(permissionError);
      
      const result = await pitchDetectionService.initialize();
      
      expect(result).toBe(false);
      const error = pitchDetectionService.getInitializationError();
      expect(error).toContain('Permissão de microfone negada');
    });

    it('should handle AudioContext creation failure', async () => {
      // Mock getUserMedia to succeed
      (navigator.mediaDevices.getUserMedia as any) = vi.fn().mockResolvedValue(new MockMediaStream());
      
      // Mock AudioContext constructor to throw
      (global.window as any).AudioContext = vi.fn().mockImplementation(() => {
        throw new Error('AudioContext creation failed');
      });
      
      const result = await pitchDetectionService.initialize();
      
      expect(result).toBe(false);
      const error = pitchDetectionService.getInitializationError();
      expect(error).toBeTruthy();
    });
  });

  describe('isNoteMatch', () => {
    it('should match notes correctly within tolerance', () => {
      const detected: PitchDetectionResult = {
        frequency: 440,
        note: 'A',
        octave: 4,
        cents: 5, // 5 cents sharp
        clarity: 0.9,
      };
      
      const result = pitchDetectionService.isNoteMatch(detected, 'A4', 50);
      expect(result).toBe(true);
    });

    it('should not match different notes', () => {
      const detected: PitchDetectionResult = {
        frequency: 440,
        note: 'A',
        octave: 4,
        cents: 0,
        clarity: 0.9,
      };
      
      const result = pitchDetectionService.isNoteMatch(detected, 'C4', 50);
      expect(result).toBe(false);
    });

    it('should not match if cents deviation exceeds tolerance', () => {
      const detected: PitchDetectionResult = {
        frequency: 440,
        note: 'A',
        octave: 4,
        cents: 60, // 60 cents sharp (exceeds 50 tolerance)
        clarity: 0.9,
      };
      
      const result = pitchDetectionService.isNoteMatch(detected, 'A4', 50);
      expect(result).toBe(false);
    });
  });

  describe('getChordNotes', () => {
    it('should return correct notes for major chord', () => {
      const notes = pitchDetectionService.getChordNotes('C');
      expect(notes).toEqual(['C', 'E', 'G']);
    });

    it('should return correct notes for minor chord', () => {
      const notes = pitchDetectionService.getChordNotes('Am');
      expect(notes).toEqual(['A', 'C', 'E']);
    });

    it('should return correct notes for dominant 7th chord', () => {
      const notes = pitchDetectionService.getChordNotes('C7');
      expect(notes).toEqual(['C', 'E', 'G', 'A#']);
    });

    it('should return empty array for invalid chord', () => {
      const notes = pitchDetectionService.getChordNotes('Invalid');
      expect(notes).toEqual([]);
    });
  });

  describe('start and stop', () => {
    it('should not start if not initialized', () => {
      const callback = vi.fn();
      pitchDetectionService.start(callback);
      
      // Should not call callback if not initialized
      expect(callback).not.toHaveBeenCalled();
    });

    it('should stop detection', () => {
      pitchDetectionService.stop();
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('dispose', () => {
    it('should clean up resources', () => {
      pitchDetectionService.dispose();
      // Should not throw
      expect(true).toBe(true);
    });
  });
});
