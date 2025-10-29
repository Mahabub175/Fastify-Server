import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import path from "path";
import fs from "fs";
import axios from "axios";
import config from "../../config/config";
import { uploadService } from "./upload.service";
import { responseSuccess, responseError } from "../../utils/response";

const downloadImage = async (
  url: string,
  uploadDir: string = path.join(process.cwd(), "uploads")
): Promise<string> => {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const response = await axios.get(url, { responseType: "arraybuffer" });
  const contentType = response.headers["content-type"] || "";
  const ext = contentType.split("/")[1] || "jpg";
  const filename = `${Date.now()}-${path
    .basename(url)
    .replace(/\s+/g, "_")}.${ext}`;
  const filePath = path.join(uploadDir, filename);

  fs.writeFileSync(filePath, Buffer.from(response.data));
  return filePath;
};

export const uploadRoutes = async (app: FastifyInstance) => {
  app.post("/upload/", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = (request.body as Record<string, any>) || {};
      const files: any[] = [];

      if (body.image) {
        const imagePath = await downloadImage(body.image);
        files.push({
          path: imagePath,
          url: `${config.base_url}/uploads/${path.basename(imagePath)}`,
        });
      }

      const attachmentPath = await uploadService(request, "attachment");
      if (attachmentPath) {
        const paths = Array.isArray(attachmentPath)
          ? attachmentPath
          : [attachmentPath];
        for (const filePath of paths) {
          const stats = fs.statSync(filePath);
          files.push({
            name: path.basename(filePath),
            path: filePath,
            size: stats.size,
            url: `${config.base_url}/${filePath.replace(/\\/g, "/")}`,
          });
        }
      }

      const imagesPath = await uploadService(request, "images");
      if (imagesPath) {
        const paths = Array.isArray(imagesPath) ? imagesPath : [imagesPath];
        for (const filePath of paths) {
          const stats = fs.statSync(filePath);
          files.push({
            name: path.basename(filePath),
            path: filePath,
            size: stats.size,
            url: `${config.base_url}/${filePath.replace(/\\/g, "/")}`,
          });
        }
      }

      if (!files.length) return responseError(reply, "No file uploaded");

      return responseSuccess(reply, files, "File(s) uploaded successfully");
    } catch (error: any) {
      return responseError(
        reply,
        error.message || "Failed to upload file(s)",
        500,
        error
      );
    }
  });
};
