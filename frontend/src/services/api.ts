import axios from "axios";
import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth-store";

const api = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${env.API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        useAuthStore.getState().setAccessToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        useAuthStore.getState().reset();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
