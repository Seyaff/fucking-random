import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { QuickReplyService } from "./quick-reply.service";
import { HTTPSTATUS } from "../../config/http.config";

const quickReplyService = new QuickReplyService();

export class QuickReplyController {
    list = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const category = req.query.category as string | undefined;
        const search = req.query.search as string | undefined;
        const result = await quickReplyService.listQuickReplies(userId, category, search);

        return res.status(HTTPSTATUS.OK).json({ success: true, ...result });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const id = req.params.id as string;
        const reply = await quickReplyService.getQuickReply(userId, id);

        return res.status(HTTPSTATUS.OK).json({ success: true, reply });
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const body = req.body as Record<string, unknown>;

        if (!body.title || !body.content) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({
                success: false,
                message: "Title and content are required",
            });
        }

        const data: Parameters<typeof quickReplyService.createQuickReply>[1] = {
            title: body.title as string,
            content: body.content as string,
        };
        if (body.shortcuts) data.shortcuts = body.shortcuts as string[];
        if (body.category) data.category = body.category as string;

        const reply = await quickReplyService.createQuickReply(userId, data);

        return res.status(HTTPSTATUS.CREATED).json({ success: true, reply });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const id = req.params.id as string;
        const body = req.body as Record<string, unknown>;

        const data: Parameters<typeof quickReplyService.updateQuickReply>[2] = {};
        if (body.title !== undefined) data.title = body.title as string;
        if (body.content !== undefined) data.content = body.content as string;
        if (body.shortcuts !== undefined) data.shortcuts = body.shortcuts as string[];
        if (body.category !== undefined) data.category = body.category as string;

        const reply = await quickReplyService.updateQuickReply(userId, id, data);

        return res.status(HTTPSTATUS.OK).json({ success: true, reply });
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const id = req.params.id as string;
        await quickReplyService.deleteQuickReply(userId, id);

        return res.status(HTTPSTATUS.OK).json({ success: true, message: "Quick reply deleted" });
    });
}
