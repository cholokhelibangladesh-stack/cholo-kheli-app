import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/limit")({
  component: () => (
    <ScaffoldPage
      title='Limit interactions'
      description='Temporarily limit unwanted interactions'
      emptyTitle='Limits are off'
      emptyText='Turn on limits during periods of high activity.'
    />
  ),
});
