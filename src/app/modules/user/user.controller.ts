import { FastifyRequest, FastifyReply } from "fastify";
import { userServices } from "./user.service";
import { responseError, responseSuccess } from "../../utils/response";
import { IUser } from "./user.interface";
import {
  parseMultipartBody,
  parseQueryFilters,
} from "../../utils/parsedBodyData";
import { uploadService } from "../upload/upload.service";
import { authServices } from "../auth/auth.service";

// Create a user
const createUserController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const data = parseMultipartBody(req.body as Record<string, any>);

    const attachmentPath = await uploadService(req, "attachment");
    const imagesPath = await uploadService(req, "images");

    const images = Array.isArray(imagesPath)
      ? imagesPath
      : imagesPath
      ? [imagesPath]
      : [];

    const formData: Partial<IUser> = {
      ...data,
      ...(attachmentPath ? { attachment: attachmentPath } : {}),
      ...(images.length ? { images } : {}),
    };

    const createdUser = await userServices.createUserService(formData as IUser);

    const loginPayload = {
      id: createdUser.email || createdUser.phoneNumber || createdUser.userName,
      password: data.password,
    };

    const loginResult = await authServices.loginUserService(loginPayload);

    const responseData = {
      user: createdUser,
      login: loginResult,
    };

    return responseSuccess(
      reply,
      responseData,
      "User Created & Logged In Successfully!"
    );
  } catch (error: any) {
    throw error;
  }
};

// Create bulk users
const createBulkUsersController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const users = parseMultipartBody(req.body as Record<string, any>);

    if (!Array.isArray(users) || !users.length) {
      return responseError(reply, "No users provided", 400);
    }

    const createdUsers = await userServices.createBulkUsersService(users);

    return responseSuccess(
      reply,
      createdUsers,
      `${createdUsers.length} users created successfully`
    );
  } catch (err: any) {
    return responseError(
      reply,
      err.message || "Failed to create users",
      500,
      err
    );
  }
};

// Get all users
const getAllUserController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const searchFields = ["name"];

    const { filters, searchText } = parseQueryFilters(
      req.query as Record<string, any>
    );

    const result = await userServices.getAllUserService(
      req.server,
      searchFields,
      searchText,
      filters
    );

    return responseSuccess(reply, result, "Users Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single user by ID
const getSingleUserController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { userId: string };
    const result = await userServices.getSingleUserService(params.userId);

    return responseSuccess(reply, result, "User Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Update single user
const updateSingleUserController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { userId: string };
    const data = parseMultipartBody(req.body as Record<string, any>);
    const userData: Partial<IUser> = { ...data };

    const attachmentPath = await uploadService(req, "attachment");
    if (attachmentPath && typeof attachmentPath === "string") {
      userData.attachment = attachmentPath;
    }

    if (
      data.images === undefined ||
      (Array.isArray(data.images) && !data.images.length)
    ) {
      delete data.images;
    }

    const imageResult = await uploadService(req, "images");
    const images = Array.isArray(imageResult)
      ? imageResult
      : imageResult
      ? [imageResult]
      : [];

    if (images.length > 0) {
      userData.images = images;
    }

    const result = await userServices.updateSingleUserService(
      params.userId,
      userData as IUser
    );

    return responseSuccess(reply, result, "User Updated Successfully!");
  } catch (error: any) {
    console.error("Update user error:", error);
    throw error;
  }
};

// Toggle user status
const toggleUserStatusController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { userId: string };
    await userServices.toggleUserStatusService(params.userId);

    return responseSuccess(reply, null, "User Status Toggled Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Toggle many user status
const toggleManyUserStatusController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userIds = req.body as string[];

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty User IDs array provided",
        500
      );
    }

    const result = await userServices.toggleManyUserStatusService(userIds);

    return responseSuccess(
      reply,
      null,
      `Toggled Status for ${result.modifiedCount} Users Successfully! `
    );
  } catch (error: any) {
    throw error;
  }
};

// Soft delete single user
const softDeleteSingleUserController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { userId: string };
    await userServices.softDeleteSingleUserService(params.userId);

    return responseSuccess(reply, null, "User Soft Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Toggle user soft delete
const toggleUserSoftDeleteController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { userId: string };
    await userServices.toggleUserSoftDeleteService(params.userId);

    return responseSuccess(
      reply,
      null,
      "User Soft Delete Toggled Successfully!"
    );
  } catch (error: any) {
    throw error;
  }
};

// Toggle many user soft delete
const toggleManyUserSoftDeleteController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userIds = req.body as string[];

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty User IDs array provided",
        500
      );
    }
    const result = await userServices.toggleManyUserSoftDeleteService(userIds);

    return responseSuccess(
      reply,
      null,
      `Toggled Soft Delete for ${result.modifiedCount} Users Successfully!`
    );
  } catch (error: any) {
    throw error;
  }
};

// Recover user
const recoverUserController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userIds = req.body as string[];

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty User IDs array provided",
        500
      );
    }

    const result = await userServices.recoverUserService(userIds);

    return responseSuccess(
      reply,
      null,
      `Recovered ${result.modifiedCount} Users Successfully!`
    );
  } catch (error: any) {
    throw error;
  }
};

// Soft delete many users
const softDeleteManyUserController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userIds = req.body as string[];

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty User IDs array provided",
        500
      );
    }

    const result = await userServices.softDeleteManyUsersService(userIds);

    return responseSuccess(
      reply,
      null,
      `Soft Deleted ${result.modifiedCount} Users Successfully!`
    );
  } catch (error: any) {
    throw error;
  }
};

// Hard delete single user
const hardDeleteSingleUserController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { userId: string };
    await userServices.hardDeleteSingleUserService(params.userId);

    return responseSuccess(reply, null, "User Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Hard delete many users
const hardDeleteManyUserController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userIds = req.body as string[];

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty User IDs array provided",
        500
      );
    }

    const result = await userServices.hardDeleteManyUsersService(userIds);

    return responseSuccess(
      reply,
      null,
      `Deleted ${result.deletedCount} Users Successfully!`
    );
  } catch (error: any) {
    throw error;
  }
};

export const userControllers = {
  createUserController,
  createBulkUsersController,
  getAllUserController,
  getSingleUserController,
  updateSingleUserController,
  toggleUserStatusController,
  toggleManyUserStatusController,
  softDeleteSingleUserController,
  toggleUserSoftDeleteController,
  toggleManyUserSoftDeleteController,
  softDeleteManyUserController,
  recoverUserController,
  hardDeleteSingleUserController,
  hardDeleteManyUserController,
};
