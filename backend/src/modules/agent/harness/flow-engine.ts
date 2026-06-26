import { Intent } from "../../../lib/intent-classifier";
import { ActiveFlow, HarnessContext } from "./types";
import { runTool } from "./tool-runner";
import {
    extractOrderId,
    extractProductQuery,
    extractQuantity,
    formatFlowConfirm,
    formatPlaceOrder,
    formatProductList,
} from "./response-formatter";


const CANCEL_PATTERN = /\b(no|nah|nope|cancel|forget|stop|never\s*mind)\b/i;
const CONFIRM_PATTERN = /\b(yes|yeah|yep|confirm|ok|okay|sure|go\s*ahead)\b/i;

export interface FlowResult {
    text: string;
    activeFlow: ActiveFlow | null;
    toolsCalled: { name: string; args: Record<string, unknown>; result: string }[];
    completed?: boolean;
}

export class FlowEngine {
    async handle(
        message: string,
        intent: Intent,
        ctx: HarnessContext
    ): Promise<FlowResult | null> {
        let flow = ctx.activeFlow ?? null;

        if (!flow && (intent === "place_order" || this.looksLikeOrderIntent(message))) {
            flow = {
                type: "place_order",
                step: "select_product",
                slots: ctx.customerPhone ? { phone: ctx.customerPhone } : {},
            };
        }

        if (!flow) return null;

        if (intent === "cancel" || CANCEL_PATTERN.test(message)) {
            return {
                text: "No problem, I've cancelled that. How else can I help?",
                activeFlow: null,
                toolsCalled: [],
            };
        }

        switch (flow.step) {
            case "select_product":
                return this.handleSelectProduct(message, flow, ctx.userId);
            case "quantity":
                return this.handleQuantity(message, flow);
            case "customer_name":
                return this.handleCustomerName(message, flow);
            case "confirm":
                return this.handleConfirm(message, intent, flow, ctx.userId);
            default:
                return null;
        }
    }

    private looksLikeOrderIntent(message: string): boolean {
        return /\b(order|buy|purchase|i\s+want|i\s+need)\b/i.test(message);
    }

    private async handleSelectProduct(message: string, flow: ActiveFlow, userId: string): Promise<FlowResult> {
        const query = extractProductQuery(message);
        const { result, record } = await runTool("get_product_info", { query }, userId);
        const parsed = JSON.parse(result);

        if (!parsed.found || !parsed.products?.length) {
            return {
                text: parsed.message ?? "I couldn't find that product. Which item would you like?",
                activeFlow: flow,
                toolsCalled: [record],
            };
        }

        const product = parsed.products[0];
        const nextFlow: ActiveFlow = {
            ...flow,
            step: "quantity",
            slots: {
                ...flow.slots,
                productId: product.id,
                productName: product.name,
                price: product.price,
                unit: product.unit,
            },
        };

        return {
            text: `Great choice — ${product.name} ($${product.price}/${product.unit}). How many would you like?`,
            activeFlow: nextFlow,
            toolsCalled: [record],
        };
    }

    private handleQuantity(message: string, flow: ActiveFlow): FlowResult {
        const qty = extractQuantity(message);
        if (!qty) {
            return {
                text: "Please tell me the quantity (e.g. 2 or 5).",
                activeFlow: flow,
                toolsCalled: [],
            };
        }

        const nextFlow: ActiveFlow = {
            ...flow,
            step: flow.slots.customerName ? "confirm" : "customer_name",
            slots: { ...flow.slots, quantity: qty },
        };

        if (nextFlow.step === "confirm") {
            return {
                text: formatFlowConfirm(nextFlow.slots),
                activeFlow: nextFlow,
                toolsCalled: [],
            };
        }

        return {
            text: "What's your full name for the order?",
            activeFlow: nextFlow,
            toolsCalled: [],
        };
    }

    private handleCustomerName(message: string, flow: ActiveFlow): FlowResult {
        const name = message.trim();
        if (name.length < 2) {
            return {
                text: "Please share your full name for the order.",
                activeFlow: flow,
                toolsCalled: [],
            };
        }

        const nextFlow: ActiveFlow = {
            ...flow,
            step: "confirm",
            slots: { ...flow.slots, customerName: name },
        };

        return {
            text: formatFlowConfirm(nextFlow.slots),
            activeFlow: nextFlow,
            toolsCalled: [],
        };
    }

    private async handleConfirm(
        message: string,
        intent: Intent,
        flow: ActiveFlow,
        userId: string
    ): Promise<FlowResult> {
        if (intent !== "confirm" && !CONFIRM_PATTERN.test(message)) {
            return {
                text: formatFlowConfirm(flow.slots) + "\n\nReply YES to confirm or NO to cancel.",
                activeFlow: flow,
                toolsCalled: [],
            };
        }

        const { productId, quantity, customerName, phone } = flow.slots;
        if (!productId || !quantity || !customerName) {
            return {
                text: "Something went wrong with your order. Let's start over — which product would you like?",
                activeFlow: {
                    type: "place_order",
                    step: "select_product",
                    slots: phone !== undefined ? { phone } : {},
                },
                toolsCalled: [],
            };
        }

        const { result, record } = await runTool(
            "place_order",
            { productId, quantity, customerName, phone },
            userId
        );

        return {
            text: formatPlaceOrder(result),
            activeFlow: null,
            toolsCalled: [record],
            completed: true,
        };
    }
}
