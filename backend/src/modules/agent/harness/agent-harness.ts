import { classifyIntent, classifyFlowIntent, Intent, isPureGreeting } from "../../../lib/intent-classifier";
import { ProtocolService } from "../../protocol/protocol.service";
import { AgentTraceService, TraceInput } from "../agent-trace.service";
import { FlowEngine } from "./flow-engine";
import {
    extractOrderId,
    extractProductQuery,
    formatEscalation,
    formatOrderStatus,
    formatPriceCheck,
    formatProductList,
    isCatalogQuery,
} from "./response-formatter";
import { buildSystemPrompt, runConstrainedAgent, runTool } from "./tool-runner";
import { HarnessContext, HarnessResult, INTENT_ROUTES } from "./types";

const GREETING_BUTTONS = [
    { id: "place_order", title: "📦 Place Order" },
    { id: "products", title: "🔍 Products" },
    { id: "order_status", title: "📋 Order Status" },
    { id: "talk_human", title: "💬 Human" },
];

const BASE_RULES = [
    "Use tools for any product, price, or order question — never guess.",
    "Keep replies to 1-2 short sentences unless listing products.",
    "Be warm and natural. Hindi/English mix is fine.",
];

export class AgentHarness {
    private protocolService = new ProtocolService();
    private traceService = new AgentTraceService();
    private flowEngine = new FlowEngine();

    async process(ctx: HarnessContext, message: string): Promise<HarnessResult> {
        const start = Date.now();
        const text = message.trim();

        if (!ctx.userId) {
            return this.result("Please log in first.", "chitchat", "silent", [], []);
        }

        if (ctx.conversationStatus === "human_handling") {
            return this.result("", "escalate", "silent", [], []);
        }

        if (message === "__GREETING__") {
            const greetingResult: HarnessResult = {
                text: "Hello! How can I help you today?",
                intent: "greeting",
                handler: "greeting",
                protocolsUsed: [],
                toolsCalled: [],
                interactive: {
                    body: "Select an option below:",
                    buttons: GREETING_BUTTONS,
                },
            };
            await this.logTrace(ctx, text, greetingResult, start);
            return greetingResult;
        }

        if (message.startsWith("__BUTTON__:")) {
            const buttonResult = await this.handleButton(message, ctx);
            await this.logTrace(ctx, text, buttonResult, start);
            return buttonResult;
        }

        const protocols = await this.protocolService.getActiveRules(ctx.userId);
        const history = ctx.conversationHistory ?? [];

        let result: HarnessResult;

        // Active order flow takes priority — don't let greeting/chitchat interrupt slot filling
        if (ctx.activeFlow) {
            const flowIntent = classifyFlowIntent(text);
            if (flowIntent === "escalate") {
                result = {
                    text: formatEscalation(),
                    intent: flowIntent,
                    handler: "escalate",
                    protocolsUsed: protocols,
                    toolsCalled: [],
                    escalated: true,
                    activeFlow: null,
                };
            } else {
                const flowResult = await this.flowEngine.handle(text, flowIntent, ctx);
                if (flowResult) {
                    result = {
                        text: flowResult.text,
                        intent: "place_order",
                        handler: "flow",
                        protocolsUsed: protocols,
                        toolsCalled: flowResult.toolsCalled,
                        activeFlow: flowResult.activeFlow,
                    };
                } else {
                    result = await this.runDeterministic(text, "product_search", ctx.userId, protocols);
                }
            }
            await this.logTrace(ctx, text, result, start);
            return result;
        }

        const intent = await classifyIntent(text);
        const route = INTENT_ROUTES[intent];

        if (intent === "escalate") {
            result = {
                text: formatEscalation(),
                intent,
                handler: "escalate",
                protocolsUsed: protocols,
                toolsCalled: [],
                escalated: true,
            };
        } else if (route.handler === "flow") {
            const flowResult = await this.flowEngine.handle(text, intent, ctx);
            if (flowResult) {
                result = {
                    text: flowResult.text,
                    intent: "place_order",
                    handler: "flow",
                    protocolsUsed: protocols,
                    toolsCalled: flowResult.toolsCalled,
                    activeFlow: flowResult.activeFlow,
                };
            } else {
                result = await this.runDeterministic(text, intent, ctx.userId, protocols);
            }
        } else if (route.handler === "deterministic") {
            result = await this.runDeterministic(text, intent, ctx.userId, protocols);
        } else if (route.handler === "greeting") {
            if (!isPureGreeting(text)) {
                const { text: reply, toolsCalled } = await runConstrainedAgent(
                    text,
                    ctx.userId,
                    ["reply_to_customer"],
                    buildSystemPrompt(BASE_RULES, protocols, "chitchat"),
                    history
                );
                result = {
                    text: reply,
                    intent: "chitchat",
                    handler: "constrained_agent",
                    protocolsUsed: protocols,
                    toolsCalled,
                };
            } else {
                result = {
                    text: "Hello! How can I help you today?",
                    intent,
                    handler: "greeting",
                    protocolsUsed: protocols,
                    toolsCalled: [],
                    ...(ctx.isFirstMessage
                        ? { interactive: { body: "Or pick an option:", buttons: GREETING_BUTTONS } }
                        : {}),
                };
            }
        } else {
            const { text: reply, toolsCalled } = await runConstrainedAgent(
                text,
                ctx.userId,
                route.allowedTools,
                buildSystemPrompt(BASE_RULES, protocols, intent),
                history
            );
            result = {
                text: reply,
                intent,
                handler: "constrained_agent",
                protocolsUsed: protocols,
                toolsCalled,
            };
        }

        await this.logTrace(ctx, text, result, start);
        return result;
    }

