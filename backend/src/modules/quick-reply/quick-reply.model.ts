import mongoose, { Document, Schema, Types } from "mongoose";

export interface IQuickReply extends Document {
    userId: Types.ObjectId;
    title: string;
    content: string;
    shortcuts: string[];
    category?: string;
    createdAt: Date;
    updatedAt: Date;
}

const quickReplySchema = new Schema<IQuickReply>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        shortcuts: { type: [String], default: [] },
        category: { type: String, default: "General" },
    },
    { timestamps: true }
);

quickReplySchema.index({ userId: 1, title: "text", content: "text", shortcuts: "text" });
quickReplySchema.index({ userId: 1, category: 1 });

const QuickReplyModel = mongoose.model<IQuickReply>("QuickReply", quickReplySchema);
export default QuickReplyModel;
