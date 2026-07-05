import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/story")({
  component: () => (
    <ScaffoldPage
      title='Story, live and location'
      description='Who can see your story and live'
      emptyTitle='Followers only'
      emptyText='Only your followers can see your stories by default.'
    />
  ),
});
