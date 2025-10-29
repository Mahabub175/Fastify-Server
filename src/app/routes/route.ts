import { FastifyInstance } from "fastify";
import { blogRoutes } from "../modules/blog/blog.route";
import { uploadRoutes } from "../modules/upload/upload.route";

export const router = async (app: FastifyInstance) => {
  const routes = [blogRoutes, uploadRoutes];

  for (const route of routes) {
    await route(app);
  }
};
