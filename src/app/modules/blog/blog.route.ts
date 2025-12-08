import { FastifyInstance } from "fastify";
import { blogControllers } from "./blog.controller";
import { authorize } from "../../middlewares/authorize";
import { ModelNames, StandardActions } from "../../global/global.constants";

export const blogRoutes = async (app: FastifyInstance) => {
  app.post(
    "/blog/",
    { preHandler: authorize(ModelNames.BLOG, StandardActions.CREATE) },
    blogControllers.createBlogController
  );

  app.post(
    "/blog/bulk/",
    { preHandler: authorize(ModelNames.BLOG, StandardActions.CREATE) },
    blogControllers.createBulkBlogsController
  );

  app.post(
    "/blog/recover/",
    { preHandler: authorize(ModelNames.BLOG, StandardActions.RECOVER) },
    blogControllers.recoverBlogController
  );

  app.get(
    "/blog/",
    { preHandler: authorize(ModelNames.BLOG, StandardActions.READ_MANY) },
    blogControllers.getAllBlogController
  );

  app.get(
    "/blog/:blogId/",
    { preHandler: authorize(ModelNames.BLOG, StandardActions.READ) },
    blogControllers.getSingleBlogController
  );

  app.get(
    "/blog/slug/:blogSlug/",
    { preHandler: authorize(ModelNames.BLOG, StandardActions.READ) },
    blogControllers.getSingleBlogBySlugController
  );

  app.patch(
    "/blog/:blogId/",
    { preHandler: authorize(ModelNames.BLOG, StandardActions.UPDATE) },
    blogControllers.updateSingleBlogController
  );

  app.patch(
    "/blog/:blogId/status/toggle/",
    { preHandler: authorize(ModelNames.BLOG, StandardActions.UPDATE) },
    blogControllers.toggleBlogStatusController
  );

  app.patch(
    "/blog/status/toggle/many/",
    { preHandler: authorize(ModelNames.BLOG, StandardActions.UPDATE) },
    blogControllers.toggleManyBlogStatusController
  );

  app.patch(
    "/blog/:blogId/soft/",
    { preHandler: authorize(ModelNames.BLOG, StandardActions.SOFT_DELETE) },
    blogControllers.softDeleteSingleBlogController
  );

  app.patch(
    "/blog/:blogId/soft/toggle/",
    { preHandler: authorize(ModelNames.BLOG, StandardActions.SOFT_DELETE) },
    blogControllers.toggleBlogSoftDeleteController
  );

  app.patch(
    "/blog/soft/toggle/many/",
    {
      preHandler: authorize(ModelNames.BLOG, StandardActions.SOFT_DELETE_MANY),
    },
    blogControllers.toggleManyBlogSoftDeleteController
  );

  app.patch(
    "/blog/bulk/soft/",
    {
      preHandler: authorize(ModelNames.BLOG, StandardActions.SOFT_DELETE_MANY),
    },
    blogControllers.softDeleteManyBlogController
  );

  app.delete(
    "/blog/:blogId/",
    { preHandler: authorize(ModelNames.BLOG, StandardActions.HARD_DELETE) },
    blogControllers.hardDeleteSingleBlogController
  );

  app.delete(
    "/blog/bulk/",
    {
      preHandler: authorize(ModelNames.BLOG, StandardActions.HARD_DELETE_MANY),
    },
    blogControllers.hardDeleteManyBlogController
  );
};
