import { create } from "zustand";

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
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken:
    typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => {
    if (accessToken) {
      sessionStorage.setItem("accessToken", accessToken);
    } else {
      sessionStorage.removeItem("accessToken");
    }
    set({ accessToken });
  },
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => {
    sessionStorage.removeItem("accessToken");
    set({ user: null, accessToken: null });
  },
}));
