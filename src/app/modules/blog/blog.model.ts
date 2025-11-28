import { Schema, model } from "mongoose";
import { IBlog } from "./blog.interface";
import { generateSlug } from "../../utils/generateSlug";
import moment from "moment";

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
  { timestamps: true }
);

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
