import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
    conversationId: Types.ObjectId;
    role: "user" | "assistant" | "agent";
    content: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
        role: { type: String, enum: ["user", "assistant", "agent"], required: true },
        content: { type: String, required: true },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

const MessageModel = mongoose.model<IMessage>("Message", messageSchema);
export default MessageModel;
