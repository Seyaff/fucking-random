import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { AgentService } from "./agent.service";
import { buildHarnessContextInputFromConversation } from "./harness/context";
import { HTTPSTATUS } from "../../config/http.config";
import { eventService } from "../../lib/event-service";
import { ConversationService } from "../conversation/conversation.service";
import { AgentTraceService } from "./agent-trace.service";

const agentService = new AgentService();
const conversationService = new ConversationService();
const traceService = new AgentTraceService();
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

        const convCtx = await conversationService.getConversationContext(userId, TEST_CUSTOMER);
        const history = await conversationService.getConversationHistory(userId, TEST_CUSTOMER);
        const isFirstMessage = !history.some((m) => m.role === "assistant");

        const harnessContext = buildHarnessContextInputFromConversation({
            customerPhone: TEST_CUSTOMER,
            conversationId: convCtx.conversationId,
            conversationHistory: history,
            activeFlow: convCtx.activeFlow,
            conversationStatus: convCtx.status,
            isFirstMessage,
        });

        const reply = await agentService.processMessage(message, userId, harnessContext);

        if (reply.escalated) {
            await conversationService.escalateToHuman(userId, TEST_CUSTOMER);
        } else if (reply.activeFlow !== undefined) {
            await conversationService.updateFlowState(userId, TEST_CUSTOMER, reply.activeFlow);
        }

        const agentMsg = await conversationService.addMessage(userId, TEST_CUSTOMER, "assistant", reply.text, {
            trace: reply.trace,
        });

        eventService.emit(userId, {
            type: "new_message",
            data: { conversationId: agentMsg.conversationId.toString(), customerPhone: TEST_CUSTOMER },
        });

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            reply: reply.text,
            trace: reply.trace,
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

        await conversationService.addMessage(userId, TEST_CUSTOMER, "user", message);

        const convCtx = await conversationService.getConversationContext(userId, TEST_CUSTOMER);
        const history = await conversationService.getConversationHistory(userId, TEST_CUSTOMER);
        const isFirstMessage = !history.some((m) => m.role === "assistant");

        let fullReply = "";

        const harnessContext = buildHarnessContextInputFromConversation({
            customerPhone: TEST_CUSTOMER,
            conversationId: convCtx.conversationId,
            conversationHistory: history,
            activeFlow: convCtx.activeFlow,
            conversationStatus: convCtx.status,
            isFirstMessage,
        });

        const reply = await agentService.processMessageStream(
            message,
            userId,
            (token) => {
                fullReply += token;
                res.write(`data: ${JSON.stringify({ token })}\n\n`);
            },
            harnessContext
        );

        if (reply.escalated) {
            await conversationService.escalateToHuman(userId, TEST_CUSTOMER);
        } else if (reply.activeFlow !== undefined) {
            await conversationService.updateFlowState(userId, TEST_CUSTOMER, reply.activeFlow);
        }

        await conversationService.addMessage(userId, TEST_CUSTOMER, "assistant", fullReply || reply.text, {
            trace: reply.trace,
        });

        res.write(`data: ${JSON.stringify({ done: true, full: fullReply || reply.text, trace: reply.trace })}\n\n`);
        res.end();
    });

    stats = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const days = parseInt(req.query.days as string) || 7;
        const since = new Date();
        since.setDate(since.getDate() - days);

        const stats = await traceService.getStats(userId, since);
        return res.status(HTTPSTATUS.OK).json({ success: true, stats, periodDays: days });
    });
}
