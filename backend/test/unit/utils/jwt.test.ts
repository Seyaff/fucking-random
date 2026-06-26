import { describe, it, expect, beforeAll } from "vitest";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../../src/utils/jwt";

const TEST_USER_ID = "507f1f77bcf86cd799439011";

describe("jwt", () => {
  describe("access token", () => {
    it("signs and verifies", () => {
      const token = signAccessToken(TEST_USER_ID);
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");

      const payload = verifyAccessToken(token);
      expect(payload.sub).toBe(TEST_USER_ID);
    });

    it("rejects an invalid token", () => {
      expect(() => verifyAccessToken("invalid-token")).toThrow();
    });

    it("rejects a tampered token", () => {
      const token = signAccessToken(TEST_USER_ID);
      const parts = token.split(".");
      parts[1] = parts[1] + "a";
      expect(() => verifyAccessToken(parts.join("."))).toThrow();
    });
  });

  describe("refresh token", () => {
    it("signs and verifies with jti", () => {
      const jti = "unique-jti-123";
      const token = signRefreshToken(TEST_USER_ID, jti);
      expect(token).toBeTruthy();

      const payload = verifyRefreshToken(token);
      expect(payload.sub).toBe(TEST_USER_ID);
      expect(payload.jti).toBe(jti);
    });

    it("rejects refresh token with wrong secret", () => {
      const token = signRefreshToken(TEST_USER_ID, "jti");
      const parts = token.split(".");
      parts[2] = parts[2] + "x";
      expect(() => verifyRefreshToken(parts.join("."))).toThrow();
    });
  });
});
