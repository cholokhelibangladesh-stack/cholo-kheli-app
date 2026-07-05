import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/messages")({
  component: () => (
    <ScaffoldPage
      title='Messages and story replies'
      description='Choose who can message you'
      emptyTitle='Everyone can message you'
      emptyText='Anyone can send you a direct message right now.'
    />
  ),
});
