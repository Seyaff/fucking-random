import mongoose, { Document, Schema, Types } from "mongoose";
import { Intent } from "../../lib/intent-classifier";

export interface IAgentTrace extends Document {
    userId: Types.ObjectId;
    conversationId?: Types.ObjectId;
    customerPhone?: string;
    inboundMessage: string;
    outboundMessage: string;
    intent: Intent;
    handler: string;
    protocolsUsed: string[];
    toolsCalled: { name: string; args: Record<string, unknown>; result: string }[];
    latencyMs: number;
    success: boolean;
    error?: string;
    createdAt: Date;
}

const agentTraceSchema = new Schema<IAgentTrace>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", index: true },
        customerPhone: { type: String, index: true },
        inboundMessage: { type: String, required: true },
        outboundMessage: { type: String, required: true },
        intent: { type: String, required: true },
        handler: { type: String, required: true },
        protocolsUsed: [{ type: String }],
        toolsCalled: [
            {
                name: String,
                args: Schema.Types.Mixed,
                result: String,
            },
        ],
        latencyMs: { type: Number, default: 0 },
        success: { type: Boolean, default: true },
        error: { type: String },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

agentTraceSchema.index({ userId: 1, createdAt: -1 });

const AgentTraceModel = mongoose.model<IAgentTrace>("AgentTrace", agentTraceSchema);
export default AgentTraceModel;
