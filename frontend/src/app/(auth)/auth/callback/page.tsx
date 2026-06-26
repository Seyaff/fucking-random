"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth.service";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("accessToken");
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    const store = useAuthStore.getState();
    store.setAccessToken(accessToken);
    store.setLoading(true);

    authService
      .getMe()
      .then((user) => {
        store.setUser(user);
        store.setLoading(false);
        router.replace("/inbox");
      })
      .catch(() => {
        store.reset();
        router.replace("/login");
      });
  }, [accessToken, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}
