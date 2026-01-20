/**
 * Classes de erro customizadas para serviços de áudio
 */

export class AudioError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly userMessage: string,
    public readonly recoverable: boolean = true
  ) {
    super(message);
    this.name = 'AudioError';
    Object.setPrototypeOf(this, AudioError.prototype);
  }
}

export class AudioPermissionError extends AudioError {
  constructor(message: string = 'Microphone permission denied') {
    super(
      message,
      'AUDIO_PERMISSION_DENIED',
      'Permissão de microfone negada. Por favor, permita o acesso ao microfone nas configurações do navegador.',
      true
    );
    this.name = 'AudioPermissionError';
    Object.setPrototypeOf(this, AudioPermissionError.prototype);
  }
}

export class BrowserNotSupportedError extends AudioError {
  constructor(message: string = 'Browser does not support Web Audio API') {
    super(
      message,
      'BROWSER_NOT_SUPPORTED',
      'Seu navegador não suporta recursos de áudio necessários. Por favor, atualize para uma versão mais recente.',
      false
    );
    this.name = 'BrowserNotSupportedError';
    Object.setPrototypeOf(this, BrowserNotSupportedError.prototype);
  }
}

export class AudioContextError extends AudioError {
  constructor(message: string = 'Failed to create AudioContext') {
    super(
      message,
      'AUDIO_CONTEXT_ERROR',
      'Não foi possível inicializar o sistema de áudio. Tente recarregar a página.',
      true
    );
    this.name = 'AudioContextError';
    Object.setPrototypeOf(this, AudioContextError.prototype);
  }
}

export class AudioInitializationError extends AudioError {
  constructor(message: string = 'Failed to initialize audio service') {
    super(
      message,
      'AUDIO_INIT_ERROR',
      'Erro ao inicializar o serviço de áudio. Verifique se o navegador suporta Web Audio API.',
      true
    );
    this.name = 'AudioInitializationError';
    Object.setPrototypeOf(this, AudioInitializationError.prototype);
  }
}

export class AudioPlaybackError extends AudioError {
  constructor(message: string = 'Failed to play audio') {
    super(
      message,
      'AUDIO_PLAYBACK_ERROR',
      'Erro ao reproduzir áudio. Verifique se o serviço de áudio está inicializado.',
      true
    );
    this.name = 'AudioPlaybackError';
    Object.setPrototypeOf(this, AudioPlaybackError.prototype);
  }
}

export class SampleLoadError extends AudioError {
  constructor(message: string = 'Failed to load audio samples') {
    super(
      message,
      'SAMPLE_LOAD_ERROR',
      'Erro ao carregar samples de áudio. Usando áudio sintético temporariamente.',
      true
    );
    this.name = 'SampleLoadError';
    Object.setPrototypeOf(this, SampleLoadError.prototype);
  }
}

/**
 * Verifica se o navegador suporta Web Audio API
 */
export function checkBrowserSupport(): { supported: boolean; error?: BrowserNotSupportedError } {
  if (typeof window === 'undefined') {
    return { supported: false, error: new BrowserNotSupportedError('Window object not available') };
  }

  const hasAudioContext = !!(window.AudioContext || (window as any).webkitAudioContext);
  const hasGetUserMedia = !!(navigator.mediaDevices?.getUserMedia || (navigator as any).getUserMedia);

  if (!hasAudioContext) {
    return { supported: false, error: new BrowserNotSupportedError('AudioContext not supported') };
  }

  return { supported: true };
}

/**
 * Trata erros de áudio e retorna mensagem amigável
 */
export function handleAudioError(error: unknown): { message: string; recoverable: boolean; code: string } {
  if (error instanceof AudioError) {
    return {
      message: error.userMessage,
      recoverable: error.recoverable,
      code: error.code,
    };
  }

  // Tratar erros específicos do DOM
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return {
        message: 'Permissão de microfone negada. Por favor, permita o acesso nas configurações do navegador.',
        recoverable: true,
        code: 'AUDIO_PERMISSION_DENIED',
      };
    }

    if (error.name === 'NotSupportedError') {
      return {
        message: 'Seu navegador não suporta este recurso de áudio. Por favor, atualize o navegador.',
        recoverable: false,
        code: 'BROWSER_NOT_SUPPORTED',
      };
    }

    if (error.name === 'AbortError') {
      return {
        message: 'Operação de áudio cancelada.',
        recoverable: true,
        code: 'AUDIO_ABORTED',
      };
    }
  }

  // Erro genérico
  return {
    message: 'Erro desconhecido ao processar áudio. Tente recarregar a página.',
    recoverable: true,
    code: 'UNKNOWN_AUDIO_ERROR',
  };
}
