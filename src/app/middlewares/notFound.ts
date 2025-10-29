import { FastifyReply, FastifyRequest } from "fastify";
import httpStatus from "http-status";

export const notFound = async (
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const method = req.method;
  const url = req.url;

  reply.status(httpStatus.NOT_FOUND).send({
    success: false,
    statusCode: httpStatus.NOT_FOUND,
    message: `API Route ${method} ${url} not found`,
    error: "The route you are trying to access does not exist.",
  });
};
