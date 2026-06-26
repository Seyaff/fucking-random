import { describe, it, expect, vi } from "vitest";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE,
} from "../../../src/utils/cookie";

function mockResponse() {
  const cookies: Record<string, { value: string; options: any }> = {};
  return {
    cookie: vi.fn((name: string, value: string, options: any) => {
      cookies[name] = { value, options };
    }),
    clearCookie: vi.fn((name: string, options: any) => {
      delete cookies[name];
    }),
    _cookies: cookies,
  } as any;
}

describe("cookie", () => {
  describe("setRefreshTokenCookie", () => {
    it("sets httpOnly secure cookie with correct name", () => {
      const res = mockResponse();
      setRefreshTokenCookie(res, "my-token");

      expect(res.cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_COOKIE,
        "my-token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        })
      );
    });
  });

  describe("clearRefreshTokenCookie", () => {
    it("clears the cookie", () => {
      const res = mockResponse();
      clearRefreshTokenCookie(res);

      expect(res.clearCookie).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE, {
        path: "/",
      });
    });
  });
});
