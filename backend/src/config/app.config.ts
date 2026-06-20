import "dotenv/config"
import { getEnv } from "../utils/getEnv";


const appConfig = () => ({
  PORT: getEnv("PORT", "8000"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  BASE_PATH: getEnv("BASE_PATH", "/api/v1"),


  MONGO_URI: getEnv("MONGO_URI" , "mongodb+srv://seyaffxh:BKPMklTQpQMojY93@chat.ecmzbkj.mongodb.net/"),

  FRONTEND_ORIGIN : getEnv("FRONTEND_ORIGIN"),

  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_ACCESS_EXPIRES_IN: getEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d"),


  GOOGLE_CLIENT_ID : getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET : getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL : getEnv("GOOGLE_CALLBACK_URL"),


});



export const Env = appConfig();