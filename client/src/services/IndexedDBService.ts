/**
 * IndexedDB Service
 * Gerencia armazenamento de dados grandes (histórico de prática, etc.)
 * Suporta 1000+ sessões sem perder dados
 */

const DB_NAME = 'MusicTutorDB';
const DB_VERSION = 1;
const STORE_PRACTICE_SESSIONS = 'practice_sessions';
const STORE_USER_PROFILES = 'user_profiles';

export interface PracticeSession {
  id: string;
  timestamp: number;
  type: 'chord' | 'scale' | 'song' | 'ear_training';
  itemId: string;
  itemName: string;
  duration: number;
  accuracy: number;
  errors: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek?: number;
  attempts?: number;
  pauses?: number;
  interactions?: number;
  emotionalState?: 'focused' | 'frustrated' | 'motivated' | 'tired' | 'excited';
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  audioFeedbackUsed?: boolean;
  aiAssistanceUsed?: boolean;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Inicializa conexão com IndexedDB
   */
  async initialize(): Promise<void> {
    if (this.db) {
      return Promise.resolve();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Criar store de sessões de prática
        if (!db.objectStoreNames.contains(STORE_PRACTICE_SESSIONS)) {
          const sessionStore = db.createObjectStore(STORE_PRACTICE_SESSIONS, {
            keyPath: 'id',
            autoIncrement: false,
          });
          sessionStore.createIndex('timestamp', 'timestamp', { unique: false });
          sessionStore.createIndex('type', 'type', { unique: false });
          sessionStore.createIndex('itemId', 'itemId', { unique: false });
        }

        // Criar store de perfis de usuário
        if (!db.objectStoreNames.contains(STORE_USER_PROFILES)) {
          db.createObjectStore(STORE_USER_PROFILES, {
            keyPath: 'userId',
            autoIncrement: false,
          });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Migra dados do localStorage para IndexedDB
   */
  async migrateFromLocalStorage(): Promise<void> {
    await this.initialize();

    // Migrar histórico de prática
    const historyKey = 'musictutor_practice_history';
    const historyData = localStorage.getItem(historyKey);
    
    if (historyData) {
      try {
        const sessions: PracticeSession[] = JSON.parse(historyData);
        
        if (sessions.length > 0) {
          // Verificar se já existem dados no IndexedDB
          const existingCount = await this.getPracticeSessionCount();
          
          if (existingCount === 0) {
            // Migrar todas as sessões
            await this.savePracticeSessions(sessions);
            console.log(`[IndexedDB] Migrados ${sessions.length} sessões do localStorage`);
          }
        }
      } catch (error) {
        console.error('Erro ao migrar histórico do localStorage:', error);
      }
    }

    // Migrar perfil do usuário
    const profileKey = 'musictutor_user_profile';
    const profileData = localStorage.getItem(profileKey);
    
    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        await this.saveUserProfile('default', profile);
        console.log('[IndexedDB] Perfil do usuário migrado do localStorage');
      } catch (error) {
        console.error('Erro ao migrar perfil do localStorage:', error);
      }
    }
  }

  /**
   * Salva uma sessão de prática
   */
  async savePracticeSession(session: PracticeSession): Promise<void> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB não inicializado'));
        return;
      }

