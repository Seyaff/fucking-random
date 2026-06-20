import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { ConversationController } from "./conversation.controller";

const controller = new ConversationController();
const conversationRoutes = Router();

conversationRoutes.use(authenticate);

conversationRoutes.get("/", controller.list);
conversationRoutes.get("/:id/messages", controller.getMessages);
conversationRoutes.post("/:id/messages", controller.sendMessage);
conversationRoutes.patch("/:id/read", controller.markRead);
conversationRoutes.patch("/:id/resolve", controller.resolve);

export default conversationRoutes;
