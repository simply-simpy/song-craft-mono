import {
	createFileRoute,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
// app/routes/songs/$songId/collab.page.tsx
import * as React from "react";

export const Route = createFileRoute("/songs/$songId/collab")({
	component: Page,
});

function Page() {
	const { songId } = useParams({ from: "/songs/$songId/collab" });
	const nav = useNavigate();
	React.useEffect(() => {
		document.documentElement.requestFullscreen?.();
		return () => {
			if (document.fullscreenElement) {
				document.exitFullscreen().catch(() => {});
			}
		};
	}, []);
	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				background: "#111",
				color: "#fff",
				display: "grid",
				gridTemplateRows: "56px 1fr",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 12,
					padding: "0 12px",
					borderBottom: "1px solid #222",
				}}
			>
				<button
					type="button"
					onClick={() =>
						nav({ to: "/songs/$songId/lyrics", params: { songId } })
					}
				>
					Exit
				</button>
				<a href={location.href} style={{ color: "#aaa" }}>
					Copy Link
				</a>
				<button type="button">● Record</button>
			</div>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gridTemplateRows: "1fr 1fr",
					gap: 8,
					padding: 8,
				}}
			>
				{[0, 1, 2, 3].map((i) => (
					<div
						key={i}
						style={{ background: "#1b1b1b", borderRadius: 8, padding: 12 }}
					>
						<div style={{ opacity: 0.8, fontSize: 12, marginBottom: 8 }}>
							Writer {i + 1}
						</div>
						<div
							contentEditable
							suppressContentEditableWarning
							style={{ outline: "none", minHeight: "40vh", lineHeight: 1.4 }}
						>
							Type lyrics here…
						</div>
						<audio
							controls
							style={{ width: "100%", marginTop: 8 }}
							aria-disabled={true}
							aria-label="Disabled audio player"
						>
							<track kind="captions" />
						</audio>
					</div>
				))}
			</div>
		</div>
	);
}
