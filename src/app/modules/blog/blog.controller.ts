import { FastifyRequest, FastifyReply } from "fastify";
import { blogServices } from "./blog.service";
import { responseError, responseSuccess } from "../../utils/response";
import { IBlog } from "./blog.interface";
import { parseMultipartBody } from "../../utils/parsedBodyData";
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

// Get all blogs
const getAllBlogController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const query = req.query as Record<string, any>;
    const pageNumber = query.page ? parseInt(query.page, 10) : undefined;
    const pageSize = query.limit ? parseInt(query.limit, 10) : undefined;
    const searchText = query.searchText as string | undefined;
    const searchFields = ["name"];
    const result = await blogServices.getAllBlogService(
      pageNumber,
      pageSize,
      searchText,
      searchFields
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

// Delete single blog
const deleteSingleBlogController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = req.params as { blogId: string };
    await blogServices.deleteSingleBlogService(params.blogId);

    return responseSuccess(reply, null, "Blog Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Delete many blogs
const deleteManyBlogsController = async (
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

    const result = await blogServices.deleteManyBlogsService(blogIds);

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
  getAllBlogController,
  getSingleBlogController,
  getSingleBlogBySlugController,
  updateSingleBlogController,
  deleteSingleBlogController,
  deleteManyBlogsController,
};
