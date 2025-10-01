import { SignedIn, SignedOut } from "@clerk/tanstack-react-start";
// app/routes/index.page.tsx
import { Navigate, createFileRoute } from "@tanstack/react-router";

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
