/**
 * Auto-Save de Sessões de Prática
 * Salva automaticamente o progresso a cada 30 segundos
 * Permite retomar sessão ao reabrir
 */

import { indexedDBService } from './IndexedDBService';
import type { PracticeSession } from './AIAssistantService';

interface SavedSession {
  id: string;
  session: Partial<PracticeSession>;
  timestamp: number;
  page: string;
  lastSaved: number;
}

const AUTO_SAVE_INTERVAL = 30000; // 30 segundos
const SESSION_STORAGE_KEY = 'musictutor_current_session';
const LAST_SESSION_KEY = 'musictutor_last_session';

class AutoSaveService {
  private saveInterval: NodeJS.Timeout | null = null;
  private currentSessionId: string | null = null;
  private currentPage: string = '';

  /**
   * Inicia uma nova sessão de prática
   */
  startSession(page: string, initialData: Partial<PracticeSession>): string {
    this.currentPage = page;
    this.currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: SavedSession = {
      id: this.currentSessionId,
      session: initialData,
      timestamp: Date.now(),
      page,
      lastSaved: Date.now()
    };

    // Salvar no localStorage para acesso rápido
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    
    // Iniciar auto-save
    this.startAutoSave(session);

    return this.currentSessionId;
  }

  /**
   * Atualiza os dados da sessão atual
   */
  updateSession(updates: Partial<PracticeSession>): void {
    if (!this.currentSessionId) return;

    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!saved) return;

    const session: SavedSession = JSON.parse(saved);
    session.session = { ...session.session, ...updates };
    session.lastSaved = Date.now();

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  /**
   * Salva a sessão completa no IndexedDB
   */
  async saveSessionToDB(): Promise<void> {
    if (!this.currentSessionId) return;

    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!saved) return;

    const session: SavedSession = JSON.parse(saved);
    
    // Converter para PracticeSession completo
    const practiceSession: PracticeSession = {
      id: session.id,
      type: session.session.type || 'chord',
      accuracy: session.session.accuracy || 0,
      duration: session.session.duration || 0,
      timestamp: session.timestamp,
      exercises: session.session.exercises || [],
      mistakes: session.session.mistakes || [],
      improvements: session.session.improvements || [],
      // Campos adicionais
      timeOfDay: new Date(session.timestamp).getHours(),
      dayOfWeek: new Date(session.timestamp).getDay(),
      attempts: session.session.attempts || 1,
      pauses: session.session.pauses || 0,
      interactions: session.session.interactions || 0,
      emotionalState: session.session.emotionalState || 'neutral',
      deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      audioFeedbackUsed: session.session.audioFeedbackUsed || false,
      aiAssistanceUsed: session.session.aiAssistanceUsed || false
    };

    try {
      await indexedDBService.savePracticeSession(practiceSession);
      console.log('✅ Sessão auto-salva:', session.id);
    } catch (error) {
      console.error('❌ Erro ao auto-salvar sessão:', error);
    }
  }

  /**
   * Inicia o intervalo de auto-save
   */
  private startAutoSave(session: SavedSession): void {
    // Limpar intervalo anterior se existir
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }

    // Salvar imediatamente
    this.saveSessionToDB();

    // Configurar intervalo
    this.saveInterval = setInterval(() => {
      this.saveSessionToDB();
    }, AUTO_SAVE_INTERVAL);
  }

  /**
   * Finaliza a sessão atual
   */
  async endSession(): Promise<void> {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }

    // Salvar uma última vez
    await this.saveSessionToDB();

    // Salvar como última sessão
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      localStorage.setItem(LAST_SESSION_KEY, saved);
    }

    // Limpar sessão atual
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.currentSessionId = null;
  }

  /**
   * Verifica se há uma sessão salva para retomar
   */
  getLastSession(): SavedSession | null {
    const saved = localStorage.getItem(LAST_SESSION_KEY);
    if (!saved) return null;

    const session: SavedSession = JSON.parse(saved);
    
    // Verificar se a sessão é recente (últimas 24 horas)
    const hoursSinceLastSave = (Date.now() - session.lastSaved) / (1000 * 60 * 60);
    if (hoursSinceLastSave > 24) {
      localStorage.removeItem(LAST_SESSION_KEY);
      return null;
    }

    return session;
  }

  /**
   * Retoma uma sessão salva
   */
  resumeSession(session: SavedSession): string {
    this.currentSessionId = session.id;
    this.currentPage = session.page;
    
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    this.startAutoSave(session);

    return session.id;
  }

  /**
   * Limpa todas as sessões salvas
   */
  clearSessions(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(LAST_SESSION_KEY);
    this.currentSessionId = null;
    
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }
}

export const autoSaveService = new AutoSaveService();
