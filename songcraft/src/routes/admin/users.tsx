import { createFileRoute } from "@tanstack/react-router";
import { API_ENDPOINTS } from "../../lib/api";
import { useQuery } from "@tanstack/react-query";
import { requireAuth } from "../../lib/requireAuth.server";

export const Route = createFileRoute("/admin/users")({
  beforeLoad: () => requireAuth(),
  component: UsersPage,
});

function UsersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.admin.users(), {
        headers: {
          "x-clerk-user-id": "user_31nfGdXgrOOiHNVWtJjf20VpuYm", // TODO: remove this and make dynamic
        },
      });
      return response.json();
    },
  });
  console.log("data", data);
  return <div>Hello "/admin/users"!</div>;
}
