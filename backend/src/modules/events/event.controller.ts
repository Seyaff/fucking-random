import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { eventService } from "../../lib/event-service";
import { HTTPSTATUS } from "../../config/http.config";
import { verifyAccessToken } from "../../utils/jwt";
import UserModel from "../../modules/user/user.model";
import { UnauthorizedError } from "../../utils/appError";

export class EventController {
    subscribe = asyncHandler(async (req: Request, res: Response) => {
        const token =
            (req.query.token as string) ||
            req.headers.authorization?.replace("Bearer ", "");

        if (!token) {
            throw new UnauthorizedError("Missing access token");
        }

        const payload = verifyAccessToken(token);
        const user = await UserModel.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedError("User not found");
        }

        const userId = user._id.toString();

        res.writeHead(HTTPSTATUS.OK, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
        });

        res.flushHeaders();

        eventService.subscribe(userId, res);
    });
}
