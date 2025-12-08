import { FastifyInstance } from "fastify";
import { permissionControllers } from "./permission.controller";

export const permissionRoutes = async (app: FastifyInstance) => {
  app.post("/permission/", permissionControllers.createPermissionController);

  app.post(
    "/permission/bulk/",
    permissionControllers.createBulkPermissionsController
  );

  app.post(
    "/permission/recover/",
    permissionControllers.recoverPermissionController
  );

  app.get("/permission/", permissionControllers.getAllPermissionController);

  app.get(
    "/permission/:permissionId/",
    permissionControllers.getSinglePermissionController
  );

  app.patch(
    "/permission/:permissionId/",
    permissionControllers.updateSinglePermissionController
  );

  app.patch(
    "/permission/:permissionId/status/toggle/",
    permissionControllers.togglePermissionStatusController
  );

  app.patch(
    "/permission/status/toggle/many/",
    permissionControllers.toggleManyPermissionStatusController
  );

  app.patch(
    "/permission/:permissionId/soft/",
    permissionControllers.softDeleteSinglePermissionController
  );

  app.patch(
    "/permission/:permissionId/soft/toggle/",
    permissionControllers.togglePermissionSoftDeleteController
  );

  app.patch(
    "/permission/soft/toggle/many/",
    permissionControllers.toggleManyPermissionSoftDeleteController
  );

  app.patch(
    "/permission/bulk/soft/",
    permissionControllers.softDeleteManyPermissionController
  );

  app.delete(
    "/permission/:permissionId/",
    permissionControllers.hardDeleteSinglePermissionController
  );

  app.delete(
    "/permission/bulk/",
    permissionControllers.hardDeleteManyPermissionController
  );
};
