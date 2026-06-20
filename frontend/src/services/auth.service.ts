import api from "./api";
import type { User } from "@/types/auth";

export const authService = {
  getMe: async (): Promise<User> => {
    const { data } = await api.get("/auth/me");
    return data.user;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};
