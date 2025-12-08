import { FastifyInstance } from "fastify";
import mongoose from "mongoose";
import { IRole } from "./role.interface";
import { roleModel } from "./role.model";
import { paginateAndSort } from "../../utils/paginateAndSort";
import { throwError } from "../../utils/response";
import { cleanObject } from "../../utils/cleanObject";

// Create a role
const createRoleService = async (roleData: IRole) => {
  const result = await roleModel.create(roleData);
  return result;
};

// Create bulk roles
const createBulkRolesService = async (roles: Partial<IRole>[]) => {
  if (!roles || !roles.length) throw new Error("No roles provided");

  const result = await roleModel.insertMany(roles);
  return result;
};

// Get all roles with optional pagination & search
const getAllRoleService = async (
  fastify: FastifyInstance,
  searchFields: string[],
  searchText?: string,
  filters?: Record<string, any>
) => {
  // const key = `roles:${JSON.stringify({ searchFields, searchText, filters })}`;

  // return cacheAsync(
  //   fastify,
  //   key,
  //   async () => {
  //     const query = roleModel.find();
  //     return paginateAndSort(query, { searchFields, searchText, filters });
  //   },
  //   60
  // );
  const query = roleModel.find().populate("permissions");

  return paginateAndSort(query, {
    searchFields,
    searchText,
    filters,
  });
};

// Get single role by ID
const getSingleRoleService = async (roleId: string) => {
  const queryId =
    typeof roleId === "string" ? new mongoose.Types.ObjectId(roleId) : roleId;

  const query = roleModel.find({ _id: queryId }).populate("permissions");

  const result = await paginateAndSort<IRole>(query);

  if (!result.results || !result.results.length)
    throwError("Role not found", 404);

  return result.results[0];
};

// Update single role
const updateSingleRoleService = async (
  roleId: string | number,
  roleData: Partial<IRole>
) => {
  const queryId =
    typeof roleId === "string" ? new mongoose.Types.ObjectId(roleId) : roleId;

  const role = await roleModel.findById(queryId).exec();
  if (!role) throwError("Role not found", 404);
  else {
    roleData = cleanObject(roleData);

    const updated = await roleModel
      .findByIdAndUpdate(
        queryId,
        { $set: roleData },
        { new: true, runValidators: true, context: "query" }
      )
      .exec();

    if (!updated) throwError("Role update failed", 500);

    return updated;
  }
};

// Toggle role status
const toggleRoleStatusService = async (roleId: string) => {
  if (!mongoose.Types.ObjectId.isValid(roleId)) {
    throwError("Invalid role ID", 400);
  }

  const role = await roleModel.findOne({
    _id: roleId,
    isDeleted: { $ne: true },
  });

  if (!role) throwError("Role not found or already deleted", 404);
  else {
    role.status = !role.status;
    await role.save();

    return role.toObject();
  }
};

// Toggle multiple role status
const toggleManyRoleStatusService = async (roleIds: string[]) => {
  const validIds = roleIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!validIds.length) throwError("No valid role IDs provided!", 400);

  const result = await roleModel.updateMany(
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
    throwError("No roles found or all are deleted!", 404);

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

// Soft delete single role
const softDeleteSingleRoleService = async (roleId: string | number) => {
  const queryId =
    typeof roleId === "string" ? new mongoose.Types.ObjectId(roleId) : roleId;

  const role = await roleModel.findById(queryId).exec();
  if (!role) throwError("Role not found", 404);
  else {
    if (role.isDeleted) throwError("Role already soft deleted!", 400);

    const softDeleted = await roleModel
      .findByIdAndUpdate(queryId, { $set: { isDeleted: true } }, { new: true })
      .exec();

    if (!softDeleted) throwError("Role soft delete failed!", 500);

    return softDeleted;
  }
};

// Toggle role soft delete
const toggleRoleSoftDeleteService = async (roleId: string) => {
  if (!mongoose.Types.ObjectId.isValid(roleId)) {
    throwError("Invalid role ID", 400);
  }

  const role = await roleModel.findOne({
    _id: roleId,
  });

  if (!role) throwError("Role not found!", 404);
  else {
    role.isDeleted = !role.isDeleted;
    await role.save();

    return role.toObject();
  }
};

// Toggle Soft delete multiple roles
const toggleManyRoleSoftDeleteService = async (roleIds: string[]) => {
  const validIds = roleIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!validIds.length) throwError("No valid role IDs provided!", 400);

  const result = await roleModel.updateMany(
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
    throwError("No roles found!", 404);
  }

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

// Recover role
const recoverRoleService = async (roleIds: string[]) => {
  if (!Array.isArray(roleIds) || roleIds.length === 0) {
    throw new Error("No role IDs provided");
  }

  const validIds = roleIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) {
    throw new Error("No valid role IDs provided");
  }

  const result = await roleModel.updateMany(
    { _id: { $in: validIds } },
    { $set: { isDeleted: false } }
  );

  return {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  };
};

// Soft delete many roles
const softDeleteManyRolesService = async (roleIds: (string | number)[]) => {
  if (!roleIds || !roleIds.length) throwError("No role IDs provided", 400);

  const queryIds = roleIds.map((id) =>
    typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
      ? new mongoose.Types.ObjectId(id)
      : typeof id === "number"
      ? id
      : throwError(`Invalid role ID: ${id}`, 400)
  );

  const result = await roleModel.updateMany(
    { _id: { $in: queryIds }, isDeleted: false },
    { $set: { isDeleted: true } }
  );

  if (!result.modifiedCount) throwError("No roles were soft deleted", 404);

  return result;
};

// Hard delete single role
const hardDeleteSingleRoleService = async (roleId: string | number) => {
  const queryId =
    typeof roleId === "string" ? new mongoose.Types.ObjectId(roleId) : roleId;

  const role = await roleModel.findById(queryId).exec();
  if (!role) throwError("Role not found", 404);

  const deleted = await roleModel.findByIdAndDelete(queryId).exec();
  if (!deleted) throwError("Role delete failed", 500);

  return deleted;
};

// Hard delete many roles
const hardDeleteManyRolesService = async (roleIds: (string | number)[]) => {
  const queryIds = roleIds.map((id) => {
    if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id))
      return new mongoose.Types.ObjectId(id);
    else if (typeof id === "number") return id;
    else throwError(`Invalid ID format: ${id}`, 400);
  });

  const result = await roleModel.deleteMany({ _id: { $in: queryIds } }).exec();
  return result;
};

export const roleServices = {
  createRoleService,
  createBulkRolesService,
  getAllRoleService,
  getSingleRoleService,
  updateSingleRoleService,
  toggleRoleStatusService,
  toggleManyRoleStatusService,
  softDeleteSingleRoleService,
  toggleRoleSoftDeleteService,
  toggleManyRoleSoftDeleteService,
  softDeleteManyRolesService,
  recoverRoleService,
  hardDeleteSingleRoleService,
  hardDeleteManyRolesService,
};
