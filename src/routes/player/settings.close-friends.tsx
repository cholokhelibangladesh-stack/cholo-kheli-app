import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/close-friends")({
  component: () => (
    <ScaffoldPage
      title='Close Friends'
      description='Share stories with a smaller group'
      emptyTitle='No close friends yet'
      emptyText='Add close friends so only they see your close-friends-only content.'
    />
  ),
});
