import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { AuthService } from "./auth.service";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "../../utils/cookie";
import { HTTPSTATUS } from "../../config/http.config";
import { Env } from "../../config/app.config";
import { getRequestMeta } from "../../utils/request";
import { UnauthorizedError } from "../../utils/appError";

const authService = new AuthService();

export class AuthController {
    googleCallback = asyncHandler(async (req: Request, res: Response) => {
        const user = req.user!;
        const meta = getRequestMeta(req);
        const tokens = await authService.generateTokens(user._id, meta);

        setRefreshTokenCookie(res, tokens.refreshToken);

        const redirectUrl = new URL("/auth/callback", Env.FRONTEND_ORIGIN);
        redirectUrl.searchParams.set("accessToken", tokens.accessToken);

        res.redirect(redirectUrl.toString());
    });

    refresh = asyncHandler(async (req: Request, res: Response) => {
        const refreshTokenStr = req.cookies?.refreshToken;

        if (!refreshTokenStr) {
            throw new UnauthorizedError("Refresh token missing");
        }

        const meta = getRequestMeta(req);
        const tokens = await authService.refreshAccessToken(refreshTokenStr, meta);

        setRefreshTokenCookie(res, tokens.refreshToken);

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            accessToken: tokens.accessToken,
        });
    });

    logout = asyncHandler(async (req: Request, res: Response) => {
        const refreshTokenStr = req.cookies?.refreshToken;

        if (refreshTokenStr) {
            await authService.revokeRefreshToken(refreshTokenStr);
        }

        clearRefreshTokenCookie(res);

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Logged out successfully",
        });
    });

    getMe = asyncHandler(async (req: Request, res: Response) => {
        const user = req.user!.omitPassword();

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                createdAt: user.createdAt,
            },
        });
    });
}
