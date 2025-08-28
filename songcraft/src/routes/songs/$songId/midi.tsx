import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/songs/$songId/midi")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/songs/$songId/midi"!</div>;
}
