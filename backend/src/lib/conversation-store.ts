export interface PendingOrder {
    productId?: string;
    productName?: string;
    unitPrice?: number;
    quantity?: number;
    customerName?: string;
    phone?: string;
}

export interface ConversationState {
    lastIntent: string;
    pendingOrder: PendingOrder | null;
    awaitingDetails: "nothing" | "product" | "quantity" | "customer_name" | "phone";
}

class ConversationStore {
    private store = new Map<string, ConversationState>();

    get(key: string): ConversationState {
        if (!this.store.has(key)) {
            this.store.set(key, {
                lastIntent: "chitchat",
                pendingOrder: null,
                awaitingDetails: "nothing",
            });
        }
        return this.store.get(key)!;
    }

    set(key: string, state: ConversationState) {
        this.store.set(key, state);
    }

    reset(key: string) {
        this.store.delete(key);
    }
}

export const conversationStore = new ConversationStore();
