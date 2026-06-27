import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { QuickReplyController } from "./quick-reply.controller";

const controller = new QuickReplyController();
const quickReplyRoutes = Router();

quickReplyRoutes.use(authenticate);

quickReplyRoutes.get("/", controller.list);
quickReplyRoutes.get("/:id", controller.getById);
quickReplyRoutes.post("/", controller.create);
quickReplyRoutes.put("/:id", controller.update);
quickReplyRoutes.delete("/:id", controller.delete);

export default quickReplyRoutes;
