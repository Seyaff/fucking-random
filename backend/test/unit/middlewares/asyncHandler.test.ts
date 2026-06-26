import { describe, it, expect, vi } from "vitest";
import { asyncHandler } from "../../../src/middlewares/asyncHandler.middleware";

describe("asyncHandler", () => {
  it("calls the controller and passes returned value", async () => {
    const controller = vi.fn().mockResolvedValue("ok");
    const req = {} as any;
    const res = {} as any;
    const next = vi.fn();

    const wrapped = asyncHandler(controller);
    const result = await wrapped(req, res, next);

    expect(controller).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it("catches thrown errors and forwards to next", async () => {
    const error = new Error("controller error");
    const controller = vi.fn().mockRejectedValue(error);
    const req = {} as any;
    const res = {} as any;
    const next = vi.fn();

    const wrapped = asyncHandler(controller);
    await wrapped(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
