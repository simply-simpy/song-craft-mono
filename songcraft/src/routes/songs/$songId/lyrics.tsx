import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
// app/routes/songs/$songId/lyrics.page.tsx
import * as React from "react";

export const Route = createFileRoute("/songs/$songId/lyrics")({
	component: Page,
});

function Page() {
	const { songId } = useParams({ from: "/songs/$songId/lyrics" });
	const nav = useNavigate();
	const qc = useQueryClient();
	const { data: versions = [] } = useQuery({
		queryKey: ["versions", songId],
		queryFn: () =>
			fetch(`/core/songs/${songId}/versions`, { cache: "no-store" }).then((r) =>
				r.json(),
			),
	});
	const latest = versions[0];
	const [text, setText] = React.useState(latest?.body ?? "");
	React.useEffect(() => setText(latest?.body ?? ""), [latest?.body]);

	const save = useMutation({
		mutationFn: async () => {
			await fetch(`/core/songs/${songId}/versions`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ body: text }),
			});
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["versions", songId] }),
	});

	return (
		<div style={{ display: "grid", gap: 12 }}>
			<div style={{ display: "flex", gap: 8 }}>
				<button type="button" onClick={() => save.mutate()}>
					Save New Version
				</button>
				<button
					type="button"
					onClick={() =>
						nav({ to: "/songs/$songId/collab", params: { songId } })
					}
				>
					Collab Mode
				</button>
			</div>
			<textarea
				style={{ minHeight: 380 }}
				value={text}
				onChange={(e) => setText(e.target.value)}
			/>
			<div>
				<h4>Versions</h4>
				<ul>
					{versions.map(
						(v: { id: string; version: number; createdAt: string }) => (
							<li key={v.id}>
								v{v.version} — {new Date(v.createdAt).toLocaleString()}
							</li>
						),
					)}
				</ul>
			</div>
		</div>
	);
}
