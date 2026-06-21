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

const GREETING = /\b(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy|sup|yo)\b/i;
const PRODUCT_SEARCH = /\b(what\s*(product|item|you\s*have)|show|list|available|catalog|do\s*you\s*(have|sell)|got\s*any)\b/i;
const PRICE_CHECK = /\b(price|cost|how\s*much|rate|what.*price)\b/i;
const PLACE_ORDER = /\b(i\s*want|i\s*need|i.*(like|would).*order|place.*order|buy|purchase|order|send\s*me)\b/i;
const ORDER_STATUS = /\b(order.*status|where.*order|track|delivery|shipped)\b/i;
const CONFIRM = /\b(yes|sure|go\s*ahead|okay|ok|do\s*it|please|yeah|yep|correct|right)\b/i;
const CANCEL = /\b(no|nah|never\s*mind|cancel|forget|stop|nope|not\s*now)\b/i;
const ESCALATE = /\b(human|agent|person|talk.*to|speak.*to|escalate|manager|real\s*person)\b/i;

export function classifyIntent(message: string): Intent {
    const text = message.trim();

    if (ESCALATE.test(text)) return "escalate";
    if (GREETING.test(text)) return "greeting";
    if (ORDER_STATUS.test(text)) return "order_status";
    if (PLACE_ORDER.test(text) || CONFIRM.test(text) && text.length < 20) return "place_order";
    if (PRICE_CHECK.test(text)) return "price_check";
    if (PRODUCT_SEARCH.test(text)) return "product_search";
    if (CANCEL.test(text)) return "cancel";

    return "chitchat";
}
