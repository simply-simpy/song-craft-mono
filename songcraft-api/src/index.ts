import { env } from "./config/env";
import { createServer } from "./server/createServer";
import { pool } from "./db";

const server = createServer();

const start = async () => {
  try {
    await server.listen({ port: env.PORT, host: env.HOST });
    const displayHost = env.HOST === "0.0.0.0" ? "localhost" : env.HOST;
    server.log.info(`🚀 Server running at http://${displayHost}:${env.PORT}`);
    if (env.ENABLE_API_DOCS) {
      server.log.info(
        `📚 API Documentation available at http://${displayHost}:${env.PORT}/documentation`,
      );
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  try {
    server.log.info({ signal }, "Shutting down gracefully...");
    await server.close();
    await pool.end();
    server.log.info("Shutdown complete. Bye! 👋");
    process.exit(0);
  } catch (err) {
    server.log.error({ err }, "Error during shutdown");
    process.exit(1);
  }
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

start();
