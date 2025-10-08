import { z } from "@songcraft/shared";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { useMemo } from "react";
import { LazyDataTable } from "../../components/admin/LazyDataTable";
import { API_ENDPOINTS } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { requireAuth } from "../../lib/requireAuth.server";
import { useAuthedApi } from "../../lib/useAuthedApi";

export const Route = createFileRoute("/projects/")({
	beforeLoad: () => requireAuth(),
	component: ProjectsPage,
});
interface Project {
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
	sessionsCount: string | number;
}

function ProjectsPage() {
	const { isLoaded } = useAuth();
	const authedApi = useAuthedApi();

	// Define columns with useMemo for performance
	const columns = useMemo<ColumnDef<Project>[]>(
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
				cell: (info) => {
					const count = info.getValue() as string | number;
					return typeof count === "string" ? Number.parseInt(count) : count;
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
		[],
	);

	// Query function for fetching projects with pagination
	const permissionSchema = z.object({
		userId: z.string(),
		permissionLevel: z.string(),
		grantedAt: z.string(),
		expiresAt: z.string().nullish(),
		userEmail: z.string().nullish(),
	});

	const projectSchema = z.object({
		id: z.string(),
		accountId: z.string(),
		name: z.string(),
		description: z.string().nullable(),
		status: z.string(),
		createdAt: z.string(),
		updatedAt: z.string(),
		createdBy: z.string(),
		creatorName: z.string().nullable(),
		accountName: z.string().nullable(),
		permissions: z.array(permissionSchema),
		sessionsCount: z.union([z.string(), z.number()]),
	});

	const projectsResponseSchema = z.object({
		projects: z.array(projectSchema),
		pagination: z
			.object({
				total: z.number(),
				pages: z.number(),
			})
			.optional(),
	});

	const queryFn = async (pagination: PaginationState) => {
		const page = pagination.pageIndex + 1; // Convert 0-based to 1-based
		const limit = pagination.pageSize;

		const parsed = await authedApi({
			endpoint: `${API_ENDPOINTS.projects()}?page=${page}&limit=${limit}`,
			schema: projectsResponseSchema,
		});

		return {
			data: parsed.projects,
			rowCount: parsed.pagination?.total ?? 0,
			pageCount: parsed.pagination?.pages ?? 1,
		};
	};

	if (!isLoaded) {
		return <div>Loading...</div>;
	}

	return (
		<LazyDataTable
			title="Projects"
			columns={columns}
			queryKey={["admin", "projects"]}
			queryFn={queryFn}
			initialPageSize={20}
			pageSizeOptions={[10, 20, 50, 100]}
		/>
	);
}
