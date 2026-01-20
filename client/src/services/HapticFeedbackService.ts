/**
 * Serviço de Feedback Tátil (Vibração)
 * Fornece feedback háptico em dispositivos móveis
 */

class HapticFeedbackService {
  private isSupported: boolean;
  private isEnabled: boolean = true; // Padrão: habilitado

  constructor() {
    // Verificar suporte à Vibration API
    this.isSupported = 'vibrate' in navigator;
    
    // Carregar preferência do usuário
    const saved = localStorage.getItem('haptic_feedback_enabled');
    if (saved !== null) {
      this.isEnabled = saved === 'true';
    }
  }

  /**
   * Verifica se o feedback tátil está disponível
   */
  isAvailable(): boolean {
    return this.isSupported && this.isEnabled;
  }

  /**
   * Habilita ou desabilita o feedback tátil
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('haptic_feedback_enabled', String(enabled));
  }

  /**
   * Verifica se está habilitado
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Vibração curta (50ms) - para acertos
   */
  success(): void {
    if (!this.isAvailable()) return;
    try {
      navigator.vibrate(50);
    } catch (error) {
      console.warn('Erro ao vibrar:', error);
    }
  }

  /**
   * Vibração dupla - para completar módulo
   */
  complete(): void {
    if (!this.isAvailable()) return;
    try {
      navigator.vibrate([50, 30, 50]);
    } catch (error) {
      console.warn('Erro ao vibrar:', error);
    }
  }

  /**
   * Vibração longa (200ms) - para subir de nível
   */
  levelUp(): void {
    if (!this.isAvailable()) return;
    try {
      navigator.vibrate(200);
    } catch (error) {
      console.warn('Erro ao vibrar:', error);
    }
  }

  /**
   * Vibração de erro
   */
  error(): void {
    if (!this.isAvailable()) return;
    try {
      navigator.vibrate([100, 50, 100]);
    } catch (error) {
      console.warn('Erro ao vibrar:', error);
    }
  }

  /**
   * Vibração de alerta
   */
  alert(): void {
    if (!this.isAvailable()) return;
    try {
      navigator.vibrate([100, 30, 100, 30, 100]);
    } catch (error) {
      console.warn('Erro ao vibrar:', error);
    }
  }

  /**
   * Vibração customizada
   */
  custom(pattern: number | number[]): void {
    if (!this.isAvailable()) return;
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Erro ao vibrar:', error);
    }
  }

  /**
   * Cancela qualquer vibração em andamento
   */
  cancel(): void {
    if (!this.isSupported) return;
    try {
      navigator.vibrate(0);
    } catch (error) {
      console.warn('Erro ao cancelar vibração:', error);
    }
  }
}

export const hapticFeedbackService = new HapticFeedbackService();
