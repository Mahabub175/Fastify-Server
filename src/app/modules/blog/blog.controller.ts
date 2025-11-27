import { FastifyRequest, FastifyReply } from "fastify";
import { blogServices } from "./blog.service";
import { responseError, responseSuccess } from "../../utils/response";
import { IBlog } from "./blog.interface";
import {
  parseMultipartBody,
  parseQueryFilters,
} from "../../utils/parsedBodyData";
import { uploadService } from "../upload/upload.service";

// Create a blog
const createBlogController = async (
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

    const formData = {
      ...data,
      ...(attachmentPath ? { attachment: attachmentPath } : {}),
      ...(images.length ? { images } : {}),
    };

    const result = await blogServices.createBlogService(formData as IBlog);

    return responseSuccess(reply, result, "Blog Created Successfully");
  } catch (error: any) {
    throw error;
  }
};

// Create bulk blogs
const createBulkBlogsController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const blogs = parseMultipartBody(req.body as Record<string, any>);

    if (!Array.isArray(blogs) || !blogs.length) {
      return responseError(reply, "No blogs provided", 400);
    }

    const createdBlogs = await blogServices.createBulkBlogsService(blogs);

    return responseSuccess(
      reply,
      createdBlogs,
      `${createdBlogs.length} blogs created successfully`
    );
  } catch (err: any) {
    return responseError(
      reply,
      err.message || "Failed to create blogs",
      500,
      err
    );
  }
};

// Get all blogs
const getAllBlogController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const searchFields = ["name"];

    const { filters, searchText } = parseQueryFilters(
      req.query as Record<string, any>
    );

    const result = await blogServices.getAllBlogService(
      searchFields,
      searchText,
      filters
    );

    return responseSuccess(reply, result, "Blogs Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single blog by ID
const getSingleBlogController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { blogId: string };
    const result = await blogServices.getSingleBlogService(params.blogId);

    return responseSuccess(reply, result, "Blog Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single blog by slug
const getSingleBlogBySlugController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { blogSlug: string };
    const result = await blogServices.getSingleBlogBySlugService(
      params.blogSlug
    );

    return responseSuccess(reply, result, "Blog by Slug Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Update single blog
const updateSingleBlogController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { blogId: string };
    const data = parseMultipartBody(req.body as Record<string, any>);
    const blogData: Partial<IBlog> = { ...data };

    const attachmentPath = await uploadService(req, "attachment");
    if (attachmentPath && typeof attachmentPath === "string") {
      blogData.attachment = attachmentPath;
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
      blogData.images = images;
    }

    const result = await blogServices.updateSingleBlogService(
      params.blogId,
      blogData as IBlog
    );

    return responseSuccess(reply, result, "Blog Updated Successfully!");
  } catch (error: any) {
    console.error("Update blog error:", error);
    throw error;
  }
};

// Soft delete single blog
const softDeleteSingleBlogController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { blogId: string };
    await blogServices.softDeleteSingleBlogService(params.blogId);

    return responseSuccess(reply, null, "Blog Soft Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Soft delete many blogs
const softDeleteManyBlogController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const blogIds = req.body as string[];

    if (!Array.isArray(blogIds) || blogIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Blog IDs array provided",
        500
      );
    }

    const result = await blogServices.softDeleteManyBlogsService(blogIds);

    return responseSuccess(
      reply,
      null,
      `Bulk Blog Soft Delete Successful! Soft Deleted ${result.modifiedCount} Blogs.`
    );
  } catch (error: any) {
    throw error;
  }
};

// Hard delete single blog
const hardDeleteSingleBlogController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { blogId: string };
    await blogServices.hardDeleteSingleBlogService(params.blogId);

    return responseSuccess(reply, null, "Blog Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Hard delete many blogs
const hardDeleteManyBlogController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const blogIds = req.body as string[];

    if (!Array.isArray(blogIds) || blogIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Blog IDs array provided",
        500
      );
    }

    const result = await blogServices.hardDeleteManyBlogsService(blogIds);

    return responseSuccess(
      reply,
      null,
      `Bulk Blog Delete Successful! Deleted ${result.deletedCount} Blogs.`
    );
  } catch (error: any) {
    throw error;
  }
};

export const blogControllers = {
  createBlogController,
  createBulkBlogsController,
  getAllBlogController,
  getSingleBlogController,
  getSingleBlogBySlugController,
  updateSingleBlogController,
  softDeleteSingleBlogController,
  softDeleteManyBlogController,
  hardDeleteSingleBlogController,
  hardDeleteManyBlogController,
};
