import { AgentHarness } from "./harness/agent-harness";
import { buildHarnessContext } from "./harness/context";
import { HarnessContext, HarnessContextInput } from "./harness/types";

export interface AgentResponse {
    text: string;
    interactive?: {
        body: string;
        buttons: { id: string; title: string }[];
    };
    trace?: {
        intent: string;
        handler: string;
        toolsCalled: string[];
    };
    escalated?: boolean;
    activeFlow?: HarnessContext["activeFlow"];
}

const harness = new AgentHarness();

export class AgentService {
    async processMessage(
        message: string,
        userId?: string,
        context?: HarnessContextInput
    ): Promise<AgentResponse> {
        if (!userId) return { text: "Please log in first." };

        const result = await harness.process(buildHarnessContext(userId, context), message);

        const response: AgentResponse = {
            text: result.text,
            trace: {
                intent: result.intent,
                handler: result.handler,
                toolsCalled: result.toolsCalled.map((t) => t.name),
            },
        };

        if (result.interactive) response.interactive = result.interactive;
        if (result.escalated) response.escalated = result.escalated;
        if (result.activeFlow !== undefined) response.activeFlow = result.activeFlow;

        return response;
    }

    async processMessageStream(
        message: string,
        userId: string,
        onToken: (token: string) => void,
        context?: HarnessContextInput
    ): Promise<AgentResponse> {
        const reply = await this.processMessage(message, userId, context);

        if (reply.text) {
            const words = reply.text.split(/(\s+)/);
            for (const word of words) {
                onToken(word);
            }
        }

        return reply;
    }
}
