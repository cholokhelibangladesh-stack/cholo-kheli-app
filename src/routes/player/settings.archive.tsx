import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/archive")({
  component: () => (
    <ScaffoldPage
      title='Archive'
      description="Uploads you've archived"
      emptyTitle='No archived uploads'
      emptyText='Archive videos to hide them from your profile without deleting.'
    />
  ),
});
