import fastifyMultipart from "@fastify/multipart";
import fastifyPlugin from "fastify-plugin";

export const multipartPlugin = fastifyPlugin(async (fastify) => {
  fastify.register(fastifyMultipart, {
    attachFieldsToBody: true,
    limits: {
      fileSize: Infinity,
      files: Infinity,
    },
  });
});
