import { Types } from "mongoose";
import OrderModel from "./order.model";
import ProductModel from "../product/product.model";
import UserModel from "../user/user.model";
import { BadRequestError, NotFoundError } from "../../utils/appError";
import { eventService } from "../../lib/event-service";
import { emailService } from "../../lib/email.service";

function generateOrderId(): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${ts}${rand}`;
}

export class OrderService {
    async createOrder(
        userId: string,
        data: {
            customerName: string;
            customerPhone: string;
            productId: string;
            quantity: number;
        }
    ) {
        const product = await ProductModel.findOne({
            _id: data.productId,
            userId: new Types.ObjectId(userId),
            isActive: true,
        }).lean();

        if (!product) {
            throw new BadRequestError(`Product with ID ${data.productId} not found`);
        }

        if (product.stock < data.quantity) {
            throw new BadRequestError(
                `Insufficient stock. Available: ${product.stock}, requested: ${data.quantity}`
            );
        }

        const unitPrice = product.price;
        const total = unitPrice * data.quantity;
        const orderId = generateOrderId();

        const order = await OrderModel.create({
            userId: new Types.ObjectId(userId),
            orderId,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            items: [
                {
                    productId: product._id,
                    productName: product.name,
                    quantity: data.quantity,
                    unitPrice,
                    total,
                },
            ],
            totalAmount: total,
            status: "pending",
        });

        await ProductModel.findByIdAndUpdate(product._id, {
            $inc: { stock: -data.quantity },
        });

        eventService.emit(userId, {
            type: "order_created",
            data: {
                orderId: order.orderId,
                totalAmount: total,
                customerName: data.customerName,
            },
        });

        UserModel.findById(userId).then((user) => {
            if (user?.email) {
                emailService.sendOrderConfirmationEmail(user.email, {
                    customerName: data.customerName,
                    orderId: order.orderId,
                    items: order.items.map((i) => ({
                        name: i.productName,
                        quantity: i.quantity,
                        total: i.total,
                    })),
                    total: order.totalAmount,
                }).catch((err) => {
                    console.error("[order] Order email failed:", err.message);
                });
            }
        });

        return order;
    }

    async getOrderByOrderId(userId: string, orderId: string) {
        const order = await OrderModel.findOne({
            userId: new Types.ObjectId(userId),
            orderId,
        }).lean();

        if (!order) {
            throw new NotFoundError(`Order ${orderId} not found`);
        }

        return order;
    }

    async listOrders(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const userIdObj = new Types.ObjectId(userId);

        const [orders, total] = await Promise.all([
            OrderModel.find({ userId: userIdObj })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            OrderModel.countDocuments({ userId: userIdObj }),
        ]);

        return { orders, total, page, totalPages: Math.ceil(total / limit) };
    }
}
