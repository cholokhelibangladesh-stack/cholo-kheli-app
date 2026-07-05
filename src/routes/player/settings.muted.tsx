import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/muted")({
  component: () => (
    <ScaffoldPage
      title='Muted accounts'
      description='Mute posts or stories from an account'
      emptyTitle='No muted accounts'
      emptyText='Mute an account to stop seeing their posts.'
    />
  ),
});
