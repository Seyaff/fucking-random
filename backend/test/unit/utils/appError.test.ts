import { describe, it, expect } from "vitest";
import {
  AppError,
  BadRequestError,
  ForbiddenError,
  HttpError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../../../src/utils/appError";

describe("AppError", () => {
  it("creates with default INTERNAL_SERVER_ERROR", () => {
    const err = new AppError("Something went wrong");
    expect(err.message).toBe("Something went wrong");
    expect(err.statusCode).toBe(500);
    expect(err.errorCode).toBe("INTERNAL_SERVER_ERROR");
  });

  it("captures stack trace", () => {
    const err = new AppError("test");
    expect(err.stack).toBeTruthy();
  });
});

describe("BadRequestError", () => {
  it("defaults to 400", () => {
    const err = new BadRequestError("bad input");
    expect(err.statusCode).toBe(400);
    expect(err.errorCode).toBe("VALIDATION_ERROR");
  });
});

describe("UnauthorizedError", () => {
  it("defaults to 401", () => {
    const err = new UnauthorizedError("no token");
    expect(err.statusCode).toBe(401);
    expect(err.errorCode).toBe("ACCESS_UNAUTHORIZED");
  });
});

describe("ForbiddenError", () => {
  it("defaults to 403", () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.errorCode).toBe("ACCESS_FORBIDDEN");
    expect(err.message).toBe("You do not have permission to perform this action.");
  });
});

describe("NotFoundError", () => {
  it("defaults to 404", () => {
    const err = new NotFoundError("not found");
    expect(err.statusCode).toBe(404);
    expect(err.errorCode).toBe("RESOURCE_NOT_FOUND");
  });
});

describe("InternalServerError", () => {
  it("defaults to 500", () => {
    const err = new InternalServerError("crash");
    expect(err.statusCode).toBe(500);
    expect(err.errorCode).toBe("INTERNAL_SERVER_ERROR");
  });
});

describe("HttpError", () => {
  it("accepts custom status and error code", () => {
    const err = new HttpError("custom", 429, "AUTH_TOO_MANY_ATTEMPTS");
    expect(err.statusCode).toBe(429);
    expect(err.errorCode).toBe("AUTH_TOO_MANY_ATTEMPTS");
  });
});
