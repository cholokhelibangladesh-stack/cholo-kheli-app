import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
import ProtectedRoute from "@/components/ProtectedRoute";
export const Route = createFileRoute("/admin/videos")({
  component: () => (
    <ProtectedRoute allowedRoles={["admin"]}>
      <ScaffoldPage
        title="Video oversight"
        description="Manage live uploads, rankings, and takedowns."
        emptyTitle="Video oversight"
        emptyText="Every video on the platform will be listed here with quick moderation actions."
      />
    </ProtectedRoute>
  ),
});
