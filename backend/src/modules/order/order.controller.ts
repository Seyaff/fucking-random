import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { OrderService } from "./order.service";
import { HTTPSTATUS } from "../../config/http.config";

const orderService = new OrderService();

export class OrderController {
    list = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const page = parseInt(req.query.page as string) || 1;
        const result = await orderService.listOrders(userId, page);

        return res.status(HTTPSTATUS.OK).json({ success: true, ...result });
    });

    getByOrderId = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const orderId = req.params.orderId as string;
        if (!orderId) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({ success: false, message: "Order ID is required" });
        }

        const order = await orderService.getOrderByOrderId(userId, orderId);

        return res.status(HTTPSTATUS.OK).json({ success: true, order });
    });
}
