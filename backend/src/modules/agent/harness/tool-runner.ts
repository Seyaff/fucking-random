import OpenAI from "openai";
import { Env } from "../../../config/app.config";
import { tools } from "../tools";
import { Intent } from "../../../lib/intent-classifier";

const openai = new OpenAI({
    apiKey: Env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export interface ToolCallRecord {
    name: string;
    args: Record<string, unknown>;
    result: string;
}

export async function runTool(
    name: string,
    args: Record<string, unknown>,
    userId: string
): Promise<{ result: string; record: ToolCallRecord }> {
    const tool = tools.find((t) => t.name === name);
    if (!tool) {
        const result = JSON.stringify({ error: `Unknown tool: ${name}` });
        return { result, record: { name, args, result } };
    }

    try {
        const validated = tool.parameters.parse(args);
        const result = await tool.handler(validated, userId);
        return { result, record: { name, args, result } };
    } catch (err: any) {
        const result = JSON.stringify({ error: err.message ?? "Invalid arguments" });
        return { result, record: { name, args, result } };
    }
}

export async function runConstrainedAgent(
    message: string,
    userId: string,
    allowedToolNames: string[],
    systemPrompt: string,
    history: { role: "user" | "assistant"; content: string }[]
): Promise<{ text: string; toolsCalled: ToolCallRecord[] }> {
    const allowedTools = tools.filter((t) => allowedToolNames.includes(t.name));
    if (allowedTools.length === 0) {
        return { text: "I'm not sure how to help with that.", toolsCalled: [] };
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...history.slice(-10).map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
        })),
        { role: "user", content: message },
    ];

    const toolDefinitions = allowedTools.map((t) => t.openai);
    const toolsCalled: ToolCallRecord[] = [];

    const response = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        tools: toolDefinitions,
        tool_choice: "required",
        temperature: 0.1,
        max_tokens: 400,
    });

    const choice = response.choices[0]?.message;
    if (!choice?.tool_calls?.length) {
        return { text: "I'm not sure how to respond to that.", toolsCalled };
    }

    for (const call of choice.tool_calls) {
        if (call.type !== "function") continue;
        const fn = call.function as { name: string; arguments: string };
        let args: Record<string, unknown> = {};
        try {
            args = JSON.parse(fn.arguments);
        } catch {}

        const { result, record } = await runTool(fn.name, args, userId);
        toolsCalled.push(record);

        if (fn.name === "reply_to_customer") {
            try {
                const parsed = JSON.parse(result);
                if (parsed.reply) return { text: parsed.reply, toolsCalled };
            } catch {}
        }
    }

    const last = toolsCalled[toolsCalled.length - 1];
    if (last) {
        try {
            const parsed = JSON.parse(last.result);
            if (parsed.message) return { text: parsed.message, toolsCalled };
            if (parsed.reply) return { text: parsed.reply, toolsCalled };
        } catch {}
    }

    return { text: "Let me check on that for you.", toolsCalled };
}

export function buildSystemPrompt(baseRules: string[], protocols: string[], intent: Intent): string {
    return `You are Relay, a helpful WhatsApp customer support agent for a business.

INTENT: ${intent}

RULES:
${baseRules.map((r) => `- ${r}`).join("\n")}

MERCHANT PROTOCOLS (must follow):
${protocols.map((p) => `- ${p}`).join("\n")}

You MUST use the provided tools. Never invent product names, prices, stock, or order details.
Keep responses VERY short — 1-2 sentences. Be warm. Match the customer's language.`;
}
