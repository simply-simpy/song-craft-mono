import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { useMemo } from "react";
import { LazyDataTable } from "../../components/admin/LazyDataTable";
import { API_ENDPOINTS } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { requireAuth } from "../../lib/requireAuth.server";

export const Route = createFileRoute("/admin/users")({
  beforeLoad: () => requireAuth(),
  component: UsersPage,
});
interface User {
  id: string;
  email: string;
  globalRole: string;
  createdAt: string;
  lastLoginAt?: string;
}

function UsersPage() {
  const { getAuthHeaders, isLoaded } = useAuth();

  // Define columns with useMemo for performance
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "globalRole",
        header: "Role",
        cell: (info) => {
          // TDODO: is this safe?
          const role = info.getValue() as string;
          return (
            <span
              className={`badge badge-${
                role === "super_admin"
                  ? "error"
                  : role === "admin"
                  ? "warning"
                  : "info"
              }`}
            >
              {role}
            </span>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: () => <span className="badge badge-success">Active</span>,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: (info) =>
          // TODO: is this safe?
          new Date(info.getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: "lastLoginAt",
        header: "Last Login",
        cell: (info) => {
          // TODO: is this safe?
          const lastLogin = info.getValue() as string | undefined;
          return lastLogin ? new Date(lastLogin).toLocaleDateString() : "Never";
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: (_info) => (
          <div className="flex gap-2">
            <button type="button" className="btn-sm-outline">
              Edit Role
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

  // Query function for fetching users with pagination
  const queryFn = async (pagination: PaginationState) => {
    const authHeaders = getAuthHeaders();
    const page = pagination.pageIndex + 1; // Convert 0-based to 1-based
    const limit = pagination.pageSize;

    const response = await fetch(
      `${API_ENDPOINTS.admin.users()}?page=${page}&limit=${limit}`,
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
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const result = await response.json();

    return {
      data: result.data.users,
      rowCount: result.data.rowCount,
      pageCount: result.data.pageCount,
    };
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <LazyDataTable
      title="Users"
      columns={columns}
      queryKey={["admin", "users"]}
      queryFn={queryFn}
      initialPageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
    />
  );
}
