import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/friends-feed")({
  component: () => (
    <ScaffoldPage
      title='Activity in Friends feed'
      description="Your activity in your friends' feeds"
      emptyTitle='Sharing is on'
      emptyText="Your public likes and follows appear in your friends' feeds."
    />
  ),
});
