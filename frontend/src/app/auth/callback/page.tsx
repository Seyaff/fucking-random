"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2 } from "lucide-react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("accessToken");
    const err = searchParams.get("error");

    if (err) {
      setError("Authentication failed. Please try again.");
      return;
    }

    if (token) {
      setAccessToken(token);
      router.replace("/inbox");
    } else {
      setError("No access token received.");
    }
  }, [searchParams, setAccessToken, router]);

  if (error) {
    return (
      <div className="text-center space-y-4">
        <p className="text-destructive text-lg">{error}</p>
        <a href="/" className="text-sm text-muted-foreground hover:underline">
          Back to home
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
        fallback={
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
