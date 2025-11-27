import mongoose from "mongoose";
import { IBlog } from "./blog.interface";
import { blogModel } from "./blog.model";
import { generateSlug } from "../../utils/generateSlug";
import { paginateAndSort } from "../../utils/paginateAndSort";
import { throwError } from "../../utils/response";
import { deleteFileSync } from "../../utils/deleteFilesFromStorage";
import { cleanObject } from "../../utils/cleanObject";

// Create a blog
const createBlogService = async (blogData: IBlog) => {
  const result = await blogModel.create(blogData);
  return result;
};

// Create bulk blogs
const createBulkBlogsService = async (blogs: Partial<IBlog>[]) => {
  if (!blogs || !blogs.length) throw new Error("No blogs provided");

  const result = await blogModel.insertMany(blogs);
  return result;
};

// Get all blogs with optional pagination & search
const getAllBlogService = async (
  searchFields: string[],
  searchText?: string,
  filters?: Record<string, any>
) => {
  const query = blogModel.find();

  return paginateAndSort(query, {
    searchFields,
    searchText,
    filters,
    sort: { field: "createdAt", order: "desc" },
  });
};

// Get single blog by ID
const getSingleBlogService = async (blogId: string) => {
  const queryId =
    typeof blogId === "string" ? new mongoose.Types.ObjectId(blogId) : blogId;

  const result = await paginateAndSort<IBlog>(
    blogModel.find({ _id: queryId }),
    {
      filters: {},
    }
  );

  if (!result.results || !result.results.length)
    throwError("Blog not found", 404);

  return result.results[0];
};

// Get single blog by slug
const getSingleBlogBySlugService = async (slug: string) => {
  const result = await paginateAndSort<IBlog>(blogModel.find({ slug }), {
    filters: {},
  });

  if (!result.results || !result.results.length)
    throwError("Blog not found!", 404);

  return result.results[0];
};

// Update single blog
const updateSingleBlogService = async (
  blogId: string | number,
  blogData: Partial<IBlog>
) => {
  const queryId =
    typeof blogId === "string" ? new mongoose.Types.ObjectId(blogId) : blogId;

  const blog = await blogModel.findById(queryId).exec();
  if (!blog) throwError("Blog not found", 404);
  else {
    blogData = cleanObject(blogData);

    if (
      blogData.attachment &&
      blog.attachment &&
      blogData.attachment !== blog.attachment
    ) {
      deleteFileSync(blog.attachment);
    }

    if (blogData.images && blogData.images.length > 0 && blog.images?.length) {
      for (const oldImg of blog.images) {
        deleteFileSync(oldImg);
      }
    }

    const updated = await blogModel
      .findByIdAndUpdate(
        queryId,
        { $set: blogData },
        { new: true, runValidators: true, context: "query" }
      )
      .exec();

    if (!updated) throwError("Blog update failed", 500);

    return updated;
  }
};

// Soft delete single blog
const softDeleteSingleBlogService = async (blogId: string | number) => {
  const queryId =
    typeof blogId === "string" ? new mongoose.Types.ObjectId(blogId) : blogId;

  const blog = await blogModel.findById(queryId).exec();
  if (!blog) throwError("Blog not found", 404);
  else {
    if (blog.isDeleted) throwError("Blog already soft deleted", 400);

    const softDeleted = await blogModel
      .findByIdAndUpdate(queryId, { $set: { isDeleted: true } }, { new: true })
      .exec();

    if (!softDeleted) throwError("Blog soft delete failed", 500);

    return softDeleted;
  }
};

// Soft delete many blogs
const softDeleteManyBlogsService = async (blogIds: (string | number)[]) => {
  if (!blogIds || !blogIds.length) throwError("No blog IDs provided", 400);

  const queryIds = blogIds.map((id) =>
    typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
      ? new mongoose.Types.ObjectId(id)
      : typeof id === "number"
      ? id
      : throwError(`Invalid blog ID: ${id}`, 400)
  );

  const result = await blogModel.updateMany(
    { _id: { $in: queryIds }, isDeleted: false },
    { $set: { isDeleted: true } }
  );

  if (!result.modifiedCount) throwError("No blogs were soft deleted", 404);

  return result;
};

// Hard delete single blog
const hardDeleteSingleBlogService = async (blogId: string | number) => {
  const queryId =
    typeof blogId === "string" ? new mongoose.Types.ObjectId(blogId) : blogId;

  const blog = await blogModel.findById(queryId).exec();
  if (!blog) throwError("Blog not found", 404);
  else {
    if (blog.attachment) {
      deleteFileSync(blog.attachment);
    }

    if (blog.images?.length) {
      for (const img of blog.images) {
        deleteFileSync(img);
      }
    }

    const deleted = await blogModel.findByIdAndDelete(queryId).exec();
    if (!deleted) throwError("Blog delete failed", 500);

    return deleted;
  }
};

// Hard delete many blogs
const hardDeleteManyBlogsService = async (blogIds: (string | number)[]) => {
  const queryIds = blogIds.map((id) => {
    if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id))
      return new mongoose.Types.ObjectId(id);
    else if (typeof id === "number") return id;
    else throwError(`Invalid ID format: ${id}`, 400);
  });

  const blogs = await blogModel.find({ _id: { $in: queryIds } }).exec();

  for (const blog of blogs) {
    if (blog?.attachment) {
      deleteFileSync(blog.attachment);
    }

    if (blog?.images?.length) {
      for (const img of blog.images) {
        deleteFileSync(img);
      }
    }
  }

  const result = await blogModel.deleteMany({ _id: { $in: queryIds } }).exec();
  return result;
};

export const blogServices = {
  createBlogService,
  createBulkBlogsService,
  getAllBlogService,
  getSingleBlogService,
  getSingleBlogBySlugService,
  updateSingleBlogService,
  softDeleteSingleBlogService,
  softDeleteManyBlogsService,
  hardDeleteSingleBlogService,
  hardDeleteManyBlogsService,
};

