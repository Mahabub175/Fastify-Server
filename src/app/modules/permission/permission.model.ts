import { Schema, model } from "mongoose";
import mongoose from "mongoose";
import cron from "node-cron";
import { IPermission } from "./permission.interface";

const permissionSchema = new Schema<IPermission>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const modelNames = Object.keys(mongoose.models);

export const STANDARD_ACTIONS = ["create", "read", "update", "delete"];

export const formatPermissionName = (modelName: string, action: string) =>
  `${modelName.toLowerCase()}:${action.toLowerCase()}`;

permissionSchema.pre("save", function (next) {
  const permission = this as IPermission;
  let name = permission.name.trim().toLowerCase();
  let modelPart = "";
  let actionPart = "";

  if (name.includes(":")) {
    [modelPart, actionPart] = name.split(":");
  } else if (name.includes("_")) {
    const parts = name.split("_");
    actionPart = parts.pop() as string;
    modelPart = parts.join("_");
  } else if (name.includes("-")) {
    const parts = name.split("-");
    actionPart = parts.pop() as string;
    modelPart = parts.join("-");
  } else if (name.includes(",")) {
    const parts = name.split(",");
    actionPart = parts.pop() as string;
    modelPart = parts.join(",");
  } else {
    return next(
      new Error(
        "Permission name must be in format 'model:action', 'model_action' or 'model-action' or 'model,action'"
      )
    );
  }

  if (!modelPart || !actionPart || !STANDARD_ACTIONS.includes(actionPart)) {
    return next(
      new Error(
        `Permission must have valid model and action. Action must be one of: ${STANDARD_ACTIONS.join(
          ", "
        )}`
      )
    );
  }

  const availableModels = Object.keys(mongoose.models).map((m) =>
    m.toLowerCase()
  );
  if (!availableModels.includes(modelPart)) {
    return next(
      new Error(
        `Model '${modelPart}' does not exist in the database. Must be one of: ${availableModels.join(
          ", "
        )}`
      )
    );
  }

  permission.name = formatPermissionName(modelPart, actionPart);
  next();
});

export const permissionModel = model<IPermission>(
  "permission",
  permissionSchema
);

export const createPermissionsForAllModels = async () => {
  const createdPermissions: any[] = [];

  for (const modelName of modelNames) {
    if (modelName.toLowerCase() === "permission") continue;

    for (const action of STANDARD_ACTIONS) {
      const name = formatPermissionName(modelName, action);
      const exists = await permissionModel.findOne({ name });
      if (!exists) {
        const perm = await permissionModel.create({
          name,
          description: `Allows ${action} operation on ${modelName}`,
        });
        createdPermissions.push(perm);
      }
    }
  }

  return createdPermissions;
};

cron.schedule("30 1 * * *", async () => {
  await createPermissionsForAllModels();
});
