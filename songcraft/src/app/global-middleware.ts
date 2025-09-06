import {
  //createMiddleware,
  registerGlobalMiddleware,
} from "@tanstack/react-start";

registerGlobalMiddleware({
  middleware: [
    //	createMiddleware().server(Sentry.sentryGlobalServerMiddlewareHandler()),
  ],
});
