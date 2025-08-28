import { PendingComponent } from "@/components/ui/pending-component";
import { env } from "@/env";
import { useQuery } from "@tanstack/react-query";
import {
	ErrorComponent,
	createFileRoute,
	useNavigate,
} from "@tanstack/react-router";

const API_URL = env.VITE_API_URL || "http://localhost:4500";

export const Route = createFileRoute("/songs/")({
	component: Page,
	errorComponent: ErrorComponent,
	pendingComponent: PendingComponent,
});

function Page() {
	const nav = useNavigate();
	const { data, isLoading, error } = useQuery({
		queryKey: ["songs"],
		queryFn: () =>
			fetch(`${API_URL}/songs`, {
				cache: "no-store",
			}).then((r) => r.json()),
	});

	if (isLoading) return <PendingComponent message="Loading songs..." />;
	if (error) return <div>Error: {error.message}</div>;
	const songs = Array.isArray(data?.data) ? data.data : [];

	return (
		<div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 12,
				}}
			>
				<h2>Songs</h2>
				<button type="button" onClick={() => nav({ to: "/songs/new" })}>
					New Song
				</button>
			</div>
			<table width="100%">
				<thead>
					<tr>
						<th align="left">Title</th>
						<th align="left">BPM</th>
						<th align="left">Key</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{songs.map(
						(s: { id: string; title: string; bpm?: number; key?: string }) => (
							<tr key={s.id}>
								<td>{s.title}</td>
								<td>{s.bpm || "—"}</td>
								<td>{s.key || "—"}</td>
								<td>
									<button
										type="button"
										onClick={() =>
											nav({
												to: "/songs/$songId/lyrics",
												params: { songId: s.id },
											})
										}
									>
										Open
									</button>
								</td>
							</tr>
						),
					)}
					{songs.length === 0 && (
						<tr>
							<td colSpan={4}>No songs yet.</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}
