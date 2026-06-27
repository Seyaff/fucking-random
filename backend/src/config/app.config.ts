import "dotenv/config"
import { getEnv } from "../utils/getEnv";



const appConfig = () => ({
  PORT: getEnv("PORT", "8000"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  BASE_PATH: getEnv("BASE_PATH", "/api/v1"),


  MONGO_URI: getEnv("MONGO_URI"),

  FRONTEND_ORIGIN : getEnv("FRONTEND_ORIGIN"),

  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_ACCESS_EXPIRES_IN: getEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d"),


  GOOGLE_CLIENT_ID : getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET : getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL : getEnv("GOOGLE_CALLBACK_URL"),

  REDIS_URL: getEnv("REDIS_URL", "redis://localhost:6379"),

  GROQ_API_KEY: getEnv("GROQ_API_KEY"),

  RESEND_API_KEY: getEnv("RESEND_API_KEY", ""),
  RESEND_FROM_EMAIL: getEnv("RESEND_FROM_EMAIL", "Relay <onboarding@resend.dev>"),

  GMAIL_REDIRECT_URI: getEnv("GMAIL_REDIRECT_URI", ""),

  SLACK_CLIENT_ID: getEnv("SLACK_CLIENT_ID", ""),
  SLACK_CLIENT_SECRET: getEnv("SLACK_CLIENT_SECRET", ""),
  SLACK_REDIRECT_URI: getEnv("SLACK_REDIRECT_URI", ""),

  SENTRY_DSN: getEnv("SENTRY_DSN", ""),

});



export const Env = appConfig();