import { FastifyInstance } from "fastify";
import mongoose from "mongoose";
import { IUser } from "./user.interface";
import { userModel } from "./user.model";
import { paginateAndSort } from "../../utils/paginateAndSort";
import { throwError } from "../../utils/response";
import { deleteFileSync } from "../../utils/deleteFilesFromStorage";
import { cleanObject } from "../../utils/cleanObject";

// Create a user
const createUserService = async (userData: IUser) => {
  const result = await userModel.create(userData);
  return result;
};

// Create bulk users
const createBulkUsersService = async (users: Partial<IUser>[]) => {
  if (!users || !users.length) throw new Error("No users provided");

  const result = await userModel.insertMany(users);
  return result;
};

// Get all users with optional pagination & search
const getAllUserService = async (
  fastify: FastifyInstance,
  searchFields: string[],
  searchText?: string,
  filters?: Record<string, any>
) => {
  // const key = `users:${JSON.stringify({ searchFields, searchText, filters })}`;

  // return cacheAsync(
  //   fastify,
  //   key,
  //   async () => {
  //     const query = userModel.find();
  //     return paginateAndSort(query, { searchFields, searchText, filters });
  //   },
  //   60
  // );

  const query = userModel
    .find()
    .select("-password")
    .populate({
      path: "role",
      select: "name isDeleted status",
      populate: {
        path: "permissions",
        model: "permission",
        select: "name isDeleted status",
      },
    });

  return paginateAndSort(query, {
    searchFields,
    searchText,
    filters,
  });
};

// Get single user by ID
const getSingleUserService = async (userId: string) => {
  const queryId =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const query = userModel
    .find({ _id: queryId })
    .select("-password")
    .populate({
      path: "role",
      select: "name isDeleted status",
      populate: {
        path: "permissions",
        model: "permission",
        select: "name isDeleted status",
      },
    });

  const result = await paginateAndSort<IUser>(query);

  if (!result.results || !result.results.length)
    throwError("User not found", 404);

  return result.results[0];
};

// Update single user
const updateSingleUserService = async (
  userId: string | number,
  userData: Partial<IUser>
) => {
  const queryId =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const user = await userModel.findById(queryId).exec();
  if (!user) throwError("User not found", 404);
  else {
    userData = cleanObject(userData);

    if (
      userData.attachment &&
      user.attachment &&
      userData.attachment !== user.attachment
    ) {
      deleteFileSync(user.attachment);
    }

    if (userData.images && userData.images.length > 0 && user.images?.length) {
      for (const oldImg of user.images) {
        deleteFileSync(oldImg);
      }
    }

    const updated = await userModel
      .findByIdAndUpdate(
        queryId,
        { $set: userData },
        { new: true, runValidators: true, context: "query" }
      )
      .exec();

    if (!updated) throwError("User update failed", 500);

    return updated;
  }
};

// Toggle user status
const toggleUserStatusService = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throwError("Invalid user ID", 400);
  }

  const user = await userModel.findOne({
    _id: userId,
    isDeleted: { $ne: true },
  });

  if (!user) throwError("User not found or already deleted", 404);
  else {
    user.status = !user.status;
    await user.save();

    return user.toObject();
  }
};

// Toggle multiple user status
const toggleManyUserStatusService = async (userIds: string[]) => {
  const validIds = userIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!validIds.length) throwError("No valid user IDs provided!", 400);

  const result = await userModel.updateMany(
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
    throwError("No users found or all are deleted!", 404);

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

// Soft delete single user
const softDeleteSingleUserService = async (userId: string | number) => {
  const queryId =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const user = await userModel.findById(queryId).exec();
  if (!user) throwError("User not found", 404);
  else {
    if (user.isDeleted) throwError("User already soft deleted!", 400);

    const softDeleted = await userModel
      .findByIdAndUpdate(queryId, { $set: { isDeleted: true } }, { new: true })
      .exec();

    if (!softDeleted) throwError("User soft delete failed!", 500);

    return softDeleted;
  }
};

// Toggle user soft delete
const toggleUserSoftDeleteService = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throwError("Invalid user ID", 400);
  }

  const user = await userModel.findOne({
    _id: userId,
  });

  if (!user) throwError("User not found!", 404);
  else {
    user.isDeleted = !user.isDeleted;
    await user.save();

    return user.toObject();
  }
};

// Toggle Soft delete multiple users
const toggleManyUserSoftDeleteService = async (userIds: string[]) => {
  const validIds = userIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!validIds.length) throwError("No valid user IDs provided!", 400);

  const result = await userModel.updateMany(
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
    throwError("No users found!", 404);
  }

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

// Recover user
const recoverUserService = async (userIds: string[]) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new Error("No user IDs provided");
  }

  const validIds = userIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) {
    throw new Error("No valid user IDs provided");
  }

  const result = await userModel.updateMany(
    { _id: { $in: validIds } },
    { $set: { isDeleted: false } }
  );

  return {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  };
};

// Soft delete many users
const softDeleteManyUsersService = async (userIds: (string | number)[]) => {
  if (!userIds || !userIds.length) throwError("No user IDs provided", 400);

  const queryIds = userIds.map((id) =>
    typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
      ? new mongoose.Types.ObjectId(id)
      : typeof id === "number"
      ? id
      : throwError(`Invalid user ID: ${id}`, 400)
  );

  const result = await userModel.updateMany(
    { _id: { $in: queryIds }, isDeleted: false },
    { $set: { isDeleted: true } }
  );

  if (!result.modifiedCount) throwError("No users were soft deleted", 404);

  return result;
};

// Hard delete single user
const hardDeleteSingleUserService = async (userId: string | number) => {
  const queryId =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const user = await userModel.findById(queryId).exec();
  if (!user) throwError("User not found", 404);
  else {
    if (user.attachment) {
      deleteFileSync(user.attachment);
    }

    if (user.images?.length) {
      for (const img of user.images) {
        deleteFileSync(img);
      }
    }

    const deleted = await userModel.findByIdAndDelete(queryId).exec();
    if (!deleted) throwError("User delete failed", 500);

    return deleted;
  }
};

// Hard delete many users
const hardDeleteManyUsersService = async (userIds: (string | number)[]) => {
  const queryIds = userIds.map((id) => {
    if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id))
      return new mongoose.Types.ObjectId(id);
    else if (typeof id === "number") return id;
    else throwError(`Invalid ID format: ${id}`, 400);
  });

  const users = await userModel.find({ _id: { $in: queryIds } }).exec();

  for (const user of users) {
    if (user?.attachment) {
      deleteFileSync(user.attachment);
    }

    if (user?.images?.length) {
      for (const img of user.images) {
        deleteFileSync(img);
      }
    }
  }

  const result = await userModel.deleteMany({ _id: { $in: queryIds } }).exec();
  return result;
};

export const userServices = {
  createUserService,
  createBulkUsersService,
  getAllUserService,
  getSingleUserService,
  updateSingleUserService,
  toggleUserStatusService,
  toggleManyUserStatusService,
  softDeleteSingleUserService,
  toggleUserSoftDeleteService,
  toggleManyUserSoftDeleteService,
  softDeleteManyUsersService,
  recoverUserService,
  hardDeleteSingleUserService,
  hardDeleteManyUsersService,
};
