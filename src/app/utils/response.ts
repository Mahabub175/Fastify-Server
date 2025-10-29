import { FastifyReply } from "fastify";
import httpStatus from "http-status";

export const responseSuccess = (
  reply: FastifyReply,
  data: any,
  message = "Request successful",
  statusCode = httpStatus.OK
) => {
  return reply.status(statusCode).send({
    success: true,
    statusCode,
    message,
    data,
  });
};

export const responseError = (
  reply: FastifyReply,
  message = "Something went wrong",
  statusCode: number = httpStatus.INTERNAL_SERVER_ERROR,
  error: any = null
) => {
  return reply.status(statusCode).send({
    success: false,
    statusCode,
    message,
    error,
  });
};

export const throwError = (message: string, statusCode = 400) => {
  const err = new Error(message) as any;
  err.statusCode = statusCode;
  throw err;
};
