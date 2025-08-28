import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/songs/$songId/package")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/songs/$songId/package"!</div>;
}
