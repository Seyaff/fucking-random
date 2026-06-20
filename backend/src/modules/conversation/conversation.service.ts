import { Types } from "mongoose";
import ConversationModel from "./conversation.model";
import MessageModel from "./message.model";

export class ConversationService {
    async listConversations(userId: string) {
        return ConversationModel.find({ userId: new Types.ObjectId(userId) })
            .sort({ lastMessageAt: -1 })
            .lean();
    }

    async getMessages(conversationId: string, userId: string) {
        const conversation = await ConversationModel.findOne({
            _id: conversationId,
            userId: new Types.ObjectId(userId),
        });
        if (!conversation) return null;

        const messages = await MessageModel.find({ conversationId: new Types.ObjectId(conversationId) })
            .sort({ createdAt: 1 })
            .lean();

        return { conversation, messages };
    }

    async getOrCreateConversation(userId: string, customerPhone: string) {
        const userIdObj = new Types.ObjectId(userId);
        let conversation = await ConversationModel.findOne({ userId: userIdObj, customerPhone });

        if (!conversation) {
            conversation = await ConversationModel.create({
                userId: userIdObj,
                customerPhone,
                status: "active",
            });
        }

        return conversation;
    }

    async addMessage(
        userId: string,
        customerPhone: string,
        role: "user" | "assistant" | "agent",
        content: string,
        metadata?: Record<string, any>
    ) {
        const conversation = await this.getOrCreateConversation(userId, customerPhone);

        const doc: any = {
            conversationId: conversation._id,
            role,
            content,
        };
        if (metadata) doc.metadata = metadata;

        const message = await MessageModel.create(doc);

        await ConversationModel.findByIdAndUpdate(conversation._id, {
            $set: { lastMessage: content.slice(0, 100), lastMessageAt: new Date() },
            $inc: { unreadCount: role === "user" ? 1 : 0 },
        });

        return message;
    }

    async markAsRead(conversationId: string, userId: string) {
        await ConversationModel.findOneAndUpdate(
            { _id: conversationId, userId: new Types.ObjectId(userId) },
            { $set: { unreadCount: 0 } }
        );
    }

    async resolveConversation(conversationId: string, userId: string) {
        await ConversationModel.findOneAndUpdate(
            { _id: conversationId, userId: new Types.ObjectId(userId) },
            { $set: { status: "resolved" } }
        );
    }
}
