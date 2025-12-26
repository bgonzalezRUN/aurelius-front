import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import type { User } from '../types/user';
import { queryClient } from '../api/queryClient';

export interface UserAuth extends User {
  exp: number;
}

interface AuthState {
  logout: () => void;
  token: string | null;
  login: (u: string) => void;
  user: UserAuth | null;
  rehydrateUser: (token: string) => void;
  getToken: () => string | null;
  getUser: () => UserAuth | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      getUser: () => {
        const token = get().token;
        if (!token) return null;
        const decodedToken = jwtDecode(token) as UserAuth;
        if (Date.now() > decodedToken.exp * 1000) {
          get().logout();
          return null;
        }

        return decodedToken;
      },
      logout: () => {
        queryClient.clear();
        set({ token: null, user: null });
      },
      token: null,
      getToken: () => {
        const token = get().token;
        if (!token) return null;
        const decodedToken = jwtDecode(token) as UserAuth;
        if (Date.now() > decodedToken.exp * 1000) {
          get().logout();
          return null;
        }
        return token;
      },
      login: newToken => {
        set({ token: newToken });
        try {
          const decodedUser = jwtDecode(newToken) as UserAuth;
          set({ user: decodedUser });
        } catch {
          set({ user: null });
        }
      },
      rehydrateUser: (token: string) => {
        try {
          const decodedUser = jwtDecode(token) as UserAuth;
          set({ user: decodedUser });
        } catch {
          set({ token: null, user: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({ token: state.token }),

      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Error al rehidratar:', error);
            return;
          }

          if (state?.token) {
            state.rehydrateUser(state.token);
          }
        };
      },
    }
  )
);
