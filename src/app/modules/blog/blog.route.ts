import { FastifyInstance } from "fastify";
import { blogControllers } from "./blog.controller";

export const blogRoutes = async (app: FastifyInstance) => {
  app.post("/blog/", blogControllers.createBlogController);

  app.post("/blog/bulk/", blogControllers.createBulkBlogsController);

  app.post("/blog/recover/", blogControllers.recoverBlogController);

  app.get("/blog/", blogControllers.getAllBlogController);

  app.get("/blog/:blogId/", blogControllers.getSingleBlogController);

  app.get(
    "/blog/slug/:blogSlug/",
    blogControllers.getSingleBlogBySlugController
  );

  app.patch("/blog/:blogId/", blogControllers.updateSingleBlogController);

  app.patch(
    "/blog/:blogId/status/toggle/",
    blogControllers.toggleBlogStatusController
  );

  app.patch(
    "/blog/status/toggle/many/",
    blogControllers.toggleManyBlogStatusController
  );

  app.patch(
    "/blog/:blogId/soft/",
    blogControllers.softDeleteSingleBlogController
  );

  app.patch(
    "/blog/:blogId/soft/toggle/",
    blogControllers.toggleBlogSoftDeleteController
  );

  app.patch(
    "/blog/soft/toggle/many/",
    blogControllers.toggleManyBlogSoftDeleteController
  );

  app.patch("/blog/bulk/soft/", blogControllers.softDeleteManyBlogController);

  app.delete("/blog/:blogId/", blogControllers.hardDeleteSingleBlogController);

  app.delete("/blog/bulk/", blogControllers.hardDeleteManyBlogController);
};
