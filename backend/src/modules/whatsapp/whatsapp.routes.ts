import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { WhatsAppController } from "./whatsapp.controller";

const controller = new WhatsAppController();
const whatsappRoutes = Router();

// Webhook routes — must be before auth, Meta calls these without a token
whatsappRoutes.get("/webhook", controller.webhookVerify);
whatsappRoutes.post("/webhook", controller.webhookReceive);

// Authenticated routes
whatsappRoutes.post("/connect", authenticate, controller.connect);
whatsappRoutes.post("/disconnect", authenticate, controller.disconnect);
whatsappRoutes.get("/my-connection", authenticate, controller.myConnection);

export default whatsappRoutes;
