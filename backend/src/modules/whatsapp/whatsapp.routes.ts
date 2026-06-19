import { Router } from "express";
import { cont } from "./whatsapp.controller";

const whatsappRoutes = Router()

whatsappRoutes.get("/test" , cont)

export default whatsappRoutes