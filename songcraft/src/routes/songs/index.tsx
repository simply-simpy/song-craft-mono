import { useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "@songcraft/shared";
import { DataTable } from "../../components/admin/DataTable";
import { Button } from "@/components/ui";
import { API_ENDPOINTS, apiRequest } from "../../lib/api";
import { requireAuth } from "../../lib/requireAuth.server";
import type { ColumnDef } from "@tanstack/react-table";

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

  const handleDelete = async (id: string) => {
    const ok =
      typeof window !== "undefined"
        ? window.confirm("Delete this song?")
        : true;
    if (!ok) return;
    await apiRequest({ endpoint: API_ENDPOINTS.song(id), method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["songs"] });
  };

  const columns: ColumnDef<Song>[] = [
    {
      accessorKey: "shortId",
      header: "Song ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("shortId")}</div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "artist",
      header: "Artist",
      cell: ({ row }) => {
        const artist = row.getValue("artist") as string | null;
        return <div>{artist || "-"}</div>;
      },
    },
    {
      accessorKey: "bpm",
      header: "BPM",
      cell: ({ row }) => {
        const bpm = row.getValue("bpm") as number | null;
        return <div>{bpm || "-"}</div>;
      },
    },
    {
      accessorKey: "key",
      header: "Key",
      cell: ({ row }) => {
        const key = row.getValue("key") as string | null;
        return <div>{key || "-"}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return <div>{date ? new Date(date).toLocaleDateString() : "-"}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const song = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link
              to="/songs/$songId"
              params={{ songId: song.id }}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              View
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(song.id)}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  const queryFn = async (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    const response = await apiRequest({
      endpoint: `${API_ENDPOINTS.songs()}?page=${
        pagination.pageIndex + 1
      }&limit=${pagination.pageSize}&sort=updatedAt&order=desc`,
      schema: songsListSchema,
    });

    return {
      data: response.songs,
      rowCount: response.pagination.total,
      pageCount: response.pagination.pages,
    };
  };

  return (
    <div className="mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="default" asChild>
            <Link to="/songs/new">New Song</Link>
          </Button>
        </div>
      </div>

      <DataTable
        title="Songs"
        columns={columns}
        queryKey={["songs"]}
        queryFn={queryFn}
        initialPageSize={20}
        pageSizeOptions={[10, 20, 50, 100]}
      />
    </div>
  );
}
