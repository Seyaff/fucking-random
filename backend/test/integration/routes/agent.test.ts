import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../src/modules/conversation/conversation.model", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
    find: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock("../../../src/modules/conversation/message.model", () => ({
  default: {
    find: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../../src/modules/agent/agent-trace.model", () => ({
  default: {
    find: vi.fn(),
    aggregate: vi.fn(),
    countDocuments: vi.fn(),
    create: vi.fn(),
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
import agentRoutes from "../../../src/modules/agent/agent.routes";

const app = express();
app.use(express.json());
app.use("/api/v1/agent", agentRoutes);
app.use(errorHandler);

describe("Agent Routes (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/agent/test", () => {
    it("returns 400 when message is missing", async () => {
      const res = await request(app)
        .post("/api/v1/agent/test")
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/message is required/i);
    });
  });

  describe("POST /api/v1/agent/stream", () => {
    it("returns 400 when message is missing", async () => {
      const res = await request(app)
        .post("/api/v1/agent/stream")
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/agent/stats", () => {
    it("returns stats", async () => {
      const AgentTraceModel = (await import("../../../src/modules/agent/agent-trace.model")).default;
      (AgentTraceModel.aggregate as any).mockResolvedValue([]);
      (AgentTraceModel.countDocuments as any).mockResolvedValue(0);

      const res = await request(app)
        .get("/api/v1/agent/stats?days=7")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.stats.messagesHandled).toBe(0);
    });
  });
});
