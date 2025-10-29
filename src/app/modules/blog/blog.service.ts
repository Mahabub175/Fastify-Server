import mongoose from "mongoose";
import { IBlog } from "./blog.interface";
import { blogModel } from "./blog.model";
import path from "path";
import fs from "fs";
import { generateSlug } from "../../utils/generateSlug";
import { paginateAndSort } from "../../utils/paginateAndSort";
import { formatResultImage } from "../../utils/formatResultImage";
import { throwError } from "../../utils/response";

// Create a blog
export const createBlogService = async (blogData: IBlog) => {
  const slug = blogData.slug?.trim()
    ? blogData.slug
    : generateSlug(blogData.name);

  const dataToSave = { ...blogData, slug };

  const result = await blogModel.create(dataToSave);
  return result;
};

// Get all blogs with optional pagination & search
const getAllBlogService = async (
  page?: number,
  limit?: number,
  searchText?: string,
  searchFields?: string[]
) => {
  let query = blogModel.find();

  if (searchText && searchFields?.length) {
    const searchQuery = searchFields.map((field) => ({
      [field]: { $regex: searchText, $options: "i" },
    }));
    query = query.find({ $or: searchQuery });
  }

  if (page && limit) {
    const result = await paginateAndSort(query, {
      page,
      limit,
      sort: { field: "createdAt", order: "desc" },
    });

    result.results = formatResultImage<IBlog>(result.results, [
      "attachment",
      "images",
    ]) as unknown as typeof result.results;

    return result;
  }

  const results = await query.sort({ createdAt: -1 }).exec();
  return {
    results: formatResultImage<IBlog>(results, [
      "attachment",
      "images",
    ]) as IBlog[],
  };
};

// Get single blog by ID
const getSingleBlogService = async (blogId: string) => {
  const queryId =
    typeof blogId === "string" ? new mongoose.Types.ObjectId(blogId) : blogId;

  const blog = await blogModel.findById(queryId).exec();
  if (!blog) throwError("Blog not found", 404);
  else {
    const blogObj = blog.toObject() as IBlog;

    if (blogObj.attachment) {
      blogObj.attachment = formatResultImage(blogObj.attachment) as string;
    }

    if (blogObj.images && blogObj.images.length > 0) {
      blogObj.images = blogObj.images.map(
        (img) => formatResultImage(img) as string
      );
    }

    return blogObj;
  }
};

// Get single blog by slug
const getSingleBlogBySlugService = async (slug: string) => {
  const blog = await blogModel.findOne({ slug }).exec();
  if (!blog) throwError("Blog not found", 404);
  else {
    const blogObj = blog.toObject() as IBlog;

    if (blogObj.attachment) {
      blogObj.attachment = formatResultImage(blogObj.attachment) as string;
    }

    if (blogObj.images && blogObj.images.length > 0) {
      blogObj.images = blogObj.images.map(
        (img) => formatResultImage(img) as string
      );
    }

    return blogObj;
  }
};

// Update single blog
export const updateSingleBlogService = async (
  blogId: string | number,
  blogData: Partial<IBlog>
) => {
  const queryId =
    typeof blogId === "string" ? new mongoose.Types.ObjectId(blogId) : blogId;

  const blog = await blogModel.findById(queryId).exec();
  if (!blog) throwError("Blog not found", 404);
  else {
    Object.keys(blogData).forEach((key) =>
      blogData[key as keyof IBlog] === undefined ||
      blogData[key as keyof IBlog] === null
        ? delete blogData[key as keyof IBlog]
        : null
    );

    if (blogData.slug) {
      blogData.slug = generateSlug(blogData.slug);
    } else if (blogData.name && blogData.name !== blog.name) {
      blogData.slug = generateSlug(blogData.name);
    }

    if (
      blogData.attachment &&
      blog.attachment &&
      blogData.attachment !== blog.attachment
    ) {
      const prevFile = path.join(
        process.cwd(),
        "uploads",
        path.basename(blog.attachment)
      );
      if (fs.existsSync(prevFile)) {
        try {
          fs.unlinkSync(prevFile);
        } catch (err) {
          throwError("Failed to delete previous attachment:", 500);
        }
      }
    }

    if (blogData.images && blogData.images.length > 0 && blog.images?.length) {
      for (const oldImg of blog.images) {
        const prevFile = path.join(
          process.cwd(),
          "uploads",
          path.basename(oldImg)
        );
        if (fs.existsSync(prevFile)) {
          try {
            fs.unlinkSync(prevFile);
          } catch (err) {
            throwError("Failed to delete previous images:", 500);
          }
        }
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

// Delete single blog
export const deleteSingleBlogService = async (blogId: string | number) => {
  const queryId =
    typeof blogId === "string" ? new mongoose.Types.ObjectId(blogId) : blogId;

  const blog = await blogModel.findById(queryId).exec();
  if (!blog) throwError("Blog not found", 404);
  else {
    if (blog.attachment) {
      const filePath = path.join(
        process.cwd(),
        "uploads",
        path.basename(blog.attachment)
      );
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          throwError("Failed to delete attachment:", 500);
        }
      }
    }

    if (blog.images && blog.images.length > 0) {
      for (const img of blog.images) {
        const imgPath = path.join(process.cwd(), "uploads", path.basename(img));
        if (fs.existsSync(imgPath)) {
          try {
            fs.unlinkSync(imgPath);
          } catch (err) {
            throwError(
              `Failed to delete image ${img} for blog ${blog._id}:`,
              500
            );
          }
        }
      }
    }

    const deleted = await blogModel.findByIdAndDelete(queryId).exec();
    if (!deleted) throwError("Blog delete failed", 500);

    return deleted;
  }
};

// Delete many blogs
export const deleteManyBlogsService = async (blogIds: (string | number)[]) => {
  const queryIds = blogIds.map((id) => {
    if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id))
      return new mongoose.Types.ObjectId(id);
    else if (typeof id === "number") return id;
    else throwError(`Invalid ID format: ${id}`, 400);
  });

  const blogs = await blogModel.find({ _id: { $in: queryIds } }).exec();

  for (const blog of blogs) {
    if (blog.attachment) {
      const filePath = path.join(
        process.cwd(),
        "uploads",
        path.basename(blog.attachment)
      );
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          throwError(`Failed to delete attachment for blog ${blog._id}:`, 500);
        }
      }
    }

    if (blog.images && blog.images.length > 0) {
      for (const img of blog.images) {
        const imgPath = path.join(process.cwd(), "uploads", path.basename(img));
        if (fs.existsSync(imgPath)) {
          try {
            fs.unlinkSync(imgPath);
          } catch (err) {
            throwError(
              `Failed to delete image ${img} for blog ${blog._id}:`,
              500
            );
          }
        }
      }
    }
  }

  const result = await blogModel.deleteMany({ _id: { $in: queryIds } }).exec();
  return result;
};

export const blogServices = {
  createBlogService,
  getAllBlogService,
  getSingleBlogService,
  getSingleBlogBySlugService,
  updateSingleBlogService,
  deleteSingleBlogService,
  deleteManyBlogsService,
};
