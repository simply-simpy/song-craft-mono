import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { ThemeSwitcher } from "../../../components/ThemeSwitcher";
import { API_ENDPOINTS } from "../../../lib/api";

interface LyricVersion {
	id: string;
	shortId: string;
	songId: string;
	versionName: string;
	contentMd: string;
	createdAt: string;
}

export const Route = createFileRoute("/songs/$songId/lyrics")({
	component: RouteComponent,
});

function RouteComponent() {
	const { songId } = useParams({ from: "/songs/$songId/lyrics" });

	// Basic validation - just check if songId exists
	if (!songId) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<div className="text-center text-red-600">
					<h1 className="text-2xl font-bold mb-4">Missing Song ID</h1>
					<p>No song ID provided in the URL.</p>
				</div>
			</div>
		);
	}

	const {
		data: versionsData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["lyricVersions", songId],
		queryFn: async () => {
			const response = await fetch(API_ENDPOINTS.songVersions(songId));
			if (!response.ok) {
				throw new Error("Failed to fetch lyric versions");
			}
			return response.json();
		},
	});

	if (isLoading) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<div className="text-center">Loading lyrics...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<div className="text-center text-red-600">
					<h1 className="text-2xl font-bold mb-4">Error Loading Lyrics</h1>
					<p>{error.message}</p>
				</div>
			</div>
		);
	}

	const versions = versionsData?.data || [];

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="mb-6">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-3xl font-bold text-gray-900">Song Lyrics</h1>
					<div className="flex items-center gap-4">
						<div className="text-sm text-gray-500">
							ID:{" "}
							<span className="font-mono bg-gray-100 px-2 py-1 rounded">
								{songId}
							</span>
						</div>
						<ThemeSwitcher />
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Lyrics Editor */}
				<div className="lg:col-span-2">
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<h2 className="text-xl font-semibold mb-4">Edit Lyrics</h2>
						<textarea
							className="text-black w-full h-64 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
							placeholder="Enter your lyrics here..."
						/>
						<div className="flex justify-end mt-4 space-x-3">
							<button
								type="button"
								className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
							>
								Save Draft
							</button>
							<button
								type="button"
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								Save Version
							</button>
						</div>
					</div>
				</div>

				{/* Version History */}
				<div className="lg:col-span-1">
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<h3 className="text-lg font-semibold mb-4">Version History</h3>
						{versions.length === 0 ? (
							<div className="text-gray-500 text-sm">No versions yet</div>
						) : (
							<div className="space-y-3">
								{versions.map((version: LyricVersion) => (
									<div
										key={version.id}
										className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
									>
										<div className="flex justify-between items-center mb-2">
											<span className="font-medium text-sm">
												{version.versionName}
											</span>
											<span className="text-xs text-gray-500">
												{version.createdAt
													? new Date(version.createdAt).toLocaleDateString()
													: "-"}
											</span>
										</div>
										<div className="text-xs text-gray-600 line-clamp-2">
											{version.contentMd}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
