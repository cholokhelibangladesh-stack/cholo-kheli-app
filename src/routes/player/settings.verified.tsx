import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/verified")({
  component: () => (
    <ScaffoldPage
      title='Cholo Kheli Verified'
      description='Get a verified badge for your profile'
      emptyTitle='Not verified'
      emptyText='Verified badges are awarded to notable athletes and scouts.'
    />
  ),
});
