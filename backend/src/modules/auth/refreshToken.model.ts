import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRefreshToken extends Document {
    userId: Types.ObjectId;
    jti: string;
    expiresAt: Date;
    revokedAt?: Date | null;
    replacedByJti?: string | null;
    userAgent?: string;
    ip?: string;
    createdAt: Date;
    updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
      
        jti: {
            type: String,
            required: true,
            unique: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        revokedAt: {
            type: Date,
            default: null,
        },
       
        replacedByJti: {
            type: String,
            default: null,
        },
        userAgent: String,
        ip: String,
    },
    {
        timestamps: true,
    }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshTokenModel = mongoose.model<IRefreshToken>(
    "RefreshToken",
    refreshTokenSchema
);
export default RefreshTokenModel;