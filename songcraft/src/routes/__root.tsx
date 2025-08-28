import {
	HeadContent,
	Link,
	Outlet,
	Scripts,
	createRootRoute,
} from "@tanstack/react-router";
// app/routes/__root.tsx
import * as React from "react";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "SongCraft",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: "/src/styles.css",
			},
			// Google Fonts
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;1,300&display=swap",
			},
		],
	}),
	component: Root,
});

function Root() {
	const [rightOpen, setRightOpen] = React.useState(false);
	const [cmdOpen, setCmdOpen] = React.useState(false);

	// Cmd+K command palette toggle
	React.useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setCmdOpen((v) => !v);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<div className="h-screen grid grid-rows-[48px_1fr]">
					{/* Top bar with search */}
					<div className="flex items-center gap-3 px-3 border-b border-gray-200">
						<Link to="/" className="font-bold">
							SongCraft
						</Link>
						<input
							placeholder="Search (⌘K)"
							onFocus={() => setCmdOpen(true)}
							className="flex-1 h-8 border border-gray-300 rounded-md px-2"
						/>
						<button
							type="button"
							onClick={() => setRightOpen((v) => !v)}
							className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
						>
							{rightOpen ? "Hide" : "Show"} Panel
						</button>
					</div>

					{/* 3-column layout */}
					<div className="grid grid-cols-[260px_1fr_320px] h-full">
						{/* Left nav */}
						<aside className="border-r border-gray-200 p-3">
							<nav className="grid gap-2">
								<Link
									to="/songs"
									className="px-3 py-2 rounded-md hover:bg-gray-50"
								>
									Songs
								</Link>
								<Link
									to="/songs/new"
									className="px-3 py-2 rounded-md hover:bg-gray-50"
								>
									New Song
								</Link>
								<Link
									to="/admin"
									className="px-3 py-2 rounded-md hover:bg-gray-50"
								>
									Admin
								</Link>
							</nav>
						</aside>

						{/* Main content */}
						<main className="p-3 overflow-auto">
							<Outlet />
						</main>

						{/* Right rail (can act like a drawer) */}
						<aside
							aria-hidden={!rightOpen}
							className={`border-l border-gray-200 p-3 overflow-auto transition-transform duration-200 ease-in-out ${
								rightOpen ? "translate-x-0" : "translate-x-full"
							}`}
						>
							<h4 className="text-lg font-semibold mb-2">Panel</h4>
							<p className="text-gray-600">
								Context, tools, AI suggestions, version diff, etc.
							</p>
						</aside>
					</div>

					{/* Command palette modal */}
					{/* Command palette modal */}
					{cmdOpen && (
						<div
							onClick={() => setCmdOpen(false)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									setCmdOpen(false);
								}
							}}
							// biome-ignore lint/a11y/useSemanticElements: <explanation>Role seems appropriate</explanation>
							role="button"
							tabIndex={0}
							className="fixed inset-0 bg-black/20 grid place-items-start-center pt-[10vh]"
						>
							<div
								onClick={(e) => e.stopPropagation()}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.stopPropagation();
									}
								}}
								// biome-ignore lint/a11y/useSemanticElements: <explanation>Role seems appropriate</explanation>
								role="button"
								tabIndex={0}
								className="w-[720px] max-w-[90vw] bg-white rounded-lg shadow-2xl"
							>
								<div className="p-3 border-b border-gray-200">
									<input
										placeholder="Search songs, commands…"
										className="w-full h-9 border border-gray-300 rounded-md px-2"
									/>
								</div>
								<div className="p-3">
									<p className="text-gray-600">Recent: last opened songs…</p>
								</div>
							</div>
						</div>
					)}
				</div>
				<Scripts />
			</body>
		</html>
	);
}
