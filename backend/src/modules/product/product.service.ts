import { Types } from "mongoose";
import ProductModel from "./product.model";

export class ProductService {
    async searchProducts(userId: string, query: string) {
        const q = query.trim();

        const results = await ProductModel.find({
            userId: new Types.ObjectId(userId),
            isActive: true,
            $or: [
                { name: { $regex: q, $options: "i" } },
                { sku: { $regex: q, $options: "i" } },
                { category: { $regex: q, $options: "i" } },
            ],
        }).limit(10).lean();

        return results;
    }

    async getProduct(userId: string, productId: string) {
        return ProductModel.findOne({
            _id: productId,
            userId: new Types.ObjectId(userId),
            isActive: true,
        }).lean();
    }

    async bulkUpsert(userId: string, products: Array<{
        name: string;
        sku?: string;
        price: number;
        compareAtPrice?: number;
        costPrice?: number;
        stock?: number;
        unit?: string;
        category?: string;
        description?: string;
        externalId?: string;
    }>, importedFrom: string) {
        const userIdObj = new Types.ObjectId(userId);

        for (const p of products) {
            const filter: Record<string, any> = { userId: userIdObj };

            if (p.externalId) {
                filter.externalId = p.externalId;
            } else if (p.sku) {
                filter.sku = p.sku;
            } else {
                filter.name = p.name;
            }

            await ProductModel.findOneAndUpdate(
                filter,
                {
                    $set: {
                        userId: userIdObj,
                        name: p.name,
                        price: p.price,
                        ...(p.sku ? { sku: p.sku } : {}),
                        ...(p.compareAtPrice !== undefined ? { compareAtPrice: p.compareAtPrice } : {}),
                        ...(p.costPrice !== undefined ? { costPrice: p.costPrice } : {}),
                        ...(p.stock !== undefined ? { stock: p.stock } : {}),
                        ...(p.unit ? { unit: p.unit } : {}),
                        ...(p.category ? { category: p.category } : {}),
                        ...(p.description ? { description: p.description } : {}),
                        ...(p.externalId ? { externalId: p.externalId } : {}),
                        importedFrom,
                        isActive: true,
                    },
                },
                { upsert: true }
            );
        }

        return { count: products.length };
    }

    async listProducts(userId: string, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const userIdObj = new Types.ObjectId(userId);

        const [products, total] = await Promise.all([
            ProductModel.find({ userId: userIdObj }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            ProductModel.countDocuments({ userId: userIdObj }),
        ]);

        return { products, total, page, totalPages: Math.ceil(total / limit) };
    }
}
