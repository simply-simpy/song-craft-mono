import { z } from "@songcraft/shared";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { useMemo } from "react";
import { LazyDataTable } from "../../components/admin/LazyDataTable";
import { API_ENDPOINTS } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { requireAuth } from "../../lib/requireAuth.server";
import { useAuthedApi } from "../../lib/useAuthedApi";

export const Route = createFileRoute("/admin/accounts")({
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
	const { isLoaded } = useAuth();
	const authedApi = useAuthedApi();

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
							<span className="font-medium">{name}</span>
							{isDefault && (
								<span className="badge badge-xs badge-primary">Default</span>
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
					const planColors = {
						Free: "badge-info",
						Pro: "badge-success",
						Team: "badge-warning",
						Enterprise: "badge-error",
					};
					return (
						<span
							className={`badge ${
								planColors[plan as keyof typeof planColors] || "badge-neutral"
							}`}
						>
							{plan}
						</span>
					);
				},
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: (info) => {
					const status = info.getValue() as string;
					const statusColors = {
						active: "badge-success",
						suspended: "badge-warning",
						cancelled: "badge-error",
					};
					return (
						<span
							className={`badge ${
								statusColors[status as keyof typeof statusColors] ||
								"badge-neutral"
							}`}
						>
							{status}
						</span>
					);
				},
			},
			{
				accessorKey: "orgName",
				header: "Organization",
				cell: (info) => {
					const orgName = info.getValue() as string | undefined;
					return orgName ? (
						<span className="text-sm">{orgName}</span>
					) : (
						<span className="text-sm text-gray-400">No Organization</span>
					);
				},
			},
			{
				accessorKey: "memberCount",
				header: "Members",
				cell: (info) => {
					const count = info.getValue() as number;
					return (
						<span className="badge badge-outline">
							{count} member{count !== 1 ? "s" : ""}
						</span>
					);
				},
			},
			{
				accessorKey: "billingEmail",
				header: "Billing Email",
				cell: (info) => {
					const email = info.getValue() as string | undefined;
					return email ? (
						<span className="text-sm">{email}</span>
					) : (
						<span className="text-sm text-gray-400">-</span>
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
		[],
	);

	// Query function for fetching accounts with pagination
	const accountSchema = z.object({
		id: z.string(),
		name: z.string(),
		description: z.string().nullish(),
		plan: z.string(),
		status: z.string(),
		billingEmail: z.string().nullish(),
		isDefault: z.boolean(),
		createdAt: z.string(),
		orgId: z.string().nullish(),
		orgName: z.string().nullish(),
		memberCount: z.number(),
	});

	const accountsResponseSchema = z.object({
		success: z.boolean().optional(),
		data: z.object({
			accounts: z.array(accountSchema),
			rowCount: z.number(),
			pageCount: z.number(),
		}),
	});

	const queryFn = async (pagination: PaginationState) => {
		const page = pagination.pageIndex + 1; // Convert 0-based to 1-based
		const limit = pagination.pageSize;

		const parsed = await authedApi({
			endpoint: `${API_ENDPOINTS.admin.accounts()}?page=${page}&limit=${limit}`,
			schema: accountsResponseSchema,
		});

		return {
			data: parsed.data.accounts,
			rowCount: parsed.data.rowCount,
			pageCount: parsed.data.pageCount,
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
