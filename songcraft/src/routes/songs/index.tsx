import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "../../lib/requireAuth.server";
import { extractPrefix } from "@songcraft/shared";
import { ThemeSwitcher } from "../../components/ThemeSwitcher";
import { API_ENDPOINTS } from "../../lib/api";

interface Song {
  id: string;
  shortId: string;
  title: string;
  artist?: string;
  bpm?: number;
  key?: string;
  createdAt?: string;
}

export const Route = createFileRoute("/songs/")({
  beforeLoad: () => requireAuth(),
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const handleDelete = async (id: string) => {
    const ok =
      typeof window !== "undefined"
        ? window.confirm("Delete this song?")
        : true;
    if (!ok) return;
    await fetch(API_ENDPOINTS.song(id), { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["songs"] });
  };
  const { data: songsData, isLoading, error } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.songs());
      if (!response.ok) {
        throw new Error("Failed to fetch songs");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">Loading songs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center text-red-600">
          Error loading songs: {error.message}
        </div>
      </div>
    );
  }

  const songs = songsData?.data || [];

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
          <table className="w-full  divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Song ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/6">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Artist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  BPM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {songs.map((s: Song) => {
                const shortId = s.shortId || s.id;
                const prefix = extractPrefix(shortId);

                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {shortId}
                        </span>
                        {prefix && (
                          <span className="ml-2 text-xs text-gray-500">
                            {prefix}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {s.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {s.artist || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {s.bpm || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {s.key || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <Link
                          to="/songs/$songId/lyrics"
                          params={{ songId: shortId }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
