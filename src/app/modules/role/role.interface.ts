import { Types } from "mongoose";

export interface IRole {
  name: string;
  description: string;
  permissions: Types.ObjectId[];
  isDeleted: boolean;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
