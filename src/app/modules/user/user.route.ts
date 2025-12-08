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
    { preHandler: authorize(ModelNames.USER, StandardActions.CREATE) },
    userControllers.recoverUserController
  );

  app.get(
    "/user/",
    { preHandler: authorize(ModelNames.USER, StandardActions.READ) },
    userControllers.getAllUserController
  );

  app.get("/user/:userId/", userControllers.getSingleUserController);

  app.patch("/user/:userId/", userControllers.updateSingleUserController);

  app.patch(
    "/user/:userId/status/toggle/",
    { preHandler: authorize(ModelNames.USER, StandardActions.UPDATE) },
    userControllers.toggleUserStatusController
  );

  app.patch(
    "/user/status/toggle/many/",
    { preHandler: authorize(ModelNames.USER, StandardActions.UPDATE) },
    userControllers.toggleManyUserStatusController
  );

  app.patch(
    "/user/:userId/soft/",
    { preHandler: authorize(ModelNames.USER, StandardActions.UPDATE) },
    userControllers.softDeleteSingleUserController
  );

  app.patch(
    "/user/:userId/soft/toggle/",
    { preHandler: authorize(ModelNames.USER, StandardActions.UPDATE) },
    userControllers.toggleUserSoftDeleteController
  );

  app.patch(
    "/user/soft/toggle/many/",
    { preHandler: authorize(ModelNames.USER, StandardActions.UPDATE) },
    userControllers.toggleManyUserSoftDeleteController
  );

  app.patch(
    "/user/bulk/soft/",
    { preHandler: authorize(ModelNames.USER, StandardActions.UPDATE) },
    userControllers.softDeleteManyUserController
  );

  app.delete(
    "/user/:userId/",
    { preHandler: authorize(ModelNames.USER, StandardActions.DELETE) },
    userControllers.hardDeleteSingleUserController
  );

  app.delete(
    "/user/bulk/",
    { preHandler: authorize(ModelNames.USER, StandardActions.DELETE) },
    userControllers.hardDeleteManyUserController
  );
};
