import crypto from "crypto";
import { Types } from "mongoose";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { UnauthorizedError } from "../../utils/appError";
import { RequestMeta } from "../../utils/request";
import { Env } from "../../config/app.config";
import UserModel, { IUser } from "../user/user.model";
import AccountModel from "./account.model";
import RefreshTokenModel from "./refreshToken.model";

export class AuthService {
    async loginOrSignupWithProvider(data: {
        provider: "google";
        providerAccountId: string;
        email: string;
        name: string;
        avatarUrl?: string;
    }): Promise<IUser> {
        const existingAccount = await AccountModel.findOne({
            provider: data.provider,
            providerAccountId: data.providerAccountId,
        });

        if (existingAccount) {
            const user = await UserModel.findById(existingAccount.userId);
            if (!user) {
                throw new UnauthorizedError("User not found for linked account");
            }
            return user;
        }

        let user = await UserModel.findOne({ email: data.email });

        if (!user) {
            user = await UserModel.create({
                name: data.name,
                email: data.email,
                ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
            });
        }

        await AccountModel.create({
            userId: user._id,
            provider: data.provider,
            providerAccountId: data.providerAccountId,
        });

        return user;
    }

    async generateTokens(userId: string | Types.ObjectId, meta?: RequestMeta) {
        const id = userId.toString();
        const jti = crypto.randomUUID();

        const accessToken = signAccessToken(id);
        const refreshToken = signRefreshToken(id, jti);

        const expiresAt = new Date(Date.now() + this.parseExpiresIn(Env.JWT_REFRESH_EXPIRES_IN));

        await RefreshTokenModel.create({
            userId: id,
            jti,
            expiresAt,
            ...(meta?.userAgent ? { userAgent: meta.userAgent } : {}),
            ...(meta?.ip ? { ip: meta.ip } : {}),
        });

        return { accessToken, refreshToken };
    }

    async refreshAccessToken(refreshTokenStr: string, meta?: RequestMeta) {
        const payload = verifyRefreshToken(refreshTokenStr);

        const existingToken = await RefreshTokenModel.findOne({ jti: payload.jti });

        if (!existingToken) {
            throw new UnauthorizedError("Refresh token not found");
        }

        if (existingToken.revokedAt) {
            if (existingToken.replacedByJti) {
                await this.revokeTokenFamily(payload.jti);
            }
            throw new UnauthorizedError("Refresh token has been revoked");
        }

        const newJti = crypto.randomUUID();
        const accessToken = signAccessToken(payload.sub);
        const refreshToken = signRefreshToken(payload.sub, newJti);

        const expiresAt = new Date(Date.now() + this.parseExpiresIn(Env.JWT_REFRESH_EXPIRES_IN));

        existingToken.revokedAt = new Date();
        existingToken.replacedByJti = newJti;
        await existingToken.save();

        await RefreshTokenModel.create({
            userId: payload.sub,
            jti: newJti,
            expiresAt,
            ...(meta?.userAgent ? { userAgent: meta.userAgent } : {}),
            ...(meta?.ip ? { ip: meta.ip } : {}),
        });

        return { accessToken, refreshToken };
    }

    async revokeRefreshToken(refreshTokenStr: string): Promise<void> {
        try {
            const payload = verifyRefreshToken(refreshTokenStr);
            await RefreshTokenModel.findOneAndUpdate(
                { jti: payload.jti },
                { revokedAt: new Date() }
            );
        } catch {
            // Logout is idempotent — silently succeed even if token is invalid
        }
    }

    private async revokeTokenFamily(jti: string): Promise<void> {
        const token = await RefreshTokenModel.findOne({ jti });
        if (!token) return;
        token.revokedAt = new Date();
        await token.save();
        if (token.replacedByJti) {
            await this.revokeTokenFamily(token.replacedByJti);
        }
    }

    private parseExpiresIn(expiresIn: string): number {
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match) return 7 * 24 * 60 * 60 * 1000;
        const value = parseInt(match[1]!, 10);
        const unit = match[2]!;
        switch (unit) {
            case "s": return value * 1000;
            case "m": return value * 60 * 1000;
            case "h": return value * 60 * 60 * 1000;
            case "d": return value * 24 * 60 * 60 * 1000;
            default: return 7 * 24 * 60 * 60 * 1000;
        }
    }
}
