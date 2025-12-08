import { FastifyInstance } from "fastify";
import { permissionControllers } from "./permission.controller";
import { authorize } from "../../middlewares/authorize";
import { ModelNames, StandardActions } from "../../global/global.constants";

export const permissionRoutes = async (app: FastifyInstance) => {
  app.post(
    "/permission/",
    { preHandler: authorize(ModelNames.PERMISSION, StandardActions.CREATE) },
    permissionControllers.createPermissionController
  );

  app.post(
    "/permission/bulk/",
    { preHandler: authorize(ModelNames.PERMISSION, StandardActions.CREATE) },
    permissionControllers.createBulkPermissionsController
  );

  app.post(
    "/permission/recover/",
    { preHandler: authorize(ModelNames.PERMISSION, StandardActions.RECOVER) },
    permissionControllers.recoverPermissionController
  );

  app.get(
    "/permission/",
    { preHandler: authorize(ModelNames.PERMISSION, StandardActions.READ_MANY) },
    permissionControllers.getAllPermissionController
  );

  app.get(
    "/permission/:permissionId/",
    { preHandler: authorize(ModelNames.PERMISSION, StandardActions.READ) },
    permissionControllers.getSinglePermissionController
  );

  app.patch(
    "/permission/:permissionId/",
    { preHandler: authorize(ModelNames.PERMISSION, StandardActions.UPDATE) },
    permissionControllers.updateSinglePermissionController
  );

  app.patch(
    "/permission/:permissionId/status/toggle/",
    { preHandler: authorize(ModelNames.PERMISSION, StandardActions.UPDATE) },
    permissionControllers.togglePermissionStatusController
  );

  app.patch(
    "/permission/status/toggle/many/",
    {
      preHandler: authorize(ModelNames.PERMISSION, StandardActions.UPDATE_MANY),
    },
    permissionControllers.toggleManyPermissionStatusController
  );

  app.patch(
    "/permission/:permissionId/soft/",
    {
      preHandler: authorize(ModelNames.PERMISSION, StandardActions.SOFT_DELETE),
    },
    permissionControllers.softDeleteSinglePermissionController
  );

  app.patch(
    "/permission/:permissionId/soft/toggle/",
    {
      preHandler: authorize(ModelNames.PERMISSION, StandardActions.SOFT_DELETE),
    },
    permissionControllers.togglePermissionSoftDeleteController
  );

  app.patch(
    "/permission/soft/toggle/many/",
    {
      preHandler: authorize(
        ModelNames.PERMISSION,
        StandardActions.SOFT_DELETE_MANY
      ),
    },
    permissionControllers.toggleManyPermissionSoftDeleteController
  );

  app.patch(
    "/permission/bulk/soft/",
    {
      preHandler: authorize(
        ModelNames.PERMISSION,
        StandardActions.SOFT_DELETE_MANY
      ),
    },
    permissionControllers.softDeleteManyPermissionController
  );

  app.delete(
    "/permission/:permissionId/",
    {
      preHandler: authorize(ModelNames.PERMISSION, StandardActions.HARD_DELETE),
    },
    permissionControllers.hardDeleteSinglePermissionController
  );

  app.delete(
    "/permission/bulk/",
    {
      preHandler: authorize(
        ModelNames.PERMISSION,
        StandardActions.HARD_DELETE_MANY
      ),
    },
    permissionControllers.hardDeleteManyPermissionController
  );
};
