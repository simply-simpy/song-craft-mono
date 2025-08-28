// app/routes/songs/$songId/record.page.tsx

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/songs/$songId/record")({
	component: Page,
});

function Page() {
	// later: getUserMedia -> WebAudio chain (EQ -> compressor -> convolver -> waveshaper)
	return (
		<div style={{ display: "grid", gap: 12 }}>
			<h3>Record Take</h3>
			<p>Stub UI. Record, preview, upload, save metadata.</p>
			<div style={{ display: "flex", gap: 8 }}>
				<button type="button">● Record</button>
				<button type="button">Stop</button>
				<button type="button">Save Take</button>
			</div>
			<audio controls style={{ width: "100%" }}>
				<track kind="captions" />
			</audio>
		</div>
	);
}
