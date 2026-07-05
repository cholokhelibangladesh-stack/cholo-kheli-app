import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/privacy-center")({
  component: () => (
    <ScaffoldPage
      title='Privacy Center'
      description='Everything about your privacy'
      emptyTitle='Central hub for privacy'
      emptyText='Read policies and manage privacy across Cholo Kheli.'
    />
  ),
});
