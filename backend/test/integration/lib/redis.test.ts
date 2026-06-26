import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("RedisService", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("gracefully handles connection failure", async () => {
    const { redisService } = await import("../../../src/lib/redis");

    expect(redisService.isAvailable).toBe(false);
    const val = await redisService.get("nonexistent");
    expect(val).toBeNull();
  });

  it("set/get/del work when client is null", async () => {
    const { redisService } = await import("../../../src/lib/redis");

    await redisService.set("key", "value");
    const val = await redisService.get("key");
    expect(val).toBeNull();

    await redisService.del("key");
  });
});
