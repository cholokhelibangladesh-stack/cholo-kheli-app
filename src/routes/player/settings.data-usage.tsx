import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/data-usage")({
  component: () => (
    <ScaffoldPage
      title='Data usage and media quality'
      description='Save data on slow connections'
      emptyTitle='High quality'
      emptyText='Videos load in HD when possible.'
    />
  ),
});
