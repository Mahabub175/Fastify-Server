import { Schema, model } from "mongoose";
import { IRole } from "./role.interface";

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: { type: String, trim: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: "permission" }],
    isDeleted: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const roleModel = model<IRole>("role", roleSchema);
