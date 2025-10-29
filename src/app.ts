import Fastify from "fastify";
import path from "path";
import fs from "fs";
import fastifyStatic from "@fastify/static";
import httpStatus from "http-status";
import { notFound } from "./app/middlewares/notFound";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import corsPlugin from "./app/plugins/cors";
import { router } from "./app/routes/route";
import { dbPlugin } from "./app/plugins/db";
import { multipartPlugin } from "./app/plugins/fastifyMultipart";

export const createApp = () => {
  const app = Fastify({
    // logger: true,
  });

  app.register(corsPlugin);

  const uploadsPath = path.resolve("uploads");
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }

  app.register(fastifyStatic, {
    root: uploadsPath,
    prefix: "/uploads/",
  });

  app.register(multipartPlugin);

  app.register(dbPlugin);

  app.register(router, { prefix: "/api/v1" });

  app.get("/", async () => ({
    success: true,
    statusCode: httpStatus.OK,
    message: "Server is running!",
  }));

  app.setNotFoundHandler(notFound);

  app.setErrorHandler(globalErrorHandler);

  return app;
};
