import OpenAI from "openai";
import { Env } from "../../config/app.config";
import { tools } from "./tools";

const openai = new OpenAI({
    apiKey: Env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const SYSTEM_PROMPT = `You are Relay, a helpful AI customer support agent for a business. You have access to tools that let you search products, check prices, place orders, and check order status.

When a customer messages you:
- If they ask what's available or what you sell → use get_product_info
- If they want to buy something → find the product first, then place the order after confirming details
- If they ask about price → use get_product_info and share the price
- If they ask about an existing order → use get_order_status
- If they need a human → use escalate_to_human
- For casual conversation or greetings → just respond naturally

Rules:
- Keep responses VERY short — 1-2 sentences. Be warm and natural.
- Never make up product names, prices, or order details — always use the tools.
- If a tool returns an error or no results, tell the customer honestly and ask how else you can help.`;

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
            ...(context?.conversationHistory ?? []).slice(-6).map((m) => ({
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
            tool_choice: "auto",
            temperature: 0.3,
            max_tokens: 400,
        });

        const choice = response.choices[0]?.message;
        if (!choice) return "I'm not sure how to respond to that.";

        if (choice.tool_calls && choice.tool_calls.length > 0) {
            messages.push(choice);

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

            const finalResponse = await openai.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages,
                temperature: 0.5,
                max_tokens: 200,
            });

            return finalResponse.choices[0]?.message?.content || "Let me check on that for you.";
        }

        return choice.content || "I'm not sure how to respond to that.";
    }
}
