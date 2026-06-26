"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth.service";
import { Loader2 } from "lucide-react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAccessToken, setUser } = useAuthStore();
  const [loadError, setLoadError] = useState<string | null>(null);
  const processed = useRef(false);

  const errorParam = searchParams.get("error");
  const tokenParam = searchParams.get("accessToken");

  const initialError = errorParam
    ? "Authentication failed. Please try again."
    : !tokenParam
      ? "No access token received."
      : null;

  useEffect(() => {
    if (!tokenParam || errorParam || processed.current) return;
    processed.current = true;

    setAccessToken(tokenParam);
    authService
      .getMe()
      .then((user) => {
        setUser(user);
        router.replace("/inbox");
      })
      .catch(() => {
        setAccessToken(null);
        setLoadError("Failed to load user profile.");
      });
  }, [tokenParam, errorParam, router, setAccessToken, setUser]);

  const error = initialError || loadError;

  if (error) {
    return (
      <div className="text-center space-y-4">
        <p className="text-destructive text-lg">{error}</p>
        <a href="/login" className="text-sm text-muted-foreground hover:underline">
          Back to login
        </a>
      </div>
    );
  }

  return <Loader2 className="size-8 animate-spin text-muted-foreground" />;
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense
        fallback={<Loader2 className="size-8 animate-spin text-muted-foreground" />}
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
