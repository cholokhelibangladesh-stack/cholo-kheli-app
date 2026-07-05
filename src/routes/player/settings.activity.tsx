import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/activity")({
  component: () => (
    <ScaffoldPage
      title='Your activity'
      description='Recent likes, comments and views'
      emptyTitle='Nothing recent'
      emptyText='Your activity across Cholo Kheli will appear here.'
    />
  ),
});
