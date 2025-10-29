import { FastifyRequest } from "fastify";
import fs from "fs";
import path from "path";
import { MultipartFile } from "@fastify/multipart";
import sharp from "sharp";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export const uploadService = async (
  request: FastifyRequest,
  fieldName: string,
  allowedTypes: string[] = ["image/jpeg", "image/png", "image/jpg"]
): Promise<string | string[] | undefined> => {
  const field = (request.body as any)[fieldName];

  if (!field) return undefined;

  if (Array.isArray(field)) {
    const filePaths: string[] = [];
    for (const file of field) {
      const uploadedPath = await processSingleFile(file, allowedTypes);
      if (uploadedPath) filePaths.push(uploadedPath);
    }
    return filePaths;
  }

  return await processSingleFile(field, allowedTypes);
};

const processSingleFile = async (
  file: MultipartFile,
  allowedTypes: string[]
): Promise<string | undefined> => {
  if (!file) return undefined;

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(
      `Unsupported media type: ${
        file.mimetype
      }. Allowed types: ${allowedTypes.join(", ")}`
    );
  }

  const ext = path.extname(file.filename || "");
  const baseName = path
    .basename(file.filename || "file", ext)
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "");
  const timestamp = Date.now();
  const finalPath = path.join(uploadDir, `${baseName}_${timestamp}${ext}`);

  const buffer = await file.toBuffer();
  const compressedBuffer = await sharp(buffer).jpeg({ quality: 70 }).toBuffer();

  await fs.promises.writeFile(finalPath, compressedBuffer);

  return `uploads/${path.basename(finalPath)}`;
};
