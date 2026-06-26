import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../src/modules/user/user.model", () => ({
  default: {
    findById: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../../src/modules/auth/account.model", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../../src/modules/auth/refreshToken.model", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock("../../../src/lib/email.service", () => ({
  emailService: {
    sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
    sendOrderConfirmationEmail: vi.fn().mockResolvedValue(undefined),
  },
}));

import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "../../../src/middlewares/errorHandler.middleware";
import authRoutes from "../../../src/modules/auth/auth.routes";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/auth", authRoutes);
app.use(errorHandler);

describe("Auth Routes (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("returns 401 when no refresh token cookie", async () => {
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/refresh token missing/i);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("succeeds even without refresh token", async () => {
      const res = await request(app)
        .post("/api/v1/auth/logout")
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("clears refresh token cookie", async () => {
      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", ["refreshToken=some-token"])
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.headers["set-cookie"]).toBeDefined();
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("returns 401 without token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it("returns 401 with malformed token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer not-a-real-token")
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});
