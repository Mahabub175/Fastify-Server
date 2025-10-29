import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import httpStatus from "http-status";
import config from "../config/config";

export const globalErrorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  request.log.error(error);

  const err: any = error;
  let statusCode: number = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let response: Record<string, any> = {
    success: false,
    statusCode,
    message: err.message || "Something went wrong!",
  };

  if (err.code === 11000 && err.keyValue) {
    statusCode = httpStatus.CONFLICT;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const friendlyField = field.charAt(0).toUpperCase() + field.slice(1);
    response = {
      success: false,
      statusCode,
      message: `A record with ${friendlyField} '${value}' already exists.`,
      field,
      value,
    };
  } else if (err.name === "ValidationError" && err.errors) {
    statusCode = httpStatus.BAD_REQUEST;

    const fieldErrors = Object.entries(err.errors).map(([field, e]: any) => ({
      field,
      message: e.message,
      kind: e.kind,
    }));

    const missingFields = fieldErrors
      .filter((e) => e.kind === "required")
      .map((e) => e.field);

    response = {
      success: false,
      statusCode,
      message: missingFields.length
        ? `Missing required field(s): ${missingFields.join(", ")}`
        : "Validation failed for one or more fields.",
      errors: fieldErrors,
    };
  } else if (err.name === "CastError") {
    statusCode = httpStatus.BAD_REQUEST;
    response = {
      success: false,
      statusCode,
      message: `Invalid ${err.path}: ${err.value}`,
      field: err.path,
      value: err.value,
    };
  } else if (err.name === "ZodError") {
    statusCode = httpStatus.BAD_REQUEST;
    const errors = (err.issues || []).map((i: any) => i.message);
    response = {
      success: false,
      statusCode,
      message: errors.join(", "),
      errors,
    };
  } else if (err.isJoi) {
    statusCode = httpStatus.BAD_REQUEST;
    const errors = err.details.map((d: any) => d.message);
    response = {
      success: false,
      statusCode,
      message: errors.join(", "),
      errors,
    };
  } else if (err instanceof TypeError) {
    statusCode = httpStatus.BAD_REQUEST;
    response = {
      success: false,
      statusCode,
      message: err.message,
    };
  } else if (err.statusCode && err.message) {
    statusCode = err.statusCode;
    response = {
      success: false,
      statusCode,
      message: err.message,
    };
  } else {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    response = {
      success: false,
      statusCode,
      message: err.message || "Internal Server Error",
    };
  }

  if (config.env !== "production" && err.stack) {
    const stackLines = err.stack.split("\n");
    const origin = stackLines[1]?.trim() || "Unknown origin";
    response.stack = err.stack;
    response.origin = origin;
  }

  reply.status(statusCode).send(response);
};
