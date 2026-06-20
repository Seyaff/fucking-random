import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { ProductService } from "./product.service";
import { parseCsv, detectColumnMap, parseCsvRows } from "./import/csv-importer";
import { HTTPSTATUS } from "../../config/http.config";
import fs from "fs/promises";
import path from "path";

const productService = new ProductService();

export class ProductController {
    list = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const page = parseInt(req.query.page as string) || 1;
        const result = await productService.listProducts(userId, page);

        return res.status(HTTPSTATUS.OK).json({ success: true, ...result });
    });

    search = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const query = (req.query.q as string) || "";

        const products = await productService.searchProducts(userId, query);

        return res.status(HTTPSTATUS.OK).json({ success: true, products });
    });

    importCsv = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!._id.toString();
        const file = req.file;

        if (!file) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({
                success: false,
                message: "CSV file is required",
            });
        }

        const text = await fs.readFile(file.path, "utf-8");
        const { headers, rows } = parseCsv(text);
        const columnMap = detectColumnMap(headers);
        const products = parseCsvRows(headers, rows, columnMap);

        await productService.bulkUpsert(userId, products, "csv");

        // Cleanup uploaded file
        await fs.unlink(file.path).catch(() => {});

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            imported: products.length,
            columnMap,
            preview: products.slice(0, 3),
        });
    });

    detectColumns = asyncHandler(async (req: Request, res: Response) => {
        const file = req.file;

        if (!file) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({
                success: false,
                message: "CSV file is required",
            });
        }

        const text = await fs.readFile(file.path, "utf-8");
        const { headers, rows } = parseCsv(text);
        const columnMap = detectColumnMap(headers);
        const products = parseCsvRows(headers, rows.slice(0, 5), columnMap);

        await fs.unlink(file.path).catch(() => {});

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            headers,
            columnMap,
            preview: products,
            totalRows: rows.length,
        });
    });
}
