import fastifyPlugin from "fastify-plugin";
import mongoose from "mongoose";
import config from "../config/config";

declare module "fastify" {
  interface FastifyInstance {
    mongo: typeof mongoose;
  }
}

export const dbPlugin = fastifyPlugin(async (fastify) => {
  try {
    await mongoose.connect(config.database_url as string, {
      dbName: config.database_name,
    });

    fastify.decorate("mongo", mongoose);
    console.log("\x1b[32m%s\x1b[0m", `Database connected successfully!`);
    fastify.log.info("Database connected successfully");
  } catch (err) {
    fastify.log.error("Database connection error:");
    throw err;
  }
});
