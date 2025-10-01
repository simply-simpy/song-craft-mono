import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { useMemo } from "react";
import { LazyDataTable } from "../../components/admin/LazyDataTable";
import { API_ENDPOINTS } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { requireAuth } from "../../lib/requireAuth.server";

// Import new reusable components
import { Badge, StatusBadge, PlanBadge, CountBadge } from "../../components/Badge";

export const Route = createFileRoute("/admin/accounts/refactored")({
  beforeLoad: () => requireAuth(),
  component: AccountsPage,
});

interface Account {
  id: string;
  name: string;
  description?: string;
  plan: string;
  status: string;
  billingEmail?: string;
  isDefault: boolean;
  createdAt: string;
  orgId?: string;
  orgName?: string;
  memberCount: number;
}

function AccountsPage() {
  const { getAuthHeaders, isLoaded } = useAuth();

  // Define columns with useMemo for performance
  const columns = useMemo<ColumnDef<Account>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Account Name",
        cell: (info) => {
          const name = info.getValue() as string;
          const isDefault = info.row.original.isDefault;
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-fg-primary">{name}</span>
              {isDefault && (
                <Badge variant="brand" size="sm">Default</Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "plan",
        header: "Plan",
        cell: (info) => {
          const plan = info.getValue() as string;
          return <PlanBadge plan={plan} />;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as string;
          return <StatusBadge status={status} />;
        },
      },
      {
        accessorKey: "orgName",
        header: "Organization",
        cell: (info) => {
          const orgName = info.getValue() as string | undefined;
          return orgName ? (
            <span className="text-sm text-fg-primary">{orgName}</span>
          ) : (
            <span className="text-sm text-fg-tertiary">No Organization</span>
          );
        },
      },
      {
        accessorKey: "memberCount",
        header: "Members",
        cell: (info) => {
          const count = info.getValue() as number;
          return (
            <CountBadge 
              count={count} 
              singular="member" 
              plural="members"
            />
          );
        },
      },
      {
        accessorKey: "billingEmail",
        header: "Billing Email",
        cell: (info) => {
          const email = info.getValue() as string | undefined;
          return email ? (
            <span className="text-sm text-fg-primary">{email}</span>
          ) : (
            <span className="text-sm text-fg-tertiary">-</span>
          );
        },
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
        cell: () => (
          <div className="flex gap-2">
            <button type="button" className="btn-sm-outline">
              View Details
            </button>
            <button type="button" className="btn-sm-outline">
              Edit
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Query function for fetching accounts with pagination
  const queryFn = async (pagination: PaginationState) => {
    const authHeaders = getAuthHeaders();
    const page = pagination.pageIndex + 1; // Convert 0-based to 1-based
    const limit = pagination.pageSize;

    const response = await fetch(
      `${API_ENDPOINTS.admin.accounts()}?page=${page}&limit=${limit}`,
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
      throw new Error(`Failed to fetch accounts: ${response.status}`);
    }

    const result = await response.json();

    return {
      data: result.data.accounts,
      rowCount: result.data.rowCount,
      pageCount: result.data.pageCount,
    };
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <LazyDataTable
      title="Accounts"
      columns={columns}
      queryKey={["admin", "accounts"]}
      queryFn={queryFn}
      initialPageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
    />
  );
}