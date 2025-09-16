import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "../../lib/requireAuth.server";
import { API_ENDPOINTS } from "../../lib/api";

// Types for organization data
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
      const response = await fetch(API_ENDPOINTS.admin.orgs());
      if (!response.ok) {
        throw new Error(`Failed to fetch organizations: ${response.status}`);
      }
      const result = (await response.json()) as OrganizationsResponse;
      return result.data;
    } catch (error) {
      throw new Error(
        `Error loading organizations: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
  component: RouteComponent,
  errorComponent: ({ error }) => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center text-red-600">
        <h2 className="text-xl font-semibold mb-2">
          Error Loading Organizations
        </h2>
        <p>{error.message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>
  ),
  pendingComponent: () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p>Loading organizations...</p>
      </div>
    </div>
  ),
});

function RouteComponent() {
  const data = Route.useLoaderData();
  const orgs = data?.orgs || [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Organizations</h1>

      {orgs.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No organizations found
        </div>
      ) : (
        <div className="space-y-4">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="border rounded-lg p-4 hover:bg-gray-50"
            >
              <h3 className="font-semibold">{org.name}</h3>
              <p className="text-sm text-gray-600">
                Status: {org.status} | Accounts: {org.accountCount} | Created:{" "}
                {new Date(org.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}

          {pagination && (
            <div className="mt-6 text-center text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
              total)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
