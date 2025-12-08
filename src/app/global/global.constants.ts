export enum ModelNames {
  USER = "user",
  ROLE = "role",
  PERMISSION = "permission",
  BLOG = "blog",
  UPLOAD = "upload",
}

export const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];

export enum StandardActions {
  CREATE = "create",
  READ = "read",
  READ_MANY = "readMany",
  UPDATE = "update",
  UPDATE_MANY = "updateMany",
  SOFT_DELETE = "softDelete",
  SOFT_DELETE_MANY = "softDeleteMany",
  HARD_DELETE = "hardDelete",
  HARD_DELETE_MANY = "hardDeleteMany",
  RECOVER = "recover",
}
