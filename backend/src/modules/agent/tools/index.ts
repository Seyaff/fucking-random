import { z } from "zod";
import {
    getProductInfoSchema,
    checkPriceSchema,
    placeOrderSchema,
    getOrderStatusSchema,
    escalateToHumanSchema,
} from "./schemas";

export interface Tool {
    name: string;
    description: string;
    parameters: z.ZodType;
    handler: (args: any) => Promise<string>;
}

const products = [
    { id: "p1", name: "Moong Dal", price: 120, unit: "kg" },
    { id: "p2", name: "Chana Dal", price: 99, unit: "kg" },
    { id: "p3", name: "Basmati Rice", price: 180, unit: "kg" },
    { id: "p4", name: "Wheat Atta", price: 35, unit: "kg" },
    { id: "p5", name: "Mustard Oil", price: 210, unit: "litre" },
];

export const tools: Tool[] = [
    {
        name: "get_product_info",
        description: "Search for products by name. Returns product details including price.",
        parameters: getProductInfoSchema,
        handler: async (args: any) => {
            const { query } = getProductInfoSchema.parse(args);
            const q = query.toLowerCase();
            const matches = products.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    q.includes(p.name.toLowerCase())
            );

            if (matches.length === 0) {
                return JSON.stringify({ found: false, message: `No products found matching "${query}"` });
            }

            return JSON.stringify({
                found: true,
                products: matches.map((p) => ({ id: p.id, name: p.name, price: p.price, unit: p.unit })),
            });
        },
    },
    {
        name: "check_price",
        description: "Get the current price of a product by its ID.",
        parameters: checkPriceSchema,
        handler: async (args: any) => {
            const { productId } = checkPriceSchema.parse(args);
            const product = products.find((p) => p.id === productId);
            if (!product) return JSON.stringify({ found: false, message: "Product not found" });
            return JSON.stringify({ found: true, product: { id: product.id, name: product.name, price: product.price, unit: product.unit } });
        },
    },
    {
        name: "place_order",
        description: "Place a customer order. Returns order confirmation.",
        parameters: placeOrderSchema,
        handler: async (args: any) => {
            const { customerName, phone, productId, quantity } = placeOrderSchema.parse(args);
            const product = products.find((p) => p.id === productId);
            if (!product) return JSON.stringify({ success: false, message: `Product with ID ${productId} not found` });

            const total = product.price * quantity;
            const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

            return JSON.stringify({
                success: true,
                orderId,
                customerName,
                product: product.name,
                quantity,
                total,
                message: `Order placed for ${quantity} ${product.unit}(s) of ${product.name}. Total: ₹${total}. Order ID: ${orderId}`,
            });
        },
    },
    {
        name: "get_order_status",
        description: "Check the status of an existing order.",
        parameters: getOrderStatusSchema,
        handler: async (args: any) => {
            const { orderId } = getOrderStatusSchema.parse(args);
            return JSON.stringify({ orderId, status: "processing", estimatedDelivery: "2-3 business days" });
        },
    },
    {
        name: "escalate_to_human",
        description: "Escalate the conversation to a human support agent.",
        parameters: escalateToHumanSchema,
        handler: async (args: any) => {
            const { reason } = escalateToHumanSchema.parse(args);
            return JSON.stringify({ escalated: true, message: `Escalated to human agent. Reason: ${reason}. A team member will reach out shortly.` });
        },
    },
];
