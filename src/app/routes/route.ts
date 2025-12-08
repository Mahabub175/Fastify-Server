import { FastifyInstance } from "fastify";
import { blogRoutes } from "../modules/blog/blog.route";
import { uploadRoutes } from "../modules/upload/upload.route";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";

export const router = async (app: FastifyInstance) => {
  const routes = [blogRoutes, userRoutes, authRoutes, uploadRoutes];

  for (const route of routes) {
    await route(app);
  }
};
