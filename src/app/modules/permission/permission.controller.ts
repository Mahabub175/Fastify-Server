import { FastifyRequest, FastifyReply } from "fastify";
import { permissionServices } from "./permission.service";
import { responseError, responseSuccess } from "../../utils/response";
import { IPermission } from "./permission.interface";
import {
  parseMultipartBody,
  parseQueryFilters,
} from "../../utils/parsedBodyData";

// Create a permission
const createPermissionController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const data = parseMultipartBody(req.body as Record<string, any>);

    const result = await permissionServices.createPermissionService(
      data as IPermission
    );

    return responseSuccess(reply, result, "Permission Created Successfully");
  } catch (error: any) {
    throw error;
  }
};

// Create bulk permissions
const createBulkPermissionsController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const permissions = parseMultipartBody(req.body as Record<string, any>);

    if (!Array.isArray(permissions) || !permissions.length) {
      return responseError(reply, "No permissions provided", 400);
    }

    const createdPermissions =
      await permissionServices.createBulkPermissionsService(permissions);

    return responseSuccess(
      reply,
      createdPermissions,
      `${createdPermissions.length} permissions created successfully`
    );
  } catch (err: any) {
    return responseError(
      reply,
      err.message || "Failed to create permissions",
      500,
      err
    );
  }
};

// Get all permissions
const getAllPermissionController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const searchFields = ["name"];

    const { filters, searchText } = parseQueryFilters(
      req.query as Record<string, any>
    );

    const result = await permissionServices.getAllPermissionService(
      req.server,
      searchFields,
      searchText,
      filters
    );

    return responseSuccess(reply, result, "Permissions Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single permission by ID
const getSinglePermissionController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { permissionId: string };
    const result = await permissionServices.getSinglePermissionService(
      params.permissionId
    );

    return responseSuccess(reply, result, "Permission Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Update single permission
const updateSinglePermissionController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { permissionId: string };
    const data = parseMultipartBody(req.body as Record<string, any>);
    const permissionData: Partial<IPermission> = { ...data };

    const result = await permissionServices.updateSinglePermissionService(
      params.permissionId,
      permissionData as IPermission
    );

    return responseSuccess(reply, result, "Permission Updated Successfully!");
  } catch (error: any) {
    console.error("Update permission error:", error);
    throw error;
  }
};

// Toggle permission status
const togglePermissionStatusController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { permissionId: string };
    await permissionServices.togglePermissionStatusService(params.permissionId);

    return responseSuccess(
      reply,
      null,
      "Permission Status Toggled Successfully!"
    );
  } catch (error: any) {
    throw error;
  }
};

// Toggle many permission status
const toggleManyPermissionStatusController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const permissionIds = req.body as string[];

    if (
      !permissionIds ||
      !Array.isArray(permissionIds) ||
      permissionIds.length === 0
    ) {
      return responseError(
        reply,
        "Invalid or empty Permission IDs array provided",
        500
      );
    }

    const result = await permissionServices.toggleManyPermissionStatusService(
      permissionIds
    );

    return responseSuccess(
      reply,
      null,
      `Toggled Status for ${result.modifiedCount} Permissions Successfully! `
    );
  } catch (error: any) {
    throw error;
  }
};

// Soft delete single permission
const softDeleteSinglePermissionController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { permissionId: string };
    await permissionServices.softDeleteSinglePermissionService(
      params.permissionId
    );

    return responseSuccess(
      reply,
      null,
      "Permission Soft Deleted Successfully!"
    );
  } catch (error: any) {
    throw error;
  }
};

// Toggle permission soft delete
const togglePermissionSoftDeleteController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { permissionId: string };
    await permissionServices.togglePermissionSoftDeleteService(
      params.permissionId
    );

    return responseSuccess(
      reply,
      null,
      "Permission Soft Delete Toggled Successfully!"
    );
  } catch (error: any) {
    throw error;
  }
};

// Toggle many permission soft delete
const toggleManyPermissionSoftDeleteController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const permissionIds = req.body as string[];

    if (
      !permissionIds ||
      !Array.isArray(permissionIds) ||
      permissionIds.length === 0
    ) {
      return responseError(
        reply,
        "Invalid or empty Permission IDs array provided",
        500
      );
    }
    const result =
      await permissionServices.toggleManyPermissionSoftDeleteService(
        permissionIds
      );

    return responseSuccess(
      reply,
      null,
      `Toggled Soft Delete for ${result.modifiedCount} Permissions Successfully!`
    );
  } catch (error: any) {
    throw error;
  }
};

// Recover permission
const recoverPermissionController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const permissionIds = req.body as string[];

    if (
      !permissionIds ||
      !Array.isArray(permissionIds) ||
      permissionIds.length === 0
    ) {
      return responseError(
        reply,
        "Invalid or empty Permission IDs array provided",
        500
      );
    }

    const result = await permissionServices.recoverPermissionService(
      permissionIds
    );

    return responseSuccess(
      reply,
      null,
      `Recovered ${result.modifiedCount} Permissions Successfully!`
    );
  } catch (error: any) {
    throw error;
  }
};

// Soft delete many permissions
const softDeleteManyPermissionController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const permissionIds = req.body as string[];

    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Permission IDs array provided",
        500
      );
    }

    const result = await permissionServices.softDeleteManyPermissionsService(
      permissionIds
    );

    return responseSuccess(
      reply,
      null,
      `Soft Deleted ${result.modifiedCount} Permissions Successfully!`
    );
  } catch (error: any) {
    throw error;
  }
};

// Hard delete single permission
const hardDeleteSinglePermissionController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { permissionId: string };
    await permissionServices.hardDeleteSinglePermissionService(
      params.permissionId
    );

    return responseSuccess(reply, null, "Permission Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Hard delete many permissions
const hardDeleteManyPermissionController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const permissionIds = req.body as string[];

    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Permission IDs array provided",
        500
      );
    }

    const result = await permissionServices.hardDeleteManyPermissionsService(
      permissionIds
    );

    return responseSuccess(
      reply,
      null,
      `Deleted ${result.deletedCount} Permissions Successfully!`
    );
  } catch (error: any) {
    throw error;
  }
};

export const permissionControllers = {
  createPermissionController,
  createBulkPermissionsController,
  getAllPermissionController,
  getSinglePermissionController,
  updateSinglePermissionController,
  togglePermissionStatusController,
  toggleManyPermissionStatusController,
  softDeleteSinglePermissionController,
  togglePermissionSoftDeleteController,
  toggleManyPermissionSoftDeleteController,
  softDeleteManyPermissionController,
  recoverPermissionController,
  hardDeleteSinglePermissionController,
  hardDeleteManyPermissionController,
};
