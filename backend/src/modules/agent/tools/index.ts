import { z } from "zod";
import {
    getProductInfoSchema,
    checkPriceSchema,
    placeOrderSchema,
    getOrderStatusSchema,
    escalateToHumanSchema,
} from "./schemas";
import ProductModel from "../../product/product.model";
import { OrderService } from "../../order/order.service";

const orderService = new OrderService();

export interface Tool {
    name: string;
    description: string;
    parameters: z.ZodType;
    openai: {
        type: "function";
        function: {
            name: string;
            description: string;
            parameters: Record<string, any>;
        };
    };
    handler: (args: any, userId?: string) => Promise<string>;
}

function buildOpenaiParams(name: string, desc: string, properties: Record<string, any>, required: string[]) {
    return {
        type: "function" as const,
        function: {
            name,
            description: desc,
            parameters: { type: "object", properties, required },
        },
    };
}

export const tools: Tool[] = [
    {
        name: "get_product_info",
        description: "Search for products by name. Returns product details including price and stock. If no exact match, return all products to let the customer choose.",
        parameters: getProductInfoSchema,
        openai: buildOpenaiParams("get_product_info", "Search for products by name. Returns product details including price and stock.", {
            query: { type: "string", description: "Product name or search query" },
        }, ["query"]),
        handler: async (args: any, userId) => {
            const { query } = getProductInfoSchema.parse(args);
            if (!userId) return JSON.stringify({ found: false, message: "User not identified" });

            const q = query.trim();
            const words = q.split(/\s+/).filter(Boolean);

            const conditions = words.map((word) => ({
                $or: [
                    { name: { $regex: word, $options: "i" } },
                    { sku: { $regex: word, $options: "i" } },
                    { category: { $regex: word, $options: "i" } },
                ],
            }));

            const products = await ProductModel.find({
                userId,
                isActive: true,
                ...(conditions.length > 0 ? { $and: conditions } : {}),
            })
                .limit(10)
                .lean();

            if (products.length === 0) {
                return JSON.stringify({ found: false, message: `No products found matching "${query}"` });
            }

            return JSON.stringify({
                found: true,
                products: products.map((p) => ({
                    id: p._id.toString(),
                    name: p.name,
                    price: p.price,
                    unit: p.unit,
                    stock: p.stock,
                    category: p.category,
                })),
            });
        },
    },
    {
        name: "check_price",
        description: "Get the current price and stock of a product by its ID.",
        parameters: checkPriceSchema,
        openai: buildOpenaiParams("check_price", "Get the current price and stock of a product by its ID.", {
            productId: { type: "string", description: "ID of the product to check price for" },
        }, ["productId"]),
        handler: async (args: any, userId) => {
            const { productId } = checkPriceSchema.parse(args);
            if (!userId) return JSON.stringify({ found: false, message: "User not identified" });

            const product = await ProductModel.findOne({ _id: productId, userId, isActive: true }).lean();

            if (!product) {
                return JSON.stringify({ found: false, message: "Product not found" });
            }

            return JSON.stringify({
                found: true,
                product: {
                    id: product._id.toString(),
                    name: product.name,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    stock: product.stock,
                    unit: product.unit,
                    category: product.category,
                },
            });
        },
    },
    {
        name: "place_order",
        description: "Place a customer order after confirming product and quantity with the customer.",
        parameters: placeOrderSchema,
        openai: buildOpenaiParams("place_order", "Place a customer order after confirming product and quantity.", {
            customerName: { type: "string", description: "Customer's full name" },
            phone: { type: "string", description: "Customer's phone number" },
            productId: { type: "string", description: "Product ID to order" },
            quantity: { type: "number", description: "Quantity to order" },
        }, ["customerName", "phone", "productId", "quantity"]),
        handler: async (args: any, userId) => {
            const { customerName, phone, productId, quantity } = placeOrderSchema.parse(args);
            if (!userId) return JSON.stringify({ success: false, message: "User not identified" });

            try {
                const order = await orderService.createOrder(userId, {
                    customerName,
                    customerPhone: phone,
                    productId,
                    quantity,
                });

                const item = order.items[0]!;

                return JSON.stringify({
                    success: true,
                    orderId: order.orderId,
                    customerName,
                    product: item.productName,
                    quantity: item.quantity,
                    total: order.totalAmount,
                    message: `Order placed for ${item.quantity} of ${item.productName}. Total: $${order.totalAmount.toFixed(2)}. Order ID: ${order.orderId}. Status: ${order.status}`,
                });
            } catch (err: any) {
                return JSON.stringify({ success: false, message: err.message });
            }
        },
    },
    {
        name: "get_order_status",
        description: "Check the status of an existing order.",
        parameters: getOrderStatusSchema,
        openai: buildOpenaiParams("get_order_status", "Check the status of an existing order.", {
            orderId: { type: "string", description: "Order ID to check status for" },
        }, ["orderId"]),
        handler: async (args: any, userId) => {
            const { orderId } = getOrderStatusSchema.parse(args);
            if (!userId) return JSON.stringify({ found: false, message: "User not identified" });

            try {
                const order = await orderService.getOrderByOrderId(userId, orderId);
                const item = order.items[0]!;

                return JSON.stringify({
                    found: true,
                    orderId: order.orderId,
                    customerName: order.customerName,
                    product: item.productName,
                    quantity: item.quantity,
                    total: order.totalAmount,
                    status: order.status,
                    createdAt: order.createdAt,
                });
            } catch {
                return JSON.stringify({ found: false, message: `Order ${orderId} not found` });
            }
        },
    },
    {
        name: "escalate_to_human",
        description: "Escalate the conversation to a human support agent when the AI cannot resolve the query.",
        parameters: escalateToHumanSchema,
        openai: buildOpenaiParams("escalate_to_human", "Escalate the conversation to a human support agent.", {
            reason: { type: "string", description: "Why this needs a human agent" },
        }, ["reason"]),
        handler: async (args: any) => {
            const { reason } = escalateToHumanSchema.parse(args);
            return JSON.stringify({ escalated: true, message: `Escalated to human agent. Reason: ${reason}. A team member will reach out shortly.` });
        },
    },
];
