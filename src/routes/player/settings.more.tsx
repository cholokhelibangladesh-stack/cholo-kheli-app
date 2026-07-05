import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/more")({
  component: () => (
    <ScaffoldPage
      title='More from Cholo Kheli'
      description='Other Cholo Kheli products'
      emptyTitle='Only one product for now'
      emptyText='Cholo Kheli is currently a single unified app.'
    />
  ),
});
