import { FastifyInstance } from "fastify";
import { authController } from "./auth.controller";

export const authRoutes = async (app: FastifyInstance) => {
  app.post("/auth/login/", authController.loginUserController);
};
