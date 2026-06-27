import { Types } from "mongoose";
import TemplateModel from "./template.model";
import type { TemplateCategory, TemplateStatus, ITemplate } from "./template.model";
import { NotFoundError } from "../../utils/appError";

export class TemplateService {
    async listTemplates(
        userId: string,
        page = 1,
        limit = 20,
        status?: TemplateStatus
    ) {
        const skip = (page - 1) * limit;
        const userIdObj = new Types.ObjectId(userId);
        const filter: Record<string, unknown> = { userId: userIdObj };

        if (status) {
            filter.status = status;
        }

        const [templates, total] = await Promise.all([
            TemplateModel.find(filter)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            TemplateModel.countDocuments(filter),
        ]);

        return { templates, total, page, totalPages: Math.ceil(total / limit) };
    }

    async getTemplate(userId: string, templateId: string) {
        const template = await TemplateModel.findOne({
            _id: templateId,
            userId: new Types.ObjectId(userId),
        }).lean();

        if (!template) {
            throw new NotFoundError("Template not found");
        }

        return template;
    }

    async createTemplate(
        userId: string,
        data: {
            name: string;
            category: TemplateCategory;
            language?: string;
            body: string;
            header?: ITemplate["header"];
            footer?: string;
            buttons?: ITemplate["buttons"];
            exampleValues?: string[];
        }
    ) {
        const doc: Record<string, unknown> = {
            userId: new Types.ObjectId(userId),
            name: data.name,
            category: data.category,
            language: data.language || "en",
            body: data.body,
        };
        if (data.header) doc.header = data.header;
        if (data.footer) doc.footer = data.footer;
        if (data.buttons) doc.buttons = data.buttons;
        if (data.exampleValues) doc.exampleValues = data.exampleValues;

        const template = await TemplateModel.create(doc as any);

        return template;
    }

    async updateTemplate(
        userId: string,
        templateId: string,
        data: {
            name?: string;
            category?: TemplateCategory;
            language?: string;
            body?: string;
            header?: ITemplate["header"];
            footer?: string;
            buttons?: ITemplate["buttons"];
            exampleValues?: string[];
            status?: TemplateStatus;
            rejectionReason?: string;
            whatsappId?: string;
        }
    ) {
        const update: Record<string, unknown> = {};
        if (data.name !== undefined) update.name = data.name;
        if (data.category !== undefined) update.category = data.category;
        if (data.language !== undefined) update.language = data.language;
        if (data.body !== undefined) update.body = data.body;
        if (data.header !== undefined) update.header = data.header;
        if (data.footer !== undefined) update.footer = data.footer;
        if (data.buttons !== undefined) update.buttons = data.buttons;
        if (data.exampleValues !== undefined) update.exampleValues = data.exampleValues;
        if (data.status !== undefined) update.status = data.status;
        if (data.rejectionReason !== undefined) update.rejectionReason = data.rejectionReason;
        if (data.whatsappId !== undefined) update.whatsappId = data.whatsappId;

        const template = await TemplateModel.findOneAndUpdate(
            { _id: templateId, userId: new Types.ObjectId(userId) },
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!template) {
            throw new NotFoundError("Template not found");
        }

        return template;
    }

    async deleteTemplate(userId: string, templateId: string) {
        const template = await TemplateModel.findOneAndDelete({
            _id: templateId,
            userId: new Types.ObjectId(userId),
        });

        if (!template) {
            throw new NotFoundError("Template not found");
        }

        return template;
    }
}
