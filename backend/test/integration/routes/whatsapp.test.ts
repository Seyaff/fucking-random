import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../../../src/modules/whatsapp/whatsapp-account.model", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

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

vi.mock("../../../src/lib/worker", () => ({
  enqueueMessage: vi.fn().mockResolvedValue(undefined),
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
import whatsappRoutes from "../../../src/modules/whatsapp/whatsapp.routes";

const app = express();
app.use(express.json());
app.use("/api/v1/whatsapp", whatsappRoutes);
app.use(errorHandler);

describe("WhatsApp Routes (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/whatsapp/webhook", () => {
    it("returns 403 when challenge is missing", async () => {
      await request(app)
        .get("/api/v1/whatsapp/webhook")
        .expect(403);
    });

    it("returns 403 with wrong mode", async () => {
      await request(app)
        .get("/api/v1/whatsapp/webhook?hub.mode=wrong&hub.verify_token=test&hub.challenge=123")
        .expect(403);
    });
  });

  describe("POST /api/v1/whatsapp/webhook", () => {
    it("accepts incoming message webhook", async () => {
      const payload = {
        entry: [
          {
            changes: [
              {
                value: {
                  metadata: { phone_number_id: "12345" },
                  messages: [
                    {
                      from: "919999999999",
                      id: "msg-1",
                      timestamp: "1700000000",
                      text: { body: "Hello" },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      await request(app)
        .post("/api/v1/whatsapp/webhook")
        .send(payload)
        .expect(200);
    });
  });

  describe("POST /api/v1/whatsapp/connect", () => {
    it("connects whatsapp when account exists and updates it", async () => {
      const mockAccount = {
        _id: "acc-1",
        businessAccountId: "biz-1",
        phoneNumberId: "phone-1",
        phoneNumber: "+1234567890",
        isConnected: true,
        userId: "user-1",
        save: vi.fn().mockResolvedValue(true),
      };

      const WhatsAppAccountModel = (await import("../../../src/modules/whatsapp/whatsapp-account.model")).default;
      (WhatsAppAccountModel.findOne as any).mockResolvedValue(mockAccount);

      const axios = (await import("axios")).default;
      (axios.get as any).mockResolvedValue({
        data: { id: "phone-1", display_phone_number: "+1234567890", verified_name: "Test" },
      });

      const res = await request(app)
        .post("/api/v1/whatsapp/connect")
        .send({
          businessAccountId: "biz-1",
          phoneNumberId: "phone-1",
          phoneNumber: "",
          accessToken: "test-token",
          verifyToken: "test-verify",
        })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("connects whatsapp when no existing account", async () => {
      const mockAccount = {
        _id: "acc-2",
        businessAccountId: "biz-2",
        phoneNumberId: "phone-2",
        phoneNumber: "+1234567890",
        isConnected: true,
        save: vi.fn().mockResolvedValue(true),
      };

      const WhatsAppAccountModel = (await import("../../../src/modules/whatsapp/whatsapp-account.model")).default;
      (WhatsAppAccountModel.findOne as any).mockResolvedValue(null);
      (WhatsAppAccountModel.create as any).mockResolvedValue(mockAccount);

      const axios = (await import("axios")).default;
      (axios.get as any).mockResolvedValue({
        data: { id: "phone-2", display_phone_number: "+1234567890", verified_name: "Test" },
      });

      const res = await request(app)
        .post("/api/v1/whatsapp/connect")
        .send({
          businessAccountId: "biz-2",
          phoneNumberId: "phone-2",
          phoneNumber: "+1234567890",
          accessToken: "test-token",
          verifyToken: "test-verify",
        })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
