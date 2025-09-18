import { createFileRoute } from "@tanstack/react-router";
import { API_ENDPOINTS } from "../../lib/api";
import { useQuery } from "@tanstack/react-query";
import { requireAuth } from "../../lib/requireAuth.server";
import { useAuth } from "../../lib/auth";

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
// songcraft/src/routes/admin/users.tsx
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
    <div>
      users:{" "}
      <ul>
        {data.data.users.map((user: User) => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>
      Hello "/admin/users"!
    </div>
  );
}
