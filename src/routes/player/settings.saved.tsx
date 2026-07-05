import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/saved")({
  component: () => (
    <ScaffoldPage
      title='Saved'
      description="Videos you've saved"
      emptyTitle='No saved videos yet'
      emptyText='Tap the bookmark on any video and it will appear here.'
    />
  ),
});
