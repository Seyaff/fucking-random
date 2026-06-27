import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { TemplateService } from "./template.service";
import { HTTPSTATUS } from "../../config/http.config";
import type { ITemplate, TemplateCategory, TemplateStatus } from "./template.model";

const templateService = new TemplateService();

export class TemplateController {
    list = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const page = parseInt(req.query.page as string) || 1;
        const status = req.query.status as TemplateStatus | undefined;
        const result = await templateService.listTemplates(userId, page, 20, status);

        return res.status(HTTPSTATUS.OK).json({ success: true, ...result });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const id = req.params.id as string;
        const template = await templateService.getTemplate(userId, id);

        return res.status(HTTPSTATUS.OK).json({ success: true, template });
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const body = req.body as Record<string, unknown>;

        if (!body.name || !body.category || !body.body) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({
                success: false,
                message: "Name, category, and body are required",
            });
        }

        const validCategories: TemplateCategory[] = ["MARKETING", "UTILITY", "AUTHENTICATION"];
        if (!validCategories.includes(body.category as TemplateCategory)) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({
                success: false,
                message: `Category must be one of: ${validCategories.join(", ")}`,
            });
        }

        const data: Parameters<typeof templateService.createTemplate>[1] = {
            name: body.name as string,
            category: body.category as TemplateCategory,
            body: body.body as string,
        };
        if (body.language) data.language = body.language as string;
        if (body.header) data.header = body.header as ITemplate["header"];
        if (body.footer) data.footer = body.footer as string;
        if (body.buttons) data.buttons = body.buttons as ITemplate["buttons"];
        if (body.exampleValues) data.exampleValues = body.exampleValues as string[];

        const template = await templateService.createTemplate(userId, data);

        return res.status(HTTPSTATUS.CREATED).json({ success: true, template });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const id = req.params.id as string;
        const body = req.body as Record<string, unknown>;

        const data: Parameters<typeof templateService.updateTemplate>[2] = {};
        if (body.name !== undefined) data.name = body.name as string;
        if (body.category !== undefined) data.category = body.category as TemplateCategory;
        if (body.language !== undefined) data.language = body.language as string;
        if (body.body !== undefined) data.body = body.body as string;
        if (body.header !== undefined) data.header = body.header as ITemplate["header"];
        if (body.footer !== undefined) data.footer = body.footer as string;
        if (body.buttons !== undefined) data.buttons = body.buttons as ITemplate["buttons"];
        if (body.exampleValues !== undefined) data.exampleValues = body.exampleValues as string[];
        if (body.status !== undefined) data.status = body.status as TemplateStatus;
        if (body.rejectionReason !== undefined) data.rejectionReason = body.rejectionReason as string;
        if (body.whatsappId !== undefined) data.whatsappId = body.whatsappId as string;

        const template = await templateService.updateTemplate(userId, id, data);

        return res.status(HTTPSTATUS.OK).json({ success: true, template });
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const id = req.params.id as string;
        await templateService.deleteTemplate(userId, id);

        return res.status(HTTPSTATUS.OK).json({ success: true, message: "Template deleted" });
    });
}
