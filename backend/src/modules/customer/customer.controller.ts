import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { CustomerService } from "./customer.service";
import { HTTPSTATUS } from "../../config/http.config";
import type { ICustomer } from "./customer.model";

const customerService = new CustomerService();

export class CustomerController {
    list = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const page = parseInt(req.query.page as string) || 1;
        const search = req.query.search as string | undefined;
        const tag = req.query.tag as string | undefined;
        const result = await customerService.listCustomers(userId, page, 20, search, tag);

        return res.status(HTTPSTATUS.OK).json({ success: true, ...result });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const id = req.params.id as string;
        const customer = await customerService.getCustomer(userId, id);

        return res.status(HTTPSTATUS.OK).json({ success: true, customer });
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const { name, phone, email, avatarUrl, tags, notes, source } = req.body as Record<string, unknown>;

        if (!name || !phone) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({
                success: false,
                message: "Name and phone are required",
            });
        }

        const data: Parameters<typeof customerService.createCustomer>[1] = {
            name: name as string,
            phone: phone as string,
        };
        if (email) data.email = email as string;
        if (avatarUrl) data.avatarUrl = avatarUrl as string;
        if (tags) data.tags = tags as string[];
        if (notes) data.notes = notes as string;
        if (source) data.source = source as ICustomer["source"];

        const customer = await customerService.createCustomer(userId, data);

        return res.status(HTTPSTATUS.CREATED).json({ success: true, customer });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const id = req.params.id as string;
        const body = req.body as Record<string, unknown>;

        const data: Parameters<typeof customerService.updateCustomer>[2] = {};
        if (body.name !== undefined) data.name = body.name as string;
        if (body.phone !== undefined) data.phone = body.phone as string;
        if (body.email !== undefined) data.email = body.email as string;
        if (body.avatarUrl !== undefined) data.avatarUrl = body.avatarUrl as string;
        if (body.tags !== undefined) data.tags = body.tags as string[];
        if (body.notes !== undefined) data.notes = body.notes as string;
        if (body.source !== undefined) data.source = body.source as ICustomer["source"];

        const customer = await customerService.updateCustomer(userId, id, data);

        return res.status(HTTPSTATUS.OK).json({ success: true, customer });
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const id = req.params.id as string;
        await customerService.deleteCustomer(userId, id);

        return res.status(HTTPSTATUS.OK).json({ success: true, message: "Customer deleted" });
    });
}
