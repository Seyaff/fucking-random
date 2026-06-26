import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { UnauthorizedError } from "../utils/appError";
import UserModel from "../modules/user/user.model";

/**
 * Protects a route by requiring a valid `Authorization: Bearer <accessToken>` header.
 * On success, attaches the user document to req.user (typed via types/express.d.ts).
 */
export const authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const header = req.headers.authorization;

        if (!header?.startsWith("Bearer ")) {
            throw new UnauthorizedError("Missing access token");
        }

        const token = header.slice("Bearer ".length);
        const payload = verifyAccessToken(token);

        const user = await UserModel.findById(payload.sub).maxTimeMS(5000);

        if (!user) {
            throw new UnauthorizedError("User no longer exists");
        }

        req.user = user;
        next();
    } catch (error) {
        next(new UnauthorizedError("Invalid or expired access token"));
    }
};