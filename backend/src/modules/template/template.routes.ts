import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { TemplateController } from "./template.controller";

const controller = new TemplateController();
const templateRoutes = Router();

templateRoutes.use(authenticate);

templateRoutes.get("/", controller.list);
templateRoutes.get("/:id", controller.getById);
templateRoutes.post("/", controller.create);
templateRoutes.put("/:id", controller.update);
templateRoutes.delete("/:id", controller.delete);

export default templateRoutes;
