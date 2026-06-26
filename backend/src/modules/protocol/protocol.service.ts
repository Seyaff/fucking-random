import { Types } from "mongoose";
import ProtocolModel, { ProtocolCategory } from "./protocol.model";

const DEFAULT_PROTOCOLS: { title: string; rule: string; category: ProtocolCategory; priority: number }[] = [
    {
        title: "Be concise",
        rule: "Keep replies to 1-2 short sentences. Be warm and natural.",
        category: "tone",
        priority: 100,
    },
    {
        title: "Never invent facts",
        rule: "Never make up product names, prices, stock levels, or order details. Only state facts returned by tools.",
        category: "general",
        priority: 99,
    },
    {
        title: "Product listing",
        rule: "When asked what products you have, list products from the catalog tool. Do not guess.",
        category: "products",
        priority: 80,
    },
    {
        title: "Order ID required",
        rule: "Before checking order status, ask for the order ID (format ORD-...) if the customer did not provide one.",
        category: "orders",
        priority: 80,
    },
    {
        title: "Human escalation",
        rule: "If the customer asks for a human or you cannot help, escalate immediately and stop automated replies.",
        category: "escalation",
        priority: 90,
    },
];

export class ProtocolService {
    async ensureDefaults(userId: string) {
        const count = await ProtocolModel.countDocuments({ userId: new Types.ObjectId(userId) });
        if (count > 0) return;

        await ProtocolModel.insertMany(
            DEFAULT_PROTOCOLS.map((p) => ({
                ...p,
                userId: new Types.ObjectId(userId),
                isActive: true,
            }))
        );
    }

    async list(userId: string) {
        await this.ensureDefaults(userId);
        return ProtocolModel.find({ userId: new Types.ObjectId(userId) })
            .sort({ priority: -1, createdAt: -1 })
            .lean();
    }

    async getActiveRules(userId: string): Promise<string[]> {
        await this.ensureDefaults(userId);
        const protocols = await ProtocolModel.find({
            userId: new Types.ObjectId(userId),
            isActive: true,
        })
            .sort({ priority: -1 })
            .lean();

        return protocols.map((p) => `[${p.category}] ${p.rule}`);
    }

    async create(
        userId: string,
        data: { title: string; rule: string; category?: ProtocolCategory; priority?: number }
    ) {
        return ProtocolModel.create({
            userId: new Types.ObjectId(userId),
            title: data.title,
            rule: data.rule,
            category: data.category ?? "general",
            priority: data.priority ?? 0,
            isActive: true,
        });
    }

    async update(
        userId: string,
        protocolId: string,
        data: Partial<{ title: string; rule: string; category: ProtocolCategory; isActive: boolean; priority: number }>
    ) {
        return ProtocolModel.findOneAndUpdate(
            { _id: protocolId, userId: new Types.ObjectId(userId) },
            { $set: data },
            { new: true }
        );
    }

    async delete(userId: string, protocolId: string) {
        return ProtocolModel.findOneAndDelete({
            _id: protocolId,
            userId: new Types.ObjectId(userId),
        });
    }
}
