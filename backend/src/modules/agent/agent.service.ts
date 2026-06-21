import OpenAI from "openai";
import { Env } from "../../config/app.config";
import { tools } from "./tools";

const openai = new OpenAI({
    apiKey: Env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export interface AgentResponse {
    text: string;
    interactive?: {
        body: string;
        buttons: { id: string; title: string }[];
    };
}

const GREETING_BUTTONS = [
    { id: "place_order", title: "📦 Place Order" },
    { id: "products", title: "🔍 Products" },
    { id: "order_status", title: "📋 Order Status" },
    { id: "talk_human", title: "💬 Human" },
];

const SYSTEM_PROMPT = `You are Relay, a helpful AI customer support agent for a business.

You MUST use the available tools to answer questions — never make up product names, prices, stock, or order details.

RULES:
- Customer asks about a product by name → get_product_info(query:"<product name>")
- Customer wants to buy/order → first get_product_info to find the product and get the correct ID and price, then if all details are known call place_order. If you lack customerName, phone, or productId, ask the customer politely for what's missing.
- Customer asks about an existing order → get_order_status
- Customer asks for price → get_product_info
- Customer says "talk to human" → escalate_to_human
- For everything else (greetings, thanks, casual chat) → reply_to_customer

IMPORTANT: When the customer says "yes" or confirms they want to order, check the conversation history — they may have already named the product. Use get_product_info with the mentioned product name to find the correct productId, then ask for any remaining missing details (name, phone) before calling place_order.

Keep responses VERY short — 1-2 sentences. Be warm and natural. Use the customer's language (Hindi/English mix is fine).`;

const QUICK_ESCALATE = /\b(human|agent|talk\s*to\s*(a\s*)?(human|person)|real\s*person|speak\s*to\s*(manager|human))\b/i;

export class AgentService {
    async processMessage(
        message: string,
        userId?: string,
        context?: {
            conversationHistory?: { role: "user" | "assistant"; content: string }[];
            templateContext?: string;
        }
    ): Promise<AgentResponse> {
        const text = message.trim();
        if (!text) return { text: "Please say something!" };
        if (!userId) return { text: "Please log in first." };

        if (QUICK_ESCALATE.test(text)) {
            return { text: "I'm transferring you to a human agent. Someone will be with you shortly." };
        }

        if (message === "__GREETING__") {
            return {
                text: "Hello! How can I help you today?",
                interactive: {
                    body: "Select an option below:",
                    buttons: GREETING_BUTTONS,
                },
            };
        }

        if (message === "__BUTTON__:place_order") {
            return this.handleButtonPlaceOrder(userId);
        }
        if (message === "__BUTTON__:products") {
            return this.handleButtonProducts(userId);
        }
        if (message === "__BUTTON__:order_status") {
            return { text: "Please share your order ID (e.g. ORD-...) so I can check the status." };
        }
        if (message === "__BUTTON__:talk_human") {
            return { text: "I'm transferring you to a human agent. Someone will be with you shortly." };
        }

        const historyMessages = (context?.conversationHistory ?? []).slice(-10).map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
        }));

        const lastHistory = historyMessages[historyMessages.length - 1];
        const shouldAppendUser = !lastHistory || lastHistory.role !== "user" || lastHistory.content !== text;

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: context?.templateContext
                    ? `${SYSTEM_PROMPT}\n\nThe customer is replying to this message you sent just now:\n${context.templateContext}`
                    : SYSTEM_PROMPT,
            },
            ...historyMessages,
            ...(shouldAppendUser ? [{ role: "user" as const, content: text }] : []),
        ];

        const toolDefinitions = tools.map((t) => t.openai);

        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            tools: toolDefinitions,
            tool_choice: "required",
            temperature: 0.1,
            max_tokens: 400,
        });

        const choice = response.choices[0]?.message;
        if (!choice || !choice.tool_calls) return { text: "I'm not sure how to respond to that." };

        messages.push(choice);

        let onlyReplyToCustomer = true;

        for (const call of choice.tool_calls) {
            if (call.type !== "function") continue;
            const fn = call.function as { name: string; arguments: string };
            const tool = tools.find((t) => t.name === fn.name);
            if (!tool) {
                messages.push({
                    role: "tool",
                    tool_call_id: call.id,
                    content: JSON.stringify({ error: `Unknown tool: ${fn.name}` }),
                });
                continue;
            }

            if (fn.name !== "reply_to_customer") onlyReplyToCustomer = false;

            try {
                const args = JSON.parse(fn.arguments);
                const validated = tool.parameters.parse(args);
                const result = await tool.handler(validated, userId);
                messages.push({
                    role: "tool",
                    tool_call_id: call.id,
                    content: result,
                });
            } catch (err: any) {
                messages.push({
                    role: "tool",
                    tool_call_id: call.id,
                    content: JSON.stringify({ error: err.message ?? "Invalid arguments" }),
                });
            }
        }

        if (onlyReplyToCustomer) {
            const lastTool = messages[messages.length - 1];
            if (lastTool?.role === "tool") {
                try {
                    const parsed = JSON.parse(lastTool.content as string);
                    if (parsed.reply) return { text: parsed.reply };
                } catch {}
            }
        }

        const finalResponse = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.3,
            max_tokens: 200,
        });

        return { text: finalResponse.choices[0]?.message?.content || "Let me check on that for you." };
    }

    async processMessageStream(
        message: string,
        userId: string,
        onToken: (token: string) => void,
        context?: {
            conversationHistory?: { role: "user" | "assistant"; content: string }[];
        }
    ): Promise<void> {
        const text = message.trim();
        if (!text || !userId) {
            onToken("Please log in first.");
            return;
        }

        if (QUICK_ESCALATE.test(text)) {
            onToken("I'm transferring you to a human agent. Someone will be with you shortly.");
            return;
        }

        if (message === "__GREETING__") {
            onToken("Hello! How can I help you today?");
            return;
        }

        const historyMessages = (context?.conversationHistory ?? []).slice(-10).map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
        }));

        const lastHistory = historyMessages[historyMessages.length - 1];
        const shouldAppendUser = !lastHistory || lastHistory.role !== "user" || lastHistory.content !== text;

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: "system", content: SYSTEM_PROMPT },
            ...historyMessages,
            ...(shouldAppendUser ? [{ role: "user" as const, content: text }] : []),
        ];

        const toolDefinitions = tools.map((t) => t.openai);

        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            tools: toolDefinitions,
            tool_choice: "required",
            temperature: 0.1,
            max_tokens: 400,
        });

        const choice = response.choices[0]?.message;
        if (!choice || !choice.tool_calls) {
            onToken("I'm not sure how to respond to that.");
            return;
        }

        messages.push(choice);

        let onlyReplyToCustomer = true;

        for (const call of choice.tool_calls) {
            if (call.type !== "function") continue;
            const fn = call.function as { name: string; arguments: string };
            const tool = tools.find((t) => t.name === fn.name);
            if (!tool) {
                messages.push({
                    role: "tool",
                    tool_call_id: call.id,
                    content: JSON.stringify({ error: `Unknown tool: ${fn.name}` }),
                });
                continue;
            }

            if (fn.name !== "reply_to_customer") onlyReplyToCustomer = false;

            try {
                const args = JSON.parse(fn.arguments);
                const validated = tool.parameters.parse(args);
                const result = await tool.handler(validated, userId);
                messages.push({
                    role: "tool",
                    tool_call_id: call.id,
                    content: result,
                });
            } catch (err: any) {
                messages.push({
                    role: "tool",
                    tool_call_id: call.id,
                    content: JSON.stringify({ error: err.message ?? "Invalid arguments" }),
                });
            }
        }

        if (onlyReplyToCustomer) {
            const lastTool = messages[messages.length - 1];
            if (lastTool?.role === "tool") {
                try {
                    const parsed = JSON.parse(lastTool.content as string);
                    if (parsed.reply) {
                        onToken(parsed.reply);
                        return;
                    }
                } catch {}
            }
        }

        const stream = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.3,
            max_tokens: 200,
            stream: true,
        });

        for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content || "";
            if (token) onToken(token);
        }
    }

    private async handleButtonPlaceOrder(userId: string): Promise<AgentResponse> {
        const products = await this.getAllProducts(userId);
        if (products.length === 0) {
            return { text: "Your catalog is empty. Add products first." };
        }

        const list = products.slice(0, 10).map((p) => `${p.name} — $${p.price}/${p.unit}`).join("\n");
        return { text: `Sure! Which product would you like to order?\n\n${list}` };
    }

    private async handleButtonProducts(userId: string): Promise<AgentResponse> {
        const products = await this.getAllProducts(userId);
        if (products.length === 0) {
            return { text: "Your catalog is empty. Add products first." };
        }

        const list = products.slice(0, 10).map((p) => `${p.name} — $${p.price}/${p.unit} (${p.stock} in stock)`).join("\n");
        return { text: `Here's what's in your catalog:\n\n${list}` };
    }

    private async getAllProducts(userId: string) {
        const ProductModel = (await import("../product/product.model")).default;
        return ProductModel.find({ userId, isActive: true }).limit(20).lean();
    }
}
