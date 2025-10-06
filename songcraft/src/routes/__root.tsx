import {
	HeadContent,
	Link,
	Outlet,
	Scripts,
	createRootRoute,
	useRouterState,
} from "@tanstack/react-router";
// app/routes/__root.tsx
import * as React from "react";
import ClerkProvider from "../integrations/clerk/provider";
import { RadixThemeIntegration } from "../components/RadixThemeIntegration";
import { ThemeProvider } from "../components/ThemeProvider";
import { ThemeSwitcher } from "../components/ThemeSwitcher";

// Import styles
import "../styles.css";
import CurrentUser from "@/components/admin/currentUser";
import { CommandPalette } from "@/components/CommandPalette";
import { AccountContextDisplay } from "@/components/layout/navigation/AccountContextDisplay.tsx";
import Navigation from "@/components/layout/navigation/navigation";
import { Button, Input } from "@/components/ui";
import { SignedIn, SignedOut } from "@clerk/tanstack-react-start";
import { Navigate } from "@tanstack/react-router";

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
	const [cmdOpen, setCmdOpen] = React.useState(false);
	const location = useRouterState({ select: (s) => s.location });
	const isAuthPage = location.pathname.startsWith("/sign-in");

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
			<ThemeProvider defaultTheme={{ colorScheme: "light", brandSkin: "blue" }}>
				<ClerkProvider>
					<body>
						<RadixThemeIntegration>
							{isAuthPage ? (
								<main className="p-6 min-h-screen grid place-items-center">
									<Outlet />
								</main>
							) : (
								<>
									{/* Temporarily disable auth redirect for development */}
									<SignedOut>
										<Navigate
											to="/sign-in"
											search={{
												returnTo: `${location.pathname}${
													location.search ?? ""
												}`,
											}}
										/>
									</SignedOut>{" "}
									<SignedIn>
										<div className="h-screen grid grid-rows-[48px_1fr]">
											{/* Top bar with search */}
											<div className="flex items-center gap-3 px-3 border-b border-gray-200">
												<Link to="/" className="font-bold">
													SongScribe
												</Link>

												<Link
													to="/theme-test"
													className="text-sm text-green-600 hover:underline"
												>
													Theme Test
												</Link>
												<Input
													placeholder="Search (⌘K)"
													onFocus={() => setCmdOpen(true)}
												/>

												<SignedIn>
													<ThemeSwitcher />
													<Button variant="default">Sign out</Button>
													<AccountContextDisplay />
												</SignedIn>
											</div>

											{/* 3-column layout */}
											<div className="grid grid-cols-[260px_1fr]   h-full">
												{/* Left nav */}
												<aside className="border-r bg-surface-elevated border-gray-200 p-3">
													<Navigation />
													<CurrentUser />
												</aside>

												<main className="p-3 overflow-auto">
													<Outlet />
												</main>
											</div>
										</div>
									</SignedIn>
								</>
							)}
							<CommandPalette
								isOpen={cmdOpen}
								onClose={() => setCmdOpen(false)}
							/>
							<Scripts />
						</RadixThemeIntegration>
					</body>
				</ClerkProvider>
			</ThemeProvider>
		</html>
	);
}
