import { Types } from "mongoose";
import OpenAI from "openai";
import { Env } from "../../config/app.config";
import { classifyIntent, type Intent } from "../../lib/intent-classifier";
import { conversationStore, type ConversationState } from "../../lib/conversation-store";
import ProductModel from "../product/product.model";
import { OrderService } from "../order/order.service";

const openai = new OpenAI({
    apiKey: Env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const orderService = new OrderService();

const CHITCHAT_SYSTEM = `You are Relay, a friendly AI customer support agent. Keep responses VERY short — 1-2 sentences. Be warm and natural.`;

export class AgentService {
    async processMessage(
        message: string,
        userId?: string,
        conversationHistory: { role: "user" | "assistant"; content: string }[] = []
    ): Promise<string> {
        const text = message.trim();
        if (!text) return "Please say something!";

        const stateKey = userId || "anonymous";
        const state = conversationStore.get(stateKey);
        const intent = classifyIntent(text);

        state.lastIntent = intent;
        conversationStore.set(stateKey, state);

        // --- GREETING ---
        if (intent === "greeting") {
            const name = conversationHistory.length > 0
                ? ""
                : "! How can I help you today?";
            return `Hello${name}`;
        }

        // --- CANCEL ---
        if (intent === "cancel") {
            conversationStore.reset(stateKey);
            return "No problem! Let me know if you need anything else.";
        }

        // --- ESCALATE ---
        if (intent === "escalate") {
            conversationStore.reset(stateKey);
            return "I'm transferring you to a human agent. Someone will be with you shortly.";
        }

        // --- PRODUCT SEARCH ---
        if (intent === "product_search") {
            return await this.handleProductSearch(text, userId);
        }

        // --- PRICE CHECK ---
        if (intent === "price_check") {
            return await this.handlePriceCheck(text, userId);
        }

        // --- ORDER STATUS ---
        if (intent === "order_status") {
            return await this.handleOrderStatus(text, userId);
        }

        // --- PLACE ORDER / CONFIRM ---
        if (intent === "place_order") {
            return await this.handlePlaceOrder(text, userId, state, stateKey);
        }

        // --- CHITCHAT (use LLM) ---
        return await this.handleChitchat(text, conversationHistory);
    }

    private async handleProductSearch(text: string, userId?: string): Promise<string> {
        if (!userId) return "Please log in first.";

        const query = text
            .replace(/what\s*(product|item|you\s*have|do\s*you\s*have|do\s*you\s*sell|got|show|list|available|catalog)/i, "")
            .replace(/[?]/g, "")
            .trim();

        const words = query.split(/\s+/).filter(Boolean);
        const conditions = words.map((word) => ({
            $or: [
                { name: { $regex: word, $options: "i" } },
                { sku: { $regex: word, $options: "i" } },
                { category: { $regex: word, $options: "i" } },
            ],
        }));

        const products = await ProductModel.find({
            userId: new Types.ObjectId(userId),
            isActive: true,
            ...(conditions.length > 0 ? { $and: conditions } : {}),
        })
            .limit(10)
            .lean();

        if (products.length === 0) {
            return query
                ? `I couldn't find anything matching "${query}". Try searching with a different word?`
                : "Your catalog is empty. Import some products in Settings to get started.";
        }

        const list = products
            .map((p) => `${p.name} — $${p.price}/${p.unit} (${p.stock} in stock)`)
            .join("\n");

        return `Here's what I found:\n${list}`;
    }

    private async handlePriceCheck(text: string, userId?: string): Promise<string> {
        if (!userId) return "Please log in first.";

        const query = text
            .replace(/(price|cost|how\s*much|rate|what.*price|of|for)/gi, "")
            .replace(/[?]/g, "")
            .trim();

        const products = await ProductModel.find({
            userId: new Types.ObjectId(userId),
            isActive: true,
            name: { $regex: query, $options: "i" },
        })
            .limit(5)
            .lean();

        if (products.length === 0) {
            return query
                ? `I couldn't find pricing for "${query}". Try searching with a different name?`
                : "Which product's price would you like to know?";
        }

        return products
            .map((p) => `${p.name}: $${p.price}/${p.unit}`)
            .join("\n");
    }

    private async handleOrderStatus(text: string, userId?: string): Promise<string> {
        if (!userId) return "Please log in first.";

        const match = text.match(/ORD-[A-Z0-9]+/i);
        const orderId = match ? match[0].toUpperCase() : null;

        if (!orderId) {
            return "Please provide an order ID (e.g., ORD-ABC123) to check the status.";
        }

        try {
            const order = await orderService.getOrderByOrderId(userId, orderId);
            const item = order.items[0]!;
            return `Order ${order.orderId}: ${item.productName} x${item.quantity} — Status: ${order.status}. Total: $${order.totalAmount.toFixed(2)}.`;
        } catch {
            return `Order ${orderId} not found. Please check the ID and try again.`;
        }
    }

    private async handlePlaceOrder(
        text: string,
        userId: string | undefined,
        state: ConversationState,
        stateKey: string
    ): Promise<string> {
        if (!userId) return "Please log in first.";

        // Extract potential product name and quantity from the message
        const qtyMatch = text.match(/(\d+)\s*(kg|piece|pieces|pcs|unit|units|pack|box)/i);
        const quantity = qtyMatch ? parseInt(qtyMatch[1]!) : undefined;
        const unit = qtyMatch ? qtyMatch[2]!.toLowerCase() : undefined;

        const productName = text
            .replace(/(\d+\s*(kg|piece|pieces|pcs|unit|units|pack|box)|yes|sure|please|i\s*want|i\s*need|order|buy|place)/gi, "")
            .replace(/[?.!]/g, "")
            .trim();

        // If we already have a pending order and user confirms
        if (state.pendingOrder && /yes|sure|go ahead|okay|ok|do it|please|yeah/i.test(text)) {
            if (!state.pendingOrder.productId) {
                return "Sorry, I don't have the product details. Could you tell me what you'd like to order?";
            }

            try {
                const order = await orderService.createOrder(userId, {
                    customerName: state.pendingOrder.customerName || "Customer",
                    customerPhone: state.pendingOrder.phone || "0000000000",
                    productId: state.pendingOrder.productId,
                    quantity: state.pendingOrder.quantity || 1,
                });

                conversationStore.reset(stateKey);
                return `Order placed! ${order.orderId} — ${order.items[0]!.productName} x${order.items[0]!.quantity}. Total: $${order.totalAmount.toFixed(2)}.`;
            } catch (err: any) {
                return `Sorry, I couldn't place the order: ${err.message}`;
            }
        }

        // Try to find the product
        const searchWords = productName.split(/\s+/).filter(Boolean);
        if (searchWords.length === 0) {
            conversationStore.set(stateKey, {
                ...state,
                awaitingDetails: "product",
                pendingOrder: null,
            });
            return "Sure! Which product would you like to order?";
        }

        const conditions = searchWords.map((w) => ({
            $or: [
                { name: { $regex: w, $options: "i" } },
                { category: { $regex: w, $options: "i" } },
            ],
        }));

        const products = await ProductModel.find({
            userId: new Types.ObjectId(userId),
            isActive: true,
            $and: conditions,
        })
            .limit(5)
            .lean();

        if (products.length === 0) {
            return `I couldn't find "${productName}" in your catalog. Try a different product name?`;
        }

        const product = products[0]!;
        const qty = quantity || 1;
        const total = product.price * qty;

        // Save pending order
        conversationStore.set(stateKey, {
            lastIntent: "place_order",
            pendingOrder: {
                productId: product._id.toString(),
                productName: product.name,
                unitPrice: product.price,
                quantity: qty,
            },
            awaitingDetails: "nothing",
        });

        const unitStr = unit || product.unit;
        return `${product.name}: $${product.price}/${product.unit}. ${qty} ${unitStr} = $${total.toFixed(2)}. Shall I place the order?`;
    }

    private async handleChitchat(
        text: string,
        conversationHistory: { role: "user" | "assistant"; content: string }[]
    ): Promise<string> {
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: "system", content: CHITCHAT_SYSTEM },
            ...conversationHistory.slice(-6).map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            })),
            { role: "user", content: text },
        ];

        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.7,
            max_tokens: 150,
        }).catch(() => null);

        if (!response) {
            return "I'm sorry, I'm having trouble connecting. Please try again.";
        }

        return response.choices[0]?.message?.content || "I'm not sure how to respond to that.";
    }
}
