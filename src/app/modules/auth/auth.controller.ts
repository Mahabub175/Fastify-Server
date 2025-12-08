import { authServices } from "./auth.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { parseMultipartBody } from "../../utils/parsedBodyData";
import { responseSuccess, throwError } from "../../utils/response";

const loginUserController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const data = parseMultipartBody(req.body as Record<string, any>);

    if (!data.id || !data.password) {
      return throwError(
        "id (email | phone | username) or password required",
        400
      );
    }

    const result = await authServices.loginUserService({
      id: data.id,
      password: data.password,
    });

    return responseSuccess(reply, result, "User Logged In Successfully!");
  } catch (error: any) {
    throw error;
  }
};

export const authController = {
  loginUserController,
};
