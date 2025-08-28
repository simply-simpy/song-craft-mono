import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import * as dotenv from "dotenv";
import songRoutes from "./routes/songs";

// Load environment variables
dotenv.config();

const server = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

server.register(cors, {
  origin: ["http://localhost:3000"],
  credentials: true,
});

// Add schema validator and serializer
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// Register Swagger
server.register(swagger, {
  openapi: {
    info: {
      title: "Songcraft API",
      description: "API for Songcraft application",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:4500", // Updated to match your .env
        description: "Development server",
      },
    ],
  },
});

server.register(swaggerUi, {
  routePrefix: "/documentation",
});

// Register routes
server.register(songRoutes);

// Health check route
server.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 4500; // Updated default
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(
      `📚 API Documentation available at http://localhost:${port}/documentation`
    );
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
