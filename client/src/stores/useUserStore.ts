/**
 * Store de Usuário - Zustand
 * Gerencia estado do usuário autenticado
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, User, UserPreferences, UserStats } from '@/services/AuthService';

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Ações
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateStats: (stats: Partial<UserStats>) => void;
  refreshUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const user = await authService.login({ email, password });
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        try {
          set({ isLoading: true });
          const user = await authService.register({ email, password, name });
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          const updatedUser = authService.updateProfile(updates);
          set({ user: updatedUser });
        } catch (error) {
          console.error('Erro ao atualizar perfil:', error);
        }
      },

      updatePreferences: (preferences: Partial<UserPreferences>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          const updatedUser = authService.updatePreferences(preferences);
          set({ user: updatedUser });
        } catch (error) {
          console.error('Erro ao atualizar preferências:', error);
        }
      },

      updateStats: (stats: Partial<UserStats>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          const updatedUser = authService.updateStats(stats);
          set({ user: updatedUser });
        } catch (error) {
          console.error('Erro ao atualizar estatísticas:', error);
        }
      },

      refreshUser: () => {
        const currentUser = authService.getCurrentUser();
        set({
          user: currentUser,
          isAuthenticated: currentUser !== null,
          isLoading: false,
        });
      },
    }),
    {
      name: 'musictutor_user_store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Inicializar store ao carregar
if (typeof window !== 'undefined') {
  useUserStore.getState().refreshUser();
}
