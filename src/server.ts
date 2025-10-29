import dotenv from "dotenv";
import path from "path";
import config from "./app/config/config";
import { log } from "console-log-colors";
import { createApp } from "./app";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const startServer = async () => {
  if (!config.database_url) {
    log("DATABASE_URL is missing in .env!", "red");
    process.exit(1);
  }

  const app = createApp();

  const PORT = config.port ? Number(config.port) : 6000;

  try {
    // Fastify will register db plugin internally
    await app.listen({ port: PORT, host: "0.0.0.0" });
    log(`Server running at http://localhost:${PORT}`, "greenBright");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

startServer();
