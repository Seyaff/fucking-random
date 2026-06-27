import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICustomer extends Document {
    userId: Types.ObjectId;
    name: string;
    phone: string;
    email?: string;
    avatarUrl?: string;
    tags: string[];
    notes?: string;
    source: "whatsapp" | "gmail" | "slack" | "manual" | "import";
    lastContactedAt?: Date;
    totalOrders: number;
    totalSpent: number;
    metadata: Map<string, string>;
    createdAt: Date;
    updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, trim: true, lowercase: true },
        avatarUrl: { type: String },
        tags: { type: [String], default: [] },
        notes: { type: String },
        source: {
            type: String,
            enum: ["whatsapp", "gmail", "slack", "manual", "import"],
            default: "manual",
        },
        lastContactedAt: { type: Date },
        totalOrders: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        metadata: { type: Map, of: String, default: {} },
    },
    { timestamps: true }
);

customerSchema.index({ userId: 1, phone: 1 }, { unique: true });
customerSchema.index({ userId: 1, name: "text", email: "text", phone: "text" });
customerSchema.index({ userId: 1, createdAt: -1 });

const CustomerModel = mongoose.model<ICustomer>("Customer", customerSchema);
export default CustomerModel;
