import { createRouter } from "./router";
import { createStartHandler } from "@tanstack/react-start/server";

const router = createRouter();

export default createStartHandler({
  createRouter: () => router,
});
