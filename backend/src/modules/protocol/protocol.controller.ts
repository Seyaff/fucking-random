import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../../config/http.config";
import { ProtocolService } from "./protocol.service";

const protocolService = new ProtocolService();

export class ProtocolController {
    list = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const protocols = await protocolService.list(userId);
        return res.status(HTTPSTATUS.OK).json({ success: true, protocols });
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const { title, rule, category, priority } = req.body;

        if (!title || !rule) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({
                success: false,
                message: "title and rule are required",
            });
        }

        const protocol = await protocolService.create(userId, { title, rule, category, priority });
        return res.status(HTTPSTATUS.CREATED).json({ success: true, protocol });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const id = req.params.id as string;
        const protocol = await protocolService.update(userId, id, req.body);

        if (!protocol) {
            return res.status(HTTPSTATUS.NOT_FOUND).json({ success: false, message: "Protocol not found" });
        }

        return res.status(HTTPSTATUS.OK).json({ success: true, protocol });
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const id = req.params.id as string;
        const protocol = await protocolService.delete(userId, id);

        if (!protocol) {
            return res.status(HTTPSTATUS.NOT_FOUND).json({ success: false, message: "Protocol not found" });
        }

        return res.status(HTTPSTATUS.OK).json({ success: true });
    });
}
