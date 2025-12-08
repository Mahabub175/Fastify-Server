import { FastifyInstance } from "fastify";
import mongoose from "mongoose";
import { IPermission } from "./permission.interface";
import { permissionModel } from "./permission.model";
import { paginateAndSort } from "../../utils/paginateAndSort";
import { throwError } from "../../utils/response";
import { cleanObject } from "../../utils/cleanObject";

// Create a permission
const createPermissionService = async (permissionData: IPermission) => {
  const result = await permissionModel.create(permissionData);
  return result;
};

// Create bulk permissions
const createBulkPermissionsService = async (
  permissions: Partial<IPermission>[]
) => {
  if (!permissions || !permissions.length)
    throw new Error("No permissions provided");

  const result = await permissionModel.insertMany(permissions);
  return result;
};

// Get all permissions with optional pagination & search
const getAllPermissionService = async (
  fastify: FastifyInstance,
  searchFields: string[],
  searchText?: string,
  filters?: Record<string, any>
) => {
  // const key = `permissions:${JSON.stringify({ searchFields, searchText, filters })}`;

  // return cacheAsync(
  //   fastify,
  //   key,
  //   async () => {
  //     const query = permissionModel.find();
  //     return paginateAndSort(query, { searchFields, searchText, filters });
  //   },
  //   60
  // );
  const query = permissionModel.find();

  return paginateAndSort(query, {
    searchFields,
    searchText,
    filters,
  });
};

// Get single permission by ID
const getSinglePermissionService = async (permissionId: string) => {
  const queryId =
    typeof permissionId === "string"
      ? new mongoose.Types.ObjectId(permissionId)
      : permissionId;

  const query = permissionModel.find({ _id: queryId });

  const result = await paginateAndSort<IPermission>(query);

  if (!result.results || !result.results.length)
    throwError("Permission not found", 404);

  return result.results[0];
};

// Update single permission
const updateSinglePermissionService = async (
  permissionId: string | number,
  permissionData: Partial<IPermission>
) => {
  const queryId =
    typeof permissionId === "string"
      ? new mongoose.Types.ObjectId(permissionId)
      : permissionId;

  const permission = await permissionModel.findById(queryId).exec();
  if (!permission) throwError("Permission not found", 404);
  else {
    permissionData = cleanObject(permissionData);

    const updated = await permissionModel
      .findByIdAndUpdate(
        queryId,
        { $set: permissionData },
        { new: true, runValidators: true, context: "query" }
      )
      .exec();

    if (!updated) throwError("Permission update failed", 500);

    return updated;
  }
};

// Toggle permission status
const togglePermissionStatusService = async (permissionId: string) => {
  if (!mongoose.Types.ObjectId.isValid(permissionId)) {
    throwError("Invalid permission ID", 400);
  }

  const permission = await permissionModel.findOne({
    _id: permissionId,
    isDeleted: { $ne: true },
  });

  if (!permission) throwError("Permission not found or already deleted", 404);
  else {
    permission.status = !permission.status;
    await permission.save();

    return permission.toObject();
  }
};

// Toggle multiple permission status
const toggleManyPermissionStatusService = async (permissionIds: string[]) => {
  const validIds = permissionIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );
  if (!validIds.length) throwError("No valid permission IDs provided!", 400);

  const result = await permissionModel.updateMany(
    {
      _id: { $in: validIds },
      isDeleted: { $ne: true },
    },
    [
      {
        $set: {
          status: { $not: "$status" },
        },
      },
    ]
  );

  if (result.matchedCount === 0)
    throwError("No permissions found or all are deleted!", 404);

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

// Soft delete single permission
const softDeleteSinglePermissionService = async (
  permissionId: string | number
) => {
  const queryId =
    typeof permissionId === "string"
      ? new mongoose.Types.ObjectId(permissionId)
      : permissionId;

  const permission = await permissionModel.findById(queryId).exec();
  if (!permission) throwError("Permission not found", 404);
  else {
    if (permission.isDeleted)
      throwError("Permission already soft deleted!", 400);

    const softDeleted = await permissionModel
      .findByIdAndUpdate(queryId, { $set: { isDeleted: true } }, { new: true })
      .exec();

    if (!softDeleted) throwError("Permission soft delete failed!", 500);

    return softDeleted;
  }
};

