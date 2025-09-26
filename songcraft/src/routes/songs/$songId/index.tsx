// app/routes/songs/$songId/index.page.tsx
import { Link, createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/songs/$songId/")({ component: Page });

function Page() {
	const { songId } = useParams({ from: "/songs/$songId/" });
	return (
		<div style={{ display: "grid", gap: 12 }}>
			<h2>Song Overview</h2>
			<div style={{ display: "grid", gap: 8 }}>
				<Link to="/songs/$songId/lyrics" params={{ songId }}>
					Lyric Writing
				</Link>
				<Link to="/songs/$songId/record" params={{ songId }}>
					Record Takes
				</Link>
				<Link to="/songs/$songId/midi" params={{ songId }}>
					Create MIDI
				</Link>
				<Link to="/songs/$songId/package" params={{ songId }}>
					Copyright Package
				</Link>
				<Link to="/songs/$songId/collab" params={{ songId }}>
					Enter Collaboration Mode
				</Link>
			</div>
		</div>
	);
}
