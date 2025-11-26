import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoleName } from '../types/roles';

interface User {
  userName?: string;
  userLastName?: string;
  role: RoleName;
}

interface AuthState {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      setUser: user => set({ user }),
      logout: () => {
        useAuthStore.persist.clearStorage();
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage', // clave en localStorage
    }
  )
);
