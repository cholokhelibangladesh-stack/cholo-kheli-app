import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/sharing")({
  component: () => (
    <ScaffoldPage
      title='Sharing'
      description='Allow others to share your content'
      emptyTitle='Sharing is on'
      emptyText='Others can share your videos as messages.'
    />
  ),
});
