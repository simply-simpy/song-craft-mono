// app/routes/admin/index.page.tsx
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/")({
  component: () => (
    <div>
      <h3>Admin</h3>
      <p>Users, roles, quotas, audit logs.</p>
    </div>
  ),
});
