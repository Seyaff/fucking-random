import { Intent } from "../../../lib/intent-classifier";

export interface FlowSlots {
    productId?: string;
    productName?: string;
    price?: number;
    unit?: string;
    quantity?: number;
    customerName?: string;
    phone?: string;
}

export interface ActiveFlow {
    type: "place_order";
    step: "select_product" | "quantity" | "customer_name" | "confirm";
    slots: FlowSlots;
}

export interface HarnessContext {
    userId: string;
    customerPhone?: string;
    conversationId?: string;
    conversationHistory?: { role: "user" | "assistant"; content: string }[];
    activeFlow?: ActiveFlow | null;
    conversationStatus?: "active" | "resolved" | "human_handling";
    templateContext?: string;
    isFirstMessage?: boolean;
}

/** Passed to AgentService without userId (merged in via buildHarnessContext). */
export type HarnessContextInput = Omit<HarnessContext, "userId">;

export interface HarnessResult {
    text: string;
    intent: Intent;
    handler: string;
    protocolsUsed: string[];
    toolsCalled: { name: string; args: Record<string, unknown>; result: string }[];
    activeFlow?: ActiveFlow | null;
    escalated?: boolean;
    interactive?: {
        body: string;
        buttons: { id: string; title: string }[];
    };
}

export type HandlerType =
    | "deterministic"
    | "flow"
    | "constrained_agent"
    | "escalate"
    | "greeting"
    | "silent";

export interface IntentRoute {
    handler: HandlerType;
    allowedTools: string[];
}

export const INTENT_ROUTES: Record<Intent, IntentRoute> = {
    greeting: { handler: "greeting", allowedTools: ["reply_to_customer"] },
    product_search: { handler: "deterministic", allowedTools: ["get_product_info"] },
    price_check: { handler: "deterministic", allowedTools: ["get_product_info", "check_price"] },
    place_order: { handler: "flow", allowedTools: ["get_product_info", "place_order", "reply_to_customer"] },
    order_status: { handler: "deterministic", allowedTools: ["get_order_status"] },
    confirm: { handler: "flow", allowedTools: ["place_order", "reply_to_customer"] },
    cancel: { handler: "constrained_agent", allowedTools: ["reply_to_customer"] },
    escalate: { handler: "escalate", allowedTools: ["escalate_to_human"] },
    chitchat: { handler: "constrained_agent", allowedTools: ["reply_to_customer"] },
};
