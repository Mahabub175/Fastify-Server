import { FastifyInstance } from "fastify";
import { roleControllers } from "./role.controller";
import { authorize } from "../../middlewares/authorize";
import { ModelNames, StandardActions } from "../../global/global.constants";

export const roleRoutes = async (app: FastifyInstance) => {
  app.post(
    "/role/",
    { preHandler: authorize(ModelNames.ROLE, StandardActions.CREATE) },
    roleControllers.createRoleController
  );

  app.post(
    "/role/bulk/",
    { preHandler: authorize(ModelNames.ROLE, StandardActions.CREATE) },
    roleControllers.createBulkRolesController
  );

  app.post(
    "/role/recover/",
    { preHandler: authorize(ModelNames.ROLE, StandardActions.RECOVER) },
    roleControllers.recoverRoleController
  );

  app.get(
    "/role/",
    { preHandler: authorize(ModelNames.ROLE, StandardActions.READ_MANY) },
    roleControllers.getAllRoleController
  );

  app.get(
    "/role/:roleId/",
    { preHandler: authorize(ModelNames.ROLE, StandardActions.READ) },
    roleControllers.getSingleRoleController
  );

  app.patch(
    "/role/:roleId/",
    { preHandler: authorize(ModelNames.ROLE, StandardActions.UPDATE) },
    roleControllers.updateSingleRoleController
  );

  app.patch(
    "/role/:roleId/status/toggle/",
    { preHandler: authorize(ModelNames.ROLE, StandardActions.UPDATE) },
    roleControllers.toggleRoleStatusController
  );

  app.patch(
    "/role/status/toggle/many/",
    {
      preHandler: authorize(ModelNames.ROLE, StandardActions.UPDATE_MANY),
    },
    roleControllers.toggleManyRoleStatusController
  );

  app.patch(
    "/role/:roleId/soft/",
    {
      preHandler: authorize(ModelNames.ROLE, StandardActions.SOFT_DELETE),
    },
    roleControllers.softDeleteSingleRoleController
  );

  app.patch(
    "/role/:roleId/soft/toggle/",
    {
      preHandler: authorize(ModelNames.ROLE, StandardActions.SOFT_DELETE),
    },
    roleControllers.toggleRoleSoftDeleteController
  );

  app.patch(
    "/role/soft/toggle/many/",
    {
      preHandler: authorize(ModelNames.ROLE, StandardActions.SOFT_DELETE_MANY),
    },
    roleControllers.toggleManyRoleSoftDeleteController
  );

  app.patch(
    "/role/bulk/soft/",
    {
      preHandler: authorize(ModelNames.ROLE, StandardActions.SOFT_DELETE_MANY),
    },
    roleControllers.softDeleteManyRoleController
  );

  app.delete(
    "/role/:roleId/",
    {
      preHandler: authorize(ModelNames.ROLE, StandardActions.HARD_DELETE),
    },
    roleControllers.hardDeleteSingleRoleController
  );

  app.delete(
    "/role/bulk/",
    {
      preHandler: authorize(ModelNames.ROLE, StandardActions.HARD_DELETE_MANY),
    },
    roleControllers.hardDeleteManyRoleController
  );
};
