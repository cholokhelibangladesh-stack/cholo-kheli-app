import { createFileRoute } from "@tanstack/react-router";
import ScaffoldPage from "@/pages/settings/ScaffoldPage";
export const Route = createFileRoute("/player/settings/help")({
  component: () => (
    <ScaffoldPage
      title='Help'
      description='Report a problem or find answers'
      emptyTitle='Search the FAQ'
      emptyText='Browse frequently asked questions and contact support.'
    />
  ),
});
