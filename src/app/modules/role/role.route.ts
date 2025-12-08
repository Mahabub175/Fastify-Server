import { FastifyInstance } from "fastify";
import { roleControllers } from "./role.controller";

export const roleRoutes = async (app: FastifyInstance) => {
  app.post("/role/", roleControllers.createRoleController);

  app.post("/role/bulk/", roleControllers.createBulkRolesController);

  app.post("/role/recover/", roleControllers.recoverRoleController);

  app.get("/role/", roleControllers.getAllRoleController);

  app.get("/role/:roleId/", roleControllers.getSingleRoleController);

  app.patch("/role/:roleId/", roleControllers.updateSingleRoleController);

  app.patch(
    "/role/:roleId/status/toggle/",
    roleControllers.toggleRoleStatusController
  );

  app.patch(
    "/role/status/toggle/many/",
    roleControllers.toggleManyRoleStatusController
  );

  app.patch(
    "/role/:roleId/soft/",
    roleControllers.softDeleteSingleRoleController
  );

  app.patch(
    "/role/:roleId/soft/toggle/",
    roleControllers.toggleRoleSoftDeleteController
  );

  app.patch(
    "/role/soft/toggle/many/",
    roleControllers.toggleManyRoleSoftDeleteController
  );

  app.patch("/role/bulk/soft/", roleControllers.softDeleteManyRoleController);

  app.delete("/role/:roleId/", roleControllers.hardDeleteSingleRoleController);

  app.delete("/role/bulk/", roleControllers.hardDeleteManyRoleController);
};
