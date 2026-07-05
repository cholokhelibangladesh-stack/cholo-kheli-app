import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/two-factor")({
  component: () => (
    <ScaffoldPage
      title="Two-step verification"
      description="Add a second step when signing in from a new device."
      emptyTitle="Two-step verification"
      emptyText="Choose an authenticator app or SMS to secure your Cholo Kheli account."
    />
  ),
});
