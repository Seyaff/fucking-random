"use client";

import { useEffect, Suspense } from "react";
import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";
import { env } from "@/config/env";

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (posthog.__loaded) {
      posthog.capture("$pageview", { $current_url: pathname + searchParams.toString() });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!env.POSTHOG_KEY) return;
    if (!posthog.__loaded) {
      posthog.init(env.POSTHOG_KEY, {
        api_host: env.POSTHOG_HOST,
        capture_pageview: false,
        loaded: (ph) => {
          if (process.env.NODE_ENV !== "production") ph.opt_out_capturing();
        },
      });
    }
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  );
}
