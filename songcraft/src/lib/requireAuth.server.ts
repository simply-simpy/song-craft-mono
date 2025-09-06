import { createServerFn } from "@tanstack/react-start";

// TEMP: Auth disabled for development. This no-op makes all routes accessible
// while keeping the /sign-in page available.
export const requireAuth = createServerFn({ method: "GET" }).handler(
  async () => {
    return null;
  }
);
