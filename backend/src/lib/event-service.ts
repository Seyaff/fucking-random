import { Response } from "express";

type EventType = "new_message" | "new_conversation" | "order_created" | "whatsapp_status_changed";

interface SseEvent {
    type: EventType;
    data: Record<string, unknown>;
}

class EventService {
    private clients = new Map<string, Set<Response>>();
    private heartbeatInterval = 30_000;

    subscribe(userId: string, res: Response) {
        if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
        }
        this.clients.get(userId)!.add(res);

        const keepAlive = setInterval(() => {
            try {
                res.write(":keepalive\n\n");
            } catch {
                clearInterval(keepAlive);
            }
        }, this.heartbeatInterval);

        res.on("close", () => {
            clearInterval(keepAlive);
            this.unsubscribe(userId, res);
        });
    }

    private unsubscribe(userId: string, res: Response) {
        const userClients = this.clients.get(userId);
        if (!userClients) return;
        userClients.delete(res);
        if (userClients.size === 0) {
            this.clients.delete(userId);
        }
    }

    emit(userId: string, event: SseEvent) {
        const userClients = this.clients.get(userId);
        if (!userClients || userClients.size === 0) return;

        const payload = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;

        for (const res of userClients) {
            try {
                res.write(payload);
            } catch {
                this.unsubscribe(userId, res);
            }
        }
    }

    emitToMultiple(userIds: string[], event: SseEvent) {
        for (const id of userIds) {
            this.emit(id, event);
        }
    }
}

export const eventService = new EventService();
