import OpenAI from "openai";
import { Env } from "../../config/app.config";
import { tools } from "./tools";

const openai = new OpenAI({
    apiKey: Env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const SYSTEM_PROMPT = `You are Relay, a helpful AI customer support agent for a business.

You MUST use the available tools to answer questions — never make up product names, prices, stock, or order details.

RULES:
- Customer asks "what products" / "catalog" / "what do you have" → get_product_info(query:"")
- Customer asks about a product by name → get_product_info(query:"<product name>")
- Customer wants to buy/order → first get_product_info to find the product and get the correct ID, then place_order
- Customer asks about an existing order → get_order_status
- Customer asks for price → get_product_info
- Customer says "talk to human" → escalate_to_human
- For everything else (greetings, thanks, casual chat) → reply_to_customer

Keep responses VERY short — 1-2 sentences. Be warm and natural.`;

const QUICK_GREETING = /^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy|sup|yo|bye|goodbye|thanks?|thank\s*you)[\s!.?]*$/i;
const QUICK_ESCALATE = /\b(human|agent|talk\s*to\s*(a\s*)?(human|person)|real\s*person|speak\s*to\s*(manager|human))\b/i;

export class AgentService {
    async processMessage(
        message: string,
        userId?: string,
        context?: {
            conversationHistory?: { role: "user" | "assistant"; content: string }[];
            templateContext?: string;
        }
    ): Promise<string> {
        const text = message.trim();
        if (!text) return "Please say something!";
        if (!userId) return "Please log in first.";

        if (QUICK_ESCALATE.test(text)) {
            return "I'm transferring you to a human agent. Someone will be with you shortly.";
        }

        if (QUICK_GREETING.test(text)) {
            return "Hello! How can I help you today?";
        }

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: context?.templateContext
                    ? `${SYSTEM_PROMPT}\n\nThe customer is replying to this message you sent just now:\n${context.templateContext}`
                    : SYSTEM_PROMPT,
            },
            ...(context?.conversationHistory ?? []).slice(-10).map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            })),
            { role: "user", content: text },
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
        if (!choice || !choice.tool_calls) return "I'm not sure how to respond to that.";

        messages.push(choice);

        let onlyReplyToCustomer = choice.tool_calls.length === 1;

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
                    if (parsed.reply) return parsed.reply;
                } catch {}
            }
        }

        const finalResponse = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.3,
            max_tokens: 200,
        });

        return finalResponse.choices[0]?.message?.content || "Let me check on that for you.";
    }
}
