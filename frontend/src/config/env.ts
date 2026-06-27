export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY || "",
  POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
} as const;
