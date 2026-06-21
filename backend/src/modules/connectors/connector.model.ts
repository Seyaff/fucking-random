import mongoose, { Document, Schema, Types } from "mongoose";

export interface IConnector extends Document {
    userId: Types.ObjectId;
    provider: "gmail" | "slack";
    email?: string;
    teamName?: string;
    accessToken: string;
    refreshToken?: string;
    tokenExpiry?: Date;
    isConnected: boolean;
    scope: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const connectorSchema = new Schema<IConnector>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        provider: { type: String, enum: ["gmail", "slack"], required: true },
        email: { type: String },
        teamName: { type: String },
        accessToken: { type: String, required: true },
        refreshToken: { type: String },
        tokenExpiry: { type: Date },
        isConnected: { type: Boolean, default: false },
        scope: { type: String, default: "" },
        metadata: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

connectorSchema.index({ userId: 1, provider: 1 }, { unique: true });

const ConnectorModel = mongoose.model<IConnector>("Connector", connectorSchema);
export default ConnectorModel;
