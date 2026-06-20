import mongoose, { Document, Schema, Types } from "mongoose";

export interface IWhatsAppAccount extends Document {
    userId: Types.ObjectId;
    phoneNumberId: string;
    phoneNumber: string;
    accessToken: string;
    verifyToken: string;
    webhookSecret?: string;
    isConnected: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const whatsappAccountSchema = new Schema<IWhatsAppAccount>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        phoneNumberId: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        accessToken: {
            type: String,
            required: true,
        },
        verifyToken: {
            type: String,
            required: true,
        },
        webhookSecret: {
            type: String,
            default: "",
        },
        isConnected: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const WhatsAppAccountModel = mongoose.model<IWhatsAppAccount>(
    "WhatsAppAccount",
    whatsappAccountSchema
);

export default WhatsAppAccountModel;
