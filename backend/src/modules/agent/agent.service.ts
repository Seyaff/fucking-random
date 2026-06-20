import OpenAI from "openai";
import { Env } from "../../config/app.config";
import { tools } from "./tools";

const openai = new OpenAI({
    apiKey: Env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const SYSTEM_PROMPT = `You are Relay, an AI customer support agent.

RULES:
1. Always reply in the SAME language the customer used
2. Be polite, warm, and professional
3. Use the available tools to look up products, check prices, and place orders
4. If a customer asks about products, search using get_product_info
5. If they want to order, first confirm the product and quantity, then use place_order
6. If you cannot help, escalate to a human agent
7. Keep responses concise and natural
8. Never make up product information — use the tools to check`;

export class AgentService {
    async processMessage(
        message: string,
        userId?: string,
        conversationHistory: { role: "user" | "assistant"; content: string }[] = []
    ): Promise<string> {
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: "system", content: SYSTEM_PROMPT },
            ...conversationHistory.map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            })),
            { role: "user", content: message },
        ];

        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            tools: tools.map((t) => t.openai),
            tool_choice: "auto",
            temperature: 0.7,
            max_tokens: 500,
        });

        const choice = response.choices[0];
        if (!choice) return "I'm sorry, I couldn't process that. Please try again.";

        const toolCalls = choice.message.tool_calls;

        if (toolCalls && toolCalls.length > 0) {
            const results: string[] = [];

            for (const tc of toolCalls) {
                if (!("function" in tc)) continue;
                const tool = tools.find((t) => t.name === tc.function.name);
                if (!tool) {
                    results.push(`Unknown tool: ${tc.function.name}`);
                    continue;
                }

                try {
                    const args = JSON.parse(tc.function.arguments);
                    const result = await tool.handler(args, userId);
                    results.push(result);
                } catch (err: any) {
                    results.push(`Error executing ${tc.function.name}: ${err.message}`);
                }
            }

            messages.push(choice.message);
            for (let i = 0; i < results.length; i++) {
                messages.push({
                    role: "tool",
                    tool_call_id: toolCalls[i]!.id,
                    content: results[i]!,
                });
            }

            const finalResponse = await openai.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages,
                temperature: 0.7,
                max_tokens: 500,
            });

            return finalResponse.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again.";
        }

        return choice.message?.content || "I'm sorry, I couldn't process that. Please try again.";
    }
}
