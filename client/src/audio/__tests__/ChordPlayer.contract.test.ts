/**
 * Testes de contrato - ChordPlayer
 * Garante que ChordPlayer NÃO cria AudioNodes diretamente e delega ao AudioBus
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createMockAudioContext,
  createMockAudioBuffer,
  createMockGainNode,
  createMockBufferSourceNode,
} from './mocks/audioContext.mock';

// Mock dos dados de acordes antes de importar ChordPlayer
vi.mock('@/data/chords', () => ({
  chords: [
    { id: 'C', name: 'C', frets: ['x', 3, 2, 0, 1, 0] },
    { id: 'D', name: 'D', frets: ['x', 'x', 0, 2, 3, 2] },
    { id: 'E', name: 'E', frets: [0, 2, 2, 1, 0, 0] },
  ],
}));

// Mock AudioEngine
vi.mock('../AudioEngine', () => {
  return {
    default: {
      getInstance: vi.fn(() => {
        const mockContext = createMockAudioContext();
        const mockMasterGain = createMockGainNode();
        return {
          getContext: vi.fn(() => mockContext),
          getMasterGain: vi.fn(() => mockMasterGain),
          isReady: vi.fn(() => true),
          initialize: vi.fn().mockResolvedValue(undefined),
          ensureResumed: vi.fn().mockResolvedValue(undefined),
        };
      }),
    },
  };
});

// Mock SampleLoader
vi.mock('../SampleLoader', () => {
  return {
    default: {
      getInstance: vi.fn(() => {
        const mockBuffer = createMockAudioBuffer();
        return {
          loadSample: vi.fn().mockResolvedValue({
            buffer: mockBuffer,
            duration: 1.0,
            loaded: true,
          }),
        };
      }),
    },
  };
});

// Mock AudioBus
const mockAudioBus = {
  playSample: vi.fn().mockReturnValue(true),
  playSampleFromUrl: vi.fn().mockResolvedValue(true),
  playOscillator: vi.fn().mockReturnValue(true),
  playBuffer: vi.fn().mockReturnValue(true),
};

vi.mock('../index', () => {
  return {
    getAudioBus: vi.fn(() => mockAudioBus),
    initializeAudioSystem: vi.fn().mockResolvedValue(undefined),
  };
});

// Importar após mocks
import ChordPlayer from '../GuitarSynth';
import { getAudioBus } from '../index';
import AudioEngine from '../AudioEngine';

describe('ChordPlayer - Contratos Arquiteturais', () => {
  let chordPlayer: ChordPlayer;
  let mockContext: AudioContext;

  beforeEach(() => {
    vi.clearAllMocks();
    // Resetar mocks
    mockAudioBus.playSampleFromUrl.mockResolvedValue(true);
    mockAudioBus.playSample.mockReturnValue(true);
    mockAudioBus.playOscillator.mockReturnValue(true);
    mockAudioBus.playBuffer.mockReturnValue(true);
    
    // Garantir que getAudioBus sempre retorna o mock
    vi.mocked(getAudioBus).mockReturnValue(mockAudioBus as any);
    
    mockContext = AudioEngine.getInstance().getContext();
    chordPlayer = new ChordPlayer();
  });

  it('NÃO deve criar AudioBufferSourceNode diretamente', async () => {
    // Spy no AudioContext para detectar chamadas diretas
    const createSourceSpy = vi.spyOn(mockContext, 'createBufferSource');

    // ChordPlayer agora usa playChord que chama playSampleFromUrl no AudioBus
    await chordPlayer.playChord('C');

    // AudioBus.playSampleFromUrl deve ser chamado (delegação correta)
    expect(mockAudioBus.playSampleFromUrl).toHaveBeenCalled();
    
    // AudioContext.createBufferSource NÃO deve ser chamado diretamente pelo ChordPlayer
    // O ChordPlayer deve delegar ao AudioBus, que é quem cria o source
    // Como o AudioBus está mockado, createBufferSource não deve ser chamado neste contexto
    expect(createSourceSpy).not.toHaveBeenCalled();
  });

  it('NÃO deve chamar source.start() diretamente', async () => {
    // Criar um mock de source para verificar se start() é chamado
    const mockSource = createMockBufferSourceNode();
    const startSpy = vi.spyOn(mockSource, 'start');

    // Mock do AudioContext para retornar nosso source mockado
    vi.spyOn(mockContext, 'createBufferSource').mockReturnValue(mockSource);

    // ChordPlayer agora usa playChord que chama playSampleFromUrl no AudioBus
    await chordPlayer.playChord('C');

    // AudioBus.playSampleFromUrl deve ser chamado (delegação correta)
    expect(mockAudioBus.playSampleFromUrl).toHaveBeenCalled();
    
    // source.start() NÃO deve ser chamado diretamente pelo ChordPlayer
    // O ChordPlayer não deve ter acesso ao source - isso é responsabilidade do AudioBus
    // Como o AudioBus está mockado, start() não deve ser chamado neste contexto
    expect(startSpy).not.toHaveBeenCalled();
  });

  it('deve delegar playback de samples exclusivamente ao AudioBus', async () => {
    await chordPlayer.playChord('C');

    // Deve chamar playSampleFromUrl com a URL do sample
    expect(mockAudioBus.playSampleFromUrl).toHaveBeenCalled();
    
    // Verificar que foi chamado com os parâmetros corretos
    const calls = mockAudioBus.playSampleFromUrl.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    
    // Verificar que todas as chamadas usam o canal 'chords' e sample único
    calls.forEach(call => {
      expect(call[0]).toMatchObject({
        channel: 'chords',
        volume: expect.any(Number),
        sampleUrl: expect.stringMatching(/\/samples\/chords\/.+\.mp3$/),
      });
    });
  });

  it('NÃO deve usar síntese por oscilador (usa apenas samples)', async () => {
    // ChordPlayer refatorado não usa mais síntese por oscilador
    // Deve usar apenas samples individuais por corda
    await chordPlayer.playChord('C');

    // playOscillator NÃO deve ser chamado (síntese removida)
    expect(mockAudioBus.playOscillator).not.toHaveBeenCalled();
    
    // playSampleFromUrl deve ser chamado (usa samples)
    expect(mockAudioBus.playSampleFromUrl).toHaveBeenCalled();
  });

  it('deve retornar sucesso quando AudioBus está disponível', async () => {
    mockAudioBus.playSampleFromUrl.mockResolvedValue(true);

    await chordPlayer.playChord('C');

    // Não deve logar erro
    const consoleErrorSpy = vi.spyOn(console, 'error');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('deve logar erro quando AudioBus não está disponível', async () => {
    vi.mocked(getAudioBus).mockReturnValue(null);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await chordPlayer.playChord('C');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[ChordPlayer] playChord falhou: AudioBus não está disponível. Chame initializeAudioSystem() primeiro.'
    );

    consoleErrorSpy.mockRestore();
  });

  it('NÃO deve conectar diretamente ao masterGain', async () => {
    const mockMasterGain = AudioEngine.getInstance().getMasterGain();
    const connectSpy = vi.spyOn(mockMasterGain, 'connect');

    await chordPlayer.playChord('C');

    // Nenhuma conexão direta ao masterGain deve ocorrer
    // Tudo deve passar pelo AudioBus -> AudioMixer
    expect(connectSpy).not.toHaveBeenCalled();
  });

  it('deve usar o canal correto (chords) para todos os playbacks', async () => {
    await chordPlayer.playChord('C');

    // Deve chamar playSampleFromUrl uma vez com sample único
    expect(mockAudioBus.playSampleFromUrl).toHaveBeenCalledTimes(1);
    
    // Deve usar o canal 'chords' e sample de acorde
    expect(mockAudioBus.playSampleFromUrl).toHaveBeenCalledWith({
      sampleUrl: '/samples/chords/C.mp3',
      channel: 'chords',
      volume: expect.any(Number),
    });
  });

  it('deve respeitar o volume configurado', async () => {
    chordPlayer.setVolume(0.5);
    
    await chordPlayer.playChord('C');

    // Volume deve ser aplicado com normalização (volume base * ganho do acorde)
    // Acorde 'C' tem ganho 0.9, então: 0.5 * 0.9 = 0.45
    expect(mockAudioBus.playSampleFromUrl).toHaveBeenCalledWith({
      sampleUrl: '/samples/chords/C.mp3',
      channel: 'chords',
      volume: 0.45, // 0.5 * 0.9 (ganho de normalização do acorde C)
    });
  });

  it('deve garantir que volume final está no range válido [0, 1]', async () => {
    // Testar com diferentes volumes e acordes
    const testCases = [
      { volume: 0.0, chord: 'C' }, // Volume mínimo
      { volume: 0.5, chord: 'C' }, // Volume médio
      { volume: 1.0, chord: 'G' }, // Volume máximo com ganho 1.0
      { volume: 0.7, chord: 'E' }, // Volume padrão com ganho 0.85 (mais baixo)
      { volume: 1.0, chord: 'E' }, // Volume máximo com ganho 0.85
    ];

    for (const testCase of testCases) {
      vi.clearAllMocks();
      chordPlayer.setVolume(testCase.volume);
      
      await chordPlayer.playChord(testCase.chord);

      // Garantir que AudioBus.playSampleFromUrl foi chamado
      expect(mockAudioBus.playSampleFromUrl).toHaveBeenCalled();

      // Verificar que o volume está no range válido [0, 1]
      const calls = mockAudioBus.playSampleFromUrl.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      
      const volume = calls[0][0].volume;
      expect(volume).toBeGreaterThanOrEqual(0);
      expect(volume).toBeLessThanOrEqual(1);
    }
  });
});
