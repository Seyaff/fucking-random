import { z } from "zod";

export const getProductInfoSchema = z.object({
    query: z.string().describe("Product name or search query, e.g. 'daal', 'rice', 'chana'"),
});

export const checkPriceSchema = z.object({
    productId: z.string().describe("ID of the product to check price for"),
});

export const placeOrderSchema = z.object({
    customerName: z.string().describe("Customer's full name"),
    phone: z.string().optional().describe("Customer's phone number (omit if unknown)"),
    productId: z.string().describe("Product ID to order"),
    quantity: z.number().int().positive().describe("Quantity to order"),
});

export const getOrderStatusSchema = z.object({
    orderId: z.string().describe("Order ID to check status for"),
});

export const escalateToHumanSchema = z.object({
    reason: z.string().describe("Why this needs a human agent"),
});

export const replyToCustomerSchema = z.object({
    message: z.string().describe("Your brief, friendly response to the customer"),
});
