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
    author: { type: String, trim: true },
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
  if (this.isModified("name")) {
    let newSlug = generateSlug(this.name);
    let slugExists = await model<IBlog>("blog").exists({
      slug: newSlug,
      _id: { $ne: this._id },
    });
    let suffix = 1;

    while (slugExists) {
      newSlug = `${generateSlug(this.name)}-${suffix}`;
      slugExists = await model<IBlog>("blog").exists({
        slug: newSlug,
        _id: { $ne: this._id },
      });
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

blogSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as any;

  const setUpdate = update.$set ? update.$set : update;

  if (setUpdate.name) {
    let newSlug = generateSlug(setUpdate.name);

    let slugExists = await model<IBlog>("blog").exists({
      slug: newSlug,
      _id: { $ne: this.getQuery()._id },
    });

    let suffix = 1;
    while (slugExists) {
      newSlug = `${generateSlug(setUpdate.name)}-${suffix}`;
      slugExists = await model<IBlog>("blog").exists({
        slug: newSlug,
        _id: { $ne: this.getQuery()._id },
      });
      suffix++;
    }

    if (update.$set) {
      update.$set.slug = newSlug;
    } else {
      update.slug = newSlug;
    }

    this.setUpdate(update);
  }

  next();
});

export const blogModel = model<IBlog>("blog", blogSchema);
