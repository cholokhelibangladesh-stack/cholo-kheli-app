import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/tags")({
  component: () => (
    <ScaffoldPage
      title='Tags and mentions'
      description='Who can tag or mention you'
      emptyTitle='Everyone'
      emptyText='Anyone can tag or mention you in a video.'
    />
  ),
});
