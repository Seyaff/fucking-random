"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth.service";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, accessToken, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    if (!accessToken) {
      router.replace("/");
      return;
    }

    if (!user) {
      authService
        .getMe()
        .then(setUser)
        .catch(() => {
          useAuthStore.getState().reset();
          router.replace("/");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [accessToken, user, router, setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
