"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth.service";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { Loader2 } from "lucide-react";
import { useEventStream } from "@/hooks/use-event-stream";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, accessToken, isLoading, isInitialized, setUser, setLoading } =
    useAuthStore();

  useEventStream();

  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    if (!user) {
      setLoading(true);
      authService
        .getMe()
        .then(setUser)
        .catch(() => {
          useAuthStore.getState().reset();
          router.replace("/login");
        })
        .finally(() => setLoading(false));
    }
  }, [isInitialized, accessToken, user, router, setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!accessToken || !user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Toaster richColors closeButton position="top-right" />
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
