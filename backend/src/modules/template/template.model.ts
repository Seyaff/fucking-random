import mongoose, { Document, Schema, Types } from "mongoose";

export type TemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION";
export type TemplateStatus = "draft" | "pending" | "approved" | "rejected";
export type TemplateHeaderType = "text" | "image" | "video" | "document";
export type TemplateButtonType = "quick_reply" | "url" | "phone_number";

export interface ITemplateButton {
    type: TemplateButtonType;
    text: string;
    url?: string;
    phoneNumber?: string;
}

export interface ITemplateHeader {
    type: TemplateHeaderType;
    text?: string;
    mediaUrl?: string;
}

export interface ITemplate extends Document {
    userId: Types.ObjectId;
    name: string;
    category: TemplateCategory;
    language: string;
    body: string;
    header?: ITemplateHeader;
    footer?: string;
    buttons: ITemplateButton[];
    exampleValues: string[];
    status: TemplateStatus;
    rejectionReason?: string;
    whatsappId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const templateSchema = new Schema<ITemplate>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        name: { type: String, required: true, trim: true },
        category: {
            type: String,
            enum: ["MARKETING", "UTILITY", "AUTHENTICATION"],
            required: true,
        },
        language: { type: String, default: "en" },
        body: { type: String, required: true },
        header: {
            type: {
                type: { type: String, enum: ["text", "image", "video", "document"] },
                text: { type: String },
                mediaUrl: { type: String },
            },
        },
        footer: { type: String },
        buttons: [
            {
                type: { type: String, enum: ["quick_reply", "url", "phone_number"] },
                text: { type: String, required: true },
                url: { type: String },
                phoneNumber: { type: String },
            },
        ],
        exampleValues: { type: [String], default: [] },
        status: {
            type: String,
            enum: ["draft", "pending", "approved", "rejected"],
            default: "draft",
        },
        rejectionReason: { type: String },
        whatsappId: { type: String },
    },
    { timestamps: true }
);

templateSchema.index({ userId: 1, name: 1 }, { unique: true });
templateSchema.index({ userId: 1, status: 1 });

const TemplateModel = mongoose.model<ITemplate>("Template", templateSchema);
export default TemplateModel;
