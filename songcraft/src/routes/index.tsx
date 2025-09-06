// app/routes/index.page.tsx
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { SignedIn, SignedOut } from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/")({
  component: () => (
    <>
      <SignedIn>
        <Navigate to="/songs" />
      </SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" />
      </SignedOut>
    </>
  ),
});
