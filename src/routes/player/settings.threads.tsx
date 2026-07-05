import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/threads")({
  component: () => (
    <ScaffoldPage
      title='Threads'
      description='Long-form posts and conversations'
      emptyTitle='No threads yet'
      emptyText='Threads let you post longer updates and stories.'
    />
  ),
});
