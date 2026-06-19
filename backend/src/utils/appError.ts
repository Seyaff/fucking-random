import { HTTPSTATUS, HttpStatusType } from "../config/http.config";
import { ErrorCodeEnumType } from "../enums/error-code.enum";


export class AppError extends Error {
  public statusCode: HttpStatusType;
  public errorCode: ErrorCodeEnumType;

  constructor(
    message: string,
    statusCode = HTTPSTATUS.INTERNAL_SERVER_ERROR,
    errorCode?: ErrorCodeEnumType,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || "INTERNAL_SERVER_ERROR";

    Error.captureStackTrace(this, this.constructor);
  }
}

export class InternalServerError extends AppError {
  constructor(
    message: string,
    statusCode = HTTPSTATUS.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCodeEnumType = "INTERNAL_SERVER_ERROR",
  ) {
    super(message, statusCode, errorCode);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message: string,
    statusCode = HTTPSTATUS.UNAUTHORIZED,
    errorCode: ErrorCodeEnumType = "ACCESS_UNAUTHORIZED",
  ) {
    super(message, statusCode, errorCode);
  }
}

export class BadRequestError extends AppError {
  constructor(
    message: string,
    statusCode = HTTPSTATUS.BAD_REQUEST,
    errorCode: ErrorCodeEnumType = "VALIDATION_ERROR",
  ) {
    super(message, statusCode, errorCode);
  }
}

export class HttpError extends AppError {
  constructor(
    message: string,
    statusCode: HttpStatusType,
    errorCode: ErrorCodeEnumType,
  ) {
    super(message, statusCode, errorCode);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string,
    statusCode = HTTPSTATUS.NOT_FOUND,
    errorCode: ErrorCodeEnumType = "RESOURCE_NOT_FOUND",
  ) {
    super(message, statusCode, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message: string = "You do not have permission to perform this action.",
    statusCode = HTTPSTATUS.FORBIDDEN,
    errorCode: ErrorCodeEnumType = "ACCESS_FORBIDDEN",
  ) {
    super(message, statusCode, errorCode);
  }
}