import { Router } from "express";
import { EventController } from "./event.controller";

const controller = new EventController();
const eventRoutes = Router();

eventRoutes.get("/", controller.subscribe);

export default eventRoutes;
