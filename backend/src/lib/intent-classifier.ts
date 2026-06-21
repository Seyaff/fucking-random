import OpenAI from "openai";
import { Env } from "../config/app.config";

export type Intent =
    | "greeting"
    | "product_search"
    | "price_check"
    | "place_order"
    | "order_status"
    | "confirm"
    | "cancel"
    | "escalate"
    | "chitchat";

const openai = new OpenAI({
    apiKey: Env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const QUICK_GREETING = /\b(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy|sup|yo|bye|goodbye)\b/i;
const QUICK_CANCEL = /\b(no|nah|nope|cancel|forget|stop|never\s*mind)\b/i;
const QUICK_ESCALATE = /\b(human|agent|talk\s*to\s*a\s*(human|person)|real\s*person|speak\s*to\s*(manager|human))\b/i;

const CLASSIFY_PROMPT = `Classify the user's intent into exactly ONE of these labels:

- greeting: casual greeting or farewell (hi, hello, bye, good morning, thanks)
- product_search: asking what products exist, what's available, catalog, inventory, what you sell
- price_check: asking for price/cost of a specific product
- place_order: wanting to buy, order, purchase something
- order_status: asking about existing order delivery status, tracking
- confirm: confirming, agreeing, saying yes
- cancel: declining, saying no, canceling
- escalate: wanting to speak to a human agent or manager
- chitchat: anything else — casual conversation, off-topic questions

Reply with ONLY the label, nothing else.`;

export async function classifyIntent(message: string): Promise<Intent> {
    const text = message.trim();

    if (QUICK_ESCALATE.test(text)) return "escalate";
    if (QUICK_CANCEL.test(text) && text.length < 30) return "cancel";
    if (QUICK_GREETING.test(text) && text.length < 30) return "greeting";

    try {
        const response = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: CLASSIFY_PROMPT },
                { role: "user", content: text },
            ],
            temperature: 0,
            max_tokens: 10,
        });

        const label = response.choices[0]?.message?.content?.trim().toLowerCase() as Intent | undefined;
        if (label && ["greeting", "product_search", "price_check", "place_order", "order_status", "confirm", "cancel", "escalate", "chitchat"].includes(label)) {
            return label;
        }

        return "chitchat";
    } catch {
        return "chitchat";
    }
}
