import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
import ProtectedRoute from "@/components/ProtectedRoute";
export const Route = createFileRoute("/admin/moderation")({
  component: () => (
    <ProtectedRoute allowedRoles={["admin"]}>
      <ScaffoldPage
        title="Moderation queue"
        description="Review flagged videos, comments, and scout requests."
        emptyTitle="Moderation queue"
        emptyText="Pending items awaiting admin review will appear here."
      />
    </ProtectedRoute>
  ),
});
