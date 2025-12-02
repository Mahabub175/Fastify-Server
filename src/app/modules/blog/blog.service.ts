import { FastifyInstance } from "fastify";
import mongoose from "mongoose";
import { IBlog } from "./blog.interface";
import { blogModel } from "./blog.model";
import { paginateAndSort } from "../../utils/paginateAndSort";
import { throwError } from "../../utils/response";
import { deleteFileSync } from "../../utils/deleteFilesFromStorage";
import { cleanObject } from "../../utils/cleanObject";
import { cacheAsync } from "../../utils/cacheAsync";

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
  fastify: FastifyInstance,
  searchFields: string[],
  searchText?: string,
  filters?: Record<string, any>
) => {
  // const key = `blogs:${JSON.stringify({ searchFields, searchText, filters })}`;

  // return cacheAsync(
  //   fastify,
  //   key,
  //   async () => {
  //     const query = blogModel.find();
  //     return paginateAndSort(query, { searchFields, searchText, filters });
  //   },
  //   60
  // );
  const query = blogModel.find();

  return paginateAndSort(query, {
    searchFields,
    searchText,
    filters,
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

// Toggle blog status
const toggleBlogStatusService = async (blogId: string) => {
  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    throwError("Invalid blog ID", 400);
  }

  const blog = await blogModel.findOne({
    _id: blogId,
    isDeleted: { $ne: true },
  });

  if (!blog) throwError("Blog not found or already deleted", 404);
  else {
    blog.status = !blog.status;
    await blog.save();

    return blog.toObject();
  }
};

// Toggle multiple blog status
const toggleManyBlogStatusService = async (blogIds: string[]) => {
  const validIds = blogIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (!validIds.length) throwError("No valid blog IDs provided!", 400);

  const blogs = await blogModel.find({
    _id: { $in: validIds },
    isDeleted: { $ne: true },
  });

  if (!blogs.length) throwError("No blogs found or all are deleted!", 404);

  const updatedBlogs = [];
  for (const blog of blogs) {
    blog.status = !blog.status;
    await blog.save();
    updatedBlogs.push(blog.toObject());
  }

  return updatedBlogs;
};

// Soft delete single blog
const softDeleteSingleBlogService = async (blogId: string | number) => {
  const queryId =
    typeof blogId === "string" ? new mongoose.Types.ObjectId(blogId) : blogId;

  const blog = await blogModel.findById(queryId).exec();
  if (!blog) throwError("Blog not found", 404);
  else {
    if (blog.isDeleted) throwError("Blog already soft deleted!", 400);

    const softDeleted = await blogModel
      .findByIdAndUpdate(queryId, { $set: { isDeleted: true } }, { new: true })
      .exec();

    if (!softDeleted) throwError("Blog soft delete failed!", 500);

    return softDeleted;
  }
};

// Toggle blog soft delete
const toggleBlogSoftDeleteService = async (blogId: string) => {
  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    throwError("Invalid blog ID", 400);
  }

  const blog = await blogModel.findOne({
    _id: blogId,
  });

  if (!blog) throwError("Blog not found!", 404);
  else {
    blog.isDeleted = !blog.isDeleted;
    await blog.save();

    return blog.toObject();
  }
};

// Soft delete multiple blogs
const toggleManyBlogSoftDeleteService = async (blogIds: string[]) => {
  const validIds = blogIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (!validIds.length) throwError("No valid blog IDs provided!", 400);

  const blogs = await blogModel.find({
    _id: { $in: validIds },
  });

  if (!blogs.length) throwError("No blogs found!", 404);

  const updatedBlogs = [];
  for (const blog of blogs) {
    blog.isDeleted = !blog.isDeleted;
    await blog.save();
    updatedBlogs.push(blog.toObject());
  }

  return updatedBlogs;
};

// Recover blog
const recoverBlogService = async (blogIds: string[]) => {
  if (!Array.isArray(blogIds) || blogIds.length === 0) {
    throw new Error("No blog IDs provided");
  }

  const validIds = blogIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) {
    throw new Error("No valid blog IDs provided");
  }

  const result = await blogModel.updateMany(
    { _id: { $in: validIds } },
    { $set: { isDeleted: false } }
  );

  return {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  };
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
  toggleBlogStatusService,
  toggleManyBlogStatusService,
  softDeleteSingleBlogService,
  toggleBlogSoftDeleteService,
  toggleManyBlogSoftDeleteService,
  softDeleteManyBlogsService,
  recoverBlogService,
  hardDeleteSingleBlogService,
  hardDeleteManyBlogsService,
};
