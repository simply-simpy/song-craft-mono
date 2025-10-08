import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { API_ENDPOINTS } from "../../lib/api";
import { requireAuth } from "../../lib/requireAuth.server";

export const Route = createFileRoute("/songs/new")({
	beforeLoad: () => requireAuth(),
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		title: "",
		artist: "",
		bpm: "",
		key: "",
		tags: [] as string[],
		lyrics: "",
		midiData: "",
		collaborators: [] as string[],
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		createSong.mutate(formData);
	};

	const createSong = useMutation({
		mutationFn: async (songData: typeof formData) => {
			const requestBody = {
				ownerClerkId: "temp-user-id",
				title: songData.title,
				artist: songData.artist || undefined,
				bpm: songData.bpm ? Number.parseInt(songData.bpm) : undefined,
				key: songData.key || undefined,
				tags: songData.tags,
				lyrics: songData.lyrics || undefined,
				midiData: songData.midiData || undefined,
				collaborators: songData.collaborators,
			};

			console.log("🚀 Frontend sending song data:", requestBody);

			const response = await fetch(API_ENDPOINTS.songs(), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestBody),
			});

			console.log("📡 API response status:", response.status);
			const responseData = await response.json();
			console.log("📡 API response data:", responseData);

			if (!response.ok) {
				throw new Error(
					`Failed to create song: ${response.status} - ${JSON.stringify(
						responseData,
					)}`,
				);
			}

			return responseData;
		},
		onSuccess: (data) => {
			console.log("✅ Song created successfully:", data);
			navigate({ to: "/songs" });
		},
		onError: (error) => {
			console.error("❌ Song creation failed:", error);
		},
	});

	return (
		<div className="max-w-2xl mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Create New Song</h1>
			</div>

			<div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
				<div className="text-sm text-blue-600 mb-1">ℹ️ Note</div>
				<div className="text-sm text-blue-700">
					A unique short ID will be automatically generated for your song when
					it's created.
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="title" className="block text-sm font-medium mb-2">
						Title *
					</label>
					<input
						id="title"
						type="text"
						required
						value={formData.title}
						onChange={(e) =>
							setFormData({ ...formData, title: e.target.value })
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Enter song title"
					/>
				</div>

				<div>
					<label htmlFor="artist" className="block text-sm font-medium mb-2">
						Artist
					</label>
					<input
						id="artist"
						type="text"
						value={formData.artist}
						onChange={(e) =>
							setFormData({ ...formData, artist: e.target.value })
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Enter artist name"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label htmlFor="bpm" className="block text-sm font-medium mb-2">
							BPM
						</label>
						<input
							id="bpm"
							type="number"
							min="1"
							max="300"
							value={formData.bpm}
							onChange={(e) =>
								setFormData({ ...formData, bpm: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="120"
						/>
					</div>

					<div>
						<label htmlFor="key" className="block text-sm font-medium mb-2">
							Key
						</label>
						<input
							id="key"
							type="text"
							value={formData.key}
							onChange={(e) =>
								setFormData({ ...formData, key: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="C"
						/>
					</div>
				</div>

				<div>
					<label htmlFor="lyrics" className="block text-sm font-medium mb-2">
						Lyrics
					</label>
					<textarea
						id="lyrics"
						rows={4}
						value={formData.lyrics}
						onChange={(e) =>
							setFormData({ ...formData, lyrics: e.target.value })
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Enter your lyrics here..."
					/>
				</div>

				<div className="flex justify-end space-x-3">
					<button
						type="button"
						onClick={() => navigate({ to: "/songs" })}
						className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={createSong.isPending}
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{createSong.isPending ? "Creating..." : "Create Song"}
					</button>
				</div>
			</form>
		</div>
	);
}
