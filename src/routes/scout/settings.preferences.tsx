import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/scout/settings/preferences")({
  component: () => (
    <ScaffoldPage
      title="Scouting preferences"
      description="Tune which sports, positions, and traits show up in your discovery feed."
      emptyTitle="Preferences"
      emptyText="Set your preferred sports and positions so the feed surfaces the players you care about."
    />
  ),
});
