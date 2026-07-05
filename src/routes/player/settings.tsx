import { createFileRoute, Outlet } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
export const Route = createFileRoute("/player/settings")({
  component: () => (
    <ProtectedRoute allowedRoles={["player"]}>
      <Outlet />
    </ProtectedRoute>
  ),
});
