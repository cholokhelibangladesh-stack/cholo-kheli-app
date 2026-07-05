import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/ai")({
  component: () => (
    <ScaffoldPage
      title='Cholo Kheli AI'
      description='Coaching insights powered by AI'
      emptyTitle='Coming with your next upload'
      emptyText='AI insights appear on your uploads automatically.'
    />
  ),
});