    private async logTrace(
        ctx: HarnessContext,
        inboundMessage: string,
        result: HarnessResult,
        start: number
    ) {
        const traceInput: TraceInput = {
            userId: ctx.userId,
            inboundMessage,
            outboundMessage: result.text,
            intent: result.intent,
            handler: result.handler,
            protocolsUsed: result.protocolsUsed,
            toolsCalled: result.toolsCalled,
            latencyMs: Date.now() - start,
        };
        if (ctx.conversationId) traceInput.conversationId = ctx.conversationId;
        if (ctx.customerPhone) traceInput.customerPhone = ctx.customerPhone;
        await this.traceService.log(traceInput);
    }

    private async runDeterministic(
        message: string,
        intent: Intent,
        userId: string,
        protocols: string[]
    ): Promise<HarnessResult> {
        const toolsCalled: HarnessResult["toolsCalled"] = [];
        

        if (intent === "product_search" || intent === "price_check") {
            const query = extractProductQuery(message);
            let { result, record } = await runTool("get_product_info", { query }, userId);
            toolsCalled.push(record);

            let parsed = JSON.parse(result);
            if ((!parsed.found || !parsed.products?.length) && (isCatalogQuery(message) || query.split(/\s+/).length >= 2)) {
                const fallback = await runTool("get_product_info", { query: "" }, userId);
                toolsCalled.push(fallback.record);
                const fallbackParsed = JSON.parse(fallback.result);
                if (fallbackParsed.found && fallbackParsed.products?.length) {
                    result = fallback.result;
                    parsed = fallbackParsed;
                }
            }

            if (intent === "price_check" && parsed.found && parsed.products?.length === 1) {
                const text = formatPriceCheck(result);
                return { text, intent, handler: "deterministic", protocolsUsed: protocols, toolsCalled };
            }

            return {
                text: formatProductList(result),
                intent,
                handler: "deterministic",
                protocolsUsed: protocols,
                toolsCalled,
            };
        }

        if (intent === "order_status") {
            const orderId = extractOrderId(message);
            if (!orderId) {
                return {
                    text: "Please share your order ID (e.g. ORD-...) so I can check the status.",
                    intent,
                    handler: "deterministic",
                    protocolsUsed: protocols,
                    toolsCalled,
                };
            }

            const { result, record } = await runTool("get_order_status", { orderId }, userId);
            toolsCalled.push(record);
            return {
                text: formatOrderStatus(result),
                intent,
                handler: "deterministic",
                protocolsUsed: protocols,
                toolsCalled,
            };
        }

        const { text, toolsCalled: agentTools } = await runConstrainedAgent(
            message,
            userId,
            INTENT_ROUTES[intent].allowedTools,
            buildSystemPrompt(BASE_RULES, protocols, intent),
            []
        );

        return {
            text,
            intent,
            handler: "constrained_agent",
            protocolsUsed: protocols,
            toolsCalled: agentTools,
        };
    }

    private async handleButton(message: string, ctx: HarnessContext): Promise<HarnessResult> {
        const protocols = await this.protocolService.getActiveRules(ctx.userId);

        switch (message) {
            case "__BUTTON__:place_order":
                return {
                    text: "Sure! Which product would you like to order?",
                    intent: "place_order",
                    handler: "flow",
                    protocolsUsed: protocols,
                    toolsCalled: [],
                    activeFlow: {
                        type: "place_order",
                        step: "select_product",
                        slots: ctx.customerPhone ? { phone: ctx.customerPhone } : {},
                    },
                };
            case "__BUTTON__:products": {
                const { result, record } = await runTool("get_product_info", { query: "" }, ctx.userId);
                return {
                    text: formatProductList(result),
                    intent: "product_search",
                    handler: "deterministic",
                    protocolsUsed: protocols,
                    toolsCalled: [record],
                };
            }
            case "__BUTTON__:order_status":
                return {
                    text: "Please share your order ID (e.g. ORD-...) so I can check the status.",
                    intent: "order_status",
                    handler: "deterministic",
                    protocolsUsed: protocols,
                    toolsCalled: [],
                };
            case "__BUTTON__:talk_human":
                return {
                    text: formatEscalation(),
                    intent: "escalate",
                    handler: "escalate",
                    protocolsUsed: protocols,
                    toolsCalled: [],
                    escalated: true,
                };
            default:
                return {
                    text: "How can I help you?",
                    intent: "chitchat",
                    handler: "constrained_agent",
                    protocolsUsed: protocols,
                    toolsCalled: [],
                };
        }
    }

    private result(
        text: string,
        intent: Intent,
        handler: string,
        protocols: string[],
        toolsCalled: HarnessResult["toolsCalled"]
    ): HarnessResult {
        return { text, intent, handler, protocolsUsed: protocols, toolsCalled };
    }
}
