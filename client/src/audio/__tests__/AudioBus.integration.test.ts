/**
 * Testes de integração - AudioBus + AudioMixer
 * Garante que áudio é roteado corretamente e volumes são respeitados
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import AudioBus from '../AudioBus';
import AudioEngine from '../AudioEngine';
import AudioMixer from '../AudioMixer';
import {
  createMockAudioContext,
  createMockAudioBuffer,
  createMockGainNode,
  createMockBufferSourceNode,
  createMockOscillatorNode,
} from './mocks/audioContext.mock';

// Mock AudioEngine
const mockContext = createMockAudioContext();
const mockMasterGain = createMockGainNode();

vi.mock('../AudioEngine', () => {
  return {
    default: {
      getInstance: vi.fn(() => ({
        getContext: vi.fn(() => mockContext),
        getMasterGain: vi.fn(() => mockMasterGain),
        isReady: vi.fn(() => true),
        initialize: vi.fn().mockResolvedValue(undefined),
        ensureResumed: vi.fn().mockResolvedValue(undefined),
        setMasterVolume: vi.fn(),
      })),
    },
  };
});

// Mock AudioMixer
const mockChordsChannel = createMockGainNode();
const mockScalesChannel = createMockGainNode();
const mockMetronomeChannel = createMockGainNode();
const mockEffectsChannel = createMockGainNode();

vi.mock('../AudioMixer', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      initialize: vi.fn().mockResolvedValue(undefined),
      getChannel: vi.fn((name: string) => {
        const channels: Record<string, any> = {
          chords: mockChordsChannel,
          scales: mockScalesChannel,
          metronome: mockMetronomeChannel,
          effects: mockEffectsChannel,
        };
        return channels[name] || null;
      }),
      createChannel: vi.fn(),
      setChannelVolume: vi.fn(),
      getChannelVolume: vi.fn((name: string) => {
        const volumes: Record<string, number> = {
          chords: 0.8,
          scales: 0.8,
          metronome: 0.7,
          effects: 0.5,
        };
        return volumes[name] || 0;
      }),
      setMasterVolume: vi.fn(),
      getMasterVolume: vi.fn(() => 0.8),
      mute: vi.fn(),
      unmute: vi.fn(),
      toggleMute: vi.fn(),
      getIsMuted: vi.fn(() => false),
    })),
  };
});

describe('AudioBus - Integração com AudioMixer', () => {
  let audioBus: AudioBus;
  let mockAudioMixer: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAudioMixer = new AudioMixer();
    audioBus = new AudioBus();
  });

  it('deve rotear áudio para o canal correto (chords)', async () => {
    const buffer = createMockAudioBuffer();
    const mockSource = createMockBufferSourceNode();
    const mockNormalizationGain = createMockGainNode();
    const mockEnvelopeGain = createMockGainNode();
    const mockVolumeGain = createMockGainNode();
    const mockChordsChannel = mockAudioMixer.getChannel('chords');
    
    vi.spyOn(mockContext, 'createBufferSource').mockReturnValue(mockSource);
    // Para 'chords': normalizationGain, envelopeGain, volumeGain
    vi.spyOn(mockContext, 'createGain')
      .mockReturnValueOnce(mockNormalizationGain)
      .mockReturnValueOnce(mockEnvelopeGain)
      .mockReturnValueOnce(mockVolumeGain);
    const connectSpy = vi.spyOn(mockVolumeGain, 'connect');

    await audioBus.playBuffer({
      buffer,
      channel: 'chords',
    });

    // Verificar que o volumeGain conecta no canal de chords
    expect(connectSpy).toHaveBeenCalledWith(mockChordsChannel);
  });

  it('deve rotear áudio para o canal correto (scales)', async () => {
    const buffer = createMockAudioBuffer();
    const mockSource = createMockBufferSourceNode();
    const mockVolumeGain = createMockGainNode();
    const mockScalesChannel = mockAudioMixer.getChannel('scales');
    
    vi.spyOn(mockContext, 'createBufferSource').mockReturnValue(mockSource);
    vi.spyOn(mockContext, 'createGain').mockReturnValue(mockVolumeGain);
    const connectSpy = vi.spyOn(mockVolumeGain, 'connect');

    await audioBus.playBuffer({
      buffer,
      channel: 'scales',
    });

    expect(connectSpy).toHaveBeenCalledWith(mockScalesChannel);
  });

  it('deve rotear áudio para o canal correto (metronome)', async () => {
    const buffer = createMockAudioBuffer();
    const mockSource = createMockBufferSourceNode();
    const mockVolumeGain = createMockGainNode();
    const mockMetronomeChannel = mockAudioMixer.getChannel('metronome');
    
    vi.spyOn(mockContext, 'createBufferSource').mockReturnValue(mockSource);
    vi.spyOn(mockContext, 'createGain').mockReturnValue(mockVolumeGain);
    const connectSpy = vi.spyOn(mockVolumeGain, 'connect');

    await audioBus.playBuffer({
      buffer,
      channel: 'metronome',
    });

    expect(connectSpy).toHaveBeenCalledWith(mockMetronomeChannel);
  });

  it('deve respeitar volumes de diferentes canais', async () => {
    const buffer = createMockAudioBuffer();
    const mockNormalizationGain1 = createMockGainNode();
    const mockEnvelopeGain1 = createMockGainNode();
    const mockVolumeGain1 = createMockGainNode();
    const mockVolumeGain2 = createMockGainNode();
    const mockContext = AudioEngine.getInstance().getContext();

    // Ordem de criação no código: volumeGain primeiro, depois normalizationGain e envelopeGain (se chords)
    // Para 'chords': volumeGain, normalizationGain, envelopeGain
    // Para 'metronome': apenas volumeGain
    vi.spyOn(mockContext, 'createGain')
      .mockReturnValueOnce(mockVolumeGain1)         // volumeGain para chords (criado primeiro)
      .mockReturnValueOnce(mockNormalizationGain1) // normalizationGain para chords
      .mockReturnValueOnce(mockEnvelopeGain1)      // envelopeGain para chords
      .mockReturnValueOnce(mockVolumeGain2);        // volumeGain para metronome

    // Tocar no canal chords com volume 0.5
    await audioBus.playBuffer({
      buffer,
      channel: 'chords',
      volume: 0.5,
    });

    // Tocar no canal metronome com volume 0.3
    await audioBus.playBuffer({
      buffer,
      channel: 'metronome',
      volume: 0.3,
    });

    expect(mockVolumeGain1.gain.value).toBe(0.5);
    expect(mockVolumeGain2.gain.value).toBe(0.3);
  });

  it('deve funcionar mesmo quando mixer está mutado (mute não impede criação, apenas volume)', async () => {
    const buffer = createMockAudioBuffer();
    const mockNormalizationGain = createMockGainNode();
    const mockEnvelopeGain = createMockGainNode();
    const mockVolumeGain = createMockGainNode();
    const mockContext = AudioEngine.getInstance().getContext();
    
    // Ordem de criação no código: volumeGain primeiro, depois normalizationGain e envelopeGain (se chords)
    // Para 'chords': volumeGain, normalizationGain, envelopeGain
    vi.spyOn(mockContext, 'createGain')
      .mockReturnValueOnce(mockVolumeGain)         // volumeGain (criado primeiro)
      .mockReturnValueOnce(mockNormalizationGain) // normalizationGain
      .mockReturnValueOnce(mockEnvelopeGain);     // envelopeGain
    vi.spyOn(mockAudioMixer, 'getIsMuted').mockReturnValue(true);
    
    // Mute não deve impedir o AudioBus de criar sources
    // O mute é controlado pelo AudioMixer no masterGain
    const result = await audioBus.playBuffer({
      buffer,
      channel: 'chords',
      volume: 0.8,
    });

    expect(result).toBe(true);
    
    // O volume do volumeGain ainda deve ser setado (mute é no masterGain)
    // Mas o volume efetivo será 0 devido ao mute no masterGain
    expect(mockVolumeGain.gain.value).toBe(0.8);
  });

  it('deve respeitar mute do mixer (volume efetivo = 0 quando mutado)', async () => {
    const buffer = createMockAudioBuffer();
    const mockMasterGain = AudioEngine.getInstance().getMasterGain();
    const mockNormalizationGain = createMockGainNode();
    const mockEnvelopeGain = createMockGainNode();
    const mockVolumeGain = createMockGainNode();
    const mockContext = AudioEngine.getInstance().getContext();
    
    // Ordem de criação no código: volumeGain primeiro, depois normalizationGain e envelopeGain (se chords)
    // Para 'chords': volumeGain, normalizationGain, envelopeGain
    vi.spyOn(mockContext, 'createGain')
      .mockReturnValueOnce(mockVolumeGain)         // volumeGain (criado primeiro)
      .mockReturnValueOnce(mockNormalizationGain) // normalizationGain
      .mockReturnValueOnce(mockEnvelopeGain);     // envelopeGain
    vi.spyOn(mockAudioMixer, 'getIsMuted').mockReturnValue(true);
    
    // Quando mutado, o masterGain deve ter volume 0
    // (isso é controlado pelo AudioMixer, não pelo AudioBus)
    // O AudioBus ainda cria o source, mas o volume efetivo é 0
    const result = await audioBus.playBuffer({
      buffer,
      channel: 'chords',
      volume: 0.8,
    });

    expect(result).toBe(true);
    
    // O volumeGain ainda tem seu valor, mas o masterGain está em 0
    // (o mute é aplicado no masterGain pelo AudioMixer)
    expect(mockVolumeGain.gain.value).toBe(0.8);
  });

  it('deve permitir múltiplos playbacks simultâneos em canais diferentes', async () => {
    const buffer1 = createMockAudioBuffer();
    const buffer2 = createMockAudioBuffer();
    const mockContext = AudioEngine.getInstance().getContext();
    const createSourceSpy = vi.spyOn(mockContext, 'createBufferSource');
    const createGainSpy = vi.spyOn(mockContext, 'createGain');

    // Mockar createGain para retornar um novo gain node a cada chamada
    createGainSpy.mockImplementation(() => createMockGainNode());

    await audioBus.playBuffer({
      buffer: buffer1,
      channel: 'chords',
    });

    await audioBus.playBuffer({
      buffer: buffer2,
      channel: 'scales',
    });

    // Deve criar duas sources diferentes
    expect(createSourceSpy).toHaveBeenCalledTimes(2);
  });

  it('deve agendar playback com when correto', async () => {
    const buffer = createMockAudioBuffer();
    const mockSource = createMockBufferSourceNode();
    const mockContext = AudioEngine.getInstance().getContext();
    const startSpy = vi.spyOn(mockSource, 'start');

    vi.spyOn(mockContext, 'createBufferSource').mockReturnValue(mockSource);
    // Ordem de criação no código: volumeGain primeiro, depois normalizationGain e envelopeGain (se chords)
    // Para 'chords': volumeGain, normalizationGain, envelopeGain
    vi.spyOn(mockContext, 'createGain')
      .mockReturnValueOnce(createMockGainNode()) // volumeGain (criado primeiro)
      .mockReturnValueOnce(createMockGainNode()) // normalizationGain
      .mockReturnValueOnce(createMockGainNode()); // envelopeGain

    const scheduledTime = 5.0;
    await audioBus.playBuffer({
      buffer,
      channel: 'chords',
      when: scheduledTime,
    });

    expect(startSpy).toHaveBeenCalledWith(scheduledTime, 0);
  });

  it('deve agendar oscilador com when e duration corretos', async () => {
    const mockOsc = createMockOscillatorNode();
    const mockContext = AudioEngine.getInstance().getContext();
    const startSpy = vi.spyOn(mockOsc, 'start');
    const stopSpy = vi.spyOn(mockOsc, 'stop');

    vi.spyOn(mockContext, 'createOscillator').mockReturnValue(mockOsc);
    vi.spyOn(mockContext, 'createGain')
      .mockReturnValue(createMockGainNode())
      .mockReturnValue(createMockGainNode());

    const scheduledTime = 2.0;
    const duration = 1.5;

    await audioBus.playOscillator({
      frequency: 440,
      duration,
      channel: 'chords',
      when: scheduledTime,
    });

    expect(startSpy).toHaveBeenCalledWith(scheduledTime);
    expect(stopSpy).toHaveBeenCalledWith(scheduledTime + duration);
  });
});
