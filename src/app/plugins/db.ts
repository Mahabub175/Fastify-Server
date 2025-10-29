import fastifyPlugin from "fastify-plugin";
import mongoose from "mongoose";
import config from "../config/config";
import { log } from "console-log-colors";

declare module "fastify" {
  interface FastifyInstance {
    mongo: typeof mongoose;
  }
}

// Encapsulated plugin
export const dbPlugin = fastifyPlugin(async (fastify) => {
  try {
    await mongoose.connect(config.database_url as string, {
      dbName: config.database_name,
    });

    fastify.decorate("mongo", mongoose);
    log("Database connected successfully!", "greenBright");
    fastify.log.info("Database connected successfully");
  } catch (err) {
    fastify.log.error("Database connection error:");
    throw err;
  }
});
