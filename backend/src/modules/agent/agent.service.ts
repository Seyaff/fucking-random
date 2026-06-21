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
3. Keep responses VERY short — 1-2 sentences max. No lengthy confirmations.
4. When a customer asks about products, immediately call get_product_info — do NOT list products from memory
5. When a customer clearly says "yes place order" (or similar confirmation) WITH the product and quantity already stated, immediately call place_order — do NOT reconfirm
6. When a customer says something casual (greeting, thanks, goodbye, small talk), just reply naturally WITHOUT calling any tools
7. If a product search returns nothing, tell the customer honestly and suggest they try a different search term
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
        }).catch((err: any) => {
            console.error("[Agent] Groq API error:", err.message);
            return null;
        });

        if (!response) {
            return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
        }

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
            }).catch((err: any) => {
                console.error("[Agent] Groq API error (tool response):", err.message);
                return null;
            });

            if (!finalResponse) {
                return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
            }

            return finalResponse.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again.";
        }

        return choice.message?.content || "I'm sorry, I couldn't process that. Please try again.";
    }
}
