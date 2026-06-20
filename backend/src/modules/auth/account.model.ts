import mongoose, { Document, Schema, Types } from "mongoose";

export type AuthProvider = "email" | "google" | "facebook";

export interface IAccount extends Document {
    userId: Types.ObjectId;
    provider: AuthProvider;
    providerAccountId: string;
    createdAt: Date;
    updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        provider: {
            type: String,
            enum: ["email", "google", "facebook"],
            required: true,
        },
        
        providerAccountId: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

accountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

const AccountModel = mongoose.model<IAccount>("Account", accountSchema);
export default AccountModel;