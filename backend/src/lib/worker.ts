import { createWorker, messageQueue } from "./queue";
import { WhatsAppService } from "../modules/whatsapp/whatsapp.service";
import { AgentService } from "../modules/agent/agent.service";
import { ConversationService } from "../modules/conversation/conversation.service";

const whatsappService = new WhatsAppService();
const agentService = new AgentService();
const conversationService = new ConversationService();

export function startWorker() {
    createWorker(async (job) => {
        const { sender, text, userId } = job.data;

        console.log(`[${job.id}] Processing from ${sender}: "${text}"`);

        const reply = await agentService.processMessage(text, userId);

        await whatsappService.sendMessage(sender, reply, userId);

        await conversationService.addMessage(userId, sender, "assistant", reply);

        console.log(`[${job.id}] Replied: "${reply.slice(0, 60)}..."`);
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
