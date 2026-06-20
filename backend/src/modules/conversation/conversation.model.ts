import mongoose, { Document, Schema, Types } from "mongoose";

export interface IConversation extends Document {
    userId: Types.ObjectId;
    customerPhone: string;
    customerName?: string;
    lastMessage?: string;
    lastMessageAt?: Date;
    unreadCount: number;
    status: "active" | "resolved";
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
        status: { type: String, enum: ["active", "resolved"], default: "active" },
    },
    { timestamps: true }
);

conversationSchema.index({ userId: 1, customerPhone: 1 }, { unique: true });
conversationSchema.index({ userId: 1, lastMessageAt: -1 });

const ConversationModel = mongoose.model<IConversation>("Conversation", conversationSchema);
export default ConversationModel;
