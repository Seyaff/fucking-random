import { Types } from "mongoose";
import ConversationModel, { IActiveFlow } from "./conversation.model";
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

    async getConversationHistory(userId: string, customerPhone: string) {
        const conversation = await ConversationModel.findOne({
            userId: new Types.ObjectId(userId),
            customerPhone,
        });
        if (!conversation) return [];

        const messages = await MessageModel.find({ conversationId: conversation._id })
            .sort({ createdAt: 1 })
            .limit(20)
            .lean();

        return messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
        }));
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
            { $set: { status: "resolved", activeFlow: null } }
        );
    }

    async getConversationContext(userId: string, customerPhone: string) {
        const conversation = await ConversationModel.findOne({
            userId: new Types.ObjectId(userId),
            customerPhone,
        }).lean();

        if (!conversation) {
            return {
                status: "active" as const,
                activeFlow: null,
            };
        }

        return {
            conversationId: conversation._id.toString(),
            status: conversation.status,
            activeFlow: (conversation.activeFlow as IActiveFlow | null) ?? null,
        };
    }

    async updateFlowState(
        userId: string,
        customerPhone: string,
        activeFlow: IActiveFlow | null
    ) {
        await ConversationModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId), customerPhone },
            { $set: { activeFlow } }
        );
    }

    async escalateToHuman(userId: string, customerPhone: string) {
        await ConversationModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId), customerPhone },
            { $set: { status: "human_handling", escalatedAt: new Date(), activeFlow: null } }
        );
    }

    async resumeBot(userId: string, customerPhone: string) {
        await ConversationModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId), customerPhone },
            { $set: { status: "active", activeFlow: null } }
        );
    }
}
