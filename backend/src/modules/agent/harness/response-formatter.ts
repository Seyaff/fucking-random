interface ProductResult {
    id: string;
    name: string;
    price: number;
    unit: string;
    stock: number;
    category?: string;
}

function parseToolJson<T>(raw: string): T | null {
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export function formatProductList(toolResult: string): string {
    const data = parseToolJson<{ found: boolean; message?: string; products?: ProductResult[] }>(toolResult);
    if (!data) return "I couldn't load the product catalog right now. Please try again.";
    if (!data.found || !data.products?.length) {
        return data.message ?? "I couldn't find any matching products.";
    }

    const lines = data.products.map(
        (p) => `• ${p.name} — $${p.price}/${p.unit} (${p.stock} in stock)`
    );
    return `Here's what we have:\n\n${lines.join("\n")}\n\nWant to order something? Just tell me the product name.`;
}

export function formatPriceCheck(toolResult: string): string {
    const data = parseToolJson<{ found: boolean; message?: string; product?: ProductResult & { compareAtPrice?: number } }>(
        toolResult
    );
    if (!data?.found || !data.product) {
        return data?.message ?? "I couldn't find that product.";
    }

    const p = data.product;
    return `${p.name} is $${p.price}/${p.unit}. We have ${p.stock} in stock.`;
}

export function formatOrderStatus(toolResult: string): string {
    const data = parseToolJson<{
        found: boolean;
        message?: string;
        orderId?: string;
        product?: string;
        quantity?: number;
        total?: number;
        status?: string;
        customerName?: string;
    }>(toolResult);

    if (!data?.found) {
        return data?.message ?? "I couldn't find that order. Please check the order ID.";
    }

    return `Order ${data.orderId}: ${data.quantity}x ${data.product} — $${data.total?.toFixed(2)}. Status: ${data.status}.`;
}

export function formatPlaceOrder(toolResult: string): string {
    const data = parseToolJson<{ success: boolean; message?: string; orderId?: string; total?: number }>(toolResult);
    if (!data?.success) {
        return data?.message ?? "Sorry, I couldn't place that order. Please try again.";
    }
    return data.message ?? `Order placed! Your order ID is ${data.orderId}.`;
}

export function formatEscalation(): string {
    return "I'm connecting you with a human agent. Someone will reply shortly.";
}

export function formatFlowConfirm(slots: {
    productName?: string;
    quantity?: number;
    customerName?: string;
    price?: number;
    unit?: string;
}): string {
    const total = (slots.price ?? 0) * (slots.quantity ?? 1);
    return `Please confirm your order:\n• ${slots.quantity}x ${slots.productName} — $${total.toFixed(2)}\n• Name: ${slots.customerName}\n\nReply YES to confirm or NO to cancel.`;
}

export function extractOrderId(text: string): string | null {
    const match = text.match(/\bORD-[A-Z0-9]+\b/i);
    return match ? match[0].toUpperCase() : null;
}

export function extractQuantity(text: string): number | null {
    const match = text.match(/\b(\d+)\b/);
    const captured = match?.[1];
    if (!captured) return null;
    const n = parseInt(captured, 10);
    return n > 0 && n <= 999 ? n : null;
}

const LIST_ALL_PATTERNS =
    /\b((wht|wat|what)\s+(products?|do\s+you\s+(have|sell))|(products?\s+(do\s+you\s+)?have)|catalog|inventory|list\s+(all\s+)?products?|show\s+(me\s+)?(all\s+)?products?|menu)\b/i;

export function isCatalogQuery(text: string): boolean {
    return LIST_ALL_PATTERNS.test(text);
}

export function extractProductQuery(text: string): string {
    if (isCatalogQuery(text)) return "";
    return text
        .replace(/\b(i\s+want|i\s+need|can\s+i\s+get|order|buy|price\s+of|how\s+much\s+is)\b/gi, "")
        .replace(/[?.!]/g, "")
        .trim();
}
