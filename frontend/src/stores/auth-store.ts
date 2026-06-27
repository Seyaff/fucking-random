import { create } from "zustand";

interface AuthStore {
  accessToken: string | null;
  isInitialized: boolean;
  setAccessToken: (token: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  isInitialized: false,

  setAccessToken: (accessToken) => set({ accessToken, isInitialized: true }),

  reset: () => set({ accessToken: null, isInitialized: false }),
}));
