import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
import ProtectedRoute from "@/components/ProtectedRoute";
export const Route = createFileRoute("/admin/reports")({
  component: () => (
    <ProtectedRoute allowedRoles={["admin"]}>
      <ScaffoldPage
        title="Reports and appeals"
        description="User-submitted reports and account-status appeals."
        emptyTitle="Reports and appeals"
        emptyText="Incoming reports and pending appeals will be routed to this queue."
      />
    </ProtectedRoute>
  ),
});
