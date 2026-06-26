import { describe, it, expect } from "vitest";
import { hashValue, compareValue } from "../../../src/utils/hash";

describe("hash", () => {
  it("hashes a password", async () => {
    const hash = await hashValue("my-password");
    expect(hash).toBeTruthy();
    expect(hash).not.toBe("my-password");
  });

  it("compares a correct password", async () => {
    const hash = await hashValue("my-password");
    const match = await compareValue("my-password", hash);
    expect(match).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashValue("my-password");
    const match = await compareValue("wrong-password", hash);
    expect(match).toBe(false);
  });

  it("produces different hashes for same password", async () => {
    const hash1 = await hashValue("same");
    const hash2 = await hashValue("same");
    expect(hash1).not.toBe(hash2);
  });
});
