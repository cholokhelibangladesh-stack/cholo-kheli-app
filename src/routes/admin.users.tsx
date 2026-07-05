import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
import ProtectedRoute from "@/components/ProtectedRoute";
export const Route = createFileRoute("/admin/users")({
  component: () => (
    <ProtectedRoute allowedRoles={["admin"]}>
      <ScaffoldPage
        title="User management"
        description="Search, promote, or suspend accounts across Cholo Kheli."
        emptyTitle="User management"
        emptyText="A searchable directory of every player, scout, and admin will live here."
      />
    </ProtectedRoute>
  ),
});
