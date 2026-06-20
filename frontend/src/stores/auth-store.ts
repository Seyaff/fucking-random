import { create } from "zustand";
import axios from "axios";
import { env } from "@/config/env";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isInitialized: false,

  setUser: (user) => set({ user }),

  setAccessToken: (accessToken) => set({ accessToken }),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () => {
    set({ user: null, accessToken: null, isInitialized: false });
  },

  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true });
    try {
      const { data } = await axios.post(
        `${env.API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      set({ accessToken: data.accessToken });
    } catch {
      set({ user: null, accessToken: null });
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },
}));
