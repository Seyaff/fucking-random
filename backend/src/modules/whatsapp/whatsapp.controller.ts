import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../../config/http.config";

export const cont = asyncHandler(async(req :Request , res: Response) => {
    return res.status(HTTPSTATUS.OK).json({
        message : "changed"
    })
})