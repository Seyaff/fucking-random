import { Types } from "mongoose";
import AgentTraceModel from "./agent-trace.model";
import { Intent } from "../../lib/intent-classifier";

export interface TraceInput {
    userId: string;
    conversationId?: string;
    customerPhone?: string;
    inboundMessage: string;
    outboundMessage: string;
    intent: Intent;
    handler: string;
    protocolsUsed: string[];
    toolsCalled: { name: string; args: Record<string, unknown>; result: string }[];
    latencyMs: number;
    success?: boolean;
    error?: string;
}

export class AgentTraceService {
    async log(input: TraceInput) {
        const doc: Record<string, unknown> = {
            userId: new Types.ObjectId(input.userId),
            inboundMessage: input.inboundMessage,
            outboundMessage: input.outboundMessage,
            intent: input.intent,
            handler: input.handler,
            protocolsUsed: input.protocolsUsed,
            toolsCalled: input.toolsCalled,
            latencyMs: input.latencyMs,
            success: input.success ?? true,
        };

        if (input.conversationId) doc.conversationId = new Types.ObjectId(input.conversationId);
        if (input.customerPhone) doc.customerPhone = input.customerPhone;
        if (input.error) doc.error = input.error;

        return AgentTraceModel.create(doc);
    }

    async listForConversation(conversationId: string, userId: string) {
        return AgentTraceModel.find({
            conversationId: new Types.ObjectId(conversationId),
            userId: new Types.ObjectId(userId),
        })
            .sort({ createdAt: -1 })
            .lean();
    }

    async getStats(userId: string, since: Date) {
        const userIdObj = new Types.ObjectId(userId);
        const [total, escalations, avgLatency] = await Promise.all([
            AgentTraceModel.countDocuments({ userId: userIdObj, createdAt: { $gte: since } }),
            AgentTraceModel.countDocuments({
                userId: userIdObj,
                createdAt: { $gte: since },
                intent: "escalate",
            }),
            AgentTraceModel.aggregate([
                { $match: { userId: userIdObj, createdAt: { $gte: since } } },
                { $group: { _id: null, avg: { $avg: "$latencyMs" } } },
            ]),
        ]);

        return {
            messagesHandled: total,
            escalations,
            avgLatencyMs: Math.round(avgLatency[0]?.avg ?? 0),
        };
    }
}
