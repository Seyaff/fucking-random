"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useUser } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const processed = useRef(false);

  const errorParam = searchParams.get("error");
  const tokenParam = searchParams.get("accessToken");

  const { data: user, isSuccess, isError } = useUser();

  useEffect(() => {
    if (!tokenParam || errorParam || processed.current) return;
    processed.current = true;
    setAccessToken(tokenParam);
  }, [tokenParam, errorParam, setAccessToken]);

  useEffect(() => {
    if (isSuccess && user) {
      router.replace("/inbox");
    }
  }, [isSuccess, user, router]);

  if (errorParam) {
    return (
      <div className="text-center space-y-4">
        <p className="text-destructive text-lg">Authentication failed. Please try again.</p>
        <a href="/login" className="text-sm text-muted-foreground hover:underline">Back to login</a>
      </div>
    );
  }

  if (!tokenParam) {
    return (
      <div className="text-center space-y-4">
        <p className="text-destructive text-lg">No access token received.</p>
        <a href="/login" className="text-sm text-muted-foreground hover:underline">Back to login</a>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center space-y-4">
        <p className="text-destructive text-lg">Failed to load user profile.</p>
        <a href="/login" className="text-sm text-muted-foreground hover:underline">Back to login</a>
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
