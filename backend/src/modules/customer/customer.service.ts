import { Types } from "mongoose";
import CustomerModel from "./customer.model";
import type { ICustomer } from "./customer.model";
import { NotFoundError } from "../../utils/appError";

type CustomerSource = ICustomer["source"];

export class CustomerService {
    async listCustomers(
        userId: string,
        page = 1,
        limit = 20,
        search?: string,
        tag?: string
    ) {
        const skip = (page - 1) * limit;
        const userIdObj = new Types.ObjectId(userId);
        const filter: Record<string, unknown> = { userId: userIdObj };

        if (tag) {
            filter.tags = tag;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }

        const [customers, total] = await Promise.all([
            CustomerModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            CustomerModel.countDocuments(filter),
        ]);

        return { customers, total, page, totalPages: Math.ceil(total / limit) };
    }

    async getCustomer(userId: string, customerId: string) {
        const customer = await CustomerModel.findOne({
            _id: customerId,
            userId: new Types.ObjectId(userId),
        }).lean();

        if (!customer) {
            throw new NotFoundError("Customer not found");
        }

        return customer;
    }

    async createCustomer(
        userId: string,
        data: {
            name: string;
            phone: string;
            email?: string;
            avatarUrl?: string;
            tags?: string[];
            notes?: string;
            source?: CustomerSource;
        }
    ) {
        const doc: Record<string, unknown> = {
            userId: new Types.ObjectId(userId),
            name: data.name,
            phone: data.phone,
        };
        if (data.email) doc.email = data.email.toLowerCase();
        if (data.avatarUrl) doc.avatarUrl = data.avatarUrl;
        if (data.tags) doc.tags = data.tags;
        if (data.notes) doc.notes = data.notes;
        if (data.source) doc.source = data.source;

        const customer = await CustomerModel.create(doc as any);

        return customer;
    }

    async updateCustomer(
        userId: string,
        customerId: string,
        data: {
            name?: string;
            phone?: string;
            email?: string;
            avatarUrl?: string;
            tags?: string[];
            notes?: string;
            source?: CustomerSource;
        }
    ) {
        const update: Record<string, unknown> = {};
        if (data.name !== undefined) update.name = data.name;
        if (data.phone !== undefined) update.phone = data.phone;
        if (data.email !== undefined) update.email = data.email.toLowerCase();
        if (data.avatarUrl !== undefined) update.avatarUrl = data.avatarUrl;
        if (data.tags !== undefined) update.tags = data.tags;
        if (data.notes !== undefined) update.notes = data.notes;
        if (data.source !== undefined) update.source = data.source;

        const customer = await CustomerModel.findOneAndUpdate(
            { _id: customerId, userId: new Types.ObjectId(userId) },
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!customer) {
            throw new NotFoundError("Customer not found");
        }

        return customer;
    }

    async deleteCustomer(userId: string, customerId: string) {
        const customer = await CustomerModel.findOneAndDelete({
            _id: customerId,
            userId: new Types.ObjectId(userId),
        });

        if (!customer) {
            throw new NotFoundError("Customer not found");
        }

        return customer;
    }

    async getOrCreateByPhone(userId: string, phone: string, name?: string) {
        const existing = await CustomerModel.findOne({
            userId: new Types.ObjectId(userId),
            phone,
        });

        if (existing) {
            return existing;
        }

        return CustomerModel.create({
            userId: new Types.ObjectId(userId),
            name: name || phone,
            phone,
            source: "whatsapp" as CustomerSource,
        });
    }
}
