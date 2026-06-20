import OpenAI from "openai";
import { Env } from "../../config/app.config";
import { tools } from "./tools";

const openai = new OpenAI({ apiKey: Env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are Relay, an AI customer support agent for an Indian grocery store.

RULES:
1. Always reply in the SAME language the customer used (Hindi, Hinglish, English, Urdu, etc.)
2. Be polite, warm, and professional
3. Use the available tools to look up products, check prices, and place orders
4. If a customer asks about products, search using get_product_info
5. If they want to order, first confirm the product and quantity, then use place_order
6. If you cannot help, escalate to a human agent
7. Keep responses concise and natural — like a real shopkeeper
8. Never make up product information — use the tools to check`;

function buildOpenAITools() {
    return tools.map((t) => {
        const shape = (t.parameters as any)._def.shape();
        const properties: Record<string, any> = {};
        const required: string[] = [];

        for (const [key, schema] of Object.entries(shape)) {
            const s = schema as any;
            properties[key] = {
                type: s._def.typeName === "ZodNumber" ? "number" : "string",
                description: s._def.description,
            };
            const isOptional = s._def.typeName === "ZodOptional" || s.isNullable?.();
            if (!isOptional) required.push(key);
        }

        return {
            type: "function" as const,
            function: {
                name: t.name,
                description: t.description,
                parameters: { type: "object", properties, required },
            },
        };
    });
}

export class AgentService {
    async processMessage(
        message: string,
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
            model: "gpt-4o-mini",
            messages,
            tools: buildOpenAITools(),
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
                    const result = await tool.handler(args);
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
                model: "gpt-4o-mini",
                messages,
                temperature: 0.7,
                max_tokens: 500,
            });

            return finalResponse.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again.";
        }

        return choice.message?.content || "I'm sorry, I couldn't process that. Please try again.";
    }
}
