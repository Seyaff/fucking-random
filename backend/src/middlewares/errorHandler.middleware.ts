import { ErrorRequestHandler } from "express";
import { ZodError, ZodIssue } from "zod"; 
import { AppError } from "../utils/appError";
import { HTTPSTATUS } from "../config/http.config";
import { Env } from "../config/app.config";


export const errorHandler: ErrorRequestHandler = (err:any, req, res, next): any => {

    console.error(`[Error] ${err.name}: ${err.message}`);

    console.log(err.stack)

   if (err instanceof ZodError) {
       
        const formattedErrors = err.issues.map((issue: ZodIssue) => ({
            field: issue.path.join('.'), 
            message: issue.message
        }));

        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            success: false,
            message: "Validation failed",
            errors: formattedErrors
        });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errorCode: err.errorCode 
        });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            success: false,
            message: `An account with that ${field} already exists.`
        });
    }

    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: Env.NODE_ENV === "production" ? "Internal Server Error" : err.message
    });
};