import fp from "fastify-plugin";
import cors from "@fastify/cors";

const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

const corsPlugin = fp(async (fastify) => {
  await fastify.register(cors, {
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error("Not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });
});

export default corsPlugin;
