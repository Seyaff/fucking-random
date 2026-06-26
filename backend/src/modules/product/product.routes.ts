import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { ProductController } from "./product.controller";

const upload = multer({ dest: "/tmp/uploads" });
const controller = new ProductController();
const productRoutes = Router();

productRoutes.use(authenticate);

productRoutes.get("/", controller.list);
productRoutes.get("/search", controller.search);
productRoutes.post("/import/csv", upload.single("file"), controller.importCsv);
productRoutes.post("/import/detect", upload.single("file"), controller.detectColumns);

export default productRoutes;
