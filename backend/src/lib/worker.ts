import { createWorker, messageQueue } from "./queue";
import { WhatsAppService } from "../modules/whatsapp/whatsapp.service";

const whatsappService = new WhatsAppService();

export function startWorker() {
    createWorker(async (job) => {
        const { from, sender, text, messageId } = job.data;

        console.log(`Processing message from ${sender}: "${text}"`);

        // TODO: Phase 3 - call AI agent, get reply
        const reply = `Hi! Thanks for your message. We got your query: "${text}". One of our agents will get back to you shortly.`;

        await whatsappService.sendMessage(sender, reply, job.data.userId);
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
