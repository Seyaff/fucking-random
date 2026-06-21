import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { ConnectorController } from "./connector.controller";

const controller = new ConnectorController();
const connectorRoutes = Router();

connectorRoutes.get("/", authenticate, controller.listStatus);

connectorRoutes.get("/gmail/auth", authenticate, controller.gmailAuth);
connectorRoutes.get("/gmail/callback", controller.gmailCallback);
connectorRoutes.post("/gmail/disconnect", authenticate, controller.gmailDisconnect);
connectorRoutes.get("/gmail/data", authenticate, controller.gmailData);
connectorRoutes.get("/gmail/data/:emailId", authenticate, controller.gmailEmailDetail);
connectorRoutes.get("/gmail/status", authenticate, controller.gmailStatus);

connectorRoutes.get("/slack/auth", authenticate, controller.slackAuth);
connectorRoutes.get("/slack/callback", controller.slackCallback);
connectorRoutes.post("/slack/disconnect", authenticate, controller.slackDisconnect);
connectorRoutes.get("/slack/data", authenticate, controller.slackData);
connectorRoutes.get("/slack/status", authenticate, controller.slackStatus);

export default connectorRoutes;
