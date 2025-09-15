import { Link } from "@tanstack/react-router";

interface Song {
  id: string;
  shortId: string;
  title: string;
  artist?: string;
  bpm?: number;
  key?: string;
  createdAt?: string;
}

interface SongCardProps {
  song: Song;
  onDelete: (id: string) => void;
}

export function SongCard({ song, onDelete }: SongCardProps) {
  // Use full UUID for routing instead of shortId
  const songId = song.id;

  return (
    <div className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
      <div className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
        {/* Song ID */}
        <div className="col-span-2">
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {song.shortId || songId.slice(0, 8)}
            </span>
            <span className="ml-2 text-xs text-gray-500">ID</span>
          </div>
        </div>

        {/* Title */}
        <div className="col-span-3">
          <div className="text-sm font-medium text-gray-900 truncate">
            {song.title}
          </div>
        </div>

        {/* Artist */}
        <div className="col-span-2">
          <div className="text-sm text-gray-500 truncate">
            {song.artist || "-"}
          </div>
        </div>

        {/* BPM */}
        <div className="col-span-1">
          <div className="text-sm text-gray-500">{song.bpm || "-"}</div>
        </div>

        {/* Key */}
        <div className="col-span-1">
          <div className="text-sm text-gray-500">{song.key || "-"}</div>
        </div>

        {/* Created Date */}
        <div className="col-span-2">
          <div className="text-sm text-gray-500">
            {song.createdAt
              ? new Date(song.createdAt).toLocaleDateString()
              : "-"}
          </div>
        </div>

        {/* Actions */}
        <div className="col-span-1">
          <div className="flex items-center gap-3">
            <Link
              to="/songs/$songId/lyrics"
              params={{ songId }}
              className="text-blue-600 hover:text-blue-900 text-sm"
            >
              View
            </Link>
            <button
              type="button"
              onClick={() => onDelete(song.id)}
              className="text-red-600 hover:text-red-900 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
