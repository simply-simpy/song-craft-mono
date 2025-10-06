import { createFileRoute } from "@tanstack/react-router";
import ErrorComponent from "../../components/layout/page/error";
import { PendingComponent } from "../../components/ui/pending-component";
import { API_ENDPOINTS } from "../../lib/api";
import { requireAuth } from "../../lib/requireAuth.server";

interface Organization {
	id: string;
	name: string;
	status: string;
	createdAt: string;
	accountCount: number;
}

interface OrganizationsResponse {
	success: boolean;
	data: {
		orgs: Organization[];
		pagination: {
			page: number;
			limit: number;
			total: number;
			pages: number;
		};
	};
}

export const Route = createFileRoute("/admin/orgs")({
	beforeLoad: () => requireAuth(),
	loader: async () => {
		try {
			// For development, use the mock user ID
			const mockUserId = "user_31nfGdXgrOOiHNVWtJjf20VpuYm";

			const response = await fetch(API_ENDPOINTS.admin.orgs(), {
				headers: {
					"x-clerk-user-id": mockUserId,
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch organizations: ${response.status}`);
			}
			const result = (await response.json()) as OrganizationsResponse;
			return result.data;
		} catch (error) {
			throw new Error(
				`Error loading organizations: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	},
	component: RouteComponent,
	errorComponent: ErrorComponent,
	pendingComponent: PendingComponent,
});

function RouteComponent() {
	const data = Route.useLoaderData();
	const orgs = data?.orgs || [];
	const pagination = data?.pagination;

	return (
		<div className="max-w-6xl mx-auto p-6 bg-surface-base">
			<h1 className="text-2xl font-bold mb-6 text-fg-primary">Organizations</h1>

			{orgs.length === 0 ? (
				<div className="text-center text-fg-tertiary py-8">
					No organizations found
				</div>
			) : (
				<div className="space-y-4">
					{orgs.map((org) => (
						<div
							key={org.id}
							className="border border-border-primary rounded-lg p-4 bg-surface-elevated hover:bg-surface-hover transition-colors"
						>
							<h3 className="font-semibold text-fg-primary">{org.name}</h3>
							<p className="text-sm text-fg-secondary">
								Status: <span className="text-fg-brand">{org.status}</span> |
								Accounts: {org.accountCount} | Created:{" "}
								{new Date(org.createdAt).toLocaleDateString()}
							</p>
						</div>
					))}

					{pagination && (
						<div className="mt-6 text-center text-sm text-fg-tertiary">
							Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
							total)
						</div>
					)}
				</div>
			)}
		</div>
	);
}
