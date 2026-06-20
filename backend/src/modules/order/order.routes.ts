import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { OrderController } from "./order.controller";

const controller = new OrderController();
const orderRoutes = Router();

orderRoutes.use(authenticate);

orderRoutes.get("/", controller.list);
orderRoutes.get("/:orderId", controller.getByOrderId);

export default orderRoutes;
