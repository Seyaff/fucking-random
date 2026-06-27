import { Types } from "mongoose";
import QuickReplyModel from "./quick-reply.model";
import { NotFoundError } from "../../utils/appError";

export class QuickReplyService {
    async listQuickReplies(
        userId: string,
        category?: string,
        search?: string
    ) {
        const userIdObj = new Types.ObjectId(userId);
        const filter: Record<string, unknown> = { userId: userIdObj };

        if (category) {
            filter.category = category;
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
                { shortcuts: { $regex: search, $options: "i" } },
            ];
        }

        const [replies, total] = await Promise.all([
            QuickReplyModel.find(filter).sort({ title: 1 }).lean(),
            QuickReplyModel.countDocuments(filter),
        ]);

        return { replies, total };
    }

    async getQuickReply(userId: string, replyId: string) {
        const reply = await QuickReplyModel.findOne({
            _id: replyId,
            userId: new Types.ObjectId(userId),
        }).lean();

        if (!reply) {
            throw new NotFoundError("Quick reply not found");
        }

        return reply;
    }

    async createQuickReply(
        userId: string,
        data: {
            title: string;
            content: string;
            shortcuts?: string[];
            category?: string;
        }
    ) {
        const doc: Record<string, unknown> = {
            userId: new Types.ObjectId(userId),
            title: data.title,
            content: data.content,
        };
        if (data.shortcuts) doc.shortcuts = data.shortcuts;
        if (data.category) doc.category = data.category;

        const reply = await QuickReplyModel.create(doc as any);

        return reply;
    }

    async updateQuickReply(
        userId: string,
        replyId: string,
        data: {
            title?: string;
            content?: string;
            shortcuts?: string[];
            category?: string;
        }
    ) {
        const update: Record<string, unknown> = {};
        if (data.title !== undefined) update.title = data.title;
        if (data.content !== undefined) update.content = data.content;
        if (data.shortcuts !== undefined) update.shortcuts = data.shortcuts;
        if (data.category !== undefined) update.category = data.category;

        const reply = await QuickReplyModel.findOneAndUpdate(
            { _id: replyId, userId: new Types.ObjectId(userId) },
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!reply) {
            throw new NotFoundError("Quick reply not found");
        }

        return reply;
    }

    async deleteQuickReply(userId: string, replyId: string) {
        const reply = await QuickReplyModel.findOneAndDelete({
            _id: replyId,
            userId: new Types.ObjectId(userId),
        });

        if (!reply) {
            throw new NotFoundError("Quick reply not found");
        }

        return reply;
    }
}
