/**
 * Serviço de Autenticação e Gerenciamento de Usuários
 * Sistema completo de autenticação com armazenamento local
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: number;
  lastLogin: number;
  preferences: UserPreferences;
  stats: UserStats;
  plan: 'free' | 'pro' | 'lifetime';
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'none';
  proFeatures?: {
    unlimitedHearts: boolean;
    advancedStats: boolean;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'pt-BR' | 'en-US' | 'es-ES';
  notifications: {
    achievements: boolean;
    dailyMissions: boolean;
    practiceReminders: boolean;
    weeklyReports: boolean;
  };
  practice: {
    defaultDuration: number; // minutos
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    autoSave: boolean;
  };
}

export interface UserStats {
  totalPracticeTime: number; // segundos
  totalSessions: number;
  averageAccuracy: number;
  favoriteChords: string[];
  favoriteSongs: string[];
  completedExercises: number;
  currentLevel: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

class AuthService {
  private readonly STORAGE_KEY = 'musictutor_users';
  private readonly SESSION_KEY = 'musictutor_session';
  private currentUser: User | null = null;

  constructor() {
    this.loadSession();
  }

  /**
   * Registra um novo usuário
   */
  async register(data: RegisterData): Promise<User> {
    // Validar dados
    if (!data.email || !data.password || !data.name) {
      throw new Error('Todos os campos são obrigatórios');
    }

    if (!this.isValidEmail(data.email)) {
      throw new Error('Email inválido');
    }

    if (data.password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    // Verificar se email já existe
    const users = this.getAllUsers();
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('Email já cadastrado');
    }

    // Criar novo usuário
    const newUser: User = {
      id: this.generateId(),
      email: data.email.toLowerCase(),
      name: data.name,
      createdAt: Date.now(),
      lastLogin: Date.now(),
      preferences: {
        theme: 'dark',
        language: 'pt-BR',
        notifications: {
          achievements: true,
          dailyMissions: true,
          practiceReminders: true,
          weeklyReports: true,
        },
        practice: {
          defaultDuration: 30,
          difficulty: 'beginner',
          autoSave: true,
        },
      },
      stats: {
        totalPracticeTime: 0,
        totalSessions: 0,
        averageAccuracy: 0,
        favoriteChords: [],
        favoriteSongs: [],
        completedExercises: 0,
        currentLevel: 1,
      },
      plan: 'free',
      subscriptionStatus: 'none',
      proFeatures: {
        unlimitedHearts: false,
        advancedStats: false,
      }
    };

    // Salvar usuário (com senha hasheada)
    const hashedPassword = this.hashPassword(data.password);
    users.push({ ...newUser, password: hashedPassword } as any);
    this.saveUsers(users);

    // Fazer login automático
    this.currentUser = newUser;
    this.saveSession(newUser.id);

    return newUser;
  }

  /**
   * Faz login do usuário
   */
  async login(credentials: LoginCredentials): Promise<User> {
    const users = this.getAllUsers();
    const userData = users.find(
      u => u.email.toLowerCase() === credentials.email.toLowerCase()
    ) as any;

    if (!userData) {
      throw new Error('Email ou senha incorretos');
    }

    // Verificar senha
    if (!this.verifyPassword(credentials.password, userData.password)) {
      throw new Error('Email ou senha incorretos');
    }

    // Atualizar último login
    userData.lastLogin = Date.now();
    this.saveUsers(users);

    // Criar objeto User (sem senha)
    const user: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar,
      createdAt: userData.createdAt,
      lastLogin: userData.lastLogin,
      preferences: userData.preferences,
      stats: userData.stats,
      plan: userData.plan || 'free',
      subscriptionStatus: userData.subscriptionStatus || 'none',
      proFeatures: userData.proFeatures || { unlimitedHearts: false, advancedStats: false },
    };

    this.currentUser = user;
    this.saveSession(user.id);

    return user;
  }

  /**
   * Faz logout
   */
  logout(): void {
    this.currentUser = null;
    localStorage.removeItem(this.SESSION_KEY);
  }

  /**
   * Obtém usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Atualiza perfil do usuário
   */
  updateProfile(updates: Partial<User>): User {
    if (!this.currentUser) {
      throw new Error('Usuário não autenticado');
    }

    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === this.currentUser!.id);

    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }

    // Atualizar usuário
    const updatedUser = { ...this.currentUser, ...updates };
    users[userIndex] = { ...users[userIndex], ...updates } as any;
    this.saveUsers(users);

    this.currentUser = updatedUser;
    return updatedUser;
  }

  /**
   * Atualiza preferências do usuário
   */
  updatePreferences(preferences: Partial<UserPreferences>): User {
    if (!this.currentUser) {
      throw new Error('Usuário não autenticado');
    }

    return this.updateProfile({
      preferences: {
        ...this.currentUser.preferences,
        ...preferences,
      },
    });
  }

  /**
   * Atualiza estatísticas do usuário
   */
  updateStats(stats: Partial<UserStats>): User {
    if (!this.currentUser) {
      throw new Error('Usuário não autenticado');
    }

    return this.updateProfile({
      stats: {
        ...this.currentUser.stats,
        ...stats,
      },
    });
  }

  /**
   * Altera senha
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('Usuário não autenticado');
    }

    if (newPassword.length < 6) {
      throw new Error('Nova senha deve ter pelo menos 6 caracteres');
    }

    const users = this.getAllUsers();
    const userData = users.find(u => u.id === this.currentUser!.id) as any;

    if (!userData) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar senha antiga
    if (!this.verifyPassword(oldPassword, userData.password)) {
      throw new Error('Senha atual incorreta');
    }

    // Atualizar senha
    userData.password = this.hashPassword(newPassword);
    this.saveUsers(users);
  }

  /**
   * Deleta conta do usuário
   */
  async deleteAccount(): Promise<void> {
    if (!this.currentUser) {
      throw new Error('Usuário não autenticado');
    }

    const users = this.getAllUsers();
    const filteredUsers = users.filter(u => u.id !== this.currentUser!.id);
    this.saveUsers(filteredUsers);

    this.logout();
  }

  // ========== MÉTODOS PRIVADOS ==========

  private loadSession(): void {
    const sessionId = localStorage.getItem(this.SESSION_KEY);
    if (!sessionId) return;

    const users = this.getAllUsers();
    const userData = users.find(u => u.id === sessionId) as any;

    if (userData) {
      this.currentUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin,
        preferences: userData.preferences,
        stats: userData.stats,
        plan: userData.plan || 'free',
        subscriptionStatus: userData.subscriptionStatus || 'none',
        proFeatures: userData.proFeatures || { unlimitedHearts: false, advancedStats: false },
      };
    } else {
      // Sessão inválida
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  private saveSession(userId: string): void {
    localStorage.setItem(this.SESSION_KEY, userId);
  }

  private getAllUsers(): any[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveUsers(users: any[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private hashPassword(password: string): string {
    // Hash simples (em produção, usar bcrypt ou similar)
    // Por enquanto, apenas base64 para simulação
    return btoa(password + 'musictutor_salt');
  }

  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }
}

export const authService = new AuthService();
