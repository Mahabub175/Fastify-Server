import { Schema, model } from "mongoose";
import { IBlog } from "./blog.interface";
import { generateSlug } from "../../utils/generateSlug";
import config from "../../config/config";
import moment from "moment";

const BASE_URL = config.base_url || "https://example.com";

const blogSchema = new Schema<IBlog>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    publishedAt: { type: Date, required: true, trim: true },
    attachment: { type: String },
    images: { type: [String], default: undefined },
    isDeleted: { type: Boolean, default: false },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
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

  if (ret.publishedAt) {
    ret.publishedAt = moment(ret.publishedAt)
      .local()
      .format("YYYY-MM-DD HH:mm:ss");
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

  if (this.publishedAt) {
    const m = moment(this.publishedAt);
    if (!m.isValid()) {
      return next(new Error("Invalid publishedAt date"));
    }
    this.publishedAt = m.toDate();
  } else {
    this.publishedAt = new Date();
  }

  next();
});

export const blogModel = model<IBlog>("blog", blogSchema);