      const transaction = this.db.transaction([STORE_PRACTICE_SESSIONS], 'readwrite');
      const store = transaction.objectStore(STORE_PRACTICE_SESSIONS);
      const request = store.put(session);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Salva múltiplas sessões de prática (útil para migração)
   */
  async savePracticeSessions(sessions: PracticeSession[]): Promise<void> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB não inicializado'));
        return;
      }

      const transaction = this.db.transaction([STORE_PRACTICE_SESSIONS], 'readwrite');
      const store = transaction.objectStore(STORE_PRACTICE_SESSIONS);

      let completed = 0;
      let hasError = false;

      sessions.forEach((session) => {
        const request = store.put(session);
        
        request.onsuccess = () => {
          completed++;
          if (completed === sessions.length && !hasError) {
            resolve();
          }
        };
        
        request.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(request.error);
          }
        };
      });
    });
  }

  /**
   * Obtém todas as sessões de prática
   */
  async getPracticeSessions(limit?: number): Promise<PracticeSession[]> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB não inicializado'));
        return;
      }

      const transaction = this.db.transaction([STORE_PRACTICE_SESSIONS], 'readonly');
      const store = transaction.objectStore(STORE_PRACTICE_SESSIONS);
      const index = store.index('timestamp');
      
      // Ordenar por timestamp descendente (mais recentes primeiro)
      const request = index.openCursor(null, 'prev');
      const sessions: PracticeSession[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        
        if (cursor && (!limit || sessions.length < limit)) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(sessions);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtém sessões filtradas por tipo
   */
  async getPracticeSessionsByType(
    type: 'chord' | 'scale' | 'song' | 'ear_training',
    limit?: number
  ): Promise<PracticeSession[]> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB não inicializado'));
        return;
      }

      const transaction = this.db.transaction([STORE_PRACTICE_SESSIONS], 'readonly');
      const store = transaction.objectStore(STORE_PRACTICE_SESSIONS);
      const index = store.index('type');
      const request = index.openCursor(IDBKeyRange.only(type));
      const sessions: PracticeSession[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        
        if (cursor && (!limit || sessions.length < limit)) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          // Ordenar por timestamp descendente
          sessions.sort((a, b) => b.timestamp - a.timestamp);
          resolve(sessions);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtém contagem total de sessões
   */
  async getPracticeSessionCount(): Promise<number> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB não inicializado'));
        return;
      }

      const transaction = this.db.transaction([STORE_PRACTICE_SESSIONS], 'readonly');
      const store = transaction.objectStore(STORE_PRACTICE_SESSIONS);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove sessões antigas (manter apenas as N mais recentes)
   */
  async keepRecentSessions(count: number): Promise<void> {
    await this.initialize();

    const allSessions = await this.getPracticeSessions();
    
    if (allSessions.length <= count) {
      return; // Não precisa remover nada
    }

    // Ordenar por timestamp e manter apenas as mais recentes
    const sessionsToKeep = allSessions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);

    const sessionsToDelete = allSessions.filter(
      (s) => !sessionsToKeep.some((k) => k.id === s.id)
    );

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB não inicializado'));
        return;
      }

      const transaction = this.db.transaction([STORE_PRACTICE_SESSIONS], 'readwrite');
      const store = transaction.objectStore(STORE_PRACTICE_SESSIONS);

      let completed = 0;
      let hasError = false;

      if (sessionsToDelete.length === 0) {
        resolve();
        return;
      }

      sessionsToDelete.forEach((session) => {
        const request = store.delete(session.id);
        
        request.onsuccess = () => {
          completed++;
          if (completed === sessionsToDelete.length && !hasError) {
            resolve();
          }
        };
        
        request.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(request.error);
          }
        };
      });
    });
  }

  /**
   * Salva perfil do usuário
   */
  async saveUserProfile(userId: string, profile: any): Promise<void> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB não inicializado'));
        return;
      }

      const transaction = this.db.transaction([STORE_USER_PROFILES], 'readwrite');
      const store = transaction.objectStore(STORE_USER_PROFILES);
      const request = store.put({ userId, ...profile });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtém perfil do usuário
   */
  async getUserProfile(userId: string): Promise<any | null> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB não inicializado'));
        return;
      }

      const transaction = this.db.transaction([STORE_USER_PROFILES], 'readonly');
      const store = transaction.objectStore(STORE_USER_PROFILES);
      const request = store.get(userId);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Remover userId do objeto retornado
          const { userId: _, ...profile } = result;
          resolve(profile);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Limpa todos os dados (útil para testes)
   */
  async clearAll(): Promise<void> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB não inicializado'));
        return;
      }

      const transaction = this.db.transaction(
        [STORE_PRACTICE_SESSIONS, STORE_USER_PROFILES],
        'readwrite'
      );

      let completed = 0;
      const total = 2;

      transaction.objectStore(STORE_PRACTICE_SESSIONS).clear().onsuccess = () => {
        completed++;
        if (completed === total) resolve();
      };

      transaction.objectStore(STORE_USER_PROFILES).clear().onsuccess = () => {
        completed++;
        if (completed === total) resolve();
      };

      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Fecha conexão com IndexedDB
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

export const indexedDBService = new IndexedDBService();
