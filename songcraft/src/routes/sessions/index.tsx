import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { useMemo } from "react";
import { LazyDataTable } from "../../components/admin/LazyDataTable";
import { API_ENDPOINTS } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { requireAuth } from "../../lib/requireAuth.server";

export const Route = createFileRoute("/sessions/")({
  beforeLoad: () => requireAuth(),
  component: SessionsPage,
});
interface Session {
  id: string;
  accountId: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  creatorName: string | null;
  accountName: string | null;
  permissions: Array<{
    userId: string;
    permissionLevel: string;
    grantedAt: string;
    expiresAt: string | null;
    userEmail: string | null;
  }>;
  sessionsCount: number;
}

function SessionsPage() {
  const { getAuthHeaders, isLoaded } = useAuth();

  // Define columns with useMemo for performance
  const columns = useMemo<ColumnDef<Session>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "accountName",
        header: "Account",
        cell: (info) => info.getValue() || "N/A",
      },
      {
        accessorKey: "creatorName",
        header: "Created By",
        cell: (info) => info.getValue() || "Unknown",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as string;
          return (
            <span
              className={`badge badge-${
                status === "active"
                  ? "success"
                  : status === "archived"
                  ? "warning"
                  : "error"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "sessionsCount",
        header: "Sessions",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: (info) =>
          new Date(info.getValue() as string).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (_info) => (
          <div className="flex gap-2">
            <button type="button" className="btn-sm-outline">
              Edit
            </button>
            <button type="button" className="btn-sm-outline">
              View Details
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Query function for fetching projects with pagination
  const queryFn = async (pagination: PaginationState) => {
    const authHeaders = getAuthHeaders();
    const page = pagination.pageIndex + 1; // Convert 0-based to 1-based
    const limit = pagination.pageSize;

    const response = await fetch(
      `${API_ENDPOINTS.sessions()}?page=${page}&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(authHeaders["x-clerk-user-id"] && {
            "x-clerk-user-id": authHeaders["x-clerk-user-id"],
          }),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch sessions: ${response.status}`);
    }

    const result = await response.json();
    console.log("Projects API response:", result);

    return {
      data: result.data || [],
      rowCount: result.data?.length || 0,
      pageCount: 1, // Since the API doesn't return pagination info
    };
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <LazyDataTable
      title="Sessions"
      columns={columns}
      queryKey={["admin", "sessions"]}
      queryFn={queryFn}
      initialPageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
    />
  );
}
