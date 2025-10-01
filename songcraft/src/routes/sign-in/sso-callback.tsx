import { AuthenticateWithRedirectCallback } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-in/sso-callback")({
	staticData: { isPublic: true },
	component: () => (
		<div className="p-6 grid place-items-center">
			<h1 className="text-2xl font-bold">Completing Sign In...</h1>
			<AuthenticateWithRedirectCallback />
		</div>
	),
});
