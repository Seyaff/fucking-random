import mongoose, { Document, Schema, Types } from "mongoose";

export type ProtocolCategory =
    | "general"
    | "products"
    | "orders"
    | "shipping"
    | "returns"
    | "escalation"
    | "tone";

export interface IProtocol extends Document {
    userId: Types.ObjectId;
    title: string;
    rule: string;
    category: ProtocolCategory;
    isActive: boolean;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
}

const protocolSchema = new Schema<IProtocol>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, required: true, trim: true },
        rule: { type: String, required: true },
        category: {
            type: String,
            enum: ["general", "products", "orders", "shipping", "returns", "escalation", "tone"],
            default: "general",
        },
        isActive: { type: Boolean, default: true },
        priority: { type: Number, default: 0 },
    },
    { timestamps: true }
);

protocolSchema.index({ userId: 1, isActive: 1, priority: -1 });

const ProtocolModel = mongoose.model<IProtocol>("Protocol", protocolSchema);
export default ProtocolModel;
