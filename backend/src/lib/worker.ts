import { createWorker, messageQueue } from "./queue";
import { WhatsAppService } from "../modules/whatsapp/whatsapp.service";
import { AgentService } from "../modules/agent/agent.service";
import { ConversationService } from "../modules/conversation/conversation.service";
import { eventService } from "./event-service";

const whatsappService = new WhatsAppService();
const agentService = new AgentService();
const conversationService = new ConversationService();

export function startWorker() {
    createWorker(async (job) => {
        const { sender, text, userId } = job.data;

        console.log(`[${job.id}] Processing from ${sender}: "${text.slice(0, 60)}"`);

        const isFirstMessage = !(await conversationService.getConversationHistory(userId, sender)).some(
            (m) => m.role === "assistant"
        );

        let reply;
        if (isFirstMessage) {
            reply = await agentService.processMessage("__GREETING__", userId);
        } else {
            const history = await conversationService.getConversationHistory(userId, sender);
            reply = await agentService.processMessage(text, userId, { conversationHistory: history });
        }

        if (reply.interactive && reply.interactive.buttons.length > 0) {
            await whatsappService.sendInteractiveButtons(
                sender,
                reply.interactive.body,
                reply.interactive.buttons,
                userId
            );
        } else {
            await whatsappService.sendMessage(sender, reply.text, userId);
        }

        const msg = await conversationService.addMessage(userId, sender, "assistant", reply.text);

        eventService.emit(userId, {
            type: "new_message",
            data: {
                conversationId: msg.conversationId.toString(),
                customerPhone: sender,
            },
        });

        console.log(`[${job.id}] Replied: "${reply.text.slice(0, 60)}..."`);
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
