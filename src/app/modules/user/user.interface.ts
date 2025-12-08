import { Types } from "mongoose";

export interface IUser {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: Types.ObjectId;
  attachment: string;
  images: string[];
  isDeleted: boolean;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
