import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { AgentService } from "./agent.service";
import { HTTPSTATUS } from "../../config/http.config";
import { eventService } from "../../lib/event-service";
import { ConversationService } from "../conversation/conversation.service";

const agentService = new AgentService();
const conversationService = new ConversationService();
const TEST_CUSTOMER = "test-agent";

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

        await conversationService.addMessage(userId, TEST_CUSTOMER, "user", message);

        const history = await conversationService.getConversationHistory(userId, TEST_CUSTOMER);
        const reply = await agentService.processMessage(message, userId, { conversationHistory: history });

        const agentMsg = await conversationService.addMessage(userId, TEST_CUSTOMER, "assistant", reply.text);

        eventService.emit(userId, {
            type: "new_message",
            data: { conversationId: agentMsg.conversationId.toString(), customerPhone: TEST_CUSTOMER },
        });

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            reply: reply.text,
        });
    });

    stream = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const { message } = req.body;

        if (!message) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({ success: false, message: "Message is required" });
        }

        res.writeHead(HTTPSTATUS.OK, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
        });

        await conversationService.addMessage(userId, "test-agent", "user", message);
        const history = await conversationService.getConversationHistory(userId, "test-agent");

        let fullReply = "";

        await agentService.processMessageStream(message, userId, (token) => {
            fullReply += token;
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }, { conversationHistory: history });

        await conversationService.addMessage(userId, "test-agent", "assistant", fullReply);

        res.write(`data: ${JSON.stringify({ done: true, full: fullReply })}\n\n`);
        res.end();
    });
}
