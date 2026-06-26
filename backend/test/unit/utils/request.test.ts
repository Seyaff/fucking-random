import { describe, it, expect } from "vitest";
import { getRequestMeta } from "../../../src/utils/request";

describe("getRequestMeta", () => {
  it("extracts ip and user-agent", () => {
    const req = {
      ip: "192.168.1.1",
      socket: { remoteAddress: "10.0.0.1" },
      get: (header: string) => {
        if (header === "user-agent") return "test-agent";
        return undefined;
      },
    } as any;

    const meta = getRequestMeta(req);
    expect(meta.ip).toBe("192.168.1.1");
    expect(meta.userAgent).toBe("test-agent");
  });

  it("falls back to socket.remoteAddress when req.ip is missing", () => {
    const req = {
      socket: { remoteAddress: "10.0.0.1" },
      get: () => undefined,
    } as any;

    const meta = getRequestMeta(req);
    expect(meta.ip).toBe("10.0.0.1");
  });

  it("returns empty object when nothing is available", () => {
    const req = {
      socket: {},
      get: () => undefined,
    } as any;

    const meta = getRequestMeta(req);
    expect(meta.ip).toBeUndefined();
    expect(meta.userAgent).toBeUndefined();
  });
});
