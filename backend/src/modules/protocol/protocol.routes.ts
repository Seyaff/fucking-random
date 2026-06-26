import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { ProtocolController } from "./protocol.controller";

const router = Router();
const controller = new ProtocolController();

router.get("/", authenticate, controller.list);
router.post("/", authenticate, controller.create);
router.patch("/:id", authenticate, controller.update);
router.delete("/:id", authenticate, controller.delete);

export default router;
