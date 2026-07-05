import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/comments")({
  component: () => (
    <ScaffoldPage
      title='Comments'
      description='Manage who can comment'
      emptyTitle='Everyone'
      emptyText='Comments are open to everyone.'
    />
  ),
});
