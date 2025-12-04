import dotenv from "dotenv";
import path from "path";
import config from "./app/config/config";
import { createApp } from "./app";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const startServer = async () => {
  if (!config.database_url) {
    console.log("\x1b[31m%s\x1b[0m", "DATABASE_URL is missing in .env!");
    process.exit(1);
  }

  const app = createApp();

  const PORT = config.port ? Number(config.port) : 6000;

  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(
      "\x1b[32m%s\x1b[0m",
      `Server running at http://localhost:${PORT}`
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

startServer();
