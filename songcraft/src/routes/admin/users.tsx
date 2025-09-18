import { createFileRoute } from "@tanstack/react-router";
import { API_ENDPOINTS } from "../../lib/api";
import { useQuery } from "@tanstack/react-query";
import { requireAuth } from "../../lib/requireAuth.server";
import { useAuth } from "../../lib/auth";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

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
// Define columns
const columns = [
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
];

function UsersPage() {
  const { getAuthHeaders, isLoaded } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const authHeaders = getAuthHeaders();
      const response = await fetch(API_ENDPOINTS.admin.users(), {
        headers: {
          "Content-Type": "application/json",
          ...(authHeaders["x-clerk-user-id"] && {
            "x-clerk-user-id": authHeaders["x-clerk-user-id"],
          }),
        },
      });
      return response.json();
    },
    enabled: isLoaded,
  });

  const table = useReactTable({
    data: data?.data?.users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error loading users: {error.message}</div>;
  }

  if (!data?.data?.users) {
    return <div>No users found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
