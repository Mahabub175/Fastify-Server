import { FastifyInstance } from "fastify";
import { userControllers } from "./user.controller";

export const userRoutes = async (app: FastifyInstance) => {
  app.post("/user/", userControllers.createUserController);

  app.post("/user/bulk/", userControllers.createBulkUsersController);

  app.post("/user/recover/", userControllers.recoverUserController);

  app.get("/user/", userControllers.getAllUserController);

  app.get("/user/:userId/", userControllers.getSingleUserController);

  app.patch("/user/:userId/", userControllers.updateSingleUserController);

  app.patch(
    "/user/:userId/status/toggle/",
    userControllers.toggleUserStatusController
  );

  app.patch(
    "/user/status/toggle/many/",
    userControllers.toggleManyUserStatusController
  );

  app.patch(
    "/user/:userId/soft/",
    userControllers.softDeleteSingleUserController
  );

  app.patch(
    "/user/:userId/soft/toggle/",
    userControllers.toggleUserSoftDeleteController
  );

  app.patch(
    "/user/soft/toggle/many/",
    userControllers.toggleManyUserSoftDeleteController
  );

  app.patch("/user/bulk/soft/", userControllers.softDeleteManyUserController);

  app.delete("/user/:userId/", userControllers.hardDeleteSingleUserController);

  app.delete("/user/bulk/", userControllers.hardDeleteManyUserController);
};
