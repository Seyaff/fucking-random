import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { AgentService } from "./agent.service";
import { HTTPSTATUS } from "../../config/http.config";
import { eventService } from "../../lib/event-service";

const agentService = new AgentService();

export class AgentController {
    test = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const { message } = req.body;

        if (!message) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({
                success: false,
                message: "Message is required",
            });
        }

        const reply = await agentService.processMessage(message, userId);

        eventService.emit(userId, {
            type: "new_message",
            data: { conversationId: "", customerPhone: "test-agent" },
        });

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            reply,
        });
    });
}
