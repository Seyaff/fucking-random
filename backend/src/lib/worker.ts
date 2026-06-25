import { createWorker, messageQueue } from "./queue";
import { ConversationService } from "../modules/conversation/conversation.service";
import { eventService } from "./event-service";

const conversationService = new ConversationService();

export function startWorker() {
    createWorker(async (job) => {
        const { sender, userId } = job.data;

        console.log(`[${job.id}] Processing from ${sender}`);

        try {
            const msg = await conversationService.addMessage(
                userId,
                sender,
                "assistant",
                "Thanks for your message! A team member will respond shortly."
            );

            eventService.emit(userId, {
                type: "new_message",
                data: {
                    conversationId: msg.conversationId.toString(),
                    customerPhone: sender,
                },
            });

            console.log(`[${job.id}] Acknowledged`);
        } catch (err: any) {
            console.error(`[${job.id}] Failed to process message:`, err.message);
        }
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
    try {
        await messageQueue.add("process-message", data, {
            jobId: `msg-${data.messageId}`,
        });
    } catch (err: any) {
        console.error(`[queue] Failed to enqueue message ${data.messageId}:`, err.message);
    }
}
