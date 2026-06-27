import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import { env } from "@/config/env";

export function useUser() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["user"],
    queryFn: authService.getMe,
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const reset = useAuthStore((s) => s.reset);

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      reset();
      queryClient.clear();
    },
  });
}

export function useInitialize() {
  const { isInitialized, accessToken, setAccessToken } = useAuthStore();

  return useQuery({
    queryKey: ["auth-init"],
    queryFn: async () => {
      try {
        const { data } = await axios.post(
          `${env.API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        setAccessToken(data.accessToken);
      } catch {
        if (!accessToken) {
          setAccessToken(null);
        }
      }
      return null;
    },
    enabled: !isInitialized,
    staleTime: Infinity,
    retry: false,
  });
}
