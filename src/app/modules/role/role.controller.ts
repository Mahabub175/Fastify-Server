import { FastifyRequest, FastifyReply } from "fastify";
import { roleServices } from "./role.service";
import { responseError, responseSuccess } from "../../utils/response";
import { IRole } from "./role.interface";
import {
  parseMultipartBody,
  parseQueryFilters,
} from "../../utils/parsedBodyData";

// Create a role
const createRoleController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const data = parseMultipartBody(req.body as Record<string, any>);

    const result = await roleServices.createRoleService(data as IRole);

    return responseSuccess(reply, result, "Role Created Successfully");
  } catch (error: any) {
    throw error;
  }
};

// Create bulk roles
const createBulkRolesController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const roles = parseMultipartBody(req.body as Record<string, any>);

    if (!Array.isArray(roles) || !roles.length) {
      return responseError(reply, "No roles provided", 400);
    }

    const createdRoles = await roleServices.createBulkRolesService(roles);

    return responseSuccess(
      reply,
      createdRoles,
      `${createdRoles.length} roles created successfully`
    );
  } catch (err: any) {
    return responseError(
      reply,
      err.message || "Failed to create roles",
      500,
      err
    );
  }
};

// Get all roles
const getAllRoleController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const searchFields = ["name"];

    const { filters, searchText } = parseQueryFilters(
      req.query as Record<string, any>
    );

    const result = await roleServices.getAllRoleService(
      req.server,
      searchFields,
      searchText,
      filters
    );

    return responseSuccess(reply, result, "Roles Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single role by ID
const getSingleRoleController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { roleId: string };
    const result = await roleServices.getSingleRoleService(params.roleId);

    return responseSuccess(reply, result, "Role Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Update single role
const updateSingleRoleController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { roleId: string };
    const data = parseMultipartBody(req.body as Record<string, any>);
    const roleData: Partial<IRole> = { ...data };

    const result = await roleServices.updateSingleRoleService(
      params.roleId,
      roleData as IRole
    );

    return responseSuccess(reply, result, "Role Updated Successfully!");
  } catch (error: any) {
    console.error("Update role error:", error);
    throw error;
  }
};

// Toggle role status
const toggleRoleStatusController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { roleId: string };
    await roleServices.toggleRoleStatusService(params.roleId);

    return responseSuccess(reply, null, "Role Status Toggled Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Toggle many role status
const toggleManyRoleStatusController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const roleIds = req.body as string[];

    if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Role IDs array provided",
        500
      );
    }

    const result = await roleServices.toggleManyRoleStatusService(roleIds);

    return responseSuccess(
      reply,
      null,
      `Toggled Status for ${result.modifiedCount} Roles Successfully! `
    );
  } catch (error: any) {
    throw error;
  }
};

// Soft delete single role
const softDeleteSingleRoleController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { roleId: string };
    await roleServices.softDeleteSingleRoleService(params.roleId);

    return responseSuccess(reply, null, "Role Soft Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Toggle role soft delete
const toggleRoleSoftDeleteController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { roleId: string };
    await roleServices.toggleRoleSoftDeleteService(params.roleId);

    return responseSuccess(
      reply,
      null,
      "Role Soft Delete Toggled Successfully!"
    );
  } catch (error: any) {
    throw error;
  }
};

// Toggle many role soft delete
const toggleManyRoleSoftDeleteController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const roleIds = req.body as string[];

    if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Role IDs array provided",
        500
      );
    }
    const result = await roleServices.toggleManyRoleSoftDeleteService(roleIds);

    return responseSuccess(
      reply,
      null,
      `Toggled Soft Delete for ${result.modifiedCount} Roles Successfully!`
    );
  } catch (error: any) {
    throw error;
  }
};

// Recover role
const recoverRoleController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const roleIds = req.body as string[];

    if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Role IDs array provided",
        500
      );
    }

    const result = await roleServices.recoverRoleService(roleIds);

    return responseSuccess(
      reply,
      null,
      `Recovered ${result.modifiedCount} Roles Successfully!`
    );
  } catch (error: any) {
    throw error;
  }
};

// Soft delete many roles
const softDeleteManyRoleController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const roleIds = req.body as string[];

    if (!Array.isArray(roleIds) || roleIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Role IDs array provided",
        500
      );
    }

    const result = await roleServices.softDeleteManyRolesService(roleIds);

    return responseSuccess(
      reply,
      null,
      `Soft Deleted ${result.modifiedCount} Roles Successfully!`
    );
  } catch (error: any) {
    throw error;
  }
};

// Hard delete single role
const hardDeleteSingleRoleController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { roleId: string };
    await roleServices.hardDeleteSingleRoleService(params.roleId);

    return responseSuccess(reply, null, "Role Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Hard delete many roles
const hardDeleteManyRoleController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const roleIds = req.body as string[];

    if (!Array.isArray(roleIds) || roleIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Role IDs array provided",
        500
      );
    }

    const result = await roleServices.hardDeleteManyRolesService(roleIds);

    return responseSuccess(
      reply,
      null,
      `Deleted ${result.deletedCount} Roles Successfully!`
    );
  } catch (error: any) {
    throw error;
  }
};

export const roleControllers = {
  createRoleController,
  createBulkRolesController,
  getAllRoleController,
  getSingleRoleController,
  updateSingleRoleController,
  toggleRoleStatusController,
  toggleManyRoleStatusController,
  softDeleteSingleRoleController,
  toggleRoleSoftDeleteController,
  toggleManyRoleSoftDeleteController,
  softDeleteManyRoleController,
  recoverRoleController,
  hardDeleteSingleRoleController,
  hardDeleteManyRoleController,
};
