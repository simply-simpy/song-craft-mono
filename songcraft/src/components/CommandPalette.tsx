import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { API_ENDPOINTS, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useAccountContext } from "../lib/useAccountContext";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface SearchResult {
	songs: Array<{
		id: string;
		shortId: string;
		title: string;
		artist: string | null;
		createdAt: string;
	}>;
	projects: Array<{
		id: string;
		name: string;
		description: string | null;
		createdAt: string;
	}>;
	users: Array<{
		id: string;
		email: string;
		clerkId: string;
		globalRole: string;
	}>;
	accounts: Array<{
		id: string;
		name: string;
		description: string | null;
		plan: string;
		status: string;
	}>;
	totalResults: number;
}

interface CommandPaletteProps {
	isOpen: boolean;
	onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
	const [query, setQuery] = useState("");
	const navigate = useNavigate();
	const { getAuthHeaders, isLoaded, user } = useAuth();

	// Get account context for the current user
	const { currentContext } = useAccountContext(user?.id || "");

	// Close on Escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			return () => document.removeEventListener("keydown", handleEscape);
		}
	}, [isOpen, onClose]);

	// Search query
	const { data: searchResults, isLoading } = useQuery({
		queryKey: ["search", query, currentContext?.currentAccountId],
		queryFn: async () => {
			if (!query.trim()) return null;

			const authHeaders = getAuthHeaders();
			const response = await fetch(
				`${API_ENDPOINTS.search()}?q=${encodeURIComponent(query)}&limit=10`,
				{
					headers: {
						"Content-Type": "application/json",
						...(authHeaders["x-clerk-user-id"] && {
							"x-clerk-user-id": authHeaders["x-clerk-user-id"],
						}),
						...(currentContext?.currentAccountId && {
							"x-account-id": currentContext.currentAccountId,
						}),
					},
				},
			);

			if (!response.ok) {
				throw new ApiError(
					response.status,
					response.statusText,
					response.url,
					null,
				);
			}

			return response.json() as Promise<SearchResult>;
		},
		enabled: query.length > 0 && isLoaded && !!currentContext?.currentAccountId,
		staleTime: 30000, // Cache for 30 seconds
	});

	const handleItemClick = (type: string, id: string) => {
		onClose();
		setQuery("");

		switch (type) {
			case "song":
				navigate({ to: "/songs/$songId", params: { songId: id } });
				break;
			case "project":
				// Navigate to projects list for now (no individual project page exists)
				navigate({ to: "/projects" });
				break;
			case "user":
				// Navigate to users list for now (no individual user page exists)
				navigate({ to: "/admin/users" });
				break;
			case "account":
				// Navigate to accounts list for now (no individual account page exists)
				navigate({ to: "/admin/accounts" });
				break;
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/50"
				onClick={onClose}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						onClose();
					}
				}}
				role="button"
				tabIndex={0}
			/>

			{/* Command Palette */}
			<div className="relative w-full max-w-2xl mx-4">
				<div
					className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
					style={{
						backgroundColor: "var(--surface-elevated)",
						borderColor: "var(--border-primary)",
					}}
				>
					{/* Search Input */}
					<div
						className="flex items-center px-4 py-3 border-b"
						style={{ borderBottomColor: "var(--border-primary)" }}
					>
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search songs, projects, users, accounts..."
							className="border-0 shadow-none text-lg"
							autoFocus
							style={{
								backgroundColor: "transparent",
								color: "var(--fg-primary)",
							}}
						/>
						<Button
							variant="ghost"
							size="sm"
							onClick={onClose}
							className="ml-2"
						>
							ESC
						</Button>
					</div>

					{/* Results */}
					<div className="max-h-96 overflow-y-auto">
						{!query ? (
							<div
								className="px-4 py-8 text-center"
								style={{ color: "var(--fg-secondary)" }}
							>
								<div className="text-sm">Start typing to search...</div>
								<div className="text-xs mt-2 opacity-75">
									Search across songs, projects, users, and accounts
								</div>
							</div>
						) : isLoading ? (
							<div
								className="px-4 py-8 text-center"
								style={{ color: "var(--fg-secondary)" }}
							>
								<div className="text-sm">Searching...</div>
							</div>
						) : searchResults && searchResults.totalResults > 0 ? (
							<div className="py-2">
								{/* Songs */}
								{searchResults.songs.length > 0 && (
									<div className="px-4 py-2">
										<div
											className="text-xs font-medium uppercase tracking-wider mb-2"
											style={{ color: "var(--fg-secondary)" }}
										>
											Songs ({searchResults.songs.length})
										</div>
										{searchResults.songs.map((song) => (
											<button
												type="button"
												key={song.id}
												onClick={() => handleItemClick("song", song.id)}
												className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
												style={{
													color: "var(--fg-primary)",
													backgroundColor: "transparent",
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.backgroundColor =
														"var(--surface-hover)";
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.backgroundColor = "transparent";
												}}
											>
												<div className="font-medium">{song.title}</div>
												<div
													className="text-sm opacity-75"
													style={{ color: "var(--fg-secondary)" }}
												>
													{song.artist || "Unknown Artist"} • {song.shortId}
												</div>
											</button>
										))}
									</div>
								)}

								{/* Projects */}
								{searchResults.projects.length > 0 && (
									<div className="px-4 py-2">
										<div
											className="text-xs font-medium uppercase tracking-wider mb-2"
											style={{ color: "var(--fg-secondary)" }}
										>
											Projects ({searchResults.projects.length})
										</div>
										{searchResults.projects.map((project) => (
											<button
												type="button"
												key={project.id}
												onClick={() => handleItemClick("project", project.id)}
												className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
												style={{
													color: "var(--fg-primary)",
													backgroundColor: "transparent",
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.backgroundColor =
														"var(--surface-hover)";
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.backgroundColor = "transparent";
												}}
											>
												<div className="font-medium">{project.name}</div>
												<div
													className="text-sm opacity-75"
													style={{ color: "var(--fg-secondary)" }}
												>
													{project.description || "No description"}
												</div>
											</button>
										))}
									</div>
								)}

								{/* Users */}
								{searchResults.users.length > 0 && (
									<div className="px-4 py-2">
										<div
											className="text-xs font-medium uppercase tracking-wider mb-2"
											style={{ color: "var(--fg-secondary)" }}
										>
											Users ({searchResults.users.length})
										</div>
										{searchResults.users.map((user) => (
											<button
												type="button"
												key={user.id}
												onClick={() => handleItemClick("user", user.id)}
												className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
												style={{
													color: "var(--fg-primary)",
													backgroundColor: "transparent",
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.backgroundColor =
														"var(--surface-hover)";
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.backgroundColor = "transparent";
												}}
											>
												<div className="font-medium">{user.email}</div>
												<div
													className="text-sm opacity-75"
													style={{ color: "var(--fg-secondary)" }}
												>
													{user.globalRole} • {user.clerkId}
												</div>
											</button>
										))}
									</div>
								)}

								{/* Accounts */}
								{searchResults.accounts.length > 0 && (
									<div className="px-4 py-2">
										<div
											className="text-xs font-medium uppercase tracking-wider mb-2"
											style={{ color: "var(--fg-secondary)" }}
										>
											Accounts ({searchResults.accounts.length})
										</div>
										{searchResults.accounts.map((account) => (
											<button
												type="button"
												key={account.id}
												onClick={() => handleItemClick("account", account.id)}
												className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
												style={{
													color: "var(--fg-primary)",
													backgroundColor: "transparent",
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.backgroundColor =
														"var(--surface-hover)";
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.backgroundColor = "transparent";
												}}
											>
												<div className="font-medium">{account.name}</div>
												<div
													className="text-sm opacity-75"
													style={{ color: "var(--fg-secondary)" }}
												>
													{account.plan} • {account.status}
												</div>
											</button>
										))}
									</div>
								)}
							</div>
						) : (
							<div
								className="px-4 py-8 text-center"
								style={{ color: "var(--fg-secondary)" }}
							>
								<div className="text-sm">No results found for "{query}"</div>
								<div className="text-xs mt-2 opacity-75">
									Try different keywords or check spelling
								</div>
							</div>
						)}
					</div>

					{/* Footer */}
					<div
						className="px-4 py-2 border-t text-xs"
						style={{
							borderTopColor: "var(--border-primary)",
							color: "var(--fg-tertiary)",
						}}
					>
						<div className="flex items-center justify-between">
							<div>
								Press{" "}
								<kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
									ESC
								</kbd>{" "}
								to close
							</div>
							{searchResults && (
								<div>
									{searchResults.totalResults} result
									{searchResults.totalResults !== 1 ? "s" : ""}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
