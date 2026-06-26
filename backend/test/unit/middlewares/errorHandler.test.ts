import { describe, it, expect, vi, beforeEach } from "vitest";
import { errorHandler } from "../../../src/middlewares/errorHandler.middleware";
import { AppError, BadRequestError, UnauthorizedError } from "../../../src/utils/appError";
import { ZodError, ZodIssue } from "zod";

function mockCtx() {
  const json = vi.fn().mockReturnThis();
  const status = vi.fn().mockReturnValue({ json });
  return {
    req: {} as any,
    res: { status } as any,
    next: vi.fn(),
    json,
    status,
  };
}

describe("errorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles ZodError with formatted errors", () => {
    const { req, res, next, json, status } = mockCtx();

    const issues: ZodIssue[] = [
      {
        code: "invalid_type",
        path: ["email"],
        message: "Invalid email",
        expected: "string",
        received: "number",
      },
    ];
    const zodError = new ZodError(issues);

    errorHandler(zodError, req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      errors: [{ field: "email", message: "Invalid email" }],
    });
  });

  it("handles AppError with status code and error code", () => {
    const { req, res, next, json, status } = mockCtx();
    const err = new BadRequestError("bad input");

    errorHandler(err, req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "bad input",
      errorCode: "VALIDATION_ERROR",
    });
  });

  it("handles UnauthorizedError", () => {
    const { req, res, next, json, status } = mockCtx();
    const err = new UnauthorizedError("no token");

    errorHandler(err, req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "no token",
      errorCode: "ACCESS_UNAUTHORIZED",
    });
  });

  it("handles MongoDB duplicate key error (code 11000)", () => {
    const { req, res, next, json, status } = mockCtx();
    const err: any = new Error("duplicate");
    err.code = 11000;
    err.keyValue = { email: "test@test.com" };

    errorHandler(err, req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "An account with that email already exists.",
    });
  });

  it("handles unknown errors with 500", () => {
    const { req, res, next, json, status } = mockCtx();
    const err = new Error("something broke");

    errorHandler(err, req, res, next);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "something broke",
    });
  });

  it("returns 500 with error message in non-production", () => {
    const { req, res, next, json, status } = mockCtx();
    const err = new Error("secret detail");

    errorHandler(err, req, res, next);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "secret detail",
    });
  });
});
