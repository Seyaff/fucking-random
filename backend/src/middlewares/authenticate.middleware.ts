import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { UnauthorizedError } from "../utils/appError";
import UserModel from "../modules/user/user.model";
import { asyncHandler } from "./asyncHandler.middleware";

export const authenticate = asyncHandler(async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
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
});