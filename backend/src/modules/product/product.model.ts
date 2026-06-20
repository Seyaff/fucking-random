import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProduct extends Document {
    userId: Types.ObjectId;
    name: string;
    sku: string;
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    stock: number;
    unit: string;
    category: string;
    description?: string;
    imageUrl?: string;
    isActive: boolean;
    metadata: Map<string, string>;
    externalId: string;
    importedFrom: string;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        name: { type: String, required: true },
        sku: { type: String, default: "" },
        price: { type: Number, required: true },
        compareAtPrice: { type: Number },
        costPrice: { type: Number },
        stock: { type: Number, default: 0 },
        unit: { type: String, default: "piece" },
        category: { type: String, default: "Uncategorized", index: true },
        description: { type: String },
        imageUrl: { type: String },
        isActive: { type: Boolean, default: true },
        metadata: { type: Map, of: String, default: {} },
        externalId: { type: String, default: "" },
        importedFrom: { type: String, default: "manual" },
    },
    { timestamps: true }
);

productSchema.index({ userId: 1, name: "text", sku: "text" });

const ProductModel = mongoose.model<IProduct>("Product", productSchema);
export default ProductModel;