// Toggle permission soft delete
const togglePermissionSoftDeleteService = async (permissionId: string) => {
  if (!mongoose.Types.ObjectId.isValid(permissionId)) {
    throwError("Invalid permission ID", 400);
  }

  const permission = await permissionModel.findOne({
    _id: permissionId,
  });

  if (!permission) throwError("Permission not found!", 404);
  else {
    permission.isDeleted = !permission.isDeleted;
    await permission.save();

    return permission.toObject();
  }
};

// Toggle Soft delete multiple permissions
const toggleManyPermissionSoftDeleteService = async (
  permissionIds: string[]
) => {
  const validIds = permissionIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );
  if (!validIds.length) throwError("No valid permission IDs provided!", 400);

  const result = await permissionModel.updateMany(
    {
      _id: { $in: validIds },
    },
    [
      {
        $set: {
          isDeleted: { $not: "$isDeleted" },
        },
      },
    ]
  );

  if (result.matchedCount === 0) {
    throwError("No permissions found!", 404);
  }

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

// Recover permission
const recoverPermissionService = async (permissionIds: string[]) => {
  if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
    throw new Error("No permission IDs provided");
  }

  const validIds = permissionIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );
  if (validIds.length === 0) {
    throw new Error("No valid permission IDs provided");
  }

  const result = await permissionModel.updateMany(
    { _id: { $in: validIds } },
    { $set: { isDeleted: false } }
  );

  return {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  };
};

// Soft delete many permissions
const softDeleteManyPermissionsService = async (
  permissionIds: (string | number)[]
) => {
  if (!permissionIds || !permissionIds.length)
    throwError("No permission IDs provided", 400);

  const queryIds = permissionIds.map((id) =>
    typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
      ? new mongoose.Types.ObjectId(id)
      : typeof id === "number"
      ? id
      : throwError(`Invalid permission ID: ${id}`, 400)
  );

  const result = await permissionModel.updateMany(
    { _id: { $in: queryIds }, isDeleted: false },
    { $set: { isDeleted: true } }
  );

  if (!result.modifiedCount)
    throwError("No permissions were soft deleted", 404);

  return result;
};

// Hard delete single permission
const hardDeleteSinglePermissionService = async (
  permissionId: string | number
) => {
  const queryId =
    typeof permissionId === "string"
      ? new mongoose.Types.ObjectId(permissionId)
      : permissionId;

  const permission = await permissionModel.findById(queryId).exec();
  if (!permission) throwError("Permission not found", 404);

  const deleted = await permissionModel.findByIdAndDelete(queryId).exec();
  if (!deleted) throwError("Permission delete failed", 500);

  return deleted;
};

// Hard delete many permissions
const hardDeleteManyPermissionsService = async (
  permissionIds: (string | number)[]
) => {
  const queryIds = permissionIds.map((id) => {
    if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id))
      return new mongoose.Types.ObjectId(id);
    else if (typeof id === "number") return id;
    else throwError(`Invalid ID format: ${id}`, 400);
  });

  const result = await permissionModel
    .deleteMany({ _id: { $in: queryIds } })
    .exec();
  return result;
};

export const permissionServices = {
  createPermissionService,
  createBulkPermissionsService,
  getAllPermissionService,
  getSinglePermissionService,
  updateSinglePermissionService,
  togglePermissionStatusService,
  toggleManyPermissionStatusService,
  softDeleteSinglePermissionService,
  togglePermissionSoftDeleteService,
  toggleManyPermissionSoftDeleteService,
  softDeleteManyPermissionsService,
  recoverPermissionService,
  hardDeleteSinglePermissionService,
  hardDeleteManyPermissionsService,
};
