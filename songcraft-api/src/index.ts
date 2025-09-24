import { env } from "./config/env";
import { createServer } from "./server/createServer";

const server = createServer();

const start = async () => {
  try {
    await server.listen({ port: env.PORT, host: env.HOST });
    const displayHost = env.HOST === "0.0.0.0" ? "localhost" : env.HOST;
    server.log.info(
      `🚀 Server running at http://${displayHost}:${env.PORT}`
    );
    if (env.ENABLE_API_DOCS) {
      server.log.info(
        `📚 API Documentation available at http://${displayHost}:${env.PORT}/documentation`
      );
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
