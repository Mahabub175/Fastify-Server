import { Schema, model } from "mongoose";
import { IBlog } from "./blog.interface";
import { generateSlug } from "../../utils/generateSlug";
import config from "../../config/config";

const BASE_URL = config.base_url || "https://example.com";

const blogSchema = new Schema<IBlog>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    publishedAt: { type: String, required: true, trim: true },
    attachment: { type: String },
    images: { type: [String], default: undefined },
    isDeleted: { type: Boolean, default: false },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

blogSchema.options.toJSON = blogSchema.options.toJSON || {};
blogSchema.options.toJSON.transform = function (doc, ret: any) {
  if (!ret) return ret;

  if (ret.attachment && typeof ret.attachment === "string") {
    ret.attachment = `${BASE_URL}/${ret.attachment}`;
  }

  if (Array.isArray(ret.images)) {
    ret.images = ret.images.map((img: string) => `${BASE_URL}/${img}`);
  }

  return ret;
};

blogSchema.pre("validate", async function (next) {
  if (!this.slug && this.name) {
    let newSlug = generateSlug(this.name);
    let slugExists = await model<IBlog>("blog").exists({ slug: newSlug });
    let suffix = 1;

    while (slugExists) {
      newSlug = `${generateSlug(this.name)}-${suffix}`;
      slugExists = await model<IBlog>("blog").exists({ slug: newSlug });
      suffix++;
    }

    this.slug = newSlug;
  }
  next();
});

export const blogModel = model<IBlog>("blog", blogSchema);
