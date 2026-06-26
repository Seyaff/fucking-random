import { Response } from "express";

export const REFRESH_TOKEN_COOKIE = "refreshToken";

// Keep this in sync with JWT_REFRESH_EXPIRES_IN in your env config
const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function setRefreshTokenCookie(res: Response, token: string): void {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie(REFRESH_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" as const : "lax" as const,
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });
}

export function clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
}