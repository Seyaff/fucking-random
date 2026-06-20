import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOrder extends Document {
    userId: Types.ObjectId;
    orderId: string;
    customerName: string;
    customerPhone: string;
    items: {
        productId: Types.ObjectId;
        productName: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
    totalAmount: number;
    status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        orderId: { type: String, required: true, unique: true, index: true },
        customerName: { type: String, required: true },
        customerPhone: { type: String, required: true },
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                productName: { type: String, required: true },
                quantity: { type: Number, required: true, min: 1 },
                unitPrice: { type: Number, required: true },
                total: { type: Number, required: true },
            },
        ],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
        notes: { type: String },
    },
    { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ userId: 1, status: 1 });

const OrderModel = mongoose.model<IOrder>("Order", orderSchema);
export default OrderModel;
