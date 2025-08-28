import { env } from "@/env";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

const API_URL = env.VITE_API_URL || "http://localhost:4500";

export const Route = createFileRoute("/songs/new")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		title: "",
		bpm: "",
		key: "",
		tags: [] as string[],
	});

	const createSong = useMutation({
		mutationFn: async (songData: typeof formData) => {
			const response = await fetch(`${API_URL}/songs`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...songData,
					ownerClerkId: "temp-user-id", // You'll need to get this from Clerk
					bpm: songData.bpm ? Number.parseInt(songData.bpm) : undefined,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to create song");
			}

			return response.json();
		},
		onSuccess: () => {
			navigate({ to: "/songs" });
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		createSong.mutate(formData);
	};

	return (
		<div className="max-w-2xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">Create New Song</h1>

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

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label htmlFor="bpm" className="block text-sm font-medium mb-2">
							BPM
						</label>
						<input
							id="bpm"
							type="number"
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
						<select
							id="key"
							value={formData.key}
							onChange={(e) =>
								setFormData({ ...formData, key: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select key</option>
							<option value="C">C</option>
							<option value="G">G</option>
							<option value="D">D</option>
							<option value="A">A</option>
							<option value="E">E</option>
							<option value="B">B</option>
							<option value="F#">F#</option>
							<option value="C#">C#</option>
							<option value="F">F</option>
							<option value="Bb">Bb</option>
							<option value="Eb">Eb</option>
							<option value="Ab">Ab</option>
						</select>
					</div>
				</div>

				<div className="flex gap-4">
					<button
						type="submit"
						disabled={createSong.isPending}
						className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
					>
						{createSong.isPending ? "Creating..." : "Create Song"}
					</button>

					<button
						type="button"
						onClick={() => navigate({ to: "/songs" })}
						className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
					>
						Cancel
					</button>
				</div>

				{createSong.error && (
					<div className="text-red-600 text-sm">
						Error: {createSong.error.message}
					</div>
				)}
			</form>
		</div>
	);
}
