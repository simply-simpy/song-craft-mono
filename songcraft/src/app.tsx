import { createStartHandler } from "@tanstack/react-start/server";
import { createRouter } from "./router";

const router = createRouter();

export default createStartHandler({
	createRouter: () => router,
});
