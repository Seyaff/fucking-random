import { createWorker, messageQueue } from "./queue";
import { WhatsAppService } from "../modules/whatsapp/whatsapp.service";
import { AgentService } from "../modules/agent/agent.service";
import { buildHarnessContextInputFromConversation } from "../modules/agent/harness/context";
import { ConversationService } from "../modules/conversation/conversation.service";
import { eventService } from "./event-service";

const whatsappService = new WhatsAppService();
const agentService = new AgentService();
const conversationService = new ConversationService();

export function startWorker() {
    createWorker(async (job) => {
        const { sender, text, userId } = job.data;

        console.log(`[${job.id}] Processing from ${sender}: "${text.slice(0, 60)}"`);

        const convCtx = await conversationService.getConversationContext(userId, sender);

        if (convCtx.status === "human_handling") {
            console.log(`[${job.id}] Skipped — human handling`);
            return;
        }

        const history = await conversationService.getConversationHistory(userId, sender);
        const isFirstMessage = !history.some((m) => m.role === "assistant");

        const reply = await agentService.processMessage(
            text,
            userId,
            buildHarnessContextInputFromConversation({
                customerPhone: sender,
                conversationId: convCtx.conversationId,
                conversationHistory: history,
                activeFlow: convCtx.activeFlow,
                conversationStatus: convCtx.status,
                isFirstMessage,
            })
        );

        if (reply.escalated) {
            await conversationService.escalateToHuman(userId, sender);
        } else if (reply.activeFlow !== undefined) {
            await conversationService.updateFlowState(userId, sender, reply.activeFlow);
        }

        if (!reply.text && !reply.interactive) return;

        if (reply.interactive && reply.interactive.buttons.length > 0) {
            await whatsappService.sendInteractiveButtons(
                sender,
                reply.interactive.body,
                reply.interactive.buttons,
                userId
            );
        } else if (reply.text) {
            await whatsappService.sendMessage(sender, reply.text, userId);
        }

        const msg = await conversationService.addMessage(userId, sender, "assistant", reply.text, {
            trace: reply.trace,
        });

        eventService.emit(userId, {
            type: "new_message",
            data: {
                conversationId: msg.conversationId.toString(),
                customerPhone: sender,
            },
        });

        console.log(`[${job.id}] Replied [${reply.trace?.intent}/${reply.trace?.handler}]: "${reply.text.slice(0, 60)}..."`);
    });
}

export async function enqueueMessage(data: {
    from: string;
    sender: string;
    text: string;
    messageId: string;
    timestamp: string;
    userId: string;
}) {
    await messageQueue.add("process-message", data, {
        jobId: `msg-${data.messageId}`,
    });
}
