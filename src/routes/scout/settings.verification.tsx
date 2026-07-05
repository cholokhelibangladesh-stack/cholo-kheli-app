import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/scout/settings/verification")({
  component: () => (
    <ScaffoldPage
      title="Scout verification"
      description="Your verification documents and current review status."
      emptyTitle="Scout verification"
      emptyText="Track your verification progress and submit updated credentials when required."
    />
  ),
});
