import { create } from "zustand";
import type { Roles } from "../types/roles";

interface User {
  userName?: string;
  userLastName?: string;
  role: Roles;
}

interface AuthState {
  user: User | null;
  setUser: (u: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
