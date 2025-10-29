import { FastifyRequest, FastifyReply } from "fastify";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/config";
import httpStatus from "http-status";
import { responseError } from "../utils/response";

export const authMiddleware = (...requiredRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers["authorization"];
      if (!authHeader) {
        return responseError(
          reply,
          "Authorization token missing",
          httpStatus.UNAUTHORIZED
        );
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

      const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string
      ) as JwtPayload;

      const userId = decoded.userId || decoded.id;
      const role = decoded.role;

      // const user = await userModel.findById(userId);
      let user;
      if (!user) {
        return responseError(reply, "User not found", httpStatus.UNAUTHORIZED);
      }

      if (requiredRoles.length && !requiredRoles.includes(role)) {
        return responseError(
          reply,
          "Unauthorized Access",
          httpStatus.FORBIDDEN
        );
      }

      (request as any).user = decoded;
    } catch (error: any) {
      return responseError(
        reply,
        "Invalid or expired token",
        httpStatus.UNAUTHORIZED,
        error
      );
    }
  };
};
