import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extende os matchers do Jest DOM
expect.extend(matchers);

// Limpa após cada teste
afterEach(() => {
  cleanup();
  // Limpa localStorage
  localStorage.clear();
  // Limpa mocks
  vi.clearAllMocks();
});

// Mock de navigator.mediaDevices.getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: vi.fn(() => [
        { stop: vi.fn() }
      ])
    })
  },
  writable: true
});

// Mock de AudioContext
global.AudioContext = vi.fn().mockImplementation(() => ({
  createAnalyser: vi.fn(),
  createGain: vi.fn(),
  createOscillator: vi.fn(),
  createBufferSource: vi.fn(),
  createDynamicsCompressor: vi.fn(),
  createBiquadFilter: vi.fn(),
  createDelay: vi.fn(),
  createConvolver: vi.fn(),
  createScriptProcessor: vi.fn(),
  createChannelSplitter: vi.fn(),
  createChannelMerger: vi.fn(),
  createPanner: vi.fn(),
  createStereoPanner: vi.fn(),
  createWaveShaper: vi.fn(),
  createMediaStreamDestination: vi.fn(),
  createMediaElementSource: vi.fn(),
  createMediaStreamSource: vi.fn(),
  createConstantSource: vi.fn(),
  destination: {},
  state: 'running',
  sampleRate: 44100,
  baseLatency: 0,
  outputLatency: 0,
  currentTime: 0,
  suspend: vi.fn().mockResolvedValue(undefined),
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock de performance.now
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
};

// Mock de requestAnimationFrame
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn(id => clearTimeout(id));

// Mock de ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));