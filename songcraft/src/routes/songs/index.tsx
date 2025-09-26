import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { z } from "zod";
import { SongCard } from "../../components/SongCard";
import { ThemeSwitcher } from "../../components/ThemeSwitcher";
import { API_ENDPOINTS, ApiError, apiRequest } from "../../lib/api";
import { requireAuth } from "../../lib/requireAuth.server";

export const Route = createFileRoute("/songs/")({
	beforeLoad: () => requireAuth(),
	component: RouteComponent,
});

const songResponseSchema = z.object({
	id: z.string().uuid(),
	shortId: z.string().min(1),
	ownerClerkId: z.string(),
	title: z.string(),
	artist: z.string().nullable().optional(),
	bpm: z.number().nullable().optional(),
	key: z.string().nullable().optional(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

const songsListSchema = z.object({
	songs: z.array(songResponseSchema),
	pagination: z.object({
		page: z.number(),
		limit: z.number(),
		total: z.number(),
		pages: z.number(),
	}),
});

type Song = z.infer<typeof songResponseSchema>;

function RouteComponent() {
	const queryClient = useQueryClient();
	const parentRef = useRef<HTMLDivElement>(null);

	const handleDelete = async (id: string) => {
		const ok =
			typeof window !== "undefined"
				? window.confirm("Delete this song?")
				: true;
		if (!ok) return;
		await apiRequest({ endpoint: API_ENDPOINTS.song(id), method: "DELETE" });
		await queryClient.invalidateQueries({ queryKey: ["songs"] });
	};

	const {
		data: songsData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["songs"],
		queryFn: async () =>
			apiRequest({
				endpoint: API_ENDPOINTS.songs(),
				schema: songsListSchema,
			}),
	});

	const songs: Song[] = songsData?.songs ?? [];

	// Set up virtualization - only virtualize if we have more than 20 songs
	const shouldVirtualize = songs.length > 20;

	const rowVirtualizer = useVirtualizer({
		count: songs.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 72, // Height of each song row (approximate)
		enabled: shouldVirtualize,
	});

	if (isLoading) {
		return (
			<div className="max-w-6xl mx-auto p-6">
				<div className="text-center">Loading songs...</div>
			</div>
		);
	}

	if (error) {
		const message =
			error instanceof ApiError
				? `${error.status} ${error.statusText}`
				: error instanceof Error
					? error.message
					: "Unknown error";
		return (
			<div className="max-w-6xl mx-auto p-6">
				<div className="text-center text-red-600">
					Error loading songs: {message}
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold text-gray-900">Songs</h1>
				<div className="flex items-center gap-4">
					<ThemeSwitcher />
					<Link
						to="/songs/new"
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						New Song
					</Link>
				</div>
			</div>

			{songs.length === 0 ? (
				<div className="text-center py-12">
					<div className="text-gray-500 text-lg mb-4">No songs yet</div>
					<Link
						to="/songs/new"
						className="text-blue-600 hover:text-blue-700 underline"
					>
						Create your first song
					</Link>
				</div>
			) : (
				<div className="bg-white shadow-sm rounded-lg overflow-hidden">
					{/* Header */}
					<div className="bg-gray-50 border-b border-gray-200">
						<div className="px-6 py-3 grid grid-cols-12 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							<div className="col-span-2">Song ID</div>
							<div className="col-span-3">Title</div>
							<div className="col-span-2">Artist</div>
							<div className="col-span-1">BPM</div>
							<div className="col-span-1">Key</div>
							<div className="col-span-2">Created</div>
							<div className="col-span-1">Actions</div>
						</div>
					</div>

					{/* Virtualized List or Regular List */}
					{shouldVirtualize ? (
						<div
							ref={parentRef}
							className="h-150 overflow-auto" // Fixed height for virtualization
						>
							<div
								style={{
									height: `${rowVirtualizer.getTotalSize()}px`,
									width: "100%",
									position: "relative",
								}}
							>
								{rowVirtualizer.getVirtualItems().map((virtualRow) => {
									const song = songs[virtualRow.index];
									return (
										<div
											key={virtualRow.key}
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												width: "100%",
												height: `${virtualRow.size}px`,
												transform: `translateY(${virtualRow.start}px)`,
											}}
										>
											<SongCard song={song} onDelete={handleDelete} />
										</div>
									);
								})}
							</div>
						</div>
					) : (
						<div className="max-h-96 overflow-auto">
							{songs.map((song: Song) => (
								<SongCard key={song.id} song={song} onDelete={handleDelete} />
							))}
						</div>
					)}

					{/* Songs count indicator */}
					<div className="bg-gray-50 px-6 py-2 border-t border-gray-200">
						<div className="text-sm text-gray-500">
							{songs.length} song{songs.length !== 1 ? "s" : ""} total
							{shouldVirtualize && " (virtualized for performance)"}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
