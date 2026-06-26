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

const BUSINESS_KEYWORDS =
    /\b(product|products|order|orders|price|catalog|inventory|stock|buy|purchase|delivery|menu|have|sell|available|want|need)\b/i;

const PURE_GREETING =
    /^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy|sup|yo|bye|goodbye)[!.?\s]*$/i;

const THANKS = /\b(thanks|thank\s*you|thx|ty|appreciate)\b/i;

const QUICK_CANCEL = /^(no|nah|nope|cancel|forget|stop|never\s*mind)[!.?\s]*$/i;
const QUICK_CONFIRM = /^(yes|yeah|yep|yup|confirm|ok|okay|sure|go\s*ahead)[!.?\s]*$/i;
const QUICK_ESCALATE = /\b(human|agent|talk\s*to\s*a\s*(human|person)|real\s*person|speak\s*to\s*(manager|human))\b/i;

const CATALOG_QUERY =
    /\b((wht|wat|what)\s+(products?|do\s+you\s+(have|sell))|(products?\s+(do\s+you\s+)?have)|catalog|inventory|list\s+(all\s+)?products?|show\s+(me\s+)?(all\s+)?products?|menu)\b/i;

const CLASSIFY_PROMPT = `Classify the user's intent into exactly ONE of these labels:

- greeting: ONLY a short standalone hello or goodbye with no other request (hi, hello, bye)
- product_search: asking what products exist, catalog, inventory, what's available, what you sell
- price_check: asking for price/cost of a specific product
- place_order: wanting to buy, order, purchase something specific
- order_status: asking about existing order delivery status, tracking
- confirm: confirming, agreeing, saying yes to proceed
- cancel: declining, saying no, canceling
- escalate: wanting to speak to a human agent or manager
- chitchat: thanks, casual chat, small talk, or anything else

IMPORTANT: "thanks" and "okay thanks" are chitchat, NOT greeting.
If the message asks about products AND says hello, choose product_search.

Reply with ONLY the label, nothing else.`;

export function isCatalogQuestion(message: string): boolean {
    return CATALOG_QUERY.test(message.trim());
}

export function isPureGreeting(message: string): boolean {
    const text = message.trim();
    if (THANKS.test(text)) return false;
    if (BUSINESS_KEYWORDS.test(text)) return false;
    return PURE_GREETING.test(text);
}

export async function classifyIntent(message: string): Promise<Intent> {
    const text = message.trim();

    if (QUICK_ESCALATE.test(text)) return "escalate";
    if (QUICK_CANCEL.test(text)) return "cancel";
    if (QUICK_CONFIRM.test(text)) return "confirm";
    if (THANKS.test(text)) return "chitchat";
    if (isCatalogQuestion(text)) return "product_search";
    if (isPureGreeting(text)) return "greeting";

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
        if (
            label &&
            [
                "greeting",
                "product_search",
                "price_check",
                "place_order",
                "order_status",
                "confirm",
                "cancel",
                "escalate",
                "chitchat",
            ].includes(label)
        ) {
            if (label === "greeting" && (BUSINESS_KEYWORDS.test(text) || THANKS.test(text))) {
                return BUSINESS_KEYWORDS.test(text) ? "product_search" : "chitchat";
            }
            return label;
        }

        return "chitchat";
    } catch {
        return "chitchat";
    }
}

/** During an active order flow, only detect confirm/cancel/escalate — everything else is slot input. */
export function classifyFlowIntent(message: string): Intent {
    const text = message.trim();
    if (QUICK_ESCALATE.test(text)) return "escalate";
    if (QUICK_CANCEL.test(text)) return "cancel";
    if (QUICK_CONFIRM.test(text)) return "confirm";
    return "chitchat";
}
