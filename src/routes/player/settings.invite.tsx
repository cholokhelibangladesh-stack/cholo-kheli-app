import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/invite")({
  component: () => (
    <ScaffoldPage
      title='Follow and invite friends'
      description='Grow your network'
      emptyTitle='Invite friends'
      emptyText='Share your Cholo Kheli link with friends and teammates.'
    />
  ),
});
