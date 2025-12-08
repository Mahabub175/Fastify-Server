import { Schema, model, Document } from "mongoose";
import { IUser } from "./user.interface";
import bcrypt from "bcrypt";
import { roleModel } from "../role/role.model";
import { ModelNames } from "../../global/global.constants";

interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    userName: { type: String, unique: true, trim: true },
    email: { type: String, unique: true, trim: true },
    phoneNumber: { type: String, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    role: { type: Schema.Types.ObjectId, ref: "role" },
    attachment: { type: String },
    images: { type: [String], default: undefined },
    isDeleted: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this as IUserDocument;

  if (!user.userName) {
    const cleanFirstName = user.firstName
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
    const cleanLastName = user.lastName
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

    let username = cleanFirstName;

    if (await model(ModelNames.USER).exists({ userName: username })) {
      username = `${cleanFirstName}${cleanLastName}`;

      let count = 1;
      while (await model(ModelNames.USER).exists({ userName: username })) {
        username = `${cleanFirstName}${cleanLastName}${count}`;
        count++;
      }
    }

    user.userName = username;
  }

  if (user.isModified("password")) {
    const saltRounds = 12;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }

  if (!user.role) {
    let defaultRole = await roleModel.findOne({ name: ModelNames.USER });

    if (!defaultRole) {
      defaultRole = await roleModel.create({
        name: ModelNames.USER,
      });
    }

    user.role = defaultRole._id;
  }

  next();
});

export const userModel = model<IUserDocument>("user", userSchema);
