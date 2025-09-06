import { createFileRoute, Navigate, useSearch } from "@tanstack/react-router";
import { SignIn } from "@clerk/tanstack-react-start";
import { SignedIn, SignedOut } from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/sign-in")({
  staticData: { isPublic: true },
  component: () => (
    <div className="p-6 grid place-items-center">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <SignIn routing="path" path="/sign-in" />
      <SignedIn>
        <PostSignInRedirect />
      </SignedIn>
      <SignedOut />
    </div>
  ),
});

function PostSignInRedirect() {
  const search = useSearch({ from: "/sign-in" }) as { returnTo?: string };
  const { returnTo } = search;
  return <Navigate to={returnTo ?? "/songs"} />;
}
