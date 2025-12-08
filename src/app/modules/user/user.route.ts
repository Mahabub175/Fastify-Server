import { FastifyInstance } from "fastify";
import { userControllers } from "./user.controller";
import { authorize } from "../../middlewares/authorize";
import { ModelNames, StandardActions } from "../../global/global.constants";

export const userRoutes = async (app: FastifyInstance) => {
  app.post(
    "/user/",
    { preHandler: authorize(ModelNames.USER, StandardActions.CREATE) },
    userControllers.createUserController
  );

  app.post(
    "/user/bulk/",
    { preHandler: authorize(ModelNames.USER, StandardActions.CREATE) },
    userControllers.createBulkUsersController
  );

  app.post(
    "/user/recover/",
    { preHandler: authorize(ModelNames.USER, StandardActions.RECOVER) },
    userControllers.recoverUserController
  );

  app.get(
    "/user/",
    { preHandler: authorize(ModelNames.USER, StandardActions.READ_MANY) },
    userControllers.getAllUserController
  );

  app.get(
    "/user/:userId/",
    { preHandler: authorize(ModelNames.USER, StandardActions.READ) },
    userControllers.getSingleUserController
  );

  app.patch(
    "/user/:userId/",
    { preHandler: authorize(ModelNames.USER, StandardActions.UPDATE) },
    userControllers.updateSingleUserController
  );

  app.patch(
    "/user/:userId/status/toggle/",
    { preHandler: authorize(ModelNames.USER, StandardActions.UPDATE) },
    userControllers.toggleUserStatusController
  );

  app.patch(
    "/user/status/toggle/many/",
    { preHandler: authorize(ModelNames.USER, StandardActions.UPDATE_MANY) },
    userControllers.toggleManyUserStatusController
  );

  app.patch(
    "/user/:userId/soft/",
    { preHandler: authorize(ModelNames.USER, StandardActions.SOFT_DELETE) },
    userControllers.softDeleteSingleUserController
  );

  app.patch(
    "/user/:userId/soft/toggle/",
    { preHandler: authorize(ModelNames.USER, StandardActions.SOFT_DELETE) },
    userControllers.toggleUserSoftDeleteController
  );

  app.patch(
    "/user/soft/toggle/many/",
    {
      preHandler: authorize(ModelNames.USER, StandardActions.SOFT_DELETE_MANY),
    },
    userControllers.toggleManyUserSoftDeleteController
  );

  app.patch(
    "/user/bulk/soft/",
    {
      preHandler: authorize(ModelNames.USER, StandardActions.SOFT_DELETE_MANY),
    },
    userControllers.softDeleteManyUserController
  );

  app.delete(
    "/user/:userId/",
    { preHandler: authorize(ModelNames.USER, StandardActions.HARD_DELETE) },
    userControllers.hardDeleteSingleUserController
  );

  app.delete(
    "/user/bulk/",
    {
      preHandler: authorize(ModelNames.USER, StandardActions.HARD_DELETE_MANY),
    },
    userControllers.hardDeleteManyUserController
  );
};
