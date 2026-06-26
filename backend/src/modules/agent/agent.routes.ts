import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { AgentController } from "./agent.controller";

const controller = new AgentController();
const agentRoutes = Router();

agentRoutes.use(authenticate);

agentRoutes.post("/test", controller.test);
agentRoutes.post("/stream", controller.stream);
agentRoutes.get("/stats", controller.stats);

export default agentRoutes;
