import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { Env } from "../config/app.config";

export interface AccessTokenPayload extends JwtPayload {
    sub: string; // userId
}

export interface RefreshTokenPayload extends JwtPayload {
    sub: string; // userId
    jti: string; // unique id for this specific refresh token, see RefreshToken model
}

export function signAccessToken(userId: string): string {
    return jwt.sign({ sub: userId }, Env.JWT_ACCESS_SECRET, {
        expiresIn: Env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    } as SignOptions);
}

export function signRefreshToken(userId: string, jti: string): string {
    return jwt.sign({ sub: userId, jti }, Env.JWT_REFRESH_SECRET, {
        expiresIn: Env.JWT_REFRESH_EXPIRES_IN ?? "30d",
    } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, Env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, Env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}