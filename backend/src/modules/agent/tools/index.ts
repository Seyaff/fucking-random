import { z } from "zod";
import {
    getProductInfoSchema,
    checkPriceSchema,
    placeOrderSchema,
    getOrderStatusSchema,
    escalateToHumanSchema,
} from "./schemas";
import ProductModel from "../../product/product.model";

export interface Tool {
    name: string;
    description: string;
    parameters: z.ZodType;
    handler: (args: any, userId?: string) => Promise<string>;
}

export const tools: Tool[] = [
    {
        name: "get_product_info",
        description: "Search for products by name. Returns product details including price and stock. If no exact match, return all products to let the customer choose.",
        parameters: getProductInfoSchema,
        handler: async (args: any, userId) => {
            const { query } = getProductInfoSchema.parse(args);
            if (!userId) return JSON.stringify({ found: false, message: "User not identified" });

            const q = query.trim();
            const products = await ProductModel.find({
                userId,
                isActive: true,
                $or: [
                    { name: { $regex: q, $options: "i" } },
                    { sku: { $regex: q, $options: "i" } },
                    { category: { $regex: q, $options: "i" } },
                ],
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
        handler: async (args: any) => {
            const { customerName, phone, productId, quantity } = placeOrderSchema.parse(args);

            const product = await ProductModel.findById(productId).lean();
            if (!product) {
                return JSON.stringify({ success: false, message: `Product with ID ${productId} not found` });
            }

            const total = product.price * quantity;
            const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

            // TODO: save order to orders collection in Phase 4

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
        description: "Escalate the conversation to a human support agent when the AI cannot resolve the query.",
        parameters: escalateToHumanSchema,
        handler: async (args: any) => {
            const { reason } = escalateToHumanSchema.parse(args);
            return JSON.stringify({ escalated: true, message: `Escalated to human agent. Reason: ${reason}. A team member will reach out shortly.` });
        },
    },
];
