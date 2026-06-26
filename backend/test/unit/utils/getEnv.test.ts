import { describe, it, expect } from "vitest";
import { getEnv } from "../../../src/utils/getEnv";

describe("getEnv", () => {
  const ORIGINAL = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL };
  });

  afterEach(() => {
    process.env = ORIGINAL;
  });

  it("returns the value when set", () => {
    process.env.MY_KEY = "hello";
    expect(getEnv("MY_KEY")).toBe("hello");
  });

  it("returns default when value not set and default provided", () => {
    delete process.env.MISSING_KEY;
    expect(getEnv("MISSING_KEY", "fallback")).toBe("fallback");
  });

  it("throws when not set and no default", () => {
    delete process.env.REQUIRED_KEY;
    expect(() => getEnv("REQUIRED_KEY")).toThrow(
      "Environment variable REQUIRED_KEY is not set"
    );
  });

  it("uses value over default when both exist", () => {
    process.env.EXISTING = "real-value";
    expect(getEnv("EXISTING", "fallback")).toBe("real-value");
  });
});
