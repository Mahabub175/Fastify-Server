import { FastifyRequest, FastifyReply } from "fastify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { responseError } from "../utils/response";
import { userModel } from "../modules/user/user.model";
import config from "../config/config";

interface AuthRequest extends FastifyRequest {
  user?: { id: string };
}

interface PopulatedRole {
  _id: string;
  name: string;
  permissions: { name: string }[];
}

const role_env = config.role;

export const authorize =
  (modelName: string, action: string) =>
  async (request: AuthRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers["authorization"];
      if (!authHeader) {
        return responseError(reply, "Authorization token missing", 401);
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

      const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string
      ) as JwtPayload;

      const userId = decoded?._id;

      if (role_env === "dev") {
        return;
      }

      if (!userId) return responseError(reply, "Unauthorized!", 401);

      const user = await userModel
        .findById(userId)
        .populate({
          path: "role",
          populate: { path: "permissions", model: "permission" },
        })
        .select("-password")
        .lean();

      if (!user || !user.role)
        return responseError(reply, "Access denied!", 403);

      const role = user.role as unknown as PopulatedRole;

      const requiredPermission = `${modelName.toLowerCase()}:${action.toLowerCase()}`;

      const hasPermission = role.permissions.some(
        (perm) => perm.name === requiredPermission
      );

      if (!hasPermission) return responseError(reply, "Access denied!", 403);
    } catch (err: any) {
      console.error(err);
      return responseError(reply, "Internal server error", 500, err.message);
    }
  };
