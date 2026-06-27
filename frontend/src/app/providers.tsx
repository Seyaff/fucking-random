"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { PostHogProvider } from "@/components/providers/posthog";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PostHogProvider>
        <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
          {children}
        </Sentry.ErrorBoundary>
      </PostHogProvider>
    </QueryClientProvider>
  );
}

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-4">An unexpected error occurred.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
      >
        Reload page
      </button>
    </div>
  );
}
