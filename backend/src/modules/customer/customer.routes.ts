import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { CustomerController } from "./customer.controller";

const controller = new CustomerController();
const customerRoutes = Router();

customerRoutes.use(authenticate);

customerRoutes.get("/", controller.list);
customerRoutes.get("/:id", controller.getById);
customerRoutes.post("/", controller.create);
customerRoutes.put("/:id", controller.update);
customerRoutes.delete("/:id", controller.delete);

export default customerRoutes;
