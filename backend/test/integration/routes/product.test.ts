import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../src/modules/product/product.model", () => ({
  default: {
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    }),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    countDocuments: vi.fn().mockResolvedValue(0),
  },
}));

vi.mock("../../../src/middlewares/authenticate.middleware", () => ({
  authenticate: vi.fn((req: any, _res: any, next: any) => {
    req.user = {
      _id: "507f1f77bcf86cd799439011",
      toString() {
        return "507f1f77bcf86cd799439011";
      },
    };
    next();
  }),
}));

import request from "supertest";
import express from "express";
import { errorHandler } from "../../../src/middlewares/errorHandler.middleware";
import productRoutes from "../../../src/modules/product/product.routes";

const app = express();
app.use(express.json());
app.use("/api/v1/products", productRoutes);
app.use(errorHandler);

describe("Product Routes (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/products", () => {
    it("returns paginated products", async () => {
      const res = await request(app)
        .get("/api/v1/products")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.products).toBeDefined();
      expect(res.body.total).toBeDefined();
    });
  });

  describe("GET /api/v1/products/search", () => {
    it("returns search results", async () => {
      const ProductModel = (await import("../../../src/modules/product/product.model")).default;
      (ProductModel.find as any).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      });

      const res = await request(app)
        .get("/api/v1/products/search?q=apple")
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
