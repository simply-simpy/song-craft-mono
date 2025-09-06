import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/sign-in")({
  staticData: { isPublic: true },
  component: () => (
    <div className="p-6 grid place-items-center">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <SignIn afterSignInUrl="/sign-in" afterSignUpUrl="/sign-in" />
    </div>
  ),
});
