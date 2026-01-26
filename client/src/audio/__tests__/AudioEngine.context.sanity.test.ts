import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import AudioEngine from '../AudioEngine';

let mockResume: ReturnType<typeof vi.fn>;

beforeAll(() => {
  // Mock mínimo da Web Audio API
  mockResume = vi.fn().mockResolvedValue(undefined);
  
  global.AudioContext = vi.fn().mockImplementation(() => {
    const mockContext = {
      state: 'running',
      resume: mockResume,
      createGain: vi.fn(() => ({
        connect: vi.fn(),
        gain: { value: 1 }
      })),
      destination: {}
    };
    
    // Permitir alterar o estado
    Object.defineProperty(mockContext, 'state', {
      get: () => (mockContext as any)._state || 'running',
      set: (value) => { (mockContext as any)._state = value; },
      configurable: true
    });
    
    return mockContext;
  }) as any;
});

describe('AudioEngine sanity (mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResume.mockClear();
  });

  it('inicializa AudioEngine sem erro', async () => {
    const engine = AudioEngine.getInstance();

    await expect(engine.initialize()).resolves.not.toThrow();
    expect(engine.isReady()).toBe(true);
  });

  it('chama resume no unlock', async () => {
    const engine = AudioEngine.getInstance();
    await engine.initialize();

    const ctx = engine.getContext();
    (ctx as any).state = 'suspended';

    await engine.unlockAudio();

    expect(ctx.resume).toHaveBeenCalled();
  });
});
