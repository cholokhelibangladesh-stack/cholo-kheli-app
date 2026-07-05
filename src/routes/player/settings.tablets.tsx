import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/tablets")({
  component: () => (
    <ScaffoldPage
      title='Cholo Kheli for tablets'
      description='Optimised layouts for larger screens'
      emptyTitle='Auto-adjusts to your screen'
      emptyText='Cholo Kheli already adapts to tablet screens automatically.'
    />
  ),
});
