"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2 } from "lucide-react";

const LOGIN_PATH = "/login";
const HOME_PATH = "/analytics";

/**
 * Redirects to login if the user is not authenticated.
 * Use inside client components that require auth.
 */
export function useAuthGuard(): { isAuthenticated: boolean; isLoading: boolean } {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    if (!isInitialized) return;
    if (!accessToken) router.replace(LOGIN_PATH);
  }, [isInitialized, accessToken, router]);

  return { isAuthenticated: !!accessToken, isLoading: !isInitialized || isLoading };
}

/**
 * Wraps children and shows a full-screen loader while auth is being checked.
 * Redirects to /login if unauthenticated once initialized.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthGuard();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}

/**
 * Redirects an already-authenticated user away from public-only pages (login, signup).
 */
export function useGuestGuard(): { isGuest: boolean; isLoading: boolean } {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    if (!isInitialized) return;
    if (accessToken) router.replace(HOME_PATH);
  }, [isInitialized, accessToken, router]);

  return { isGuest: !accessToken, isLoading: !isInitialized || isLoading };
}

/**
 * GuestGuard — wraps public-only pages (login, signup) and redirects
 * authenticated users to the home dashboard.
 */
export function GuestGuard({ children }: { children: ReactNode }) {
  const { isGuest, isLoading } = useGuestGuard();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isGuest) return null;

  return <>{children}</>;
}

/**
 * Fetcher that wraps fetch() with automatic auth header injection
 * and 401 → redirect-to-login handling.
 */
export async function apiProxy<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;

  const headers = new Headers(options.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    useAuthStore.getState().reset();
    if (typeof window !== "undefined") {
      window.location.href = LOGIN_PATH;
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

/**
 * Checks whether the current user has a valid session.
 * Useful for server components or client-side conditional rendering.
 */
export function useIsAuthenticated(): boolean {
  return !!useAuthStore((s) => s.accessToken);
}
