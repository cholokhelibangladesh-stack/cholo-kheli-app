import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/counts")({
  component: () => (
    <ScaffoldPage
      title='Like and share counts'
      description='Show or hide totals across the app'
      emptyTitle='Counts are visible'
      emptyText='Everyone can see like and share counts on videos.'
    />
  ),
});
