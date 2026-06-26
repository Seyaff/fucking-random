import mongoose, { Document, Schema, Types } from "mongoose";

export interface FlowSlots {
    productId?: string;
    productName?: string;
    price?: number;
    unit?: string;
    quantity?: number;
    customerName?: string;
    phone?: string;
}

export interface IActiveFlow {
    type: "place_order";
    step: "select_product" | "quantity" | "customer_name" | "confirm";
    slots: FlowSlots;
}

export interface IConversation extends Document {
    userId: Types.ObjectId;
    customerPhone: string;
    customerName?: string;
    lastMessage?: string;
    lastMessageAt?: Date;
    unreadCount: number;
    status: "active" | "resolved" | "human_handling";
    activeFlow?: IActiveFlow | null;
    escalatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        customerPhone: { type: String, required: true },
        customerName: { type: String },
        lastMessage: { type: String },
        lastMessageAt: { type: Date },
        unreadCount: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "resolved", "human_handling"], default: "active" },
        activeFlow: { type: Schema.Types.Mixed, default: null },
        escalatedAt: { type: Date },
    },
    { timestamps: true }
);

conversationSchema.index({ userId: 1, customerPhone: 1 }, { unique: true });
conversationSchema.index({ userId: 1, lastMessageAt: -1 });

const ConversationModel = mongoose.model<IConversation>("Conversation", conversationSchema);
export default ConversationModel;
