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

// CORS configuration driven by env
// CORS_ORIGIN can be '*' or a comma-separated list of origins
const rawCorsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
const corsOrigin =
  rawCorsOrigin === "*"
    ? true
    : rawCorsOrigin
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

const rawMethods =
  process.env.CORS_METHODS || "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS";
const corsMethods = rawMethods
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean) as any;

server.register(cors, {
  origin: corsOrigin,
  methods: corsMethods,
  allowedHeaders: ["Content-Type", "Authorization"],
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
