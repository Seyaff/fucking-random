import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { ConversationService } from "./conversation.service";
import { HTTPSTATUS } from "../../config/http.config";
import { eventService } from "../../lib/event-service";

const conversationService = new ConversationService();

export class ConversationController {
    list = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const conversations = await conversationService.listConversations(userId);

        return res.status(HTTPSTATUS.OK).json({ success: true, conversations });
    });

    getMessages = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const id = req.params.id as string;

        const result = await conversationService.getMessages(id, userId);
        if (!result) {
            return res.status(HTTPSTATUS.NOT_FOUND).json({ success: false, message: "Conversation not found" });
        }

        return res.status(HTTPSTATUS.OK).json({ success: true, ...result });
    });

    sendMessage = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const id = req.params.id as string;
        const { content } = req.body;

        if (!content) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({ success: false, message: "Content is required" });
        }

        const message = await conversationService.addMessage(userId, id, "agent", content);

        eventService.emit(userId, {
            type: "new_message",
            data: { conversationId: id, customerPhone: id },
        });

        return res.status(HTTPSTATUS.OK).json({ success: true, message });
    });

    markRead = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const id = req.params.id as string;

        await conversationService.markAsRead(id, userId);

        return res.status(HTTPSTATUS.OK).json({ success: true });
    });

    resolve = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const id = req.params.id as string;

        await conversationService.resolveConversation(id, userId);

        return res.status(HTTPSTATUS.OK).json({ success: true });
    });
}
