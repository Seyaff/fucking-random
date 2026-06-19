export const getEnv = (key: string, defaultValue: string = ""): string => {
  const value = process.env[key];

  if (value === undefined) {
    if (defaultValue) {
      return defaultValue;
    }
    throw new Error(
      `Environment variable ${key} is not set. Copy backend/.env.example to backend/.env (not the repo root) and restart the server.`,
    );
  }
  return value;
};