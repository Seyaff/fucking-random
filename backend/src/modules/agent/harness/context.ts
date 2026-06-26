import { IActiveFlow } from "../../conversation/conversation.model";
import { HarnessContext, HarnessContextInput } from "./types";

export function buildHarnessContext(userId: string, input?: HarnessContextInput): HarnessContext {
    const ctx: HarnessContext = { userId };

    if (!input) return ctx;

    if (input.customerPhone !== undefined) ctx.customerPhone = input.customerPhone;
    if (input.conversationId !== undefined) ctx.conversationId = input.conversationId;
    if (input.conversationHistory !== undefined) ctx.conversationHistory = input.conversationHistory;
    if (input.activeFlow !== undefined) ctx.activeFlow = input.activeFlow;
    if (input.conversationStatus !== undefined) ctx.conversationStatus = input.conversationStatus;
    if (input.templateContext !== undefined) ctx.templateContext = input.templateContext;
    if (input.isFirstMessage !== undefined) ctx.isFirstMessage = input.isFirstMessage;

    return ctx;
}

export function buildHarnessContextInputFromConversation(params: {
    customerPhone: string;
    conversationId?: string | undefined;
    conversationHistory: { role: "user" | "assistant"; content: string }[];
    activeFlow: IActiveFlow | null;
    conversationStatus: "active" | "resolved" | "human_handling";
    isFirstMessage: boolean;
}): HarnessContextInput {
    const input: HarnessContextInput = {
        customerPhone: params.customerPhone,
        conversationHistory: params.conversationHistory,
        activeFlow: params.activeFlow,
        conversationStatus: params.conversationStatus,
        isFirstMessage: params.isFirstMessage,
    };

    if (params.conversationId !== undefined) {
        input.conversationId = params.conversationId;
    }

    return input;
}
