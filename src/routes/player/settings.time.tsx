import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/time")({
  component: () => (
    <ScaffoldPage
      title='Time management'
      description='Track and manage your time'
      emptyTitle='No usage yet today'
      emptyText='Watch a few videos and your daily time will appear here.'
    />
  ),
});
