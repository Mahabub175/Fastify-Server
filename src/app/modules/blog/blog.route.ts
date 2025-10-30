import { FastifyInstance } from "fastify";
import { blogControllers } from "./blog.controller";

export const blogRoutes = async (app: FastifyInstance) => {
  app.post("/blog/", blogControllers.createBlogController);

  app.post("/blog/bulk/", blogControllers.createBulkBlogsController);

  app.get("/blog/", blogControllers.getAllBlogController);

  app.get("/blog/:blogId/", blogControllers.getSingleBlogController);

  app.get(
    "/blog/slug/:blogSlug/",
    blogControllers.getSingleBlogBySlugController
  );

  app.patch("/blog/:blogId/", blogControllers.updateSingleBlogController);

  app.delete("/blog/:blogId/", blogControllers.deleteSingleBlogController);

  app.post("/blog/bulk-delete/", blogControllers.deleteManyBlogsController);
};
