export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "/api/v1",
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
} as const;
