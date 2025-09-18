import { createFileRoute } from "@tanstack/react-router";
import { API_ENDPOINTS } from "../../lib/api";
import { requireAuth } from "../../lib/requireAuth.server";
import { useAuth } from "../../lib/auth";
import {
  createColumnHelper,
  ColumnDef,
  PaginationState,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "../../components/admin/DataTable";

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

// Column helper for type safety
const columnHelper = createColumnHelper<User>();

function UsersPage() {
  const { getAuthHeaders, isLoaded } = useAuth();

  // Define columns with useMemo for performance
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("globalRole", {
        header: "Role",
        cell: (info) => (
          <span
            className={`badge badge-${
              info.getValue() === "super_admin"
                ? "error"
                : info.getValue() === "admin"
                ? "warning"
                : "info"
            }`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: () => <span className="badge badge-success">Active</span>,
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.accessor("lastLoginAt", {
        header: "Last Login",
        cell: (info) =>
          info.getValue()
            ? new Date(info.getValue()!).toLocaleDateString()
            : "Never",
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex gap-2">
            <button className="btn btn-sm btn-outline">Edit Role</button>
            <button className="btn btn-sm btn-outline">View Details</button>
          </div>
        ),
      }),
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
    <DataTable
      title="Users"
      columns={columns}
      queryKey={["admin", "users"]}
      queryFn={queryFn}
      initialPageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
    />
  );
}
