import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import cron from "node-cron";

const backupFolder = path.join(process.cwd(), "backups");

if (!fs.existsSync(backupFolder)) {
  fs.mkdirSync(backupFolder, { recursive: true });
}

const backupAllModels = async () => {
  try {
    const modelNames = Object.keys(mongoose.models);

    for (const modelName of modelNames) {
      const model = mongoose.models[modelName];
      const data = await model.find().lean();

      const fileName = `${modelName.toLowerCase()}.json`;
      const filePath = path.join(backupFolder, fileName);

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
  } catch (err) {}
};

cron.schedule("0 2 * * 0", () => {
  backupAllModels();
});

export { backupAllModels };
